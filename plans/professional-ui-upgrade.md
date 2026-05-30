# Hope WiFi UI/UX Overhaul Plan

## Objective
Upgrade the captive portal to a professional, industry-standard experience with a unified navigation bar, polished pages, and a sophisticated user dashboard.

## Implementation Steps

### 1. Navigation Architecture
- **Persistent Navbar:** Display Home, About, Contact for all users.
- **Dynamic Actions:** Show Login/Dashboard based on auth state.
- **New Pages:** Standalone components for Home (Landing), About, Contact.

### 2. Dashboard Professionalization (`App.tsx` & `App.css`)
- **Grid-based Layout:** Sidebar for navigation (Profile, Security, My Plans), Main pane for data visualization (charts, activity).
- **Visual Stats:** Cards for Data/Time consumption.
- **Polished UI:** Enhanced spacing, soft shadows, and a clean white/slate theme.

### 3. Consistency
- Ensure all pages (Home, About, Contact, Dashboard) use the same professional layout containers.

## Verification
- Navigate through all links as a guest vs logged-in user.
- Verify dashboard responsiveness.
