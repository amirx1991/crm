import operator
import pandas as pd
from django.shortcuts import render
from rest_framework.generics import ListAPIView, RetrieveAPIView, CreateAPIView, DestroyAPIView, UpdateAPIView, RetrieveUpdateDestroyAPIView, ListCreateAPIView
from utils.sms import SmartSms
from services.models import Service, Invoice, Materail
from rest_framework import viewsets
from services.serializers import ServiceSerializer, InvoiceSerializer, MaterailSerializer, ServiceCreateSerializer
from utils.pagination import CustomPaginationClass
from rest_framework.decorators import action
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import status, permissions, viewsets
from django.http import HttpResponse

# Create your views here.

 
class MaterailViewSet(viewsets.ModelViewSet):
    queryset = Materail.objects.all()
    serializer_class = MaterailSerializer
    pagination_class = CustomPaginationClass
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['post'])
    def import_excel(self, request):
        """
        Import materials from Excel file
        """
        try:
            file = request.FILES.get('file')
            if not file:
                return Response({'detail': 'فایل ارسال نشده است'}, status=status.HTTP_400_BAD_REQUEST)

            # Read Excel file
            if file.name.endswith('.csv'):
                df = pd.read_csv(file, encoding='utf-8')
            else:
                df = pd.read_excel(file)

            # Validate columns
            required_columns = ['عنوان']
            if not all(col in df.columns for col in required_columns):
                return Response({
                    'detail': f'ستون‌های مورد نیاز: {", ".join(required_columns)}'
                }, status=status.HTTP_400_BAD_REQUEST)

            imported_count = 0
            errors = []

            for index, row in df.iterrows():
                try:
                    # Create material
                    material_data = {
                        'title': str(row['عنوان']).strip(),
                        'count': int(row.get('تعداد', 0)) if pd.notna(row.get('تعداد')) else None,
                        'price': float(row.get('قیمت', 0)) if pd.notna(row.get('قیمت')) else None,
                    }

                    # Check if material already exists
                    if Materail.objects.filter(title=material_data['title']).exists():
                        errors.append(f'ردیف {index + 2}: متریال "{material_data["title"]}" قبلاً وجود دارد')
                        continue

                    Materail.objects.create(**material_data)
                    imported_count += 1

                except Exception as e:
                    errors.append(f'ردیف {index + 2}: خطا در پردازش - {str(e)}')

            return Response({
                'imported_count': imported_count,
                'errors': errors,
                'message': f'{imported_count} متریال با موفقیت وارد شد'
            })

        except Exception as e:
            return Response({
                'detail': f'خطا در پردازش فایل: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer

class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    pagination_class = CustomPaginationClass
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        """
        Automatically associate the logged-in user with the service when creating.
        """
        serializer.save(user=self.request.user)

    
    def get_serializer_class(self):
        if self.action == 'create':
            return ServiceCreateSerializer
        return ServiceSerializer


    def create(self, request, *args, **kwargs):
        """
        """
        data = request.data.copy()  # make request.data mutable
        data["user"] = request.user.id  # add user to payload
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """
        Custom update method (e.g., ensure user owns the object).
        """
        instance = self.get_object()

        # Example: only allow the owner to update their service
        if instance.user != request.user:
            return Response({"detail": "You do not have permission to edit this service."},
                            status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(instance, data=request.data, partial=kwargs.get('partial', False))
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def me(self, request):
        user = request.user
        services = Service.objects.filter(user=user)
        serializer = self.get_serializer(services, many=True)
        return Response(serializer.data)

    
    @action(detail=False, methods=['get'])
    def services_assigned_to_operator(self, request):
        user = request.user
        services = Service.objects.filter(operator=user)
        serializer = self.get_serializer(services, many=True)
        return Response(serializer.data)
    
    

    

