from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import AdminActivityListView, AdminMetricsView, AdminTaskViewSet, AdminUserListView

router = DefaultRouter()
router.register("tasks", AdminTaskViewSet, basename="admin-task")

urlpatterns = [
    path("metrics/", AdminMetricsView.as_view(), name="admin-metrics"),
    path("users/", AdminUserListView.as_view(), name="admin-users"),
    path("activity/", AdminActivityListView.as_view(), name="admin-activity"),
]

urlpatterns += router.urls
