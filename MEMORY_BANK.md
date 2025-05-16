# MEMORY BANK

## 1. i18n Key Structures
// List all structured i18n keys and their usage patterns here
// Example:
// - login: { heading, description, button, ... }
// - signup: { heading, button }

## 2. Component-Locale Sync Status
// Track which components/pages are fully synced with locale files
// Example:
// - [x] LoginPage (all keys present in en/vi)
// - [x] FeatureSection (featuresList.* keys synced)
// - [ ] NewFeaturePage (pending)

## 3. Feature/Component Registry
// List all major features/components and their i18n/mock data status
// Example:
// - Feature: Login/Signup
//   - i18n: synced
//   - mock data: centralized
// - Feature: Dashboard
//   - i18n: synced
//   - mock data: centralized

## 4. Update Log
// Log all major i18n/component sync or structure changes
// Example:
// - 2024-06-09: Synced login/signup i18n keys for en/vi, refactored LoginPage to use t('login.*')
// - 2024-06-08: Centralized mock data for FeatureSection

---
# MEMORY BANK: Login/Signup i18n
- login: { heading, description, button, signingIn, forgotPassword, credentialsTab, otpTab, phoneLabel, sendOtp, noAccount, signupLink, accountTypePlaceholder, accountTypeUser, accountTypeCollector, accountTypeAdmin }
- signup: { heading, button }
- Đã đồng bộ cho en/vi, giữ nguyên key string cũ để đảm bảo backward compatibility. 