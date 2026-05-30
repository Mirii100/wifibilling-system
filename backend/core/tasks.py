from celery import shared_task
from .models import Session, Transaction
from radius.manager import RadiusManager
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

@shared_task
def check_expired_sessions():
    """Periodically check for sessions that should have ended."""
    # This is a fallback if RADIUS Session-Timeout fails or for data caps
    # In a real scenario, we'd query RADIUS accounting (radacct) to see current usage
    pass

@shared_task
def cleanup_pending_transactions():
    """Cleanup old pending transactions that never got a callback."""
    threshold = timezone.now() - timezone.timedelta(minutes=15)
    Transaction.objects.filter(status='PENDING', created_at__lt=threshold).update(status='FAILED')
