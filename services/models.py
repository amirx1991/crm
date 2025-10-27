from django.db import models
from admins.models import Admin
from utils import public_variable
# Create your models here.
class TypeSercie(models.Model):
    title = models.TextField()
    code = models.IntegerField()
    class Meta:
        db_table = 'type_services'



class Materail(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True) 
    title = models.CharField(max_length=300)
    count =  models.IntegerField(null=True)
    price = models.DecimalField(max_digits=20, decimal_places=6, null=True)
    class Meta:
        db_table = 'materail'


class Invoice(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    material = models.ManyToManyField(Materail)
    class Meta:
        db_table = 'invoices'

    

class Service(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True) 
    title = models.CharField(max_length=300)
    type_service = models.ForeignKey(TypeSercie, on_delete=models.SET_NULL, null=True)
    user = models.ForeignKey(Admin, on_delete=models.CASCADE, related_name='services_as_user')
    operator = models.ForeignKey(Admin, on_delete=models.SET_NULL, null=True, related_name='services_as_operator')
    desc = models.TextField(null=True)
    status = models.IntegerField(choices=public_variable.ServiceStatus, default=0)
    invoice = models.ForeignKey(Invoice, on_delete=models.SET_NULL, null=True)
    
    class Meta:
        db_table = 'services'










    