from django.db import models

# Create your models here.


class Product(models.Model):
    title = models.CharField(max_length=300)
    code = models.IntegerField()
    price = models.DecimalField(max_digits=20, decimal_places=6, null=True)
    desc = models.TextField(null=True)
    class Meta:
        db_table = 'products'


    


