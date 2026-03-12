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
