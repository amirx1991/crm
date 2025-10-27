from django.contrib import admin
from django.conf.urls.static import static
from django.urls import path, include, re_path
from admins import views
from rest_framework import routers
from django.conf import settings
app_name = "admins"

router = routers.SimpleRouter()
#router.register(r'users/', views.ListUser,  basename='users')
# router.register(r'accounts', AccountViewSet)
urlpatterns =  [

    path('admins/list', views.ListAdmin.as_view(), name=views.ListAdmin.name),
    path('admins/create/', views.CreateAdmin.as_view(), name=views.CreateAdmin.name),
    path('admins/detail/<int:pk>', views.DetailAdmin.as_view(), name=views.DetailAdmin.name),
    
    path('patient/send-otp/', views.send_otp, name='patient-send-otp'),
    path('patient/verify-otp/', views.verify_otp, name='patient-verify-otp'),
    path('users/profile/', views.PatientProfileAPIView.as_view(), name='patient-profile'),
        #   path('dashboard/', TemplateView.as_view(template_name='index.html')),

    



]



