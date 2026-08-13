# Sri Villa Room Management — Task Tracker

## Phase 1: Project Foundation
- `[x]` Initialize Next.js 14 project with TypeScript + Tailwind CSS
- `[x]` Install dependencies (supabase, lucide-react, date-fns, cmdk)
- `[x]` Create TypeScript types/enums
- `[x]` Create `.env.example`
- `[x]` Copy logo and satellite layout reference image to public/

## Phase 2: Database Schema
- `[x]` Create `supabase/schema.sql` with all tables
- `[x]` Create `supabase/seed.sql` with realistic demo data (rooms 11–54)
- `[x]` Add RLS policies

## Phase 3: Supabase Client & Services
- `[x]` Supabase browser client
- `[x]` Supabase server client
- `[x]` Demo data store (in-memory for development)

## Phase 4: Layout & Navigation
- `[x]` Root layout with fonts and branding
- `[x]` Collapsible sidebar
- `[x]` Header with search
- `[x]` Mobile navigation

## Phase 5: Interactive Property Map
- `[x]` RoomCard component (compact + full modes)
- `[x]` RoomMap with floor layouts
- `[x]` FloorSelector tabs with counts
- `[x]` Room position configuration
- `[x]` Status filter dimming
- `[x]` Non-accommodation spaces visual distinction
- `[x]` Add Aerial View satellite reference tab to layout map
- `[x]` Render all buildings in horizontal row-wise layout

## Phase 6: Room Details & Management
- `[x]` RoomDetailsDrawer with full room info
- `[x]` Inline status/AC/cleaning editing
- `[x]` Guest add/remove from drawer (accommodation-only)
- `[x]` Quick actions panel

## Phase 7: Guest Management
- `[x]` Add guest form in drawer
- `[x]` Remove guest with confirmation
- `[x]` Vacate room with confirmation

## Phase 8: Dashboard
- `[x]` Dashboard page with stats + map
- `[x]` DashboardStats (8 KPI cards, accommodation-only stats)
- `[x]` AttentionAlerts (dynamic)
- `[x]` DashboardFilters (12 filters)
- `[x]` Legend

## Phase 9: Additional Pages
- `[x]` Rooms page (Table/Grid view)
- `[x]` Guests page
- `[x]` Maintenance page
- `[x]` Housekeeping page
- `[x]` Activity log page
- `[x]` Requests page (Zoho Forms placeholder)
- `[x]` Reservations page
- `[x]` Reports page (with CSV export)
- `[x]` Settings page
- `[x]` Users page

## Phase 10: Authentication
- `[x]` Login page with Devipuram branding
- `[x]` Auth middleware (disabled for demo)
- `[x]` Supabase client/server setup

## Phase 11: Verification
- `[x]` Build verification (Successful)
- `[x]` Dev server test (Started on port 3000)
- `[x]` README with setup instructions
