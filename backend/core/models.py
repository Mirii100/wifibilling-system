from django.db import models
import uuid

class Package(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration_seconds = models.PositiveIntegerField(help_text="Duration in seconds")
    data_limit_bytes = models.BigIntegerField(help_text="Data limit in bytes", default=0) # 0 = unlimited
    speed_limit_up_kbps = models.PositiveIntegerField(default=1024)
    speed_limit_down_kbps = models.PositiveIntegerField(default=1024)
    
    def __str__(self):
        return self.name

class WiFiUser(models.Model):
    phone_number = models.CharField(max_length=15, unique=True)
    username = models.CharField(max_length=50, unique=True)
    password = models.CharField(max_length=50) # Cleartext for RADIUS (standard for simple Hotspots)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.phone_number} ({self.username})"

class Transaction(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(WiFiUser, on_delete=models.CASCADE)
    package = models.ForeignKey(Package, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    mpesa_receipt_number = models.CharField(max_length=50, blank=True, null=True)
    checkout_request_id = models.CharField(max_length=100, unique=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Session(models.Model):
    user = models.ForeignKey(WiFiUser, on_delete=models.CASCADE)
    package = models.ForeignKey(Package, on_delete=models.CASCADE)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    nas_ip_address = models.GenericIPAddressField(null=True, blank=True)
    acct_session_id = models.CharField(max_length=100, blank=True, null=True)
    is_active = models.BooleanField(default=True)
