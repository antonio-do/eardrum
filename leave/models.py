from django.db import models

# Create your models here.

class Leave(models.Model):
    user = models.CharField(max_length=255)
    startdate = models.CharField(max_length=20)
    enddate = models.CharField(max_length=20)
    typ = models.CharField(max_length=255)
    half = models.CharField(max_length=20)
    status = models.CharField(max_length=255)
    note = models.TextField(blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)
