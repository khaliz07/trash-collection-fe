# MEMORY BANK

## 1. Google Maps to Leaflet Migration (SUCCESS!)

**Date**: January 2025  
**Problem**: Google Maps API chi phí cao, cần giải pháp miễn phí  
**Solution**: Migration sang Leaflet + OSRM + OpenStreetMap

### ✅ Migration Completed

- **RouteCreator.tsx**: Converted from Google Maps to Leaflet + OSRM
- **ScheduleMapView.tsx**: Converted from Google Maps to Leaflet
- **MapView.tsx**: Converted from Collection Google Maps to Leaflet
- **LeafletMap component**: New universal Leaflet React component created
- **leaflet-service.ts**: Complete service layer for all mapping functions

### 📦 Dependencies

- **Installed**: leaflet@1.9.4, react-leaflet@5.0.0, leaflet-routing-machine, @types/leaflet, @types/leaflet-routing-machine
- **Removed**: @react-google-maps/api (gỡ bỏ thành công)

### 🆓 Free Services Used

- **OpenStreetMap**: Free map tiles
- **Nominatim**: Free geocoding service
- **OSRM Public Server**: Free routing và optimization
- **No API keys required**

### 💰 Cost Savings

- Google Maps API: $7 per 1000 requests → Leaflet: $0 unlimited
- No billing setup needed, no usage limits

### 🎯 Key Features Working

- ✅ Address geocoding (Nominatim)
- ✅ Route calculation (OSRM)
- ✅ Route optimization
- ✅ Interactive maps với markers
- ✅ Polyline routes
- ✅ Custom marker icons
- ✅ Click handlers
- ✅ TypeScript support

### 🧪 Test URLs

- Admin Schedules: http://localhost:3000/dashboard/admin/schedules
- Collection Map: http://localhost:3000/dashboard/user/collections

## 2. i18n Key Structures

// List all structured i18n keys and their usage patterns here
// Example:
// - login: { heading, description, button, ... }
// - signup: { heading, button }

## 3. Component-Locale Sync Status

// Track which components/pages are fully synced with locale files
// Example:
// - [x] LoginPage (all keys present in en/vi)
// - [x] FeatureSection (featuresList.\* keys synced)
// - [ ] NewFeaturePage (pending)

## 4. Feature/Component Registry

// List all major features/components and their i18n/mock data status
// Example:
// - Feature: Login/Signup
// - i18n: synced
// - mock data: centralized
// - Feature: Dashboard
// - i18n: synced
// - mock data: centralized

## 5. Update Log

// Log all major i18n/component sync or structure changes
// Example:
// - 2024-06-09: Synced login/signup i18n keys for en/vi, refactored LoginPage to use t('login.\*')
// - 2024-06-08: Centralized mock data for FeatureSection

### January 2025

- **Google Maps → Leaflet Migration**: Hoàn thành thành công migration từ Google Maps sang Leaflet + OSRM. Tiết kiệm 100% chi phí API, tất cả tính năng map hoạt động bình thường.

---

# MEMORY BANK: Login/Signup i18n

- login: { heading, description, button, signingIn, forgotPassword, credentialsTab, otpTab, phoneLabel, sendOtp, noAccount, signupLink, accountTypePlaceholder, accountTypeUser, accountTypeCollector, accountTypeAdmin }
- signup: { heading, button }
- Đã đồng bộ cho en/vi, giữ nguyên key string cũ để đảm bảo backward compatibility.
