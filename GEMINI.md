# ALEXIA TECH WiFi Billing System Project Progress

## Status: Implementation Phase
- [x] Phase 1: Environment & Boilerplate
- [x] Phase 2: Core Domain Models (Enhanced with full_name, house_number, is_active)
- [x] Phase 3: M-Pesa Integration (`daraja.py` & functional STK Push renewals)
- [x] Phase 4: RADIUS Management (`radius_manager.py`)
- [x] Phase 5: Celery Tasks & Session Monitoring
- [x] Phase 6: Captive Portal (Frontend - React/Vite)
- [x] Phase 7: Full Admin & Customer Dashboards (Modular Refactor)
- [x] Phase 8: Dynamic Analytics & Admin Management Tools
- [x] Migrations & Seeding

## Accomplishments
- **Rebranding**: Successfully transitioned from HOPE WiFi to **ALEXIA TECH WiFi**.
- **Intuitive Landing Page**: Redesigned the entrance experience with a high-impact, feature-rich hero section and improved UX.
- **Full Responsiveness**: Implemented modern CSS media queries and flexible layouts ensuring a premium experience on both Smartphones and Laptops.
- **Dynamic Dashboard**: Real-time revenue charts (last 7 days) and auto-identifying expiring subscribers.
- **Package Management**: Complete UI for Adding, Editing, and Deleting WiFi packages with database sync.
- **Subscriber Management**: Functional tools for Editing profiles, Suspending/Activating accounts, and Deleting users.
- **Dual Authentication**: Seamless login for both WiFi subscribers and Django superusers/staff.
- **Automated Renewals**: Functional "Renew via M-Pesa" button in Admin panel triggering real STK pushes.
- **UI/UX Restoration**: Re-implemented the "NetPulse" professional aesthetic across all dashboard views.
- **Brand Identity**: Integrated custom `wi-fi.png` logo across Splash screen, Sidebar, and Favicon.

## Current Issues & Fixes
- **Backend:** Fixed Django `ModuleNotFoundError` by correctly installing into `venv`.
- **Backend:** Upgraded Django to 6.0+ to resolve Python 3.14 incompatibility (`AttributeError` in admin panel).
- **Backend Settings:** Fixed `NameError` for `TIME_ZONE` in `settings.py`.
- **Frontend:** Fixed Vite parse error in `App.tsx` by quoting CSS variables in style objects.
- **Frontend:** Resolved TypeScript errors regarding unused imports and type-only modules.
- **Database:** Fixed `OperationalError` by creating and applying migration for missing `is_admin` column.
- **Database:** Implemented `is_active` field to support account suspension.
- **Routing:** Disabled `APPEND_SLASH` to fix 404 errors on API POST requests.
- **M-Pesa:** Updated Daraja sandbox credentials with shortcode `600996`.

## Next Steps
- Implement more granular session monitoring in `core/tasks.py`.
- Add unit tests for payment and radius logic.
- Verify RADIUS CoA packets using `pyrad`.
- Add "Export CSV" functionality for payments and subscribers.

## Commands
- **Backend:** `..\venv\Scripts\python backend/manage.py runserver`
- **Frontend:** `cd frontend && npm run dev`
- **Docker:** `docker-compose up -d`
