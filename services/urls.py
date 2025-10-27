from rest_framework.routers import DefaultRouter,SimpleRouter
from services.views import ServiceViewSet, InvoiceViewSet, MaterailViewSet
from rest_framework import routers

app_name = "admins"

router = routers.SimpleRouter()

router.register(r'materails', MaterailViewSet)
router.register(r'invoices', InvoiceViewSet)
router.register(r'services', ServiceViewSet)
urlpatterns = router.urls