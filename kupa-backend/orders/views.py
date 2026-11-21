from django.conf import settings
from django.db import transaction
from django.db.models import Sum
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsManager

from .models import Address, Cart, CartItem, Order, OrderItem
from .serializers import (
    AddressSerializer,
    AddToCartSerializer,
    CartSerializer,
    CreateOrderSerializer,
    OrderSerializer,
    OrderStatusSerializer,
    UpdateQuantitySerializer,
)


# ---------- Addresses ----------
class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_destroy(self, instance):
        was_default, user = instance.is_default, instance.user
        instance.delete()
        if was_default:
            nxt = Address.objects.filter(user=user).order_by("-created_at").first()
            if nxt:
                nxt.is_default = True
                nxt.save()


# ---------- Cart ----------
def cart_response(request, http_status=status.HTTP_200_OK):
    cart, _ = Cart.objects.get_or_create(user=request.user)
    cart = Cart.objects.prefetch_related("items__food", "items__options__group").get(pk=cart.pk)
    return Response(CartSerializer(cart, context={"request": request}).data, status=http_status)


class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return cart_response(request)

    def delete(self, request):
        """Clear the whole cart."""
        CartItem.objects.filter(cart__user=request.user).delete()
        return cart_response(request)


class CartItemsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        s = AddToCartSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        food, qty, options = s.validated_data["food"], s.validated_data["quantity"], s.validated_data["options"]

        cart, _ = Cart.objects.get_or_create(user=request.user)
        wanted = frozenset(o.id for o in options)

        # same food + same options -> just bump the quantity
        for item in cart.items.filter(food=food).prefetch_related("options"):
            if frozenset(o.id for o in item.options.all()) == wanted:
                item.quantity = min(item.quantity + qty, 50)
                item.save(update_fields=["quantity"])
                break
        else:
            item = CartItem.objects.create(cart=cart, food=food, quantity=qty)
            item.options.set(options)

        return cart_response(request, status.HTTP_201_CREATED)


class CartItemDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_item(self, request, pk):
        return get_object_or_404(CartItem, pk=pk, cart__user=request.user)

    def patch(self, request, pk):
        item = self.get_item(request, pk)
        s = UpdateQuantitySerializer(data=request.data)
        s.is_valid(raise_exception=True)
        item.quantity = s.validated_data["quantity"]
        item.save(update_fields=["quantity"])
        return cart_response(request)

    def delete(self, request, pk):
        self.get_item(request, pk).delete()
        return cart_response(request)


# ---------- Customer orders ----------
class OrderViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Order.objects.filter(user=self.request.user)
            .select_related("user")
            .prefetch_related("items__food")
        )

    def create(self, request):
        """Checkout: turns the cart into an order. Prices are recalculated server-side."""
        s = CreateOrderSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        d = s.validated_data

        address = Address.objects.filter(user=request.user, pk=d["address_id"]).first()
        if not address:
            return Response({"detail": "Address not found."}, status=status.HTTP_400_BAD_REQUEST)

        cart = Cart.objects.filter(user=request.user).first()
        items = (
            list(cart.items.select_related("food").prefetch_related("options__group")) if cart else []
        )
        if not items:
            return Response({"detail": "Your cart is empty."}, status=status.HTTP_400_BAD_REQUEST)

        for it in items:
            if not it.food.is_available:
                return Response(
                    {"detail": f'"{it.food.name}" is no longer available. Remove it to continue.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        with transaction.atomic():
            subtotal = sum(i.line_total for i in items)
            fee = settings.DELIVERY_FEE
            order = Order.objects.create(
                user=request.user,
                payment_method=d["payment_method"],
                delivery_label=address.get_label_display(),
                delivery_address=address.full_address(),
                delivery_phone=d.get("phone") or request.user.phone,
                note=d.get("note", ""),
                subtotal=subtotal,
                delivery_fee=fee,
                total=subtotal + fee,
            )
            OrderItem.objects.bulk_create(
                [
                    OrderItem(
                        order=order,
                        food=i.food,
                        name=i.food.name,
                        unit_price=i.unit_price,
                        quantity=i.quantity,
                        options=[
                            {"group": o.group.name, "name": o.name, "extra_price": str(o.extra_price)}
                            for o in i.options.all()
                        ],
                    )
                    for i in items
                ]
            )
            cart.items.all().delete()

        return Response(
            OrderSerializer(order, context={"request": request}).data, status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        order = self.get_object()
        if order.status != Order.Status.PENDING:
            return Response(
                {"detail": "Only pending orders can be cancelled."}, status=status.HTTP_400_BAD_REQUEST
            )
        order.status = Order.Status.CANCELLED
        order.save(update_fields=["status", "updated_at"])
        return Response(OrderSerializer(order, context={"request": request}).data)


# ---------- Manager ----------
class ManageOrderViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsManager]

    def get_queryset(self):
        qs = Order.objects.select_related("user").prefetch_related("items__food")
        st = self.request.query_params.get("status")
        return qs.filter(status=st) if st else qs

    @action(detail=True, methods=["post", "patch"], url_path="status")
    def set_status(self, request, pk=None):
        order = self.get_object()
        s = OrderStatusSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        new_status = s.validated_data["status"]

        if not order.can_move_to(new_status):
            return Response(
                {"detail": f"Can't move an order from {order.status} to {new_status}."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        order.status = new_status
        order.save(update_fields=["status", "updated_at"])
        return Response(OrderSerializer(order, context={"request": request}).data)

    @action(detail=False, methods=["get"], url_path="stats")
    def stats(self, request):
        S = Order.Status
        qs = Order.objects.all()
        revenue = qs.filter(status=S.DELIVERED).aggregate(t=Sum("total"))["t"] or 0
        return Response(
            {
                "total_orders": qs.count(),
                "today_orders": qs.filter(created_at__date=timezone.localdate()).count(),
                "pending": qs.filter(status=S.PENDING).count(),
                "in_progress": qs.filter(status__in=[S.CONFIRMED, S.PREPARING, S.ON_THE_WAY]).count(),
                "delivered": qs.filter(status=S.DELIVERED).count(),
                "cancelled": qs.filter(status=S.CANCELLED).count(),
                "revenue": str(revenue),
            }
        )