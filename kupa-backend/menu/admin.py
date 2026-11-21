from django.contrib import admin

from .models import Category, Favorite, Food, Option, OptionGroup


class OptionGroupInline(admin.TabularInline):
    model = OptionGroup
    extra = 0


class OptionInline(admin.TabularInline):
    model = Option
    extra = 0


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "order")


@admin.register(Food)
class FoodAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "price", "is_available", "is_featured", "is_top_of_week")
    list_filter = ("category", "is_available", "is_featured", "is_top_of_week")
    search_fields = ("name",)
    inlines = [OptionGroupInline]


@admin.register(OptionGroup)
class OptionGroupAdmin(admin.ModelAdmin):
    list_display = ("name", "food", "is_required", "max_select")
    inlines = [OptionInline]


admin.site.register(Favorite)