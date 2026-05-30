# Hope WiFi Package History Plan

## Objective
Enable users to view a list of all successfully purchased packages (history) rather than just the current one, and ensure they remain visible until they are fully depleted.

## Implementation Steps

### 1. Update Models (`backend/core/models.py`)
- The `Transaction` model already tracks successful payments (`status='SUCCESS'`).
- We will retrieve all transactions for the current `WiFiUser` where `status='SUCCESS'`.

### 2. Add API Endpoint
- Create a new endpoint `api/core/my-plans/` that returns all successful transactions for the logged-in user.

### 3. Update Frontend (`App.tsx`)
- Update `My Plans` view to fetch and display the full history of purchased packages.
- Calculate "depleted" based on `duration_seconds` and `data_limit_bytes` (if applicable).

### 4. Verification
- Purchase multiple packages and confirm they all appear in the "My Plans" section.
- Ensure only successful payments are listed.
