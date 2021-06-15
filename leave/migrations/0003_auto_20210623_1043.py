# Generated by Django 2.1.7 on 2021-06-23 10:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('leave', '0002_leave_note'),
    ]

    operations = [
        migrations.CreateModel(
            name='ConfigEntry',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, unique=True)),
                ('value', models.CharField(blank=True, max_length=255, null=True)),
                ('extra', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
        ),
        migrations.AddField(
            model_name='leave',
            name='active',
            field=models.BooleanField(blank=True, default=True),
        ),
    ]
