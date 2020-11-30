from django.contrib import admin

from .models import SamplePack, MailingListFollower

class SamplePackAdmin(admin.ModelAdmin):
    list_display = ("title", "price", "description", "image", "samplepackfile")

class MailingListFollowerAdmin(admin.ModelAdmin):
    list_display = ("firstname", "lastname", "email")

admin.site.register(SamplePack, SamplePackAdmin)
admin.site.register(MailingListFollower, MailingListFollowerAdmin)