from django.db import models
from django.contrib.auth.models import AbstractUser , BaseUserManager
from phonenumber_field.modelfields import PhoneNumberField
from utils import public_variable
from django.core.cache import cache


 
# Create your models here.

def user_directory_path(instance, filename):
# file will be uploaded to MEDIA_ROOT/user_<id>/<filename>
    return f'users/{instance.username}/{filename}'

class Admin(AbstractUser):
    created = models.DateTimeField(auto_now_add=True)
    img = models.FileField(verbose_name='تصویر', upload_to=user_directory_path, null=True, blank=True)
    phone = PhoneNumberField(blank=True, null=True, verbose_name=" تلفن همراه", region="IR")
    type_user = models.IntegerField(verbose_name='نوع کاربر', choices=public_variable.TypeUser, default=0)
    username = models.CharField(max_length=50,unique=True)
    confirm_code = models.BigIntegerField(null=True)
    address = models.TextField(null=True, blank=True)
    device_id = models.CharField(max_length=255, null=True, blank=True)
    
    class Meta:
        db_table = 'admins'

    def __str__(self):
        return str(self.username)
    
    
    
    # @property
    # def weight(self):
    #     from sales.models import Sale

    #     """Returns the weight buy."""
    #     if  cache.get('weight'):
    #         return cache.get('weight')
    #     else:
    #         return Sale.get_weight()


    
        


