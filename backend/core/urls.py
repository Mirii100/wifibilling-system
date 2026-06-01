from django.urls import path
from .views import (
    PackageListView, PackageDetailView, LoginView, RegisterView, UserProfileView, 
    ChangePasswordView, MyPlansView, AdminStatsView, SubscriberListView,
    SubscriberDetailView, AllTransactionsView, ExportTransactionsCSVView, 
    ExpiringSubscribersView, ActiveSessionsView, SystemSettingsView
)

urlpatterns = [
    path('packages/', PackageListView.as_view(), name='package-list'),
    path('packages/<int:pk>/', PackageDetailView.as_view(), name='package-detail'),
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('my-plans/', MyPlansView.as_view(), name='my-plans'),
    
    # Admin endpoints
    path('admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('admin/subscribers/', SubscriberListView.as_view(), name='admin-subscribers'),
    path('admin/subscribers/<int:pk>/', SubscriberDetailView.as_view(), name='admin-subscriber-detail'),
    path('admin/transactions/', AllTransactionsView.as_view(), name='admin-transactions'),
    path('admin/transactions/export/', ExportTransactionsCSVView.as_view(), name='admin-transactions-export'), 
    path('admin/subscribers/expiring/', ExpiringSubscribersView.as_view(), name='admin-subscribers-expiring'), 
    path('admin/settings/', SystemSettingsView.as_view(), name='admin-settings'),
    path('admin/sessions/', ActiveSessionsView.as_view(), name='admin-sessions'),

]
