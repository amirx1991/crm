from django.contrib import admin
from django.conf.urls.static import static
from django.urls import path, include, re_path
from products import views
from rest_framework import routers
from django.conf import settings
app_name = "services"
router = routers.SimpleRouter()
urlpatterns =  [
    path('list', views.ListProduct.as_view(), name=views.ListProduct.name),
    path('detail', views.updateProduct.as_view(), name=views.updateProduct.name),


]



