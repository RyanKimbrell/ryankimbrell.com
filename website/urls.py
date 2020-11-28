from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("home", views.index, name="home"),
    path("samplepacks", views.samplepacks, name="samplepacks"),
    path("artwork", views.artwork, name="artwork"),
    path("plugins", views.plugins, name="plugins"),
    path("resume", views.resume, name="resume"),
    path("portfolio", views.portfolio, name="portfolio"),
    path("contact", views.contact, name="contact"),

]