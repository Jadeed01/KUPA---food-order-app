from django.contrib import admin

from .models import Address, Cart, CartItem, Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("name", "unit_price", "quantity", "options")


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("code", "user", "status", "payment_method", "total", "created_at")
    list_filter = ("status", "payment_method")
    inlines = [OrderItemInline]


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    inlines = [CartItemInline]


admin.site.register(Address)