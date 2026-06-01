from rest_framework import generics, status, serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Package, WiFiUser, Transaction, Session, SystemSettings
from .serializers import PackageSerializer, WiFiUserSerializer, TransactionSerializer, SystemSettingsSerializer
from django.db import IntegrityError, transaction
from django.db.models import Sum
from django.utils import timezone
from datetime import timedelta

class SystemSettingsView(APIView):
    def get(self, request):
        settings, created = SystemSettings.objects.get_or_create(id=1)
        return Response(SystemSettingsSerializer(settings).data)

    def patch(self, request):
        settings, created = SystemSettings.objects.get_or_create(id=1)
        serializer = SystemSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PackageListView(generics.ListCreateAPIView):
    queryset = Package.objects.all()
    serializer_class = PackageSerializer

class PackageDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Package.objects.all()
    serializer_class = PackageSerializer

class RegisterView(generics.CreateAPIView):
    queryset = WiFiUser.objects.all()
    serializer_class = WiFiUserSerializer

from django.contrib.auth import authenticate

class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        # 1. Try custom WiFiUser (cleartext)
        try:
            user = WiFiUser.objects.get(username=username, password=password)
            if not user.is_active:
                return Response({"error": "Your account has been suspended. Please contact the administrator."}, status=status.HTTP_403_FORBIDDEN)
                
            return Response({
                "message": "Login successful",
                "user": WiFiUserSerializer(user).data
            })
        except WiFiUser.DoesNotExist:
            pass
            
        # 2. Try standard Django Authentication (for superusers)
        django_user = authenticate(username=username, password=password)
        if django_user:
            # Sync with WiFiUser if doesn't exist
            # Generate a "safe" placeholder that doesn't collide easily
            placeholder_phone = f"ADMIN_{django_user.id}"[:15]
            
            wifi_user, created = WiFiUser.objects.get_or_create(
                username=username,
                defaults={
                    'password': password, # Store for RADIUS
                    'is_admin': django_user.is_superuser or django_user.is_staff,
                    'phone_number': placeholder_phone
                }
            )
            # If existed but needs update
            if not created and (django_user.is_superuser or django_user.is_staff):
                wifi_user.is_admin = True
                wifi_user.save()
                
            return Response({
                "message": "Login successful (Admin)",
                "user": WiFiUserSerializer(wifi_user).data
            })
            
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

from django.db.models.functions import TruncDay

class AdminStatsView(APIView):
    def get(self, request):
        # 1. Basic Stats
        total_revenue = Transaction.objects.filter(status='SUCCESS').aggregate(Sum('amount'))['amount__sum'] or 0
        active_users = WiFiUser.objects.count()
        online_devices = Session.objects.filter(is_active=True).count()
        
        # 2. Revenue - Last 7 Days
        seven_days_ago = timezone.now() - timedelta(days=7)
        daily_revenue = Transaction.objects.filter(
            status='SUCCESS', 
            created_at__gte=seven_days_ago
        ).annotate(day=TruncDay('created_at')).values('day').annotate(total=Sum('amount')).order_by('day')
        
        # Format for frontend (ensure all 7 days are present even if 0)
        revenue_labels = []
        revenue_values = []
        for i in range(7):
            date = (timezone.now() - timedelta(days=6-i)).date()
            revenue_labels.append(date.strftime('%a'))
            # Find in query result
            match = next((item for item in daily_revenue if item['day'].date() == date), None)
            revenue_values.append(float(match['total']) if match else 0)

        # 3. Expiring Soon (Subscribers whose latest successful transaction expires within 48 hours)
        expiring_soon = []
        # For simplicity, we'll get users who have a successful transaction
        # and calculate their expiry. A more robust way would be an expiry_date field on WiFiUser.
        all_users = WiFiUser.objects.all()
        now = timezone.now()
        in_48_hours = now + timedelta(hours=48)
        
        for user in all_users:
            latest_tx = Transaction.objects.filter(user=user, status='SUCCESS').order_by('-created_at').first()
            if latest_tx:
                expiry = latest_tx.created_at + timedelta(seconds=latest_tx.package.duration_seconds)
                if now < expiry <= in_48_hours:
                    expiring_soon.append({
                        "id": user.id,
                        "username": user.username,
                        "full_name": user.full_name,
                        "phone_number": user.phone_number,
                        "house_number": user.house_number,
                        "package_name": latest_tx.package.name,
                        "package_id": latest_tx.package.id,
                        "expires": expiry.isoformat()
                    })

        return Response({
            "total_revenue": total_revenue,
            "active_subscribers": active_users,
            "online_devices": online_devices,
            "renewals_due": len(expiring_soon),
            "chart_data": {
                "labels": revenue_labels,
                "values": revenue_values
            },
            "expiring_soon": expiring_soon[:5] # Limit to 5
        })

class SubscriberListView(generics.ListCreateAPIView):
    queryset = WiFiUser.objects.filter(is_admin=False).order_by('-created_at')
    serializer_class = WiFiUserSerializer

class SubscriberDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = WiFiUser.objects.all()
    serializer_class = WiFiUserSerializer

class AllTransactionsView(generics.ListAPIView):
    queryset = Transaction.objects.all().order_by('-created_at')
    serializer_class = TransactionSerializer

class ActiveSessionsView(generics.ListAPIView):
    queryset = Session.objects.filter(is_active=True).order_by('-start_time')
    
    class SessionSerializer(serializers.ModelSerializer):
        username = serializers.CharField(source='user.username', read_only=True, default="Unknown")
        full_name = serializers.CharField(source='user.full_name', read_only=True, default="N/A")
        package_name = serializers.CharField(source='package.name', read_only=True, default="None")
        class Meta:
            model = Session
            fields = '__all__'
    
    serializer_class = SessionSerializer

class ExpiringSubscribersView(APIView):
    def get(self, request):
        expiring_soon = []
        all_users = WiFiUser.objects.all()
        now = timezone.now()
        in_48_hours = now + timedelta(hours=48)
        
        for user in all_users:
            latest_tx = Transaction.objects.filter(user=user, status='SUCCESS').order_by('-created_at').first()
            if latest_tx:
                expiry = latest_tx.created_at + timedelta(seconds=latest_tx.package.duration_seconds)
                if now < expiry <= in_48_hours:
                    expiring_soon.append({
                        "id": user.id,
                        "username": user.username,
                        "full_name": user.full_name,
                        "phone_number": user.phone_number,
                        "house_number": user.house_number,
                        "package_name": latest_tx.package.name,
                        "package_id": latest_tx.package.id,
                        "expires": expiry.isoformat()
                    })
        return Response(expiring_soon)

class UserProfileView(APIView):
    def put(self, request):
        username = request.data.get('username')
        try:
            user = WiFiUser.objects.get(username=username)
            user.phone_number = request.data.get('phone_number', user.phone_number)
            user.full_name = request.data.get('full_name', user.full_name)
            user.house_number = request.data.get('house_number', user.house_number)
            with transaction.atomic():
                user.save()
            return Response(WiFiUserSerializer(user).data)
        except WiFiUser.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        except IntegrityError:
            return Response({"error": "This phone number is already registered to another account."}, status=status.HTTP_400_BAD_REQUEST)

import csv
from django.http import HttpResponse

class ExportTransactionsCSVView(APIView):
    def get(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="transactions.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['ID', 'Subscriber', 'Phone', 'Package', 'Amount', 'M-Pesa Ref', 'Status', 'Date'])
        
        transactions = Transaction.objects.all().order_by('-created_at')
        for t in transactions:
            writer.writerow([
                t.id,
                t.user.username,
                t.user.phone_number,
                t.package.name,
                t.amount,
                t.mpesa_receipt_number or 'N/A',
                t.status,
                t.created_at.strftime('%Y-%m-%d %H:%M:%S')
            ])
            
        return response

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
