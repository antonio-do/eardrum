# Generated by Django 2.1.7 on 2021-07-12 01:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('leave', '0007_auto_20210708_0929'),
    ]

    operations = [
        migrations.AlterField(
            model_name='leavemask',
            name='value',
            field=models.TextField(),
        ),
    ]
