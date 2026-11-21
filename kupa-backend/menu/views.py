from django.db.models import Q
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from accounts.permissions import IsManagerOrReadOnly

from .models import Category, Favorite, Food, Option, OptionGroup
from .serializers import (
    CategorySerializer,
    FoodSerializer,
    FoodWriteSerializer,
    OptionGroupSerializer,
    OptionSerializer,
)


class CategoryViewSet(ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsManagerOrReadOnly]


class FoodViewSet(ModelViewSet):
    permission_classes = [IsManagerOrReadOnly]

    def get_serializer_class(self):
        if self.action in ("list", "retrieve", "favorites"):
            return FoodSerializer
        return FoodWriteSerializer

    def get_queryset(self):
        qs = Food.objects.select_related("category").prefetch_related("option_groups__options")
        user = self.request.user
        is_manager = user.is_authenticated and user.role == "manager"
        if not is_manager:
            qs = qs.filter(is_available=True)

        p = self.request.query_params
        category = p.get("category")
        if category:
            qs = qs.filter(category_id=category) if category.isdigit() else qs.filter(category__slug=category)
        if p.get("featured") == "true":
            qs = qs.filter(is_featured=True)
        if p.get("top") == "true":
            qs = qs.filter(is_top_of_week=True)
        search = p.get("search")
        if search:
            qs = qs.filter(
                Q(name__icontains=search)
                | Q(description__icontains=search)
                | Q(category__name__icontains=search)
            )
        return qs

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        user = self.request.user
        ctx["fav_ids"] = (
            set(Favorite.objects.filter(user=user).values_list("food_id", flat=True))
            if user.is_authenticated
            else set()
        )
        return ctx

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def favorite(self, request, pk=None):
        """Toggle favorite on/off."""
        food = self.get_object()
        fav, created = Favorite.objects.get_or_create(user=request.user, food=food)
        if not created:
            fav.delete()
        return Response({"is_favorite": created})

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def favorites(self, request):
        qs = self.get_queryset().filter(favorited_by__user=request.user)
        return Response(FoodSerializer(qs, many=True, context=self.get_serializer_context()).data)


class OptionGroupViewSet(ModelViewSet):
    serializer_class = OptionGroupSerializer
    permission_classes = [IsManagerOrReadOnly]

    def get_queryset(self):
        qs = OptionGroup.objects.prefetch_related("options")
        food = self.request.query_params.get("food")
        return qs.filter(food_id=food) if food else qs


class OptionViewSet(ModelViewSet):
    serializer_class = OptionSerializer
    permission_classes = [IsManagerOrReadOnly]

    def get_queryset(self):
        qs = Option.objects.all()
        group = self.request.query_params.get("group")
        return qs.filter(group_id=group) if group else qs