from django.conf import settings
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from django.template import Template, Context

from rest_framework import (viewsets, mixins)
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import (IsAuthenticated, IsAdminUser)
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (OKRSerializer, OKRFileSerializer, LightOKRSerializer)
from .models import OKR, OKRFile
from .permissions import IsApplicationAdminUser, IsOKROwner, IsOKRMentor
# Create your views here.


class OKRViewset(viewsets.GenericViewSet,
                 mixins.CreateModelMixin,
                 mixins.RetrieveModelMixin,
                 mixins.ListModelMixin,
                 mixins.DestroyModelMixin,
                 mixins.UpdateModelMixin):
    """
    """
    permission_classes = [IsAuthenticated]
    serializer_class = OKRSerializer
    queryset = OKR.objects.all()

    def get_queryset(self):
        """
        """
        if IsApplicationAdminUser.has_permission(None, self.request, self):
            return self.queryset.all()
        else:
            mentees_okr_queryset = OKR.objects.filter(issuer__mentorship__mentor=self.request.user)
            return (self.request.user.okr_set.all() | mentees_okr_queryset).distinct()

    def get_serializer_class(self):
        if self.action == 'list':
            return LightOKRSerializer
        else:
            return self.serializer_class

    def create(self, request, *args, **kwargs):
        request.data['issuer'] = request.user.username
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if not IsAdminUser.has_permission(None, request, self):
            if request.data.get('issuer', None):
                del request.data['issuer']
        return super().update(request, *args, **kwargs)


class OKRFileViewset(viewsets.GenericViewSet,
                     mixins.CreateModelMixin,
                     mixins.DestroyModelMixin,
                     mixins.RetrieveModelMixin,
                     mixins.ListModelMixin):
    """
    """
    permission_classes = [IsAuthenticated]
    serializer_class = OKRFileSerializer
    queryset = OKRFile.objects.all()

    def check_okr_permission(self, okr):
        return (IsApplicationAdminUser().has_permission(self.request, self) or
                IsOKROwner().has_object_permission(self.request, None, okr) or
                IsOKRMentor().has_object_permission(self.request, None, okr))

    def get_queryset(self):
        okr = None
        if self.request.GET.get("okr", None):
            okr = get_object_or_404(OKR, pk=self.request.GET.get("okr", None))
        elif self.kwargs.get("pk", None):
            okr = get_object_or_404(OKR, files=self.kwargs['pk'])

        if okr and self.check_okr_permission(okr):
            return self.queryset.filter(okr_id=okr.id)

        return self.queryset.none()

    def create(self, request, *args, **kwargs):
        okr = get_object_or_404(OKR, pk=request.data['okr'])
        if okr and self.check_okr_permission(okr):
            return super().create(request, *args, **kwargs)
        else:
            raise PermissionDenied({"error": "Not OKR owner."})


class OKRNotifyView(APIView):
    permission_classes = [IsAuthenticated]

    def check_okr_permission(self, okr):
        return (IsApplicationAdminUser().has_permission(self.request, self) or
                IsOKROwner().has_object_permission(self.request, None, okr))

    def email(self, okr):
        if hasattr(self.request.user, 'mentorship'):
            mentors = self.request.user.mentorship.mentor.all()
            recipient_list = [mentor.email for mentor in mentors if mentor.email]
            username = self.request.user.get_short_name()
            subject = '"Mentee ' + username + '" has uploaded an OKR'
            action_url = 'http://research48-pc.dtl:8005/okrs'
            message = subject + ' for "' + okr.quarter + "_" + okr.year + '". Please check it via ' + action_url
            context = Context({"username": username, "okr": okr, "action_url": action_url})
            html_message = Template('<html><body><p>' +
                                    '"Mentee {{username}}" has uploaded an OKR for "{{okr.quarter}}_{{okr.year}}". \
                                    Please check it via <a>{{action_url}}</a></p></body></html>')
            email_from = settings.EMAIL_HOST_USER
            send_mail(subject, message=message, from_email=email_from,
                      recipient_list=recipient_list, html_message=html_message.render(context=context))

    def get(self, request, *args, **kwargs):
        okr = get_object_or_404(OKR, pk=kwargs['okr_id'])
        self.request = request
        if okr and self.check_okr_permission(okr):
            self.email(okr)
            return Response({"success": True})
        else:
            raise PermissionDenied({"error": "Not OKR owner."})
