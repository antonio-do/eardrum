import json
import datetime
import copy

from django.contrib.auth.models import User, Group
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

    def get_validated_query_value(self, fieldname, value):
        def validate_year(value):
            try:
                year = int(value)
            except (ValueError, TypeError):
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

        return (fieldname, validation_funcs[fieldname](value)) if validation_funcs.get(fieldname) is not None else (fieldname, None)

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
                # Return none queryset if there is an invalid query_param
                return self.queryset.none()

        queries = {queried_field: queried_value for queried_field, queried_value in queries}

        if self.is_admin_user():
            return self.queryset.filter(active=True, **queries)
        else:
            return self.queryset.filter(user=self.request.user.username, active=True, **queries)

    def get_mask(self, **kwargs):
        user = kwargs.get("user")
        year = kwargs.get("year")
        create = kwargs.get("create", False)

        mask_name = "{user}_{year}".format(user=user, year=year)
        try:
            mask = LeaveMask.objects.get(name=mask_name)
            return mask
        except LeaveMask.DoesNotExist:
            if create:
                mask = LeaveMask.objects.get(name="__{year}".format(year=year))
                mask.name = mask_name
                mask.pk = None
                mask.save()
                return mask
            else:
                return None

    def accumulate_mask(self, mask, leave_requests):
        leave_type_config = ConfigEntry.objects.get(name='leave_context')
        leave_types = json.loads(leave_type_config.extra)['leave_types']

        arr = list(mask.value)

        typ_with_priority = {leave_type['priority']: leave_type['name'] for leave_type in leave_types}
        summary = {leave_type['name']: 0 for leave_type in leave_types}

        for leave_request in leave_requests:
            # represent every day with 2 characters, each for the morning and afternoon shift
            start = datetime.datetime.strptime(leave_request.startdate, '%Y%m%d').timetuple().tm_yday
            start = 2 * (start - 1) + (leave_request.half[0] == "1")
            end = datetime.datetime.strptime(leave_request.enddate, '%Y%m%d').timetuple().tm_yday
            end = 2 * (end - 1) + (leave_request.half[1] == "0")

            priority = next((leave_type for leave_type
                             in leave_types if leave_type['name'] == leave_request.typ), None)['priority']

            # '-': work day
            # '0': holiday/weekend
            # otherwise: on leave, the representing character is the same as the leave type's priority,
            #            lower priority value means higher priority
            for i in range(start, end + 1):
                if arr[i] == '-' or int(arr[i]) > priority:
                    this_type = typ_with_priority[priority]
                    summary[this_type] = summary[this_type] + 1
                    if arr[i] != '-' and arr[i] != '0':
                        last_type = typ_with_priority[int(arr[i])]
                        summary[last_type] = summary[last_type] - 1

                    arr[i] = str(priority)

        mask.value = ''.join(arr)
        old_summary = json.loads(mask.summary)
        new_summary = {leave_type: summary[leave_type] + old_summary[leave_type] for leave_type in summary}
        mask.summary = json.dumps(new_summary, indent=2)
        mask.save(update_fields=['value', 'summary'])

    def create(self, request, *args, **kwargs):
        initial_data = copy.deepcopy(request.data)
        initial_data['year'] = initial_data.get('startdate', '')[:4]
        initial_data['status'] = 'pending'
        serializer = self.get_serializer(data=initial_data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        if not self.is_admin_user():
            if instance.status == 'pending':
                instance.active = False
                instance.save(update_fields=['active'])

                return Response(status=status.HTTP_204_NO_CONTENT)
            else:
                errors = {
                    'errors': {
                        'status': ['is not pending'],
                    }
                }
                return Response(errors, status=status.HTTP_403_FORBIDDEN)
        else:
            instance.active = False
            instance.save(update_fields=['active'])

            if instance.status == 'approved':
                mask = self.get_mask(user=instance.user, year=instance.year)
                base_mask = self.get_mask(user='_', year=instance.year)
                mask.value = base_mask.value
                mask.summary = base_mask.summary

                self.accumulate_mask(mask, Leave.objects.filter(user=instance.user,
                                                                year=instance.year,
                                                                status='approved',
                                                                active=True))

            return Response(status=status.HTTP_204_NO_CONTENT)

    def perform_update(self, serializer):
        instance = serializer.save()
        if (instance.status != "approved"):
            return

        mask = self.get_mask(user=instance.user, year=instance.year, create=True)
        self.accumulate_mask(mask, [instance])

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
                mask = self.get_mask(user=user, year=year)
                if mask is None:
                    stat = {leave_type['name']: 0 for leave_type in leave_types}
                else:
                    stat = {leave_type['name']: json.loads(mask.summary)[leave_type['name']] / 2
                            for leave_type in leave_types}

                stats.append({**stat, 'user': user.username})

            ret = {
                'year': year,
                'leave_types': leave_types,
                'stats': stats,
            }
            return Response(ret)
        else:
            return Response(None, status=status.HTTP_404_NOT_FOUND)

    @decorators.action(methods=['GET'], detail=False)
    def leave_users(self, request, *args, **kargs):
        date = request.query_params.get('date')
        try:
            datetime.datetime.strptime(date, '%Y%m%d')
        except (ValueError, TypeError):
            ret = {
                'message': "Date format must be YYYYMMDD"
            }
            return Response(ret, status=status.HTTP_400_BAD_REQUEST)

        leave_status = {group.name: {} for group in Group.objects.filter(name__startswith='leave_app_')}
        leave_status['all'] = {}
        users = User.objects.all()
        if not self.is_admin_user():
            users = users.filter(username=self.request.user.username)

        for user in users:
            mask = self.get_mask(user=user.username, year=date[:4])
            mask_value = mask.value if mask is not None else self.get_mask(user='_', year=date[:4]).value
            day_in_year = datetime.datetime.strptime(date, '%Y%m%d').timetuple().tm_yday
            # 0 = work, 1 = leave
            leave = ''.join(['0' if i == '-' else '1'
                             for i in mask_value[(2 * day_in_year - 2):(2 * day_in_year)]])

            groups = user.groups.filter(name__startswith='leave_app_')

            for group in groups:
                leave_status[group.name][user.username] = leave

            leave_status['all'][user.username] = leave

        ret = {
            'date': date,
            'leave_status': leave_status,
        }

        return Response(ret)

    @decorators.action(methods=['GET'], detail=False)
    def recalculate_masks(self, request, *args, **kargs):
        _, year = self.get_validated_query_value('year', request.query_params.get('year'))

        if year is None:
            ret = {
                'message': 'no year provided'
            }
            return Response(ret, status=status.HTTP_400_BAD_REQUEST)
        for user in User.objects.all():
            mask = self.get_mask(user=user.username, year=year)
            leaves = Leave.objects.filter(user=user.username,
                                          year=year,
                                          status='approved',
                                          active=True)

            if leaves.count() == 0:
                if mask is not None:
                    mask.delete()
            else:
                if mask is None:
                    mask = self.get_mask(user=user.username, year=year, create=True)

                # assumption: base_mask exists for every year leave request exist
                base_mask = self.get_mask(user='_', year=year)
                mask.value = base_mask.value
                mask.summary = base_mask.summary

                self.accumulate_mask(mask, leaves)

        return Response({})
