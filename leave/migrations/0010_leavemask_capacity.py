# Generated by Django 2.1.7 on 2021-07-21 10:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('leave', '0009_auto_20210712_0145'),
    ]

    operations = [
        migrations.AddField(
            model_name='leavemask',
            name='capacity',
            field=models.TextField(default=''),
            preserve_default=False,
        ),
    ]