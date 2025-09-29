from django.utils.dateparse import parse_datetime
from django.utils.timezone import make_aware
from rest_framework import generics, permissions

from .models import ActivityLog
from .serializers import ActivityLogSerializer


class ActivityLogListView(generics.ListAPIView):
    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = ActivityLog.objects.all()
        user = self.request.user
        if not user.is_staff:
            queryset = queryset.filter(user=user)
        user_param = self.request.query_params.get("user")
        if user_param and user.is_staff:
            queryset = queryset.filter(user__id=user_param)
        action = self.request.query_params.get("action")
        if action:
            queryset = queryset.filter(action=action)
        start = self.request.query_params.get("start")
        end = self.request.query_params.get("end")
        if start:
            dt = parse_datetime(start)
            if dt is not None:
                if dt.tzinfo is None:
                    dt = make_aware(dt)
                queryset = queryset.filter(created_at__gte=dt)
        if end:
            dt = parse_datetime(end)
            if dt is not None:
                if dt.tzinfo is None:
                    dt = make_aware(dt)
                queryset = queryset.filter(created_at__lte=dt)
        return queryset
