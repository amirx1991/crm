from rest_framework.permissions import BasePermission
from rest_framework_simplejwt.tokens import AccessToken
from django.core.exceptions import ObjectDoesNotExist
from admins.models import Admin

class IsPatient(BasePermission):
    def has_permission(self, request, view):
        try:
            auth_header = request.headers.get('Authorization')
            print("DDDDDDDDDDDDDDDDDDDDDDDDDD", auth_header)

            if not auth_header or not auth_header.startswith('Token'):
                return False

            token = auth_header.split(' ')[1]
            access_token = AccessToken(token)
            print("33333333333333333", access_token.get('patient_id'))
            if access_token.get('type') != 'patient':
                return False
                
            patient_id = access_token.get('patient_id')
            if not patient_id:
                return False
            
            try:
                patient = Admin.objects.get(id=patient_id)
                # ذخیره بیمار در request برای دسترسی در ویو
                request.patient = patient
                return True
            except Admin.DoesNotExist:
                return False

        except Exception as e:
            print(f"Error in IsPatient permission: {str(e)}")
            return False 