// ============================================================
// Sri Villa Guest House — Default Data Store
// Mirrors supabase/seed.sql room classifications with clean initial state
// ============================================================

import type {
  RoomWithOccupancy,
  Guest,
  StayWithGuest,
  MaintenanceLog,
  CleaningLog,
  ActivityLog,
  Reservation,
  AccommodationRequest,
  DashboardStats,
} from '@/types';

// ---------- GUESTS (Zero dummy guests) ----------
export const DEMO_GUESTS: Guest[] = [];

// ---------- ROOM BUILDER ----------
function makeRoom(
  roomNumber: number,
  overrides: Partial<RoomWithOccupancy> = {}
): RoomWithOccupancy {
  const id = `room-${roomNumber}`;
  return {
    id,
    room_number: roomNumber,
    room_type: 'non_ac',
    purpose: 'Guest Room',
    capacity: 2,
    floor: 'ground',
    building: 'main_wing_a',
    status: 'vacant',
    has_ac: false,
    ac_status: 'not_applicable',
    cleaning_status: 'clean',
    last_cleaned_at: null,
    last_cleaned_by: null,
    notes: '',
    is_accommodation: true,
    map_position: { row: 0, col: 0, section: 'wing_a' },
    display_order: roomNumber,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    current_occupancy: 0,
    current_guest_names: [],
    active_stays: [],
    ...overrides,
  };
}

// ---------- ROOMS (10 to 53) ----------
export const DEMO_ROOMS: RoomWithOccupancy[] = [
  // ------------------------------------------------------------
  // Ground Floor — Wing A (Rooms 10–20)
  // ------------------------------------------------------------
  makeRoom(10, { room_type: 'dormitory', purpose: 'AC Dormitory', capacity: 6, has_ac: true, ac_status: 'working', floor: 'ground', building: 'main_wing_a', map_position: { row: 0, col: 0, section: 'wing_a' } }),
  makeRoom(11, { is_accommodation: false, purpose: 'Self Use', capacity: 0, floor: 'ground', building: 'main_wing_a', map_position: { row: 0, col: 1, section: 'wing_a' } }),
  makeRoom(12, { is_accommodation: false, purpose: 'Self Use', capacity: 0, floor: 'ground', building: 'main_wing_a', map_position: { row: 0, col: 2, section: 'wing_a' } }),
  makeRoom(13, { room_type: 'non_ac', capacity: 2, floor: 'ground', building: 'main_wing_a', map_position: { row: 0, col: 3, section: 'wing_a' } }),
  makeRoom(14, { room_type: 'non_ac', capacity: 2, floor: 'ground', building: 'main_wing_a', map_position: { row: 0, col: 4, section: 'wing_a' } }),
  makeRoom(15, { room_type: 'non_ac', capacity: 2, floor: 'ground', building: 'main_wing_a', map_position: { row: 0, col: 5, section: 'wing_a' } }),
  makeRoom(16, { room_type: 'non_ac', capacity: 2, floor: 'ground', building: 'main_wing_a', map_position: { row: 0, col: 6, section: 'wing_a' } }),
  makeRoom(17, { room_type: 'non_ac', capacity: 2, floor: 'ground', building: 'main_wing_a', map_position: { row: 0, col: 7, section: 'wing_a' } }),
  makeRoom(18, { room_type: 'non_ac', capacity: 2, floor: 'ground', building: 'main_wing_a', map_position: { row: 0, col: 8, section: 'wing_a' } }),
  makeRoom(19, { room_type: 'non_ac', capacity: 2, floor: 'ground', building: 'main_wing_a', map_position: { row: 0, col: 9, section: 'wing_a' } }),
  makeRoom(20, { room_type: 'dormitory', purpose: 'Dormitory', capacity: 6, floor: 'ground', building: 'main_wing_a', map_position: { row: 0, col: 10, section: 'wing_a' } }),

  // ------------------------------------------------------------
  // First Floor — Main Building (Rooms 21–30, 40)
  // ------------------------------------------------------------
  makeRoom(21, { is_accommodation: false, purpose: 'Staff Room', room_type: 'other', capacity: 0, floor: 'first', building: 'main_first', map_position: { row: 0, col: 0, section: 'first_floor' } }),
  makeRoom(22, { room_type: 'ac', has_ac: true, ac_status: 'working', floor: 'first', building: 'main_first', map_position: { row: 0, col: 1, section: 'first_floor' } }),
  makeRoom(23, { room_type: 'ac', has_ac: true, ac_status: 'working', floor: 'first', building: 'main_first', map_position: { row: 0, col: 2, section: 'first_floor' } }),
  makeRoom(24, { room_type: 'ac', has_ac: true, ac_status: 'working', floor: 'first', building: 'main_first', map_position: { row: 0, col: 3, section: 'first_floor' } }),
  makeRoom(25, { room_type: 'ac', has_ac: true, ac_status: 'working', floor: 'first', building: 'main_first', map_position: { row: 0, col: 4, section: 'first_floor' } }),
  makeRoom(26, { room_type: 'ac', has_ac: true, ac_status: 'working', floor: 'first', building: 'main_first', map_position: { row: 0, col: 5, section: 'first_floor' } }),
  makeRoom(27, { room_type: 'ac', has_ac: true, ac_status: 'working', floor: 'first', building: 'main_first', map_position: { row: 0, col: 6, section: 'first_floor' } }),
  makeRoom(28, { room_type: 'dormitory', purpose: 'Dormitory', capacity: 6, floor: 'first', building: 'main_first', map_position: { row: 0, col: 7, section: 'first_floor' } }),
  makeRoom(29, { room_type: 'dormitory', purpose: 'Dormitory', capacity: 6, floor: 'first', building: 'main_first', map_position: { row: 0, col: 8, section: 'first_floor' } }),
  makeRoom(30, { room_type: 'dormitory', purpose: 'Dormitory', capacity: 6, floor: 'first', building: 'main_first', map_position: { row: 0, col: 9, section: 'first_floor' } }),
  makeRoom(40, { is_accommodation: false, purpose: 'Meeting Hall', room_type: 'other', capacity: 0, floor: 'first', building: 'main_first', map_position: { row: 0, col: 10, section: 'first_floor' } }),

  // ------------------------------------------------------------
  // Second Floor — Main Building Wing B (Rooms 31–39)
  // ------------------------------------------------------------
  makeRoom(31, { room_type: 'non_ac', capacity: 2, floor: 'second', building: 'main_second', map_position: { row: 1, col: 0, section: 'wing_b' } }),
  makeRoom(32, { room_type: 'ac', has_ac: true, ac_status: 'working', floor: 'second', building: 'main_second', map_position: { row: 2, col: 0, section: 'wing_b' } }),
  makeRoom(33, { room_type: 'ac', has_ac: true, ac_status: 'working', floor: 'second', building: 'main_second', map_position: { row: 3, col: 0, section: 'wing_b' } }),
  makeRoom(34, { room_type: 'ac', has_ac: true, ac_status: 'working', floor: 'second', building: 'main_second', map_position: { row: 4, col: 0, section: 'wing_b' } }),
  makeRoom(35, { room_type: 'ac', has_ac: true, ac_status: 'working', floor: 'second', building: 'main_second', map_position: { row: 5, col: 0, section: 'wing_b' } }),
  makeRoom(36, { room_type: 'ac', has_ac: true, ac_status: 'working', floor: 'second', building: 'main_second', map_position: { row: 6, col: 0, section: 'wing_b' } }),
  makeRoom(37, { room_type: 'ac', has_ac: true, ac_status: 'working', floor: 'second', building: 'main_second', map_position: { row: 7, col: 0, section: 'wing_b' } }),
  makeRoom(38, { room_type: 'dormitory', purpose: 'Dormitory', capacity: 6, floor: 'second', building: 'main_second', map_position: { row: 8, col: 0, section: 'wing_b' } }),
  makeRoom(39, { room_type: 'dormitory', purpose: 'Dormitory', capacity: 6, floor: 'second', building: 'main_second', map_position: { row: 9, col: 0, section: 'wing_b' } }),

  // ------------------------------------------------------------
  // Separate Block (Rooms 41–53)
  // ------------------------------------------------------------
  makeRoom(41, { is_accommodation: false, purpose: 'Meeting Hall', room_type: 'other', capacity: 0, floor: 'separate_block', building: 'separate_block', map_position: { row: 0, col: 0, side: 'left', section: 'upper_block' } }),
  makeRoom(42, { is_accommodation: false, purpose: 'Staff Room', room_type: 'other', capacity: 0, floor: 'separate_block', building: 'separate_block', map_position: { row: 0, col: 1, side: 'right', section: 'upper_block' } }),
  makeRoom(43, { room_type: 'non_ac', capacity: 2, floor: 'separate_block', building: 'separate_block', map_position: { row: 1, col: 0, side: 'left', section: 'upper_block' } }),
  makeRoom(44, { is_accommodation: false, purpose: 'Staff Room', room_type: 'other', capacity: 0, floor: 'separate_block', building: 'separate_block', map_position: { row: 1, col: 1, side: 'right', section: 'upper_block' } }),
  makeRoom(45, { room_type: 'non_ac', capacity: 2, floor: 'separate_block', building: 'separate_block', map_position: { row: 2, col: 0, side: 'left', section: 'upper_block' } }),
  makeRoom(46, { is_accommodation: false, purpose: 'Staff Room', room_type: 'other', capacity: 0, floor: 'separate_block', building: 'separate_block', map_position: { row: 2, col: 1, side: 'right', section: 'upper_block' } }),
  makeRoom(47, { is_accommodation: false, purpose: 'Meeting Hall', room_type: 'other', capacity: 0, floor: 'separate_block', building: 'separate_block', map_position: { row: 3, col: 0, side: 'left', section: 'upper_block' } }),
  makeRoom(48, { is_accommodation: false, purpose: 'Meeting Hall', room_type: 'other', capacity: 0, floor: 'separate_block', building: 'separate_block', map_position: { row: 3, col: 1, side: 'right', section: 'upper_block' } }),
  makeRoom(49, { is_accommodation: false, purpose: 'Staff Room', room_type: 'other', capacity: 0, floor: 'separate_block', building: 'separate_block', map_position: { row: 4, col: 0, side: 'left', section: 'upper_block' } }),
  makeRoom(50, { room_type: 'non_ac', capacity: 2, floor: 'separate_block', building: 'separate_block', map_position: { row: 4, col: 1, side: 'right', section: 'upper_block' } }),
  makeRoom(51, { room_type: 'non_ac', capacity: 2, floor: 'separate_block', building: 'separate_block', map_position: { row: 5, col: 0, side: 'left', section: 'upper_block' } }),
  makeRoom(52, { room_type: 'non_ac', capacity: 2, floor: 'separate_block', building: 'separate_block', map_position: { row: 5, col: 1, side: 'right', section: 'upper_block' } }),
  makeRoom(53, { room_type: 'ac', has_ac: true, ac_status: 'working', floor: 'separate_block', building: 'separate_block', map_position: { row: 6, col: 0, side: 'left', section: 'upper_block' } }),
];

// ---------- ZERO DUMMY LOGS & RESERVATIONS ----------
export const DEMO_MAINTENANCE: MaintenanceLog[] = [];
export const DEMO_ACTIVITY: ActivityLog[] = [];
export const DEMO_ACTIVITY_LOGS: ActivityLog[] = DEMO_ACTIVITY;
export const DEMO_RESERVATIONS: Reservation[] = [];
export const DEMO_REQUESTS: AccommodationRequest[] = [];
export const DEMO_CLEANING: CleaningLog[] = [];

// ---------- STATS CALCULATOR ----------
export function calculateDemoStats(): DashboardStats {
  const rooms = DEMO_ROOMS.filter(r => r.is_accommodation);
  const acRooms = rooms.filter(r => r.has_ac);

  return {
    total_rooms: rooms.length,
    available: rooms.filter(r => r.status === 'vacant').length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    partially_occupied: rooms.filter(r => r.status === 'partially_occupied').length,
    reserved: rooms.filter(r => r.status === 'reserved').length,
    under_maintenance: rooms.filter(r => r.status === 'under_maintenance').length,
    cleaning_required: rooms.filter(r => r.cleaning_status === 'cleaning_required').length,
    non_functioning: rooms.filter(r => r.status === 'non_functioning').length,
    unavailable: rooms.filter(r => r.status === 'unavailable').length,
    total_ac_rooms: acRooms.length,
    ac_working: acRooms.filter(r => r.ac_status === 'working').length,
    total_capacity: rooms.reduce((sum, r) => sum + r.capacity, 0),
    total_occupants: rooms.reduce((sum, r) => sum + r.current_occupancy, 0),
  };
}
