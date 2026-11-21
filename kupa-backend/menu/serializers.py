from rest_framework import serializers

from .models import Category, Food, Option, OptionGroup


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "name", "slug", "order")
        read_only_fields = ("slug",)


class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ("id", "group", "name", "extra_price")


class OptionGroupSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True, read_only=True)

    class Meta:
        model = OptionGroup
        fields = ("id", "food", "name", "is_required", "max_select", "order", "options")


class FoodSerializer(serializers.ModelSerializer):
    """Read serializer: used for list + detail."""

    category_name = serializers.CharField(source="category.name", read_only=True)
    image = serializers.SerializerMethodField()
    is_favorite = serializers.SerializerMethodField()
    option_groups = OptionGroupSerializer(many=True, read_only=True)

    class Meta:
        model = Food
        fields = (
            "id", "name", "cuisine", "description", "price", "image",
            "category", "category_name", "is_available", "is_featured",
            "is_top_of_week", "is_favorite", "option_groups",
        )

    def get_image(self, obj):
        if obj.image:
            request = self.context.get("request")
            return request.build_absolute_uri(obj.image.url) if request else obj.image.url
        return obj.image_url or None

    def get_is_favorite(self, obj):
        return obj.id in self.context.get("fav_ids", set())


class FoodWriteSerializer(serializers.ModelSerializer):
    """Write serializer for managers (JSON or multipart with an image file)."""

    class Meta:
        model = Food
        fields = (
            "id", "category", "name", "cuisine", "description", "price",
            "image", "image_url", "is_available", "is_featured", "is_top_of_week",
        )

    def to_representation(self, instance):
        # respond with the full read shape after create/update
        return FoodSerializer(instance, context=self.context).data