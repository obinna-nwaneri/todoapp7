from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/admin/', include('accounts.admin_urls')),
    path('api/doctor/', include('accounts.doctor_urls')),
    path('api/patient/', include('accounts.patient_urls')),
    path('api/public/doctors/', include('doctors.public_urls')),
]
