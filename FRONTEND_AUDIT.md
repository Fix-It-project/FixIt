# FixIt Frontend Audit Report

**Date:** 2026-03-21
**Scope:** `apps/native/src/` (all frontend files)
**Exclusions:** `(tech-app)/(schedule)/`, `components/tech/screens/schedule/`, `components/tech/screens/ScheduleScreen.tsx`

---

## Table of Contents

1. [React Architecture & SOLID](#1-react-architecture--solid)
2. [DRY Violations](#2-dry-violations)
3. [Code Quality & Redundancy](#3-code-quality--redundancy)
4. [TypeScript Audit](#4-typescript-audit)
5. [UI Consistency & Responsiveness](#5-ui-consistency--responsiveness)
6. [Hardcoded Colors](#6-hardcoded-colors)
7. [Zustand Audit](#7-zustand-audit)
8. [Zod Audit](#8-zod-audit)
9. [Data Fetching Audit](#9-data-fetching-audit)
10. [Package.json Audit](#10-packagejson-audit)
11. [Summary by Severity](#11-summary-by-severity)

---

## 1. React Architecture & SOLID

### HIGH

| # | File | Lines | Issue | Done |
|---|------|-------|-------|------|
| 1.1 | `components/user/booking/UserBookingSheet.tsx` | 12–58 | Private `useToast` hook defined inside the component file (not exported, not reusable). The project already has `react-native-toast-message` + `components/ui/toast.tsx`. This is a third parallel toast implementation. Should be unified. | [ ] |
| 1.2 | `components/user/booking/UserBookingSheet.tsx` | 145–150 | Hardcoded `service_id` UUID — `'9722e1e5-0a32-401b-b9f1-0521062bf682'` is hardcoded. The component already receives `serviceId` via `open()` (line 82) and stores it in state (line 71), but never uses it. The passed value is silently discarded. **Functional bug.** | [ ] |
| 1.3 | `components/user/booking/UserBookingSheet.tsx` | 1–238 | SRP violation — this single file handles: toast hook + animation, sheet open/close state, schedule data fetching, 90-day `markedDates` computation loop, booking mutation + error handling. The `markedDates` logic (lines 95–140) should be extracted to a hook like `useAvailabilityMarks()`. | [ ] |

### MEDIUM

| # | File | Lines | Issue | Done |
|---|------|-------|-------|------|
| 1.4 | `components/user/booking/UserBookingSheet.tsx` | 13 | Mixed animation APIs — uses legacy `Animated.Value` from RN core while rest of codebase uses `react-native-reanimated`. Two animation systems in the bundle. | [ ] |
| 1.5 | `app/(auth)/Technician/signup-step5.tsx` | 20–27, 56 | Redundant store reads — subscribes to the store at the top via hook AND calls `getState()` again at submit time. Should use one pattern consistently. | [ ] |
| 1.6 | `components/user/home/CategoryGrid.tsx` | 1–84 | Dual responsibility — fetches data via `useCategoriesQuery()` AND renders the grid. Presentational components should receive data as props. The same fetch + icon mapping is duplicated in `app/(app)/(categories)/index.tsx`. | [ ] |
| 1.7 | `components/user/booking/BookingsHeader.tsx` | 1–158 | Composite of 4+ concerns — renders back button, title, online status badge (from mock data), notification bell, view toggle, week strip, and calendar sheet. Reads `TECH_PROFILE` mock data directly. | [ ] |
| 1.8 | `app/(app)/(technicians)/list.tsx` | 1–244 | Exceeds 200-line limit (244 lines). The blue header section and sort filter row should be extracted to `TechnicianListHeader` and `TechnicianSortFilterBar`. | [ ] |
| 1.9 | `components/user/browse/TechnicianListCard.tsx` | 17–24 | Business logic in presentational component — `derive(id)` computes seeded-random specialty, rating, reviewCount, yearsExp inside a card component. This derivation should happen in the hook or screen. | [ ] |
| 1.10 | `app/(auth)/(forgotpassword)/reset-password.tsx` | 57–206 | Two distinct screens in one file (208 lines, exceeds 200-line limit). The "Invalid Link" state (lines 57–107) is a separate screen gated by `if (!access_token)`. Should be extracted to `InvalidResetLinkView`. | [ ] |

### LOW

| # | File | Lines | Issue | Done |
|---|------|-------|-------|------|
| 1.11 | `app/_layout.tsx` | 73–76 | `useEffect` with empty deps calling `loadStoredSession` and `requestLocationPermission` — ESLint exhaustive-deps would flag. | [ ] |
| 1.12 | `app/(app)/(profile)/edit-profile.tsx` | 26–34 | `useEffect` lists `[profile]` but omits `hydrate`. Tech version includes it — inconsistency. | [ ] |
| 1.13 | `components/user/home/LocationHeader.tsx` | 14 | Calls `useAddressesQuery()` directly — should receive data as props (Dependency Inversion). | [ ] |
| 1.14 | `components/user/booking/BookingsCalendarSheet.tsx` | 83–109 | Renders both the trigger button AND the sheet — two responsibilities in one component. | [ ] |
| 1.15 | `hooks/tech/useCalendar.ts` | 1–132 | Exports 7 hooks spanning templates, exceptions, AND orders. At minimum orders should be in a separate file. | [ ] |

---

## 2. DRY Violations

### HIGH

| # | Files | Issue | Extract to | Done |
|---|-------|-------|------------|------|
| 2.1 | `app/(app)/(profile)/add-address.tsx:19-65` | Private `FormField` component re-implements existing `FormInput`. Same label + TextInput + error text pattern. | Use existing `components/shared/auth/FormInput` | [ ] |

### MEDIUM

| # | Files | Issue | Extract to | Done |
|---|-------|-------|------------|------|
| 2.2 | `components/user/home/CategoryGrid.tsx:14-18` + `app/(app)/(categories)/index.tsx:11-16` | Duplicate `ICON_MAP` + `FALLBACK_COLORS` icon/color lookup logic. | `lib/categories.ts` (shared helper or `useCategoryMeta()` hook) | [ ] |
| 2.3 | `components/user/home/RecommendedTechnicians.tsx:16-42` + `NearYouSection.tsx:12-38` | 100% identical `EndArrow` component defined in both files. | `components/user/home/SectionEndArrow.tsx` (component) | [ ] |
| 2.4 | `app/(app)/_layout.tsx:27-47` + `app/(tech-app)/_layout.tsx:29-50` | Identical `tabBarStyle` + `tabBarLabelStyle` objects copy-pasted. | `lib/tab-bar-config.ts` (utility constant) | [ ] |
| 2.5 | `app/(auth)/User/login.tsx` + `Technician/login.tsx` | Near-identical login screens. Only differences: mutation hook, subtitle, forgot-password `?userType=`, OAuth presence. | Single `LoginScreen` component with `userType` prop (component) | [ ] |
| 2.6 | `add-address.tsx:140-170` + `User/signup.tsx:132-178` + `Technician/signup-step5.tsx:119-166` | Address fields section (City, Street, Building, Apartment in 2-column layout) copy-pasted 3 times. | `components/shared/AddressFormSection.tsx` (component) | [ ] |
| 2.7 | `components/user/home/LocationHeader.tsx:55-67` + `BookingsHeader.tsx:124-135` | Duplicate notification bell button with red dot. | `components/shared/NotificationBell.tsx` (component) | [ ] |

### LOW

| # | Files | Issue | Extract to | Done |
|---|-------|-------|------------|------|
| 2.8 | `User/signup.tsx:60-69` + `Technician/signup-step3.tsx:32-36` + `signup-step5.tsx:79-86` | Duplicate inline `isFormValid` boolean computation (`trim().length > 0` per field). Redundant with Zod schema. | Remove in favor of schema validation or extract to utility | [ ] |

---

## 3. Code Quality & Redundancy

### HIGH

| # | File | Lines | Issue | Done |
|---|------|-------|-------|------|
| 3.1 | Multiple files | — | Three toast systems active simultaneously: (1) `react-native-toast-message` via `Toast.show()` in auth hooks, (2) `components/ui/toast.tsx` `CustomToast` rendered in `_layout.tsx`, (3) hand-rolled animation toast in `UserBookingSheet.tsx`. Must consolidate to one. | [ ] |

### MEDIUM

| # | File | Lines | Issue | Done |
|---|------|-------|-------|------|
| 3.2 | `components/user/booking/BookingsHeader.tsx` | — | Reads `TECH_PROFILE` mock data directly for online status badge. Should use real data or receive as prop. | [ ] |
| 3.3 | `lib/mock-data/tech.ts` + `lib/mock-data/user.ts` | — | 538 lines of mock data still in production bundle. Should be dev-only or removed when real API endpoints are live. | [ ] |

---

## 4. TypeScript Audit

### HIGH

| # | File | Lines | Issue | Category | Done |
|---|------|-------|-------|----------|------|
| 4.1 | `app/(app)/index.tsx`, `(categories)/index.tsx`, `AddNewAddressSheet.tsx`, `CategoryGrid.tsx`, `reset-password.tsx` | multiple | Routes cast to `as any` — Expo Router typed routes not configured. 5+ files cast route strings to `any`, defeating compile-time route safety. Fix: enable `"experiments": { "typedRoutes": true }` in app config. | IMPROPER_PATTERN | [ ] |

### MEDIUM

| # | File | Lines | Issue | Category | Done |
|---|------|-------|-------|----------|------|
| 4.2 | `components/user/booking/UserBookingSheet.tsx` | 96 | `Record<string, any>` for `markedDates` map — erases type safety for calendar marks. | ANY_USAGE | [ ] |
| 4.3 | `components/user/booking/UserBookingSheet.tsx` | 155 | `catch (error: any)` — should be `unknown` and use existing `getErrorMessage()` helper from `lib/helpers/error-helpers.ts`. | ANY_USAGE | [ ] |
| 4.4 | `app/(app)/(profile)/add-address.tsx` | 178 | `(addMutation.error as any)?.response?.data?.error` — should use `getErrorMessage()`. | ANY_USAGE | [ ] |
| 4.5 | `services/tech-self/api/tech-self.ts` | 33, 36 | Implicit `any` from untyped `apiClient.post()` — should add generic. | ANY_USAGE | [ ] |
| 4.6 | `app/(app)/(profile)/edit-profile.tsx` | 41 | `Record<string, string>` for payload — should use `UpdateProfileRequest`. | WEAK_TYPING | [ ] |
| 4.7 | `app/(tech-app)/(profile)/edit-profile.tsx` | 43 | Same as 4.6 — should use `UpdateTechnicianSelfRequest`. | WEAK_TYPING | [ ] |
| 4.8 | `hooks/tech/useCalendar.ts` | 22, 44, 67, 95, 110 | `user!.id` non-null assertions despite `enabled: !!user?.id` guard. Should use narrowing guard in `queryFn`. | IMPROPER_PATTERN | [ ] |
| 4.9 | `stores/auth-store.ts` | 120–121 | `JSON.parse(userJson)` typed via annotation (implicit assertion). `storedUserType as UserType` cast. Should validate with Zod at runtime. | IMPROPER_PATTERN | [ ] |
| 4.10 | `lib/supabase.ts` | 3–4 | `process.env.EXPO_PUBLIC_SUPABASE_URL!` — non-null assertion on env vars. Missing env var = silent `undefined`. Should throw. | IMPROPER_PATTERN | [ ] |
| 4.11 | `services/technicians/types/technician.ts` + `schema.ts` | — | Dual type definitions — manual interfaces AND Zod-derived types for same entities. Types can drift. Should derive from Zod only. | IMPROPER_PATTERN | [ ] |
| 4.12 | `services/orders/types/order.ts` + `tech-calendar/types/calendar.ts` | 14, 55 | Duplicated `OrderStatus` union — same 6-status union defined in two files. Extract to shared type. | IMPROPER_PATTERN | [ ] |
| 4.13 | `services/users/types/user.ts` + `services/addresses/types.ts` | — | Two address types — `UserAddress` and `Address` represent same DB row but differ in fields. Should unify. | WEAK_TYPING | [ ] |
| 4.14 | `services/addresses/types.ts` + `schemas/address-schema.ts` | — | `CreateAddressRequest` requires `latitude`/`longitude` but Zod schema doesn't validate them. GPS failure = invalid coords sent unvalidated. | WEAK_TYPING | [ ] |
| 4.15 | `services/technicians/types/technician.ts` | 27–31 | `completedOrders`, `totalBookings`, `reviews` typed as `string` when they're numeric counts. | WEAK_TYPING | [ ] |
| 4.16 | `hooks/tech/useCalendar.ts` + `hooks/tech/useTemplates.ts` | — | Naming collision — both export `useTemplatesQuery` and `useSaveTemplatesMutation`. Will fail if imported in same file. | IMPROPER_PATTERN | [ ] |

### LOW

| # | File | Lines | Issue | Category | Done |
|---|------|-------|-------|----------|------|
| 4.17 | `components/tech/home/IncomingRequests.tsx` | 17 | `React.ComponentType<any>` for icon map — should use `LucideIcon` type. | ANY_USAGE | [ ] |
| 4.18 | `components/tech/home/TodaySchedule.tsx` | 16 | Same as 4.17. | ANY_USAGE | [ ] |
| 4.19 | `lib/helpers/signup-helpers.ts` | 43–63 | `as unknown as Blob` for RN FormData — justified platform workaround but should extract typed helper. | IMPROPER_PATTERN | [ ] |
| 4.20 | `hooks/useFormValidation.ts` | 6 | `Record<string, string>` for field errors — no IDE autocompletion for valid field names. | WEAK_TYPING | [ ] |
| 4.21 | Multiple profile components | — | Inline icon prop type `{ size: number; color: string; strokeWidth: number }` duplicated 5 times. Should use `LucideIcon`. | MISSING_TYPE | [ ] |
| 4.22 | Several hooks | — | Missing explicit return type annotations on `usePublicSchedule`, `useGoogleOAuth`, `getPublicSchedule`. | MISSING_TYPE | [ ] |

---

## 5. UI Consistency & Responsiveness

### HIGH

| # | File | Lines | Issue | Done |
|---|------|-------|-------|------|
| 5.1 | `app/settings/index.tsx` | 8 | Settings screen missing `SafeAreaView` — naked `ScrollView` as root. Will not respect notch/status bar. All other screens use `SafeAreaView`. | [ ] |
| 5.2 | `app/(auth)/get-started.tsx` | 20, 35, 49 | Fixed pixel layout — `pt-[189px]`, `mb-[76px]`, `absolute bottom-[34px]`. Will break on short phones (iPhone SE: 568px height). Should use flex-based layout. | [ ] |
| 5.3 | Multiple in-app screens | — | `Button` component not used outside auth — all in-app CTAs use raw `TouchableOpacity` with inconsistent `borderRadius` (12px / 14px / 100px), height, and text weight. The shared `Button` component should be used everywhere. | [ ] |

### MEDIUM

| # | File | Lines | Issue | Done |
|---|------|-------|-------|------|
| 5.4 | Multiple screens | — | `ScrollView` bottom padding varies — `pb-6` (24px), `paddingBottom: 24`, `paddingBottom: 32`, `pb-10` (40px). Mixed `contentContainerClassName` vs `contentContainerStyle`. Should standardize. | [ ] |
| 5.5 | `app/(app)/index.tsx` vs others | 54–58 | `SafeAreaView` `backgroundColor` only set on customer home. Status bar area will appear different colors on each screen. | [ ] |
| 5.6 | Auth forgot-password screens | — | Different layout structure from rest of auth flow — don't use `AuthPageLayout`, back button position differs (`px-4 pt-6` vs `ml-5 mt-14`). | [ ] |
| 5.7 | `TechnicianCard.tsx`, `OrderAgainCard.tsx`, `IncomingRequests.tsx` | — | `Dimensions.get("window")` at module-level — computed once, stale on orientation change. No max width clamp for tablets. Should use `useWindowDimensions()`. | [ ] |
| 5.8 | `app/(auth)/role-selection.tsx` | 40, 83 | Fixed `h-[250px]` cards — two 250px cards + header could overflow on small phones. Use `minHeight` or viewport percentage. | [ ] |
| 5.9 | `app/(auth)/Technician/signup-step4.tsx` | 33–39 | `marginHorizontal: -28` to escape `AuthPageLayout` padding — fragile coupling. Layout should expose a `noPadding` prop. | [ ] |
| 5.10 | Technician signup steps 1–5 | — | No progress indicator across 5-step signup flow. Users have no visibility into remaining steps. | [ ] |
| 5.11 | Multiple screens | — | Widespread `style={{}}` objects violating NativeWind-only rule. 20+ files use inline styles for visual properties. | [ ] |
| 5.12 | `IncomingRequests.tsx`, `TodaySchedule.tsx`, `EarningsWallet.tsx` | — | Double-spacing — each section applies `mt-6` while parent uses `gap: 8`. Real gap = 32px (unintentional). | [ ] |
| 5.13 | Auth screens | — | Back icon size varies: 20, 22, 24, 26 across screens. Touchable area also differs. Should standardize. | [ ] |
| 5.14 | Multiple screens | — | Inconsistent loading states — size (`"large"` vs default), supporting text (present/absent), color (`Colors.brand` vs hardcoded `"#036ded"`). Need shared loading component. | [ ] |
| 5.15 | Multiple screens | — | Inconsistent error states — ad-hoc text in some, animated components in others. `TechniciansListScreen` shows empty state instead of error on query failure. Need shared error component. | [ ] |
| 5.16 | `UserBookingSheet.tsx` | 162–170 | Missing `backgroundStyle` and `handleIndicatorStyle` that all other bottom sheets set. Sheet looks different. | [ ] |

### LOW

| # | File | Lines | Issue | Done |
|---|------|-------|-------|------|
| 5.17 | `app/(app)/index.tsx` vs `(tech-app)/index.tsx` | — | `SECTION_GAP = 16` (customer) vs `8` (tech) — undocumented divergence. | [ ] |
| 5.18 | `LocationHeader.tsx` | 38 | Fixed `maxWidth: 200` on location text — should use `flex: 1`. | [ ] |
| 5.19 | `TechnicianCard.tsx` | 12 | Cover image fixed 150px height regardless of card width — no aspect ratio. | [ ] |
| 5.20 | `OrderAgainCard.tsx` | 16 | `borderRadius: 14` while all other cards use `rounded-2xl` (16px). | [ ] |
| 5.21 | `ProfileInfoCard.tsx`, `ProfileMenuSection.tsx` | — | Card-to-card spacing `mt-3` vs `mt-5` — inconsistent vertical rhythm. | [ ] |

---

## 6. Hardcoded Colors

> **Rule:** Never hard-code color values. Use `Colors.*` from `lib/colors.ts` or Tailwind config tokens.

### Files with hardcoded colors

| File | Hardcoded Values | Correct Token | Done |
|------|-----------------|---------------|------|
| `settings/help-support.tsx:23,38` | `"#036ded"` | `Colors.brand` | [ ] |
| `settings/privacy-security.tsx:10` | `"#036ded"` | `Colors.brand` | [ ] |
| `(categories)/index.tsx:85` | `"#fff"` | `Colors.white` | [ ] |
| `SettingsItem.tsx:21,24` | `"#036ded"`, `"#555555"` | `Colors.brand`, `Colors.textSecondary` | [ ] |
| `ProfileInfoCard.tsx:18,37` | `"#036ded"` | `Colors.brand` | [ ] |
| `ProfileMenuSection.tsx:35,47` | `"#036ded"`, `"#555555"` | `Colors.brand`, `Colors.textSecondary` | [ ] |
| `ProfileStatsSection.tsx:22` | `"#ffffff"` | `Colors.white` | [ ] |
| `OrderAgainCard.tsx:17,64,70,89` | `"#fff"`, `"#d1d5dc"`, `"#141118"`, `"#f0f1f3"` | `Colors.white`, `Colors.borderLight`, MISSING, MISSING | [ ] |
| `TechnicianCard.tsx:93` | `"#F59E0B"` | `Colors.star` | [ ] |
| `CategoryGrid.tsx:58` | `"#f0f1f3"` | `Colors.surfaceGray` | [ ] |
| `UserBookingSheet.tsx:42,53,123,132` | `"#D9534F"`, `"#fff"`, `"#D1D5DB"` | MISSING, `Colors.white`, MISSING | [ ] |
| `SocialLoginButtons.tsx:13-25` | `"#EA4335"`, `"#4285F4"`, `"#FBBC05"`, `"#34A853"` | MISSING (Google brand) | [ ] |
| `SearchBar.tsx:11,18,21` | `rgba(255,255,255,0.18)` etc. | `Colors.whiteOverlay`, overlay tokens | [ ] |
| `LocationHeader.tsx:28-58` | Multiple rgba overlays | `Colors.overlay*` tokens | [ ] |
| `BookingsWeekStrip.tsx:154-156` | Multiple rgba overlays | `Colors.overlay*` tokens | [ ] |

### TechHeader.tsx — most violations (20+ hardcoded colors)

| Lines | Values | Status | Done |
|-------|--------|--------|------|
| 22–27, 40, 53, 60, 67 | SVG gradient: `"#0284c7"`, `"#0369a1"`, `"#38bdf8"`, `"#0ea5e9"` | MISSING from `colors.ts` | [ ] |
| 104, 112, 177, 196, 214 | `"#ffffff"` | `Colors.white` | [ ] |
| 122 | `"rgba(255,255,255,0.85)"` | MISSING | [ ] |
| 134, 141, 187 | `"#86efac"` | `Colors.onlineGreen` | [ ] |
| 149, 166 | `rgba(255,255,255,0.2)`, `0.15` | `Colors.overlayMd`, `Colors.overlaySm` | [ ] |
| 173 | `"#f59e0b"` | `Colors.star` | [ ] |
| 211 | `"#fde68a"` | MISSING | [ ] |

### Colors MISSING from `colors.ts` that need to be added

| Color | Value | Usage |
|-------|-------|-------|
| Cyan | `#06b6d4` | Stat card icon |
| Purple | `#a855f7` | Stat card icon |
| Very dark gray | `#141118` | Reorder button |
| Light yellow star | `#fde68a` | Star accent |
| Error toast red | `#D9534F` | Toast error |
| Disabled calendar text | `#D1D5DB` | Calendar |
| Light surface gray | `#f0f1f3` | Surface backgrounds |
| Black / shadow | `#000` / `#000000` | Shadow color (10+ files) |
| SVG gradient | `#0284c7`, `#0369a1`, `#38bdf8`, `#0ea5e9`, `#7dd3fc`, `#bae6fd` | TechHeader gradient |
| Google brand | `#EA4335`, `#4285F4`, `#FBBC05`, `#34A853` | Social login |

> **Severity:** MEDIUM — theming rule violation across ~20 files, ~60+ instances

---

## 7. Zustand Audit

**Existing stores (6):** `auth-store`, `bookings-date-store`, `edit-profile-store`, `edit-tech-profile-store`, `location-store`, `technician-signup-store` — all properly single-purpose.

### Findings

| # | File | Lines | Severity | Issue | Done |
|---|------|-------|----------|-------|------|
| 7.1 | `app/(app)/(technicians)/list.tsx` | 87–88 | MEDIUM | Sort state (`activeSort`) and search state (`searchText`) managed with `useState`. Lost on navigation. Could benefit from a `useSearchFilterStore`. | [ ] |
| 7.2 | `components/user/booking/UserBookingSheet.tsx` | 12–58 | LOW | Custom `useToast` with local state. App-wide toast could use a global Zustand store if more components need it. | [ ] |

---

## 8. Zod Audit

**Existing schemas (3):** `auth-schema.ts`, `address-schema.ts`, `technician-profile.schema.ts` — all correctly used for network boundary data.

### Findings

| # | File | Lines | Severity | Issue | Done |
|---|------|-------|----------|-------|------|
| 8.1 | `components/user/booking/UserBookingSheet.tsx` | 142–159 | HIGH | Missing booking creation schema — booking submitted without Zod validation. `technician_id` (UUID), `scheduled_date` (ISO date), `service_id` (UUID), and `problem_description` are all unvalidated. | [ ] |
| 8.2 | `app/(auth)/Technician/signup-step5.tsx` | 49–72 | MEDIUM | Missing composite signup schema — 5-step store data merged at submission without final integration validation. Individual step schemas exist but no combined schema validates the full payload. | [ ] |
| 8.3 | `services/addresses/types.ts` + `schemas/address-schema.ts` | — | MEDIUM | Address Zod schema doesn't validate `latitude`/`longitude` but API requires them. GPS failure sends invalid coords unvalidated (also noted in TS audit 4.14). | [ ] |

---

## 9. Data Fetching Audit

> **Pattern:** All data fetching uses React Query hooks via service layer. No raw `fetch()` or direct axios calls in components. This is well-implemented.

### Findings

| # | File | Lines | Severity | Issue | Done |
|---|------|-------|----------|-------|------|
| 9.1 | `components/user/booking/UserBookingSheet.tsx` | 145–150 | HIGH | Hardcoded values in booking mutation — `service_id` hardcoded UUID, `problem_description` hardcoded string. The `selectedServiceId` from `open()` is never used. (Same as 1.2) | [ ] |
| 9.2 | `components/user/browse/TechnicianProfileSheet.tsx` | 36–38, 93–107 | MEDIUM | Missing retry mechanism — query error state shows text but no "Retry" button. Other screens (`CategoriesScreen`) have retry. | [ ] |
| 9.3 | `app/(app)/(technicians)/list.tsx` | 103–111 | MEDIUM | Location permission race condition — `handleSortPress("Nearest")` requests permission but doesn't await it. Location may not be available when query runs. | [ ] |
| 9.4 | `components/user/booking/UserBookingSheet.tsx` | 60–62, 80–87 | HIGH | Unused `serviceId` parameter — `open()` accepts `serviceId`, stores it in state, but it's never passed to the mutation. (Same as 1.2) | [ ] |

---

## 10. Package.json Audit

| # | Package | Severity | Issue | Done |
|---|---------|----------|-------|------|
| 10.1 | `react-native-calendars` + `@howljs/calendar-kit` | MEDIUM | Two calendar libraries for similar purposes. Bundle bloat. Standardize on one. | [ ] |
| 10.2 | `@tanstack/react-form` | MEDIUM | Installed but never imported. Project uses custom `useFormValidation` hook with Zod instead. Dead dependency. | [ ] |
| 10.3 | `@react-native-vector-icons/material-design-icons` | MEDIUM | Installed but never imported. Codebase uses `lucide-react-native` exclusively. Dead dependency. | [ ] |
| 10.4 | `react-native-toast-message` + 2 custom implementations | HIGH | Three toast systems (see finding 3.1). `react-native-toast-message`, `components/ui/toast.tsx`, and `UserBookingSheet`'s hand-rolled toast. | [ ] |
| 10.5 | `react-native-worklets` | LOW | Standalone install but may already be bundled with `react-native-reanimated@4.1.1`. Could cause version mismatch. Verify. | [ ] |
| 10.6 | `@sentry/react-native@^7.2.0` | LOW | Verify compatibility with Expo SDK 54 / React Native 0.81.5 matrix. | [ ] |

---

## 11. Summary by Severity

### HIGH (11 findings — action required)

| # | Category | File(s) | Issue | Done |
|---|----------|---------|-------|------|
| 1.1 | React | `UserBookingSheet.tsx` | Third parallel toast implementation | [ ] |
| 1.2 | React | `UserBookingSheet.tsx` | Hardcoded `service_id`, passed `serviceId` discarded (bug) | [ ] |
| 1.3 | React | `UserBookingSheet.tsx` | SRP violation — 5 responsibilities in one file | [ ] |
| 2.1 | DRY | `add-address.tsx` | `FormField` re-implements existing `FormInput` | [ ] |
| 3.1 | Quality | Multiple | Three toast systems active simultaneously | [ ] |
| 4.1 | TypeScript | 5+ files | Expo Router typed routes not configured, routes cast to `as any` | [ ] |
| 5.1 | UI | `settings/index.tsx` | Settings screen missing `SafeAreaView` | [ ] |
| 5.2 | UI | `get-started.tsx` | Fixed pixel layout breaks on short phones | [ ] |
| 5.3 | UI | Multiple | `Button` component not used in-app, inconsistent CTAs | [ ] |
| 8.1 | Zod | `UserBookingSheet.tsx` | Missing booking creation schema | [ ] |
| 9.1 | Data | `UserBookingSheet.tsx` | Hardcoded values bypass proper data flow | [ ] |

### MEDIUM (35 findings)

Key clusters:

- **`UserBookingSheet.tsx`** — 6 medium findings (this file needs the most work)
- **DRY violations** — 6 medium findings (duplicate login screens, address forms, tab bar styles, category icon maps, end arrow, notification bell)
- **TypeScript** — 14 medium findings (any usage, weak typing, improper patterns, duplicate type definitions)
- **UI consistency** — 13 medium findings (spacing, loading/error states, bottom padding, double-spacing)
- **Hardcoded colors** — ~60 instances across ~20 files
- **Package.json** — 3 medium findings (unused deps, duplicate calendar libs)

### LOW (17 findings)

Minor issues: missing return types, icon size inconsistencies, card border-radius variations, `maxWidth` on location text, dependency warnings.

---

## Recommended Session Priority Order

| Priority | Task | Findings Addressed |
|----------|------|--------------------|
| 1 | **`UserBookingSheet.tsx` overhaul** — fix hardcoded service_id, extract `useAvailabilityMarks`, unify toast, add Zod schema | 6 HIGH + 6 MEDIUM |
| 2 | **Toast system consolidation** — pick one pattern, remove the other two | 3.1, 10.4 |
| 3 | **DRY extraction** — `FormField` → `FormInput`, address form section, login screen unification, shared constants | 2.1–2.7 |
| 4 | **Enable Expo Router typed routes** — removes 5+ `as any` casts | 4.1 |
| 5 | **Hardcoded colors cleanup** — add missing tokens to `colors.ts`, replace all hardcoded values | Section 6 |
| 6 | **Inline styles → NativeWind** — systematic conversion across 20+ files | 5.11 |
| 7 | **TypeScript tightening** — `any` removal, type unification, non-null assertion cleanup | 4.2–4.16 |
| 8 | **UI consistency** — `SafeAreaView` on settings, shared loading/error components, button standardization | 5.1–5.16 |
| 9 | **Missing Zod schemas** — booking creation, composite tech signup | 8.1, 8.2 |
| 10 | **Package cleanup** — remove `@tanstack/react-form`, `@react-native-vector-icons/material-design-icons` | 10.2, 10.3 |
