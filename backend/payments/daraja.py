import requests
import base64
from datetime import datetime
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class DarajaService:
    def __init__(self):
        self.consumer_key = settings.MPESA_CONSUMER_KEY
        self.consumer_secret = settings.MPESA_CONSUMER_SECRET
        self.shortcode = settings.MPESA_SHORTCODE
        self.passkey = settings.MPESA_PASSKEY
        self.base_url = "https://sandbox.safaricom.co.ke"

    def get_token(self):
        api_url = f"{self.base_url}/oauth/v1/generate?grant_type=client_credentials"
        response = requests.get(api_url, auth=(self.consumer_key, self.consumer_secret))
        if response.status_code == 200:
            return response.json()['access_token']
        logger.error(f"Failed to get Daraja token: {response.text}")
        return None

    def stk_push(self, phone_number, amount, account_reference, transaction_desc):
        token = self.get_token()
        if not token:
            return None

        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        password = base64.b64encode(f"{self.shortcode}{self.passkey}{timestamp}".encode()).decode()

        headers = {"Authorization": f"Bearer {token}"}
        
        # Robust phone number cleaning
        cleaned = phone_number.strip().replace(' ', '')
        if cleaned.startswith('0') and len(cleaned) == 10:
            phone_number = '254' + cleaned[1:]
        elif len(cleaned) == 9:
            phone_number = '254' + cleaned
        elif cleaned.startswith('254') and len(cleaned) == 12:
            phone_number = cleaned
        elif cleaned.startswith('+254') and len(cleaned) == 13:
            phone_number = cleaned[1:]
        else:
            phone_number = '254' + cleaned[-9:]

        payload = {
            "BusinessShortCode": self.shortcode,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": int(amount),
            "PartyA": phone_number,
            "PartyB": self.shortcode,
            "PhoneNumber": phone_number,
            "CallBackURL": settings.MPESA_CALLBACK_URL,
            "AccountReference": account_reference,
            "TransactionDesc": "Payment to HOPE WiFi Solutions"
        }

        api_url = f"{self.base_url}/mpesa/stkpush/v1/processrequest"
        response = requests.post(api_url, json=payload, headers=headers)
        
        if response.status_code == 200:
            return response.json()
        
        logger.error(f"STK Push failed: {response.text}")
        return None
