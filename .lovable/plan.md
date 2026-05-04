
## Overview

Your uploaded project is a Vite + React Router + Supabase app — different from the current TanStack Start scaffold. I'll replace the scaffold with your project as-is so it previews in Lovable, enable Lovable Cloud, run your migration, then layer all 5 requested changes on top with real backend wiring (no dummy data).

## Phase 1 — Get your project previewing

1. Wipe current `src/`, `vite.config.ts`, `package.json`, `tsconfig.json`, etc., and copy in everything from the uploaded zip.
2. Install dependencies (`bun install`).
3. Enable Lovable Cloud (provisions Supabase backend automatically).
4. Run your existing migration (`supabase/migrations/*.sql`) — creates `profiles`, `user_roles`, `mentors`, `mentor_availability`, `bookings`, `mentorship_sessions`, RLS, triggers, seed mentors.
5. Add a `mentor-photos` storage bucket (public) for admin-uploaded mentor profile photos.
6. Verify preview loads, signup/signin work.

## Phase 2 — Generate real mentor photos

- Generate ~6 polished, diverse professional headshots with AI (Ex-Google PM, McKinsey Consultant, Goldman Sachs Analyst, Meta Designer, Stripe Engineer, Bain Strategist personas).
- Upload to `mentor-photos` bucket and update seeded mentor rows with real `photo_url` + prestigious `title`/`company` values.

## Phase 3 — Navigation restructure (Request #1 + #2)

- Add new top-level nav tab **"Mentor Panel"** alongside existing **"Mentors"** tab. Update `BottomNav` / `AppShell` accordingly.
- Create `src/pages/MentorPanel.tsx` — the new route at `/mentor-panel`:
  - Grid of full mentor profile cards (photo, name, title, company, bio, expertise tag chips, "Book a Session" button).
  - "Book a Session" → `navigate('/mentors?mentor=<id>')`, which opens `Mentors` page focused on that mentor.
  - Realtime subscription to `mentors` table so admin edits appear instantly without refresh.
- Strip the mentor-list / panels sub-tab out of `src/pages/Mentors.tsx`. The `/mentors` page becomes a pure **booking hub**:
  - "Available Now" section — mentors with `availability_status = 'live'` (live badge).
  - "Upcoming Sessions" section — `mentorship_sessions` with date/time/topic and capacity badge ("3 of 5 slots remaining").
  - Per-session "Book" / "Join" button: Book inserts into `bookings`; Join opens the session's meeting link / Jitsi room.
  - Per-mentor 1:1 booking via `mentor_availability` slots (already exists) — wired to `BookingModal`.
- Add `max_capacity` + `bookings_count` columns to `mentorship_sessions` so capacity is real and admin-controlled. Enforce capacity server-side via a check.

## Phase 4 — Admin Panel upgrade (Request #4)

Extend `src/pages/AdminPanel.tsx` to a full control center, all behind `has_role(uid, 'admin')`:

- **Mentor Management tab**: list/add/edit/delete mentors. Edit form covers name, title, company, bio, expertise tags (chip input), category, active toggle. Photo upload → `mentor-photos` bucket → updates `mentors.photo_url`. Realtime publication is already enabled, so user dashboard updates instantly.
- **Sessions tab**: create/edit/cancel `mentorship_sessions` (mentor, title/topic, date/time, duration, max capacity, meeting URL). Cancel sets `status = 'cancelled'`.
- **Availability tab**: toggle each mentor's "Available Now" (`availability_status` = `live` / `scheduled`); add/remove 1:1 availability slots in `mentor_availability`.
- Route `/admin` already protected — confirm the guard checks `user_roles` for `admin` and redirects regular users.

## Phase 5 — Global UI/UX polish (Request #3)

- **Typography**: load **Plus Jakarta Sans** (body) + **Sora** (headings) via Google Fonts; wire into `tailwind.config.ts` `fontFamily`. Apply consistent type scale (text-xs → text-5xl) and a clear hierarchy on all pages.
- **Color system**: refine `index.css` HSL tokens — clean off-white background, deep neutral foreground, single brand accent (existing brand teal/violet); regenerate `--primary`, `--secondary`, `--muted`, `--accent`, `--ring`, dark mode variants. Remove ad-hoc hex/Tailwind colors in components, replace with tokens.
- **Buttons**: extend `button.tsx` with consistent `primary`, `secondary`, `ghost`, `destructive` variants — hover states, focus rings, disabled, loading spinner support.
- **Cards**: standardize border-radius (`rounded-2xl`), subtle shadow, hover lift (`hover:-translate-y-0.5 transition`).
- **Navigation**: sticky top nav with backdrop blur, smooth transitions, animated active-tab indicator. Mobile bottom nav cleaned up.
- **Micro-interactions**: page-fade transitions, button press feedback, skeleton loaders.
- **Responsiveness**: audit Mentors, Mentor Panel, Admin Panel, Home, Profile down to 360px.
- **Empty / loading states**: `Skeleton` placeholders for mentor cards, sessions, admin tables. "No sessions yet" / "No mentors available" copy with CTA where relevant.

## Phase 6 — Zero dummy content audit (Request #5)

- Sweep all pages for hardcoded mock arrays, "Coming soon", TODO buttons. Replace each with either real Supabase-backed data or remove.
- Every form submits to Supabase; every link routes to a real page; every button has a handler.

## Admin bootstrap

After Cloud is enabled and you sign up via the app, tell me your email and I'll insert `('your-uid', 'admin')` into `user_roles`. After that, `/admin` unlocks for you.

## Technical notes

- Storage bucket `mentor-photos` (public read, admin write) — RLS via `has_role(auth.uid(), 'admin')`.
- New columns: `mentorship_sessions.max_capacity INTEGER NOT NULL DEFAULT 5`, `mentorship_sessions.topic TEXT`. Capacity remaining computed via count of `bookings` joined on `session_id` (need a `session_id` column on bookings, or a separate `session_bookings` table — I'll add `session_bookings(session_id, student_id)` with unique constraint).
- Realtime: `mentors`, `mentor_availability`, `mentorship_sessions` already in `supabase_realtime` publication; add `session_bookings` too.
- Admin guard: existing `AdminLogin` flow stays; route guard on `/admin` and `/admin-panel` calls `has_role` and redirects non-admins to `/home`.
- No Edge Functions needed — Supabase client + RLS handles everything.

Estimated outcome after implementation: fully functional preview with real auth, real mentors, real bookings, real admin control, and a noticeably more polished UI.
