# ChefMii — Project TODO

## Phase 1: Design & Setup
- [x] Create design.md with full interface design plan
- [x] Update theme.config.js with ChefMii brand colors (saffron gold, charcoal)
- [x] Generate ChefMii app logo
- [x] Update app.config.ts with branding

## Phase 2: Database & Backend
- [x] Define database schema (users, chef_profiles, packages, availability, bookings, messages, reviews, chef_verification, chef_gallery, saved_chefs, notifications)
- [x] Create tRPC routers: chefs, packages, availability, bookings, messages, reviews, notifications, savedChefs, admin, seed
- [x] Seed data: 8 placeholder chefs with profiles, packages, availability
- [x] Role-based access control middleware

## Phase 3: Onboarding & Auth
- [x] Splash screen with ChefMii logo
- [x] Role selection screen (Client / Chef)
- [x] Sign up / Log in screen (email + Google OAuth)
- [x] Auth state management with role routing (ChefMiiProvider)

## Phase 4: Client Screens
- [x] Client home feed (categories, featured chefs, top rated, occasions)
- [x] Search & filter screen (cuisine, price, rating, location)
- [x] Chef profile page (photo, bio, packages, reviews)
- [x] Booking flow (package selection, date/time/guests/address/dietary notes)
- [x] My Bookings screen (Upcoming/Past/Cancelled tabs)
- [x] Booking detail screen
- [x] Client messages list + chat thread
- [x] Client profile & settings screen
- [x] Notifications screen
- [x] Saved chefs screen
- [x] Review submission screen (multi-criteria: food, service, value, presentation)

## Phase 5: Chef Screens
- [x] Chef dashboard (earnings, upcoming bookings, verification banner)
- [x] My Packages screen (list, create, edit, delete)
- [x] Availability schedule screen (weekly)
- [x] Booking requests screen (Accept/Decline with financials)
- [x] Chef booking detail screen
- [x] Chef Earnings screen (breakdown, history)
- [x] Chef Profile screen (stats, quick actions)
- [x] Edit Profile screen (bio, location, cuisines, experience)
- [x] Chef Verification flow (3-stage: identity, credentials, food safety)
- [x] Photo gallery screen
- [x] Chef messages list + chat thread

## Phase 6: Messaging & Reviews
- [x] Messages list screen (chat threads)
- [x] Chat screen (message thread with send)
- [x] Reviews screen (post-booking rating with multi-criteria)
- [x] Notifications list screen

## Phase 7: Admin Panel
- [x] Admin dashboard (platform stats: users, chefs, bookings, revenue)
- [x] Chef applications list (pending verifications)
- [x] Application review (approve/reject per stage)
- [x] All bookings view
- [x] User management
- [x] Seed data runner screen

## Phase 8: Polish & Finalization
- [x] Navigation architecture (tab bars per role: client, chef, admin)
- [x] Dark mode support (via ThemeProvider + CSS variables)
- [x] Loading states and empty states throughout
- [x] All icon mappings added to icon-symbol.tsx
- [x] Zero TypeScript errors across entire project
- [x] Seed data verified (8 chefs confirmed in database)
- [x] API endpoints tested and responding correctly

## Logo Update
- [x] Replace app icon with official ChefMii logo (red-to-orange gradient wordmark)
- [x] Update all icon asset locations (icon.png, splash-icon.png, favicon.png, android-icon-foreground.png)
- [x] Upload to CDN and update app.config.ts logoUrl

## Splash Screen
- [x] Set splash screen background to white (#FFFFFF) for seamless logo transition

## UI Fixes & New Features (Batch 2)
- [x] Fix client tab bar: Home, Search, Bookings, Messages, Profile (5 tabs only, no extra arrows)
- [x] Fix chef tab bar: Dashboard, Bookings, Messages, Profile (correct icons and labels)
- [x] Add left/right arrow navigation for date selection in booking flow
- [x] Add more time slots to booking (06:00–23:00 in 30-min increments)
- [x] Add Allergy field below Dietary Requirements in booking flow
- [x] Show chef labour cost and ingredients cost breakdown below package price
- [x] Add dark/light mode toggle button for client profile screen
- [x] Add dark/light mode toggle button for chef profile screen
- [x] Add back button on top-left of client profile screen
- [x] Add back button on top-left of chef profile screen
- [x] Write Privacy Policy page (full text)
- [x] Write Terms of Service page (full text)
- [x] Write How ChefMii Works page (full text)
- [x] Build client edit profile screen with photo upload, name, address, phone number
- [x] Build chef edit profile screen with photo upload, name, address, phone number
- [x] Fix chef verification: document upload for identity (passport/driving licence)
- [x] Fix chef verification: document upload for culinary credentials
- [x] Fix chef verification: document upload for food safety certificate
- [x] Fix verification progress indicator to correctly reflect completed stages
- [x] Fix My Packages page loading issue
- [x] Allow chefs to add/edit/delete packages with labour cost and ingredients cost fields

## Bug Fixes
- [x] Fix fontfaceobserver 6000ms timeout error (custom font loading crash on app start)

## Auth Fixes
- [x] Fix Google OAuth redirect URI error (exp:// scheme not allowed in Expo Go)
- [x] Add Apple Sign-In button to login screen
- [x] Add Apple Sign-In server endpoint (/api/auth/apple)
- [x] Add usesAppleSignIn: true to iOS config in app.config.ts

## Brand Color Update
- [x] Update primary brand color from saffron gold (#F4A227) to coral red (#F04E37) to match ChefMii logo
- [x] Update tint color to coral red for tab bar active state

## OAuth Redirect URI Fix
- [x] Replace exp:// redirect URI with Manus HTTPS URL in constants/oauth.ts
- [x] Ensure getRedirectUri() always returns the HTTPS Manus URL (not native scheme)
- [x] Switch startOAuthLogin() to use WebBrowser.openAuthSessionAsync (avoids exp:// scheme)
- [x] Update server /api/oauth/callback to pass sessionToken in redirect URL for native apps
- [x] Extract sessionToken from WebBrowser result URL in login screen

## Bottom Nav Fix
- [x] Fix client tab bar to exactly 5 tabs: Home, Search, Bookings, Messages, Profile
- [x] Remove all extra tabs beyond the 5 required (hide edit-profile, how-it-works, privacy-policy, terms-of-service, saved, notifications, review, booking, chef, messages/[bookingId])
- [x] Active tab color: #F4A227 (saffron gold), inactive: #9CA3AF
- [x] Tab bar background: #1C1C1E (dark)
- [x] No label truncation — all labels fully visible (flexShrink: 0 on label)
- [x] Safe area padding for iOS home indicator

## Auth Bug Fixes (from Expo Go testing)
- [x] Fix Apple Sign-In in Expo Go: detect Expo Go via Constants.executionEnvironment and hide Apple button (Apple requires real signed build with correct bundle ID)
- [x] Fix session token not persisted after OAuth — now stores both sessionToken and user info from redirect URL params
- [x] Fix Google OAuth button showing key emoji — replaced with proper Google G logo badge
- [x] Fix startOAuthLogin return type to return { sessionToken, user } object
- [x] Fix handleOAuth to store user info immediately after OAuth (no getMe call needed)
