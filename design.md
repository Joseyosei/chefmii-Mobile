# ChefMii — Mobile App Interface Design

## Brand Identity

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#F4A227` (Saffron Gold) | CTAs, ratings, badges, active states |
| Secondary | `#1C1C1E` (Charcoal) | Headings, primary text, nav |
| Accent | `#FFFFFF` (White) | Backgrounds, cards, surfaces |
| Surface Dark | `#1E1E20` | Dark mode cards |
| Muted | `#6B7280` | Subtitles, placeholder text |
| Success | `#22C55E` | Verified badges, confirmed states |
| Error | `#EF4444` | Errors, cancellations |
| Font | Inter (system default) | All text |

**Aesthetic:** Premium food delivery meets Airbnb simplicity. Warm, trustworthy, modern. Think Deliveroo × Urban Company × Airbnb.

---

## Screen List

### Onboarding / Auth
1. **Splash Screen** — ChefMii logo centered, saffron gold background, fade-in animation
2. **Role Selection** — Two large cards: "I want to hire a chef" / "I am a chef"
3. **Sign Up Screen** — Email + password form, Google OAuth button, role pre-selected
4. **Log In Screen** — Email + password, Google OAuth, forgot password link
5. **Forgot Password** — Email input, send reset link

### Client Screens
6. **Client Home Feed** — Search bar header, cuisine category chips, featured chef horizontal scroll, nearby chefs grid
7. **Search & Filter** — Full-screen search with filter sheet (cuisine, price, rating, availability)
8. **Chef Profile Page** — Hero photo, name, badges, bio, cuisine tags, packages list, gallery grid, reviews
9. **Booking Flow Step 1** — Package selection with price breakdown
10. **Booking Flow Step 2** — Date/time picker, guest count, address input
11. **Booking Flow Step 3** — Dietary notes, special requests
12. **Booking Flow Step 4** — Order summary + Stripe payment
13. **Booking Confirmation** — Success screen with booking ref, summary, add to calendar CTA
14. **My Bookings** — Tabs: Upcoming / Past / Cancelled
15. **Booking Detail** — Full booking info, message chef button, cancel option
16. **Messages List** — Chat threads sorted by recency
17. **Chat Screen** — Message bubbles, input bar, booking context header
18. **Client Profile & Settings** — Avatar, name, edit profile, payment methods, notifications, logout

### Chef Screens
19. **Chef Dashboard** — Earnings summary card, upcoming bookings count, recent messages, quick actions
20. **My Packages** — List of packages with edit/delete, add new package FAB
21. **Package Editor** — Form: name, description, price, min/max guests, sample menu
22. **Availability Calendar** — Weekly view with toggle per day, time slot setting
23. **Booking Requests** — Pending requests with Accept/Decline + optional message
24. **Chef My Bookings** — Upcoming and history tabs
25. **Chef Earnings** — Total earned, pending, paid out, booking breakdown list
26. **Chef Profile Editor** — Bio, photo, cuisines, certifications, experience
27. **Chef Verification** — 3-stage progress tracker with document upload per stage

### Admin Screens
28. **Admin Dashboard** — Platform stats: total users, bookings, revenue
29. **Chef Applications** — List of pending verification applications
30. **Application Detail** — View submitted docs, approve/reject per stage
31. **All Bookings** — Full booking list with filters
32. **User Management** — List all users, view details, disable accounts

---

## Primary Content & Functionality Per Screen

### Client Home Feed
- **Header:** Search bar with location pin, notification bell
- **Categories:** Horizontal scroll chips — Italian, Asian, African, Caribbean, BBQ, Vegan, French, Indian, Japanese
- **Featured Chefs:** Horizontal scroll cards (photo, name, cuisine, rating, price from)
- **Nearby Chefs:** Vertical grid of chef cards
- **Chef Card:** 200×160 photo, name, cuisine badge, star rating, "from £XX" price, verified badge

### Chef Profile Page
- **Hero:** Full-width photo (3:2 ratio), back button, save/share icons
- **Identity:** Name, cuisine tags, badges (Verified ✓ / Pro Chef ⭐ / Elite 👑)
- **Stats Row:** Rating, total bookings, response time
- **Bio:** Expandable text block
- **Packages:** Scrollable cards with name, description, guests, price, Book button
- **Gallery:** 3-column grid of dish photos
- **Reviews:** Average breakdown (food, presentation, punctuality, cleanliness) + written reviews

### Booking Flow
- **Step indicator:** 4-step progress bar at top
- **Step 1:** Package cards with radio selection, price visible
- **Step 2:** Calendar date picker, time slot selector, guest stepper, address input
- **Step 3:** Dietary preferences chips (Vegan, Halal, Kosher, Nut-free, Gluten-free, Dairy-free), notes textarea
- **Step 4:** Full summary card, platform fee breakdown, total, Stripe payment sheet

### Chef Dashboard
- **Earnings Card:** Large saffron card showing total earned this month
- **Quick Stats:** Upcoming bookings count, unread messages, pending requests
- **Recent Activity:** Last 3 booking requests with status chips
- **Quick Actions:** "View Requests", "Update Availability", "Edit Packages"

---

## Key User Flows

### Client Booking Flow
1. Home → tap chef card → Chef Profile
2. Chef Profile → tap package → Booking Step 1 (package selected)
3. Step 1 → Next → Step 2 (date/time/guests/address)
4. Step 2 → Next → Step 3 (dietary notes)
5. Step 3 → Next → Step 4 (payment summary)
6. Step 4 → Pay with Stripe → Booking Confirmation
7. Confirmation → View in My Bookings OR Message Chef

### Chef Accepting a Booking
1. Push notification → Booking Requests tab
2. View request details (client, package, date, guests, address)
3. Tap Accept → Booking confirmed, client notified
4. OR Tap Decline → Optional message → Client notified

### Chef Onboarding
1. Role Selection → "I am a chef"
2. Sign Up → Chef profile creation (name, bio, cuisines, experience)
3. Verification Stage 1 → Upload ID + selfie + phone OTP
4. Verification Stage 2 → Upload certificates
5. Await admin approval → "Verification Pending" banner
6. Approved → Can receive bookings, profile visible in search

### Admin Reviewing Chef Application
1. Admin Dashboard → Chef Applications
2. Select pending application → View documents
3. Approve Stage 1 → Chef gets "Verified" badge
4. Approve Stage 2 → Chef gets "Pro Chef" badge
5. Reject → Enter reason → Chef can resubmit

---

## Color Choices

| Context | Color |
|---------|-------|
| Primary CTA buttons | `#F4A227` Saffron Gold |
| App background | `#FFFFFF` / `#151718` (dark) |
| Card surfaces | `#F9F9F9` / `#1E1E20` (dark) |
| Primary text | `#1C1C1E` / `#ECEDEE` (dark) |
| Secondary text | `#6B7280` |
| Verified badge | `#22C55E` Green |
| Pro Chef badge | `#F4A227` Gold |
| Elite badge | `#7C3AED` Purple |
| Rating stars | `#F4A227` Gold |
| Error states | `#EF4444` Red |
| Tab bar active | `#F4A227` Gold |
| Tab bar inactive | `#9BA1A6` |

---

## Navigation Architecture

### Client Navigation
- **Tab Bar:** Home | Search | Bookings | Messages | Profile
- **Stack:** Each tab has its own stack navigator

### Chef Navigation
- **Tab Bar:** Dashboard | Bookings | Packages | Messages | Profile
- **Stack:** Each tab has its own stack navigator

### Shared
- **Auth Stack:** Splash → Role Selection → Login/Signup
- **Booking Stack:** Modal stack over client tabs
- **Chat Stack:** Pushed from Messages tab

---

## Design Principles

1. **Mobile-first, one-handed usage** — Key actions reachable with thumb in bottom 60% of screen
2. **Premium feel** — Large typography, generous whitespace, smooth transitions
3. **Trust signals** — Verification badges prominent, ratings always visible
4. **Speed** — Skeleton loaders for all async content, optimistic UI updates
5. **Accessibility** — Minimum 44pt touch targets, sufficient color contrast
