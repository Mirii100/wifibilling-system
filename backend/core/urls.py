from django.urls import path
from .views import PackageListView, LoginView, RegisterView, UserProfileView, ChangePasswordView, MyPlansView

urlpatterns = [
    path('packages/', PackageListView.as_view(), name='package-list'),
    path('login/', LoginView.as_view(), name='login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('my-plans/', MyPlansView.as_view(), name='my-plans'),
]
