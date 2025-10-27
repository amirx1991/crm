from django.shortcuts import render
from rest_framework.generics import ListAPIView, RetrieveAPIView, CreateAPIView, DestroyAPIView, UpdateAPIView, RetrieveUpdateDestroyAPIView, ListCreateAPIView
from .serializer import UserSerializer
from .models import Admin
from utils import public_variable
from rest_framework.views import APIView
from utils.sms import SmartSms
import random
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializer import CustomTokenObtainPairSerializer
from rest_framework import status, viewsets
from utils.pagination import CustomPaginationClass
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from django.core.cache import cache
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from admins.permissions import IsPatient
class ListAdmin(ListAPIView):
    name = "list_admin"
    model = Admin 
    pagination_class = CustomPaginationClass  
    serializer_class = UserSerializer
    queryset = Admin.objects.filter(type_user=public_variable.ADMIN_TYPE)
    def get_queryset(self):
        return Admin.objects.filter(type_user=self.request.GET.get('type'))
    

class CreateAdmin(CreateAPIView):
    # authentication_classes = [JWTAuthentication]
    # permission_classes = [IsAuthenticated]
    name = "create_admin"
    model = Admin
    serializer_class = UserSerializer

class DetailAdmin(RetrieveUpdateDestroyAPIView):
    name = "detail_admin"
    model = Admin   
    serializer_class = UserSerializer
    def get_queryset(self):
        return  Admin.objects.filter(type_user=self.request.GET.get('type'))




class CustomTokenObtainPairView(TokenObtainPairView):
    name = 'custom_tocken'
    serializer_class = CustomTokenObtainPairSerializer
    model = Admin


@api_view(['POST'])
@permission_classes([AllowAny])
def send_otp(request):
    phone = request.data.get('phone')
    print("DDDDDDDDDDDDDd", phone)
    if not phone:
        return Response({'message': 'شماره تلفن الزامی است'}, status=400)

    try:
        patient = Admin.objects.filter(phone=phone,type_user=public_variable.USER_TYPE).first()
        if not patient:
            return Response({'message': 'مشتری با این شماره تلفن یافت نشد'}, status=400)
        # generate otp
        otp = ''.join([str(random.randint(0, 9)) for _ in range(5)])
        otp = '12345'
        
        # save otp in cache
        cache.set(f'patient_otp_{phone}', otp, timeout=120)
        
        # send sms
        SmartSms.send_background(
            mobile=phone,
            template='authenticate',
            tokens={
                'token': otp
            }
        )
        
        return Response({'message': 'کد تایید ارسال شد'})
    except Exception as e:
        return Response({'message': str(e)}, status=400)
    
@api_view(['POST'])
def send_patient_otp(request):
    phone = request.data.get('phone')
    
    try:
        user = Admin.objects.get(phone=phone)
        # در اینجا باید کد OTP را تولید و ارسال کنید
        # برای تست، فرض می‌کنیم OTP با موفقیت ارسال شده
        return Response({'message': 'کد تایید ارسال شد'})
        
    except Admin.DoesNotExist:
        return Response({'error': 'مشتری یافت نشد'}, status=404)
    
@api_view(['POST'])
def verify_patient_otp(request):
    phone = request.data.get('phone')
    otp = request.data.get('otp')
    
    try:
        patient = Admin.objects.get(phone=phone)
        # بررسی OTP
        if otp == "12345":  # این فقط برای تست است. در محیط واقعی باید OTP را درست بررسی کنید
            # ساخت توکن با اطلاعات مشتری
            refresh = RefreshToken.for_user(patient)
            refresh['patient_id'] = patient.id
            refresh['type'] = 'patient'
            refresh['user_id'] = patient.id
            
            access_token = refresh.access_token
            access_token['patient_id'] = patient.id
            access_token['type'] = 'patient'
            access_token['user_id'] = patient.id
            
            return Response({
                'token': str(access_token),
                'refresh': str(refresh),
            })
        else:
            return Response({'error': 'کد تایید نامعتبر است'}, status=400)
            
    except Admin.DoesNotExist:
        return Response({'error': 'مشتری یافت نشد'}, status=404)
    

from django.http import HttpResponse
import os
from django.http import FileResponse

def acme_challenge(request, token):
    # محتوای پاسخ که معمولاً در فایل قرار می‌گیرد
    # به عنوان مثال، می‌توانید محتوا را از یک فایل یا دیتابیس بخوانید
    file_path = f'static/acme/{token}.txt'
    if os.path.exists(file_path):
        return FileResponse(open(file_path, 'rb'), content_type='text/plain', as_attachment=True)
    else:
        return HttpResponse('File not found.', status=404)
    


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    phone = request.data.get('phone')
    otp = request.data.get('otp')
    
    if not phone or not otp:
        return Response({'message': 'شماره تلفن و کد تایید الزامی است'}, status=400)

    # بررسی کد تایید
    cached_otp = cache.get(f'patient_otp_{phone}')
    if not cached_otp or cached_otp != otp:
        return Response({'message': 'کد تایید نامعتبر است'}, status=400)

    # پیدا کردن یا ایجاد مشتری
    patient = Admin.objects.filter(phone=phone).first()
    if not patient:
        return Response({'message': 'مشتری یافت نشد'}, status=404)

    # ایجاد توکن
    refresh = RefreshToken.for_user(patient)
    
    # اضافه کردن اطلاعات مشتری به توکن
    refresh['patient_id'] = patient.id
    refresh['type'] = 'patient'
    refresh['user_id'] = patient.id
    
    # اضافه کردن اطلاعات به access token
    access_token = refresh.access_token
    access_token['patient_id'] = patient.id
    access_token['type'] = 'patient'
    access_token['user_id'] = patient.id
    
    # حذف OTP از کش
    cache.delete(f'patient_otp_{phone}')
    
    print("Generated Token Payload:", {
        'patient_id': patient.id,
        'type': 'patient',
        'user_id': patient.id
    })
    
    return Response({
        'token': str(access_token),
        'refresh': str(refresh),
        'patient': {
            'id': patient.id,
            'first_name': patient.first_name,
            'last_name': patient.last_name,
            'phone': str(patient.phone)
        }
    })




class PatientProfileAPIView(APIView):
    """
    View for handling patient profile operations
    """
    permission_classes = [IsPatient]


    
    def get(self, request):
        """
        Get patient profile and associated studies through StudySubmission
        """
        try:
            patient = request.patient
            # دریافت مطالعات از طریق StudySubmission

          
            
            print("DDDDDDDDDDDDDDDDDDDDDD")
            return Response({
                'id': patient.id,
                'first_name': patient.first_name,
                'last_name': patient.last_name,
                'phone':str(patient.phone),
            })
            
        except Exception as e:
            print(f"Error in patient profile: {str(e)}")
            return Response({'error': str(e)}, status=500)
