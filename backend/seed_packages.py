import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'wifi_backend.settings')
django.setup()

from core.models import Package

def seed_packages():
    packages = [
        {"name": "30 Mins", "price": 10.00, "duration_seconds": 1800, "data_limit_bytes": 524288000},
        {"name": "1 Hour", "price": 20.00, "duration_seconds": 3600, "data_limit_bytes": 1073741824},
        {"name": "3 Hours", "price": 40.00, "duration_seconds": 10800, "data_limit_bytes": 2147483648},
        {"name": "Daily", "price": 80.00, "duration_seconds": 86400, "data_limit_bytes": 0},
        {"name": "24HR Unlimited", "price": 100.00, "duration_seconds": 86400, "data_limit_bytes": 0},
        {"name": "Weekly Basic", "price": 250.00, "duration_seconds": 604800, "data_limit_bytes": 5368709120},
        {"name": "Weekly Premium", "price": 400.00, "duration_seconds": 604800, "data_limit_bytes": 0},
        {"name": "Monthly Lite", "price": 1000.00, "duration_seconds": 2592000, "data_limit_bytes": 21474836480},
        {"name": "Monthly Pro", "price": 1500.00, "duration_seconds": 2592000, "data_limit_bytes": 53687091200},
        {"name": "Monthly Unlimited", "price": 2500.00, "duration_seconds": 2592000, "data_limit_bytes": 0},
    ]

    for pkg_data in packages:
        Package.objects.get_or_create(name=pkg_data["name"], defaults=pkg_data)
        print(f"Seeded package: {pkg_data['name']}")

if __name__ == "__main__":
    seed_packages()
