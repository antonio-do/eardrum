# Generated by Django 2.1.7 on 2021-06-18 07:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('leave', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='leave',
            name='note',
            field=models.TextField(blank=True, default=''),
        ),
    ]
