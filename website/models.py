from django.db import models

class SamplePack (models.Model):
    title = models.CharField(max_length=100)
    price = models.IntegerField()
    description = models.TextField()
    image = models.ImageField()
    samplepackfile = models.FileField()





