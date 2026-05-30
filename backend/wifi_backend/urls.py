from django.contrib import admin
from django.urls import path, include
from payments.views import StkPushView, MpesaCallbackView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/core/', include('core.urls')),
    path('api/payments/stk-push/', StkPushView.as_view(), name='stk-push'),
    path('api/payments/callback/', MpesaCallbackView.as_view(), name='mpesa-callback'),
]
