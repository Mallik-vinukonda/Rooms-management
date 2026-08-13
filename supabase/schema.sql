-- ============================================================
-- Sri Villa Guest House — Room Management System
-- Database Schema for Supabase PostgreSQL
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE room_type AS ENUM ('ac', 'non_ac', 'dormitory', 'non_functioning', 'other');
CREATE TYPE room_status AS ENUM ('vacant', 'occupied', 'partially_occupied', 'reserved', 'under_maintenance', 'cleaning', 'unavailable', 'non_functioning');
CREATE TYPE ac_status AS ENUM ('working', 'not_working', 'under_repair', 'not_applicable');
CREATE TYPE cleaning_status AS ENUM ('clean', 'cleaning_required', 'cleaning_in_progress');
CREATE TYPE maintenance_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');
CREATE TYPE reservation_status AS ENUM ('new', 'pending_review', 'approved', 'assigned', 'rejected', 'completed', 'cancelled');
CREATE TYPE stay_status AS ENUM ('active', 'checked_out', 'cancelled');
CREATE TYPE user_role AS ENUM ('admin', 'staff', 'supervisor');
CREATE TYPE request_status AS ENUM ('new', 'pending_review', 'approved', 'assigned', 'rejected', 'completed');

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  role user_role NOT NULL DEFAULT 'staff',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'staff')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ROOMS
-- ============================================================

CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_number INTEGER NOT NULL UNIQUE,
  room_type room_type NOT NULL DEFAULT 'non_ac',
  purpose TEXT NOT NULL DEFAULT 'Guest Room',
  capacity INTEGER NOT NULL DEFAULT 2 CHECK (capacity > 0),
  floor TEXT NOT NULL DEFAULT 'ground',
  building TEXT NOT NULL DEFAULT 'main',
  status room_status NOT NULL DEFAULT 'vacant',
  has_ac BOOLEAN NOT NULL DEFAULT false,
  ac_status ac_status NOT NULL DEFAULT 'not_applicable',
  cleaning_status cleaning_status NOT NULL DEFAULT 'clean',
  last_cleaned_at TIMESTAMPTZ,
  last_cleaned_by TEXT,
  notes TEXT DEFAULT '',
  is_accommodation BOOLEAN NOT NULL DEFAULT true,
  map_position JSONB NOT NULL DEFAULT '{}'::jsonb,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rooms_room_number ON rooms(room_number);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_floor ON rooms(floor);
CREATE INDEX idx_rooms_building ON rooms(building);
CREATE INDEX idx_rooms_room_type ON rooms(room_type);

-- ============================================================
-- GUESTS
-- ============================================================

CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  num_occupants INTEGER NOT NULL DEFAULT 1,
  notes TEXT DEFAULT '',
  reference_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_guests_full_name ON guests(full_name);
CREATE INDEX idx_guests_phone ON guests(phone);

-- ============================================================
-- STAYS / ALLOCATIONS
-- ============================================================

CREATE TABLE stays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE RESTRICT,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
  check_in TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  check_out TIMESTAMPTZ,
  status stay_status NOT NULL DEFAULT 'active',
  source TEXT DEFAULT 'manual',
  reference_id TEXT,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stays_room_id ON stays(room_id);
CREATE INDEX idx_stays_guest_id ON stays(guest_id);
CREATE INDEX idx_stays_status ON stays(status);
CREATE INDEX idx_stays_active ON stays(room_id) WHERE status = 'active';

-- ============================================================
-- RESERVATIONS
-- ============================================================

CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  guest_name TEXT NOT NULL,
  guest_phone TEXT,
  num_guests INTEGER NOT NULL DEFAULT 1,
  reservation_start TIMESTAMPTZ NOT NULL,
  reservation_end TIMESTAMPTZ,
  expected_checkin TIMESTAMPTZ,
  expected_checkout TIMESTAMPTZ,
  status reservation_status NOT NULL DEFAULT 'new',
  notes TEXT DEFAULT '',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reservations_room_id ON reservations(room_id);
CREATE INDEX idx_reservations_status ON reservations(status);

-- ============================================================
-- MAINTENANCE LOGS
-- ============================================================

CREATE TABLE maintenance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  issue TEXT NOT NULL,
  description TEXT DEFAULT '',
  status maintenance_status NOT NULL DEFAULT 'open',
  priority TEXT DEFAULT 'normal',
  reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  notes TEXT DEFAULT '',
  created_by UUID REFERENCES profiles(id),
  resolved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_maintenance_room_id ON maintenance_logs(room_id);
CREATE INDEX idx_maintenance_status ON maintenance_logs(status);

-- ============================================================
-- CLEANING LOGS
-- ============================================================

CREATE TABLE cleaning_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  status cleaning_status NOT NULL,
  cleaned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cleaned_by TEXT,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cleaning_room_id ON cleaning_logs(room_id);

-- ============================================================
-- ACTIVITY LOGS (Audit Trail)
-- ============================================================

CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  user_name TEXT,
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  room_number INTEGER,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  old_value TEXT,
  new_value TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_created_at ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_room_id ON activity_logs(room_id);
CREATE INDEX idx_activity_user_id ON activity_logs(user_id);

-- ============================================================
-- ACCOMMODATION REQUESTS (Future: Zoho Forms integration)
-- ============================================================

CREATE TABLE accommodation_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_name TEXT NOT NULL,
  guest_phone TEXT,
  guest_email TEXT,
  num_guests INTEGER NOT NULL DEFAULT 1,
  preferred_room_type room_type,
  preferred_checkin TIMESTAMPTZ,
  preferred_checkout TIMESTAMPTZ,
  purpose TEXT DEFAULT '',
  status request_status NOT NULL DEFAULT 'new',
  assigned_room_id UUID REFERENCES rooms(id),
  source TEXT DEFAULT 'manual',
  external_reference_id TEXT,
  notes TEXT DEFAULT '',
  processed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_requests_status ON accommodation_requests(status);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON guests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stays_updated_at BEFORE UPDATE ON stays
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_updated_at BEFORE UPDATE ON maintenance_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON accommodation_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE stays ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE accommodation_requests ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all profiles, update own
CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Rooms: all authenticated users can read, admins can modify
CREATE POLICY "Rooms are viewable by authenticated users"
  ON rooms FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and staff can insert rooms"
  ON rooms FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'supervisor'))
  );

CREATE POLICY "Admins and staff can update rooms"
  ON rooms FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'supervisor', 'staff'))
  );

CREATE POLICY "Only admins can delete rooms"
  ON rooms FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Guests: authenticated can read, admins/staff can modify
CREATE POLICY "Guests are viewable by authenticated users"
  ON guests FOR SELECT TO authenticated USING (true);

CREATE POLICY "Staff can manage guests"
  ON guests FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Staff can update guests"
  ON guests FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Admins can delete guests"
  ON guests FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Stays: authenticated can read and manage
CREATE POLICY "Stays are viewable by authenticated users"
  ON stays FOR SELECT TO authenticated USING (true);

CREATE POLICY "Staff can manage stays"
  ON stays FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Staff can update stays"
  ON stays FOR UPDATE TO authenticated USING (true);

-- Reservations: authenticated can read and manage
CREATE POLICY "Reservations viewable by authenticated users"
  ON reservations FOR SELECT TO authenticated USING (true);

CREATE POLICY "Staff can manage reservations"
  ON reservations FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Staff can update reservations"
  ON reservations FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Admins can delete reservations"
  ON reservations FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Maintenance: authenticated can read and manage
CREATE POLICY "Maintenance viewable by authenticated users"
  ON maintenance_logs FOR SELECT TO authenticated USING (true);

CREATE POLICY "Staff can manage maintenance"
  ON maintenance_logs FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Staff can update maintenance"
  ON maintenance_logs FOR UPDATE TO authenticated USING (true);

-- Cleaning: authenticated can read and manage
CREATE POLICY "Cleaning viewable by authenticated users"
  ON cleaning_logs FOR SELECT TO authenticated USING (true);

CREATE POLICY "Staff can manage cleaning"
  ON cleaning_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Activity logs: authenticated can read, system inserts
CREATE POLICY "Activity logs viewable by authenticated users"
  ON activity_logs FOR SELECT TO authenticated USING (true);

CREATE POLICY "Staff can insert activity logs"
  ON activity_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Accommodation requests: authenticated can read and manage
CREATE POLICY "Requests viewable by authenticated users"
  ON accommodation_requests FOR SELECT TO authenticated USING (true);

CREATE POLICY "Staff can manage requests"
  ON accommodation_requests FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Staff can update requests"
  ON accommodation_requests FOR UPDATE TO authenticated USING (true);

-- ============================================================
-- HELPER VIEWS
-- ============================================================

-- View: rooms with active occupant count
CREATE OR REPLACE VIEW rooms_with_occupancy AS
SELECT
  r.*,
  COALESCE(s.active_guests, 0) AS current_occupancy,
  COALESCE(s.guest_names, ARRAY[]::TEXT[]) AS current_guest_names
FROM rooms r
LEFT JOIN (
  SELECT
    room_id,
    COUNT(*) AS active_guests,
    ARRAY_AGG(g.full_name ORDER BY st.check_in) AS guest_names
  FROM stays st
  JOIN guests g ON g.id = st.guest_id
  WHERE st.status = 'active'
  GROUP BY room_id
) s ON s.room_id = r.id;
