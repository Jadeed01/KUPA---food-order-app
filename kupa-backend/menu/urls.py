from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("categories", views.CategoryViewSet, basename="category")
router.register("foods", views.FoodViewSet, basename="food")
router.register("option-groups", views.OptionGroupViewSet, basename="option-group")
router.register("options", views.OptionViewSet, basename="option")

urlpatterns = router.urls