from rest_framework import serializers
from services.models import Service, Invoice, Materail
from .models import Materail, Invoice, Service
from utils import public_variable

class MaterailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Materail
        fields = '__all__'


class InvoiceSerializer(serializers.ModelSerializer):
    # Nested serialization for many-to-many relation
    material = MaterailSerializer(many=True, read_only=True)
    material_ids = serializers.PrimaryKeyRelatedField(queryset=Materail.objects.all(), many=True, write_only=True, source='material')

    class Meta:
        model = Invoice
        fields = ['id', 'created_at', 'updated_at', 'material', 'material_ids']


class ServiceSerializer(serializers.ModelSerializer):
    invoice = InvoiceSerializer(read_only=True)
    invoice_id = serializers.PrimaryKeyRelatedField(queryset=Invoice.objects.all(), source='invoice', write_only=True)
    status_type = serializers.SerializerMethodField()

    def get_status_type(self, obj):
        return public_variable.ServiceTypeStatus.get(obj.status)

    class Meta:
        model = Service
        fields = ['id', 'created_at', 'updated_at', 'title', 'type_service', 'user', 'operator', 'desc', 'status', 'invoice', 'invoice_id', 'status_type']


#only save first data
class ServiceCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ['title', 'user', 'desc'] 
