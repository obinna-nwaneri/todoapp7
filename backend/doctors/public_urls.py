from rest_framework.routers import DefaultRouter

from .views import PublicDoctorViewSet

router = DefaultRouter()
router.register('', PublicDoctorViewSet, basename='public-doctors')

urlpatterns = router.urls
