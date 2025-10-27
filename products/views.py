from django.shortcuts import render
from rest_framework.generics import ListAPIView, RetrieveAPIView, CreateAPIView, DestroyAPIView, UpdateAPIView, RetrieveUpdateDestroyAPIView, ListCreateAPIView
from .models import Admin
from utils import public_variable
from rest_framework.views import APIView
from utils.sms import SmartSms
import random
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import status, viewsets
from products.models import Product
from utils.pagination import CustomPaginationClass
# Create your views here.
class ListProduct(ListCreateAPIView, CustomPaginationClass):
    model = Product
    queryset = Product.objects.all()
    name = "products"

class updateProduct(RetrieveUpdateDestroyAPIView):
    model = Product
    queryset = Product.objects.all()
    name = "update_product"





    

