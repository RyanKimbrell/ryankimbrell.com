# Generated by Django 3.0.8 on 2020-11-25 00:58

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('website', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='samplepack',
            old_name='file',
            new_name='samplepackfile',
        ),
    ]
