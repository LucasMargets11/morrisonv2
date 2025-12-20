# Search & Calendar Update

## Overview
This update refactors the Home search experience and Property Details page to prioritize "Rental Type" and gate the Calendar functionality.

## Changes

### 1. Home Page (Search Bar)
- **Removed:** The Calendar date picker has been completely removed from the Home page search bar.
- **Added:** A mandatory "Tipo de Alquiler" (Rental Type) dropdown.
- **Behavior:**
  - Users must select a rental type (Vacacional, Temporal, Tradicional) before searching.
  - The search button is disabled until a type is selected.
  - Clicking search navigates to `/properties` with `?propertyType=...`.

### 2. Property Details Page
- **Calendar Gating:** The booking calendar and date selection inputs are now **only** visible for properties with `property_type === 'vacacional'`.
- **Non-Vacational Properties:**
  - For "Temporal" and "Tradicional" properties, the calendar is hidden.
  - Instead, a pricing information block is shown (e.g., "$X / mes").
  - The WhatsApp contact button generates a message without dates for these types.

### 3. Filtering
- The `propertyType` query parameter is used to filter properties on the listing page.
- This relies on the backend `property_type` field matching the dropdown values:
  - `vacacional`
  - `temporal`
  - `tradicional`

## Files Modified
- `src/components/Hero.tsx`: Search bar refactor.
- `src/components/PropertyDetails.tsx`: Calendar conditional rendering.

## Testing
- **Home:** Verify the dropdown appears and search is disabled until selection.
- **Search:** Verify selecting "Vacacional" and searching redirects to `/properties?propertyType=vacacional`.
- **Details (Vacacional):** Verify Calendar appears and dates can be selected.
- **Details (Temporal/Tradicional):** Verify Calendar is HIDDEN and monthly price is shown.
