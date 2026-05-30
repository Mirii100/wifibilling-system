# WiFi Billing System

A captive portal WiFi billing system with M-Pesa STK Push authentication and RADIUS session management.

## Features
- **M-Pesa STK Push:** Automatic payment prompt on user selection.
- **RADIUS Integration:** Automatic provisioning of network access.
- **Session Management:** Time and data-capped sessions.
- **Modern UI:** Responsive captive portal built with React.

## Quick Start
1. **Configure Environment:**
   - Copy `backend/.env` and update your Safaricom Daraja credentials.
2. **Launch Services:**
   ```bash
   docker-compose up -d
   ```
3. **Seed Packages:**
   ```bash
   docker-compose exec backend python seed_packages.py
   ```
4. **Access:**
   - Captive Portal: `http://localhost:5173`
   - Admin API: `http://localhost:8000/admin/`

## Router Integration (MikroTik)
1. Go to **IP -> Hotspot -> Server Profiles**.
2. Select your profile, go to **RADIUS**, and check **Use RADIUS**.
3. Go to **RADIUS** in the main menu, add a new server:
   - Service: `hotspot`
   - Address: `<Your Server IP>`
   - Secret: `testing123`
4. Set **Incoming** to accept CoA (Port 3799).

## Development
- **Backend:** Django REST Framework
- **Frontend:** React + TypeScript + Vanilla CSS
- **RADIUS:** FreeRADIUS 3.x
