# WiFi Billing System Project Progress

## Status: Implementation Phase
- [x] Phase 1: Environment & Boilerplate
- [x] Phase 2: Core Domain Models
- [x] Phase 3: M-Pesa Integration (`daraja.py`)
- [x] Phase 4: RADIUS Management (`radius_manager.py`)
- [x] Phase 5: Celery Tasks & Session Monitoring
- [x] Phase 6: Captive Portal (Frontend - React/Vite)
- [x] Migrations & Seeding

## Current Issues & Fixes
- **Backend:** Fixed Django `ModuleNotFoundError` by correctly installing into `venv`.
- **Backend Settings:** Fixed `NameError` for `TIME_ZONE` in `settings.py`.
- **Frontend:** Fixed `npm start` error. Use `npm run dev`.
- **Database:** Added SQLite fallback in `.env` for local development without Docker.
- **Routing:** Disabled `APPEND_SLASH` to fix 404 errors on API POST requests.
- **M-Pesa:** Updated Daraja sandbox credentials with shortcode `600996`.

## Next Steps
- Implement more granular session monitoring in `core/tasks.py`.
- Add unit tests for payment and radius logic.
- Verify RADIUS CoA packets using `pyrad`.

## Commands
- **Backend:** `.\venv\Scripts\python backend/manage.py runserver`
- **Frontend:** `cd frontend && npm run dev`
- **Docker:** `docker-compose up -d`
