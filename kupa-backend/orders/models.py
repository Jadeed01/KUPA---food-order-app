from decimal import Decimal

from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from menu.models import Food, Option

ZERO = Decimal("0.00")


class Address(models.Model):
    class Label(models.TextChoices):
        HOME = "home", "Home"
        OFFICE = "office", "Office"
        OTHER = "other", "Others"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="addresses")
    label = models.CharField(max_length=10, choices=Label.choices, default=Label.HOME)
    street = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-is_default", "-created_at"]

    def full_address(self):
        parts = [self.street, self.city, self.state, self.postal_code, self.country]
        return ", ".join(p for p in parts if p)

    def save(self, *args, **kwargs):
        if not self.pk and not Address.objects.filter(user=self.user).exists():
            self.is_default = True  # first address is the default
        super().save(*args, **kwargs)
        if self.is_default:
            Address.objects.filter(user=self.user, is_default=True).exclude(pk=self.pk).update(is_default=False)

    def __str__(self):
        return f"{self.get_label_display()}: {self.street}"


class Cart(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="cart")
    updated_at = models.DateTimeField(auto_now=True)

    def subtotal(self):
        return sum((i.line_total for i in self.items.all()), ZERO)

    def delivery_fee(self):
        return settings.DELIVERY_FEE if len(self.items.all()) else ZERO

    def total(self):
        return self.subtotal() + self.delivery_fee()


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    food = models.ForeignKey(Food, on_delete=models.CASCADE)
    quantity = models.PositiveSmallIntegerField(
        default=1, validators=[MinValueValidator(1), MaxValueValidator(50)]
    )
    options = models.ManyToManyField(Option, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["id"]

    @property
    def unit_price(self):
        return self.food.price + sum((o.extra_price for o in self.options.all()), ZERO)

    @property
    def line_total(self):
        return self.unit_price * self.quantity


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        CONFIRMED = "confirmed", "Confirmed"
        PREPARING = "preparing", "Preparing"
        ON_THE_WAY = "on_the_way", "On the way"
        DELIVERED = "delivered", "Delivered"
        CANCELLED = "cancelled", "Cancelled"

    class Payment(models.TextChoices):
        CASH = "cash", "Cash on delivery"
        CARD = "card", "Card (simulated)"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="orders"
    )
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.PENDING)
    payment_method = models.CharField(max_length=10, choices=Payment.choices, default=Payment.CASH)

    # snapshot of the address at order time
    delivery_label = models.CharField(max_length=20, blank=True)
    delivery_address = models.TextField()
    delivery_phone = models.CharField(max_length=20, blank=True)
    note = models.CharField(max_length=300, blank=True)

    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_fee = models.DecimalField(max_digits=8, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    @property
    def code(self):
        return f"KP{self.pk:06d}"

    def can_move_to(self, new_status):
        S = self.Status
        allowed = {
            S.PENDING: [S.CONFIRMED, S.CANCELLED],
            S.CONFIRMED: [S.PREPARING, S.CANCELLED],
            S.PREPARING: [S.ON_THE_WAY, S.CANCELLED],
            S.ON_THE_WAY: [S.DELIVERED],
            S.DELIVERED: [],
            S.CANCELLED: [],
        }
        return new_status in allowed[self.status]

    def __str__(self):
        return self.code


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    food = models.ForeignKey(Food, on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=120)
    unit_price = models.DecimalField(max_digits=8, decimal_places=2)
    quantity = models.PositiveSmallIntegerField()
    options = models.JSONField(default=list, blank=True)  # [{"group","name","extra_price"}]

    @property
    def line_total(self):
        return self.unit_price * self.quantity