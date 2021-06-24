from rest_framework import serializers
from rest_framework.fields import empty

from .models import Leave


class LeaveSerializer(serializers.ModelSerializer):
    HALF_CHOICES = '00,01,10,11'.split(',')

    def __init__(self, instance=None, data=empty, **kwargs):
        self.fields['half'] = serializers.ChoiceField(choices=self.HALF_CHOICES)

        # TODO get typ choices from database ConfigEntry(name='leave_limitation')
        # typ = serializers.ChoiceField(choices=)

        # TODO get user choices from database Users.objects.all()
        # user = serializers.ChoiceField(choices=)

        # TODO get status choices from database ConfigEntry(name='leave_status_choices')
        # status = serializers.ChoiceField(choices=)

        super().__init__(instance, data, **kwargs)

    class Meta:
        model = Leave
        fields = '__all__'

    def validate_startdate(self, value):
        """
        Reference: https://www.django-rest-framework.org/api-guide/serializers/#validation
        startdate should have format of YYYYMMDD
        """
        # TODO startdate should have format of YYYYMMDD
        return value

    def validate_enddate(self, value):
        """
        Reference: https://www.django-rest-framework.org/api-guide/serializers/#validation
        enddate should have format of YYYYMMDD
        """
        # TODO enddate should have format of YYYYMMDD
        return value
