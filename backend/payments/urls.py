from django.urls import path
from .views import StkPushView, MpesaCallbackView

urlpatterns = [
    path('stk-push/', StkPushView.as_view(), name='stk-push'),
    path('callback/', MpesaCallbackView.as_view(), name='mpesa-callback'),
]
