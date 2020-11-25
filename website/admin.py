from django.contrib import admin

from .models import SamplePack

class SamplePackAdmin(admin.ModelAdmin):
    list_display = ("title", "price", "description", "image", "samplepackfile")



admin.site.register(SamplePack, SamplePackAdmin)