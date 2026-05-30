from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Package, WiFiUser, Transaction
from .serializers import PackageSerializer, WiFiUserSerializer, TransactionSerializer

class PackageListView(generics.ListAPIView):
    queryset = Package.objects.all()
    serializer_class = PackageSerializer

class RegisterView(generics.CreateAPIView):
    queryset = WiFiUser.objects.all()
    serializer_class = WiFiUserSerializer

class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        try:
            user = WiFiUser.objects.get(username=username, password=password)
            return Response({
                "message": "Login successful",
                "user": WiFiUserSerializer(user).data
            })
        except WiFiUser.DoesNotExist:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

class MyPlansView(APIView):
    def post(self, request):
        username = request.data.get('username')
        try:
            user = WiFiUser.objects.get(username=username)
            transactions = Transaction.objects.filter(user=user, status='SUCCESS').order_by('-created_at')
            return Response(TransactionSerializer(transactions, many=True).data)
        except WiFiUser.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

from django.db import IntegrityError, transaction

class UserProfileView(APIView):
    def put(self, request):
        username = request.data.get('username')
        try:
            user = WiFiUser.objects.get(username=username)
            user.phone_number = request.data.get('phone_number', user.phone_number)
            with transaction.atomic():
                user.save()
            return Response(WiFiUserSerializer(user).data)
        except WiFiUser.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        except IntegrityError:
            return Response({"error": "This phone number is already registered to another account."}, status=status.HTTP_400_BAD_REQUEST)

class ChangePasswordView(APIView):
    def post(self, request):
        username = request.data.get('username')
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        try:
            user = WiFiUser.objects.get(username=username, password=old_password)
            user.password = new_password
            user.save()
            return Response({"message": "Password changed successfully"})
        except WiFiUser.DoesNotExist:
            return Response({"error": "Invalid current password"}, status=status.HTTP_401_UNAUTHORIZED)
