# flake8: noqa
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User

from auditlog.registry import auditlog

# Create your models here.


class Mentorship(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="mentorship", null=True)
    mentor = models.ManyToManyField(User,  related_name="mentees", related_query_name="mentees", blank=True)
    EMPLOYMENT_STATUS_CHOICES = (
        ("INTERN", "Intern"),
        ("EMPLOYEE", "Employee"),
    )

    employment_status = models.CharField(max_length=8,
                    choices=EMPLOYMENT_STATUS_CHOICES,
                    default="EMPLOYEE")

    def __str__(self):
        if len(self.mentor.all()) > 0:
            return "{}: {} - Mentors : {}".format(self.get_employment_status_display(), self.user.username, ", ".join([m.username for m in self.mentor.all()]))
        return self.user.username

    def get_mentors_name(self):
        if len(self.mentor.all()) > 0:
            return ", ".join([m.username for m in self.mentor.all()])
        return "-"

    def checkMentor(self, user):
        return user in self.mentor.all()
        
    @receiver(post_save, sender=User)
    def create_user_mentorship(sender, instance, created, **kwargs):
        if created:
            Mentorship.objects.create(user=instance)

    @receiver(post_save, sender=User)
    def save_user_mentorship(sender, instance, **kwargs):
        if hasattr(instance, 'mentorship'):
            instance.mentorship.save()
        else:
            pass

auditlog.register(Mentorship, exclude_fields=['created_at', 'updated_at'])
