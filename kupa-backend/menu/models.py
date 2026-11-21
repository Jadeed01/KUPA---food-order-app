from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models
from django.utils.text import slugify

ZERO = Decimal("0")


class Category(models.Model):
    name = models.CharField(max_length=60, unique=True)
    slug = models.SlugField(max_length=70, unique=True, blank=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order", "name"]
        verbose_name_plural = "categories"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Food(models.Model):
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="foods")
    name = models.CharField(max_length=120)
    cuisine = models.CharField(max_length=60, blank=True)  # e.g. "Japanese food"
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2, validators=[MinValueValidator(ZERO)])
    image = models.ImageField(upload_to="foods/", blank=True, null=True)
    image_url = models.URLField(blank=True)  # fallback if no upload
    is_available = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    is_top_of_week = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at", "id"]

    def __str__(self):
        return self.name


class OptionGroup(models.Model):
    """e.g. 'Sauce' (pick one, required) or 'Add a Topping?' (pick up to 3)."""

    food = models.ForeignKey(Food, on_delete=models.CASCADE, related_name="option_groups")
    name = models.CharField(max_length=60)
    is_required = models.BooleanField(default=False)
    max_select = models.PositiveSmallIntegerField(
        default=1, help_text="1 = pick one (radio). More than 1 = pick several (checkboxes)."
    )
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.food.name} - {self.name}"


class Option(models.Model):
    group = models.ForeignKey(OptionGroup, on_delete=models.CASCADE, related_name="options")
    name = models.CharField(max_length=60)
    extra_price = models.DecimalField(
        max_digits=6, decimal_places=2, default=ZERO, validators=[MinValueValidator(ZERO)]
    )

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return self.name


class Favorite(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="favorites")
    food = models.ForeignKey(Food, on_delete=models.CASCADE, related_name="favorited_by")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["user", "food"], name="unique_user_food_favorite")]
