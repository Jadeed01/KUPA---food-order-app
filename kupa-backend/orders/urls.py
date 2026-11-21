from django.urls import path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("addresses", views.AddressViewSet, basename="address")
router.register("orders", views.OrderViewSet, basename="order")
router.register("manage/orders", views.ManageOrderViewSet, basename="manage-order")

urlpatterns = [
    path("cart/", views.CartView.as_view()),
    path("cart/items/", views.CartItemsView.as_view()),
    path("cart/items/<int:pk>/", views.CartItemDetailView.as_view()),
] + router.urls