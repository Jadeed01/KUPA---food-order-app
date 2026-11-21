from rest_framework import serializers

from menu.models import Food, Option

from .models import Address, Cart, CartItem, Order, OrderItem
from .utils import food_image, resolve_options


# ---------- Address ----------
class AddressSerializer(serializers.ModelSerializer):
    full_address = serializers.CharField(read_only=True)

    class Meta:
        model = Address
        fields = (
            "id", "label", "street", "city", "state", "postal_code", "country",
            "latitude", "longitude", "is_default", "full_address",
        )


# ---------- Cart ----------
class CartOptionSerializer(serializers.ModelSerializer):
    group = serializers.CharField(source="group.name")

    class Meta:
        model = Option
        fields = ("id", "group", "name", "extra_price")


class CartItemSerializer(serializers.ModelSerializer):
    food = serializers.SerializerMethodField()
    options = CartOptionSerializer(many=True, read_only=True)
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    line_total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = ("id", "food", "quantity", "options", "unit_price", "line_total")

    def get_food(self, obj):
        return {
            "id": obj.food_id,
            "name": obj.food.name,
            "price": str(obj.food.price),
            "image": food_image(obj.food, self.context.get("request")),
        }


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    item_count = serializers.SerializerMethodField()
    subtotal = serializers.SerializerMethodField()
    delivery_fee = serializers.SerializerMethodField()
    total = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ("items", "item_count", "subtotal", "delivery_fee", "total")

    def get_item_count(self, obj):
        return sum(i.quantity for i in obj.items.all())

    def get_subtotal(self, obj):
        return f"{obj.subtotal():.2f}"

    def get_delivery_fee(self, obj):
        return f"{obj.delivery_fee():.2f}"

    def get_total(self, obj):
        return f"{obj.total():.2f}"


class AddToCartSerializer(serializers.Serializer):
    food = serializers.PrimaryKeyRelatedField(queryset=Food.objects.filter(is_available=True))
    quantity = serializers.IntegerField(min_value=1, max_value=50, default=1)
    option_ids = serializers.ListField(child=serializers.IntegerField(), required=False, default=list)

    def validate(self, attrs):
        attrs["options"] = resolve_options(attrs["food"], attrs.get("option_ids", []))
        return attrs


class UpdateQuantitySerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1, max_value=50)


# ---------- Orders ----------
class OrderItemSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    line_total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ("id", "food", "name", "image", "unit_price", "quantity", "options", "line_total")

    def get_image(self, obj):
        return food_image(obj.food, self.context.get("request"))


class OrderSerializer(serializers.ModelSerializer):
    code = serializers.CharField(read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)
    customer = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = (
            "id", "code", "status", "status_display", "payment_method",
            "delivery_label", "delivery_address", "delivery_phone", "note",
            "subtotal", "delivery_fee", "total", "items", "customer",
            "created_at", "updated_at",
        )

    def get_customer(self, obj):
        u = obj.user
        return {"id": u.id, "full_name": u.full_name, "email": u.email} if u else None


class CreateOrderSerializer(serializers.Serializer):
    address_id = serializers.IntegerField()
    payment_method = serializers.ChoiceField(choices=Order.Payment.choices, default=Order.Payment.CASH)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    note = serializers.CharField(max_length=300, required=False, allow_blank=True)


class OrderStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Order.Status.choices)