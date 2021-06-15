from django.contrib.auth.models import User
from django.forms.models import model_to_dict

from rest_framework import (
    viewsets,
    permissions,
    decorators,
    response,
)

from .models import Leave
from .serializers import LeaveSerializer


Response = response.Response


class LeaveViewSet(viewsets.ModelViewSet):
    queryset = Leave.objects.all()
    serializer_class = LeaveSerializer

    def is_admin_user(self):
        return permissions.IsAdminUser.has_permission(None, self.request, self)

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['update', 'partial_update']:
            permission_classes = [permissions.IsAdminUser]
        else:
            permission_classes = [permissions.IsAuthenticated]

        return [permission() for permission in permission_classes]

    def get_queryset(self):
        if self.is_admin_user():
            return self.queryset.all()
        else:
            return self.queryset.filter(user=self.request.user.username)

    @decorators.action(methods=['GET'], detail=False)
    def context(self, *args, **kwargs):
        users = User.objects.all()
        if not self.is_admin_user():
            users = users.filter(username=self.request.user.username)
        
        res = {
            "users": list(map(lambda x: model_to_dict(x, fields=['id', 'username']), users)),
        }

        return Response(res)
