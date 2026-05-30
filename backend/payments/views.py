from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from core.models import Package, WiFiUser, Transaction
from .daraja import DarajaService
from radius.manager import RadiusManager
import logging
import random
import string

logger = logging.getLogger(__name__)

class StkPushView(APIView):
    def post(self, request):
        phone_number = request.data.get('phone_number')
        package_id = request.data.get('package_id')
        
        try:
            package = Package.objects.get(id=package_id)
        except Package.DoesNotExist:
            return Response({"error": f"Package with ID {package_id} not found in database"}, status=status.HTTP_400_BAD_REQUEST)
            
        # Create or get user
        user, created = WiFiUser.objects.get_or_create(
            phone_number=phone_number,
            defaults={
                'username': phone_number,
                'password': ''.join(random.choices(string.ascii_letters + string.digits, k=8))
            }
        )
        
        daraja = DarajaService()
        response = daraja.stk_push(
            phone_number=phone_number,
            amount=package.price,
            account_reference=user.username,
            transaction_desc=f"WiFi Package: {package.name}"
        )
        
        if response and response.get('ResponseCode') == '0':
            checkout_request_id = response.get('CheckoutRequestID')
            Transaction.objects.create(
                user=user,
                package=package,
                amount=package.price,
                checkout_request_id=checkout_request_id,
                status='PENDING'
            )
            return Response({"message": "STK Push sent successfully", "checkout_request_id": checkout_request_id})
        
        return Response({"error": "Failed to initiate STK Push"}, status=status.HTTP_400_BAD_REQUEST)

class MpesaCallbackView(APIView):
    def post(self, request):
        data = request.data.get('Body', {}).get('stkCallback', {})
        result_code = data.get('ResultCode')
        checkout_request_id = data.get('CheckoutRequestID')
        
        try:
            transaction = Transaction.objects.get(checkout_request_id=checkout_request_id)
        except Transaction.DoesNotExist:
            logger.error(f"Transaction not found for CheckoutRequestID: {checkout_request_id}")
            return Response({"message": "Transaction not found"}, status=status.HTTP_404_NOT_FOUND)
            
        if result_code == 0:
            # Payment successful
            transaction.status = 'SUCCESS'
            
            # Extract receipt number
            callback_metadata = data.get('CallbackMetadata', {}).get('Item', [])
            for item in callback_metadata:
                if item.get('Name') == 'MpesaReceiptNumber':
                    transaction.mpesa_receipt_number = item.get('Value')
                    break
            
            transaction.save()
            
            # Provision RADIUS
            radius = RadiusManager()
            radius.create_user(transaction.user.username, transaction.user.password)
            radius.set_package_attributes(
                transaction.user.username, 
                transaction.package.duration_seconds,
                transaction.package.data_limit_bytes
            )
            
            logger.info(f"Payment successful for {transaction.user.phone_number}. RADIUS provisioned.")
        else:
            transaction.status = 'FAILED'
            transaction.save()
            logger.warning(f"Payment failed for CheckoutRequestID: {checkout_request_id}. Code: {result_code}")
            
        return Response({"ResultCode": 0, "ResultDesc": "Success"})
