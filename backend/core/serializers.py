from rest_framework import serializers
from .models import Package, WiFiUser, Transaction, Session, SystemSettings

class PackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Package
        fields = '__all__'

class SystemSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemSettings
        fields = '__all__'

class WiFiUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = WiFiUser
        fields = ['id', 'username', 'phone_number', 'full_name', 'house_number', 'is_admin', 'is_active', 'created_at']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False}
        }

class TransactionSerializer(serializers.ModelSerializer):
    package_name = serializers.CharField(source='package.name', read_only=True)
    class Meta:
        model = Transaction
        fields = ['id', 'package_name', 'amount', 'created_at', 'status']
