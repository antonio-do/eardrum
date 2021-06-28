from rest_framework import serializers
from rest_framework.fields import empty

from .models import Leave, ConfigEntry
from django.contrib.auth.models import User

import json
import datetime

class LeaveSerializer(serializers.ModelSerializer):
    HALF_CHOICES = '00,01,10,11'.split(',')

    def __init__(self, instance=None, data=empty, **kwargs):
        self.fields['half'] = serializers.ChoiceField(choices=self.HALF_CHOICES)

        self.fields['typ'] = serializers.ChoiceField(
            choices=[item['name'] for item in json.loads(ConfigEntry.objects.get(name="leave_context").extra)['leave_types']])

        self.fields['user'] = serializers.ChoiceField(
            choices=[user.username for user in User.objects.all()])

        self.fields['status'] = serializers.ChoiceField(
            choices=[item['name'] for item in json.loads(ConfigEntry.objects.get(name="leave_context").extra)['leave_statuses']])

        super().__init__(instance, data, **kwargs)

    class Meta:
        model = Leave
        fields = '__all__'

    def validate_startdate(self, value):
        """
        Reference: https://www.django-rest-framework.org/api-guide/serializers/#validation
        startdate should have format of YYYYMMDD
        """
        try:
            datetime.datetime.strptime(value, '%Y%m%d')
        except ValueError:
            raise serializers.ValidationError("Incorrect data format, should be YYYYMMDD")
        
        return value

    def validate_enddate(self, value):
        """
        Reference: https://www.django-rest-framework.org/api-guide/serializers/#validation
        enddate should have format of YYYYMMDD
        """
        try:
            datetime.datetime.strptime(value, '%Y%m%d')
        except ValueError:
            raise serializers.ValidationError("Incorrect data format, should be YYYYMMDD")

        return value
