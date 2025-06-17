from rest_framework import permissions

class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Allow read access to published properties
        if request.method in permissions.SAFE_METHODS and obj.status == 'published':
            return True
            
        # Check if user is admin or owner
        return request.user.is_staff or obj.created_by == request.user