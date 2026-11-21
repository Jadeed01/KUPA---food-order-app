from rest_framework.permissions import SAFE_METHODS, BasePermission


class IsManager(BasePermission):
    def has_permission(self, request, view):
        u = request.user
        return bool(u and u.is_authenticated and u.role == "manager")


class IsManagerOrReadOnly(BasePermission):
    """Anyone can read, only managers can write."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        u = request.user
        return bool(u and u.is_authenticated and u.role == "manager")