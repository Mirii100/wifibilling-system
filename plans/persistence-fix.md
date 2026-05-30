# WiFi Billing System Persistence & State Plan

## Objective
Fix user logout on refresh and handle multiple/upgraded package subscriptions.

## Fix Strategy
### 1. Persistence
- Use `localStorage` in `App.tsx` to save `currentUser` and `isConnected` state.
- On component mount, check `localStorage` to restore session.

### 2. Package Subscription Logic
- Update `handlePurchase` to handle state transitions for existing vs. new package subscriptions.
- If a user has an active package, we need to show a confirmation before overriding it.

## Verification
- Refresh browser: User remains logged in.
- Purchase package: Existing package is updated in Dashboard.
