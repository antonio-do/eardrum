import json
import datetime
import copy

from django.contrib.auth.models import User
from django.forms.models import model_to_dict

from rest_framework import (
    viewsets,
    permissions,
    decorators,
    response,
    mixins,
    status,
)

from .models import (
    Leave,
    ConfigEntry,
    LeaveMask,
)
from .serializers import LeaveSerializer


Response = response.Response


class LeaveViewSet(mixins.CreateModelMixin,
                   mixins.ListModelMixin,
                   mixins.RetrieveModelMixin,
                   mixins.UpdateModelMixin,
                   viewsets.GenericViewSet):
    queryset = Leave.objects.all()
    serializer_class = LeaveSerializer

    def is_admin_user(self):
        return permissions.IsAdminUser.has_permission(None, self.request, self)

    def get_updated_fields(self):
        if self.is_admin_user():
            return self.ADMIN_UPDATED_FIELDS
        else:
            return self.UPDATED_FIELDS

    def get_validated_query_value(self, fieldname, value):
        def validate_year(value):
            try:
                year = int(value)
            except ValueError:
                return None
            else:
                current_year = datetime.datetime.now().year
                return value if current_year - 10 <= year <= current_year + 10 else None

        def validate_status(value):
            config_entry = ConfigEntry.objects.get(name='leave_context')
            leave_context = json.loads(config_entry.extra)
            if leave_context.get('leave_statuses') is None:
                leave_statuses = []
            else:
                leave_statuses = list(map(lambda x: x['name'], leave_context['leave_statuses']))

            return value if value in leave_statuses else None

        validation_funcs = {
            'year': validate_year,
            'status': validate_status,
        }

        return (fieldname, value) if validation_funcs.get(fieldname) is not None else (fieldname, None)

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
        request = self.request
        queries = []
        for queried_field in ['year', 'status']:
            queried_value = request.query_params.get(queried_field)
            if queried_value is not None:
                queries.append(self.get_validated_query_value(queried_field, queried_value))

        for queried_field, queried_value in queries:
            if queried_value is None:
                return self.queryset.none()

        queries = {queried_field: queried_value for queried_field, queried_value in queries}

        if self.is_admin_user():
            return self.queryset.filter(active=True, **queries)
        else:
            return self.queryset.filter(user=self.request.user.username, active=True, **queries)

    def create(self, request, *args, **kwargs):
        initial_data = copy.deepcopy(request.data)
        initial_data['year'] = initial_data.get('startdate', '')[:4]
        serializer = self.get_serializer(data=initial_data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.status != 'pending' and not self.is_admin_user():
            errors = {
                'errors': {
                    'status': ['is not pending'],
                }
            }
            return Response(errors, status=status.HTTP_403_FORBIDDEN)
            
        instance.active = False
        instance.save(update_fields=['active'])

        if instance.status == 'approved':
            leave_type_config = ConfigEntry.objects.get(name='leave_context')
            leave_types = json.loads(leave_type_config.extra)['leave_types']
            
            mask = LeaveMask.objects.get(name="{user}_{year}".format(user=instance.user, year=instance.year))
            base_mask = LeaveMask.objects.get(name="__{year}".format(year=instance.year))
            arr = list(base_mask.value)

            shortlist = Leave.objects.filter(user=instance.user, year=instance.year, status='approved', active=True)
            for leave_request in shortlist:
                start = datetime.datetime.strptime(leave_request.startdate, '%Y%m%d').timetuple().tm_yday
                start = 2 * (start - 1) + (leave_request.half[0] == "1")
                end = datetime.datetime.strptime(leave_request.enddate, '%Y%m%d').timetuple().tm_yday
                end = 2 * (end - 1) + (leave_request.half[1] == "0")

                priority = next((leave_type for leave_type 
                         in leave_types if leave_type['name'] == leave_request.typ), None)['priority']

                for i in range(start, end + 1):
                    if arr[i] == '-' or int(arr[i]) > priority :
                        arr[i] = str(priority)
            mask.value = ''.join(arr)
            mask.save(update_fields=['value'])

        return Response(status=status.HTTP_204_NO_CONTENT)

    def perform_update(self, serializer):
        instance = serializer.save()
        if (instance.status != "approved"):
            return

        mask_name = "{user}_{year}".format(user=instance.user, year=instance.year)

        # Create mask from base mask if not exist
        if LeaveMask.objects.filter(name=mask_name).count() == 0:
            base_mask_name = "__{}".format(instance.year)
            mask = LeaveMask.objects.get(name=base_mask_name)
            mask.name = mask_name
            mask.pk = None
            mask.save()

        leave_type_config = ConfigEntry.objects.get(name='leave_context')
        leave_types = json.loads(leave_type_config.extra)['leave_types']
        
        mask = LeaveMask.objects.get(name=mask_name)
        arr = list(mask.value)

        # represent every day with 2 characters, each for the morning and afternoon shift
        start = datetime.datetime.strptime(instance.startdate, '%Y%m%d').timetuple().tm_yday
        start = 2 * (start - 1) + (instance.half[0] == "1")
        end = datetime.datetime.strptime(instance.enddate, '%Y%m%d').timetuple().tm_yday
        end = 2 * (end - 1) + (instance.half[1] == "0")

        priority = next((leave_type for leave_type 
                         in leave_types if leave_type['name'] == instance.typ), None)['priority']
 
        
        # '-': work day
        # '0': holiday/weekend
        # otherwise: on leave, the representing character is the same as the leave type's priority,
        #            lower priority value means higher priority
        for i in range(start, end + 1):
            if arr[i] == '-' or int(arr[i]) > priority :
                arr[i] = str(priority)

        mask.value = ''.join(arr)
        mask.save(update_fields=['value'])

    @decorators.action(methods=['GET'], detail=False)
    def context(self, *args, **kwargs):
        config_entry = ConfigEntry.objects.get(name='leave_context')
        leave_context = json.loads(config_entry.extra)
        users = User.objects.all()
        if not self.is_admin_user():
            users = users.filter(username=self.request.user.username)

        res = {
            **leave_context,
            "users": list(map(lambda x: model_to_dict(x, fields=['id', 'username']), users)),
        }

        return Response(res)

    @decorators.action(methods=['GET'], detail=False)
    def holidays(self, request, *args, **kargs):
        year = request.query_params.get('year')
        _, year = self.get_validated_query_value('year', year)
        if year is not None:
            try:
                config_entry = ConfigEntry.objects.get(name='holidays_{}'.format(year))
            except ConfigEntry.DoesNotExist:
                return Response(None, status=status.HTTP_404_NOT_FOUND)
            else:
                holidays = config_entry.extra.split()
                return Response(holidays)
        else:
            return Response(None, status=status.HTTP_404_NOT_FOUND)

    @decorators.action(methods=['GET'], detail=False)
    def statistics(self, request, *args, **kargs):
        year = request.query_params.get('year')
        _, year = self.get_validated_query_value('year', year)
        if year is not None:
            try:
                leave_type_config = ConfigEntry.objects.get(name='leave_type_{}'.format(year))
            except ConfigEntry.DoesNotExist:
                leave_type_config = ConfigEntry.objects.get(name='leave_context')
                leave_types = json.loads(leave_type_config.extra)['leave_types']
            else:
                leave_types = json.loads(leave_type_config.extra)

            users = User.objects.all()
            if not self.is_admin_user():
                users = users.filter(username=self.request.user.username)

            stats = []
            for user in users:
                stat = {}
                for leave_type in leave_types:
                    mask_name = "{user}_{year}".format(user=user, year=year)
                    if LeaveMask.objects.filter(name=mask_name).count() == 0:
                        stat[leave_type['name']] = 0
                    else:
                        mask = LeaveMask.objects.get(name=mask_name)
                        # '-': work day
                        # '0': holiday/weekend
                        # otherwise: on leave, the representing character is the same as the leave type's 
                        #            priority
                        stat[leave_type['name']] = mask.value.count(str(leave_type['priority'])) / 2

                stats.append({**stat, 'user': user.username})

            ret = {
                'year': year,
                'leave_types': leave_types,
                'stats': stats,
            }
            return Response(ret)
        else:
            return Response(None, status=status.HTTP_404_NOT_FOUND)
