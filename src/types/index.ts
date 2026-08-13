// ============================================================
// Sri Villa Guest House — TypeScript Types
// ============================================================

// ---------- Enums ----------

export type RoomType = 'ac' | 'non_ac' | 'dormitory' | 'non_functioning' | 'other';

export type RoomStatus =
  | 'vacant'
  | 'occupied'
  | 'partially_occupied'
  | 'reserved'
  | 'under_maintenance'
  | 'cleaning'
  | 'unavailable'
  | 'non_functioning';

export type ACStatus = 'working' | 'not_working' | 'under_repair' | 'not_applicable';

export type CleaningStatus = 'clean' | 'cleaning_required' | 'cleaning_in_progress';

export type MaintenanceStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export type ReservationStatus =
  | 'new'
  | 'pending_review'
  | 'approved'
  | 'assigned'
  | 'rejected'
  | 'completed'
  | 'cancelled';

export type StayStatus = 'active' | 'checked_out' | 'cancelled';

export type UserRole = 'admin' | 'staff' | 'supervisor';

export type RequestStatus =
  | 'new'
  | 'pending_review'
  | 'approved'
  | 'assigned'
  | 'rejected'
  | 'completed';

// ---------- Entities ----------

export interface Room {
  id: string;
  room_number: number;
  room_type: RoomType;
  purpose: string;
  capacity: number;
  floor: string;
  building: string;
  status: RoomStatus;
  has_ac: boolean;
  ac_status: ACStatus;
  cleaning_status: CleaningStatus;
  last_cleaned_at: string | null;
  last_cleaned_by: string | null;
  notes: string;
  is_accommodation: boolean;
  map_position: RoomMapPosition;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface RoomMapPosition {
  row: number;
  col: number;
  section: string;
  side?: 'left' | 'right';
}

export interface RoomWithOccupancy extends Room {
  current_occupancy: number;
  current_guest_names: string[];
  active_stays?: StayWithGuest[];
}

export interface Guest {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  num_occupants: number;
  notes: string;
  reference_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Stay {
  id: string;
  guest_id: string;
  room_id: string;
  check_in: string;
  check_out: string | null;
  status: StayStatus;
  source: string;
  reference_id: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface StayWithGuest extends Stay {
  guest: Guest;
}

export interface StayWithRoom extends Stay {
  room: Room;
  guest: Guest;
}

export interface Reservation {
  id: string;
  room_id: string | null;
  guest_name: string;
  guest_phone: string | null;
  num_guests: number;
  reservation_start: string;
  reservation_end: string | null;
  expected_checkin: string | null;
  expected_checkout: string | null;
  status: ReservationStatus;
  notes: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  room?: Room;
}

export interface MaintenanceLog {
  id: string;
  room_id: string;
  issue: string;
  description: string;
  status: MaintenanceStatus;
  priority: string;
  reported_at: string;
  resolved_at: string | null;
  notes: string;
  created_by: string | null;
  resolved_by: string | null;
  created_at: string;
  updated_at: string;
  room?: Room;
}

export interface CleaningLog {
  id: string;
  room_id: string;
  status: CleaningStatus;
  cleaned_at: string;
  cleaned_by: string | null;
  notes: string;
  created_at: string;
  room?: Room;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  user_name: string | null;
  room_id: string | null;
  room_number: number | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  old_value: string | null;
  new_value: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccommodationRequest {
  id: string;
  guest_name: string;
  guest_phone: string | null;
  guest_email: string | null;
  num_guests: number;
  preferred_room_type: RoomType | null;
  preferred_checkin: string | null;
  preferred_checkout: string | null;
  purpose: string;
  status: RequestStatus;
  assigned_room_id: string | null;
  source: string;
  external_reference_id: string | null;
  notes: string;
  processed_by: string | null;
  created_at: string;
  updated_at: string;
  assigned_room?: Room;
}

// ---------- Dashboard Stats ----------

export interface DashboardStats {
  total_rooms: number;
  available: number;
  occupied: number;
  partially_occupied: number;
  reserved: number;
  under_maintenance: number;
  cleaning_required: number;
  non_functioning: number;
  unavailable: number;
  total_ac_rooms: number;
  ac_working: number;
  total_capacity: number;
  total_occupants: number;
}

// ---------- UI Helpers ----------

export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  textColor: string;
}

export type FloorFilter = 'all' | 'ground' | 'first' | 'second' | 'separate_block';
