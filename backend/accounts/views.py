from django.contrib.auth import get_user_model
from rest_framework import generics, permissions, response, status
from rest_framework.views import APIView

from .serializers import ChangePasswordSerializer, RegisterSerializer, UserSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class CurrentUserView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    serializer_class = ChangePasswordSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return response.Response({"detail": "Password updated successfully."}, status=status.HTTP_200_OK)
