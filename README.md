# Sri Villa Guest House — Internal Room Management System

A beautiful, professional, and responsive internal property operations dashboard for **Devipuram – Sri Villa Guest House**. Built to manage physical spaces, guest rooms, capacity, occupancy, housekeeping, AC status, and maintenance.

## Key Features
- **Visual Property Map**: Interactive layout reflecting ground floor (L-shape wings), first floor, and upper block corridor setup.
- **Configurable Physical Spaces**: Support for modeling rooms as either *accommodation spaces* (guest rooms, dorms) or *non-accommodation spaces* (Mega Kitchen, Classroom, Office, Storage, meeting halls).
- **Accommodation-centric Stats**: Statistics and occupancy aggregates only calculate for spaces flagged as accommodation.
- **Visual Distinctions**: Non-accommodation rooms are visually distinguished on the map with dashed borders and neutral text indicating their purpose.
- **Housekeeping & AC Health**: One-click updates to toggle cleaning (Clean, Cleaning Required, In Progress) and AC health state.
- **Audit Logs**: Comprehensive activity log tracking all changes for operational accountability.
- **Reports & Export**: Built-in CSV export of room status.

---

## Technical Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3
- **Icons**: Lucide React
- **Database / Auth**: Supabase (PostgreSQL + Auth)
- **Deployment**: Vercel

---

## Local Setup & Run

### 1. Install Dependencies
Navigate to the project directory and run:
```bash
npm install
```

### 2. Run the Development Server
To launch the application locally in **Demo Mode** (using in-memory realistic seed data for the 44 physical spaces):
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

---

## Supabase Database Integration

When you are ready to connect to your Supabase project:

1. **Configure Environment Variables**:
   Rename `.env.example` to `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

2. **Deploy Schema & Seed Data**:
   In your Supabase SQL editor, copy-paste and execute:
   - `supabase/schema.sql` (Initial tables, foreign keys, RLS security policies, and views)
   - `supabase/seed.sql` (Populate rooms 11–54 with physical space purposes, guests, stays, and maintenance logs)

3. **Enable Auth Middleware**:
   In `src/middleware.ts`, uncomment the Supabase auth block to enforce role-based redirects.

---

## Configuring Accommodations vs Non-Accommodations

The database and typescript models represent all physical spaces.
- **Accommodation Spaces**: Flagged with `is_accommodation: true`. These spaces participate in occupancy calculations and guest allocations.
- **Non-Accommodation Spaces**: Flagged with `is_accommodation: false`. Examples include classroom, mega kitchen, meeting hall, storage, office, etc. These rooms display their custom purpose on the map instead of bed icons or occupant names, and are excluded from total guest stats.
