// ============================================================
// Demo Data Store
// In-memory data for development before Supabase is connected.
// This mirrors the seed.sql data exactly.
// Replace with Supabase queries when database is ready.
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

// ---------- GUESTS ----------

const DEMO_GUESTS: Guest[] = [
  { id: 'g1',  full_name: 'Arun Kumar',       phone: '+91 9876543210', email: null, num_occupants: 1, notes: 'Regular visitor',             reference_id: null, created_at: '2026-08-11T04:00:00Z', updated_at: '2026-08-11T04:00:00Z' },
  { id: 'g2',  full_name: 'Sneha Kumar',      phone: '+91 9876543211', email: null, num_occupants: 1, notes: '',                             reference_id: null, created_at: '2026-08-11T04:00:00Z', updated_at: '2026-08-11T04:00:00Z' },
  { id: 'g3',  full_name: 'Priya Sharma',     phone: '+91 9876543212', email: null, num_occupants: 1, notes: '',                             reference_id: null, created_at: '2026-08-12T04:00:00Z', updated_at: '2026-08-12T04:00:00Z' },
  { id: 'g4',  full_name: 'Rahul Reddy',      phone: '+91 9876543213', email: null, num_occupants: 1, notes: '',                             reference_id: null, created_at: '2026-08-12T04:00:00Z', updated_at: '2026-08-12T04:00:00Z' },
  { id: 'g5',  full_name: 'Lakshmi Devi',     phone: '+91 9876543214', email: null, num_occupants: 1, notes: 'Temple committee member',      reference_id: null, created_at: '2026-08-10T04:00:00Z', updated_at: '2026-08-10T04:00:00Z' },
  { id: 'g6',  full_name: 'Suresh Babu',      phone: '+91 9876543215', email: null, num_occupants: 1, notes: '',                             reference_id: null, created_at: '2026-08-10T04:00:00Z', updated_at: '2026-08-10T04:00:00Z' },
  { id: 'g7',  full_name: 'Anitha Rao',       phone: '+91 9876543216', email: null, num_occupants: 1, notes: '',                             reference_id: null, created_at: '2026-08-11T04:00:00Z', updated_at: '2026-08-11T04:00:00Z' },
  { id: 'g8',  full_name: 'Venkat Prasad',    phone: '+91 9876543217', email: null, num_occupants: 1, notes: '',                             reference_id: null, created_at: '2026-08-12T04:00:00Z', updated_at: '2026-08-12T04:00:00Z' },
  { id: 'g9',  full_name: 'Meera Krishnan',   phone: '+91 9876543218', email: null, num_occupants: 1, notes: '',                             reference_id: null, created_at: '2026-08-12T04:00:00Z', updated_at: '2026-08-12T04:00:00Z' },
  { id: 'g10', full_name: 'Ravi Teja',        phone: '+91 9876543219', email: null, num_occupants: 1, notes: '',                             reference_id: null, created_at: '2026-08-09T04:00:00Z', updated_at: '2026-08-09T04:00:00Z' },
  { id: 'g11', full_name: 'Padma Latha',      phone: '+91 9876543220', email: null, num_occupants: 1, notes: '',                             reference_id: null, created_at: '2026-08-09T04:00:00Z', updated_at: '2026-08-09T04:00:00Z' },
  { id: 'g12', full_name: 'Ganesh Mohan',     phone: '+91 9876543221', email: null, num_occupants: 1, notes: 'Arriving from Chennai',        reference_id: null, created_at: '2026-08-12T04:00:00Z', updated_at: '2026-08-12T04:00:00Z' },
  { id: 'g13', full_name: 'Sita Ram',         phone: '+91 9876543222', email: null, num_occupants: 1, notes: '',                             reference_id: null, created_at: '2026-08-11T04:00:00Z', updated_at: '2026-08-11T04:00:00Z' },
  { id: 'g14', full_name: 'Deepa Nair',       phone: '+91 9876543223', email: null, num_occupants: 1, notes: '',                             reference_id: null, created_at: '2026-08-11T04:00:00Z', updated_at: '2026-08-11T04:00:00Z' },
  { id: 'g15', full_name: 'Karthik Iyer',     phone: '+91 9876543224', email: null, num_occupants: 1, notes: '',                             reference_id: null, created_at: '2026-08-10T04:00:00Z', updated_at: '2026-08-10T04:00:00Z' },
  { id: 'g16', full_name: 'Sunita Reddy',     phone: '+91 9876543225', email: null, num_occupants: 1, notes: '',                             reference_id: null, created_at: '2026-08-12T04:00:00Z', updated_at: '2026-08-12T04:00:00Z' },
  { id: 'g17', full_name: 'Balaji Naidu',     phone: '+91 9876543226', email: null, num_occupants: 1, notes: '',                             reference_id: null, created_at: '2026-08-12T04:00:00Z', updated_at: '2026-08-12T04:00:00Z' },
  { id: 'g18', full_name: 'Kavitha Menon',    phone: '+91 9876543228', email: null, num_occupants: 1, notes: '',                             reference_id: null, created_at: '2026-08-12T04:00:00Z', updated_at: '2026-08-12T04:00:00Z' },
  { id: 'g19', full_name: 'Arjun Nair',       phone: '+91 9876543229', email: null, num_occupants: 1, notes: '',                             reference_id: null, created_at: '2026-08-11T04:00:00Z', updated_at: '2026-08-11T04:00:00Z' },
  { id: 'g20', full_name: 'Divya Pillai',     phone: '+91 9876543230', email: null, num_occupants: 1, notes: '',                             reference_id: null, created_at: '2026-08-12T04:00:00Z', updated_at: '2026-08-12T04:00:00Z' },
  { id: 'g21', full_name: 'Mohan Das',        phone: '+91 9876543231', email: null, num_occupants: 1, notes: '',                             reference_id: null, created_at: '2026-08-10T04:00:00Z', updated_at: '2026-08-10T04:00:00Z' },
  { id: 'g22', full_name: 'Rekha Varma',      phone: '+91 9876543232', email: null, num_occupants: 1, notes: '',                             reference_id: null, created_at: '2026-08-12T04:00:00Z', updated_at: '2026-08-12T04:00:00Z' },
  { id: 'g23', full_name: 'Srinivas Rao',     phone: '+91 9876543233', email: null, num_occupants: 1, notes: '',                             reference_id: null, created_at: '2026-08-11T04:00:00Z', updated_at: '2026-08-11T04:00:00Z' },
  { id: 'g24', full_name: 'Chandra Sekhar',   phone: '+91 9876543234', email: null, num_occupants: 1, notes: '',                             reference_id: null, created_at: '2026-08-11T04:00:00Z', updated_at: '2026-08-11T04:00:00Z' },
];

function guestById(id: string): Guest {
  return DEMO_GUESTS.find(g => g.id === id)!;
}

// Helper: create a StayWithGuest
function stay(guestId: string, roomId: string, checkIn: string): StayWithGuest {
  return {
    id: `stay-${guestId}-${roomId}`,
    guest_id: guestId,
    room_id: roomId,
    check_in: checkIn,
    check_out: null,
    status: 'active',
    source: 'manual',
    reference_id: null,
    notes: '',
    created_at: checkIn,
    updated_at: checkIn,
    guest: guestById(guestId),
  };
}

// ---------- ROOMS ----------

function makeRoom(
  roomNumber: number,
  overrides: Partial<RoomWithOccupancy> = {},
  stays: StayWithGuest[] = []
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
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-13T08:00:00Z',
    current_occupancy: stays.length,
    current_guest_names: stays.map(s => s.guest.full_name),
    active_stays: stays,
    ...overrides,
  };
}

const d2 = '2026-08-11T04:00:00Z';
const d1 = '2026-08-12T04:00:00Z';
const d3 = '2026-08-10T04:00:00Z';
const d4 = '2026-08-09T04:00:00Z';

export const DEMO_ROOMS: RoomWithOccupancy[] = [
  // Ground — Wing A (11–20)
  makeRoom(11, { room_type: 'ac', has_ac: true, ac_status: 'working', status: 'occupied', building: 'main_wing_a', floor: 'ground', notes: 'Corner room with extra ventilation', map_position: { row: 0, col: 0, section: 'wing_a' }, last_cleaned_at: '2026-08-13T04:00:00Z', last_cleaned_by: 'Ramesh' },
    [stay('g1', 'room-11', d2), stay('g2', 'room-11', d2)]),
  makeRoom(12, { room_type: 'ac', has_ac: true, ac_status: 'working', status: 'occupied', building: 'main_wing_a', floor: 'ground', map_position: { row: 0, col: 1, section: 'wing_a' }, last_cleaned_at: '2026-08-13T05:00:00Z', last_cleaned_by: 'Ramesh' },
    [stay('g3', 'room-12', d1), stay('g4', 'room-12', d1)]),
  makeRoom(13, { room_type: 'non_ac', is_accommodation: false, purpose: 'Classroom', capacity: 0, status: 'vacant', building: 'main_wing_a', floor: 'ground', map_position: { row: 0, col: 2, section: 'wing_a' } }),
  makeRoom(14, { room_type: 'ac', has_ac: true, ac_status: 'not_working', status: 'vacant', building: 'main_wing_a', floor: 'ground', cleaning_status: 'cleaning_required', notes: 'AC remote missing', map_position: { row: 0, col: 3, section: 'wing_a' } }),
  makeRoom(15, { room_type: 'dormitory', has_ac: true, ac_status: 'working', capacity: 8, status: 'partially_occupied', building: 'main_wing_a', floor: 'ground', notes: 'Large dormitory', map_position: { row: 0, col: 4, section: 'wing_a' } },
    [stay('g5', 'room-15', d3), stay('g6', 'room-15', d3), stay('g7', 'room-15', d2), stay('g8', 'room-15', d1), stay('g9', 'room-15', d1)]),
  makeRoom(16, { room_type: 'non_ac', is_accommodation: false, purpose: 'Mega Kitchen', capacity: 0, status: 'vacant', building: 'main_wing_a', floor: 'ground', map_position: { row: 0, col: 5, section: 'wing_a' } }),
  makeRoom(17, { room_type: 'ac', has_ac: true, ac_status: 'working', status: 'occupied', building: 'main_wing_a', floor: 'ground', map_position: { row: 0, col: 6, section: 'wing_a' }, last_cleaned_at: '2026-08-13T02:00:00Z', last_cleaned_by: 'Ramesh' },
    [stay('g10', 'room-17', d4), stay('g11', 'room-17', d4)]),
  makeRoom(18, { room_type: 'ac', has_ac: true, ac_status: 'not_working', status: 'under_maintenance', building: 'main_wing_a', floor: 'ground', cleaning_status: 'cleaning_required', notes: 'AC compressor issue reported', map_position: { row: 0, col: 7, section: 'wing_a' } }),
  makeRoom(19, { room_type: 'non_ac', is_accommodation: false, purpose: 'Office', capacity: 0, status: 'vacant', building: 'main_wing_a', floor: 'ground', map_position: { row: 0, col: 8, section: 'wing_a' } }),
  makeRoom(20, { room_type: 'non_ac', is_accommodation: false, purpose: 'Staff Room', capacity: 0, status: 'vacant', building: 'main_wing_a', floor: 'ground', map_position: { row: 0, col: 9, section: 'wing_a' } }),

  // Ground — Wing B (30–39)
  makeRoom(30, { room_type: 'ac', has_ac: true, ac_status: 'working', status: 'occupied', building: 'main_wing_b', floor: 'ground', map_position: { row: 0, col: 0, section: 'wing_b' }, last_cleaned_at: '2026-08-13T05:00:00Z', last_cleaned_by: 'Suresh' },
    [stay('g16', 'room-30', d1), stay('g17', 'room-30', d1)]),
  makeRoom(31, { room_type: 'non_ac', status: 'vacant', building: 'main_wing_b', floor: 'ground', map_position: { row: 1, col: 0, section: 'wing_b' } }),
  makeRoom(32, { room_type: 'ac', has_ac: true, ac_status: 'working', status: 'occupied', building: 'main_wing_b', floor: 'ground', cleaning_status: 'cleaning_required', map_position: { row: 2, col: 0, section: 'wing_b' } },
    [stay('g18', 'room-32', d2)]),
  makeRoom(33, { room_type: 'non_ac', is_accommodation: false, purpose: 'Classroom', capacity: 0, status: 'vacant', building: 'main_wing_b', floor: 'ground', map_position: { row: 3, col: 0, section: 'wing_b' } }),
  makeRoom(34, { room_type: 'ac', has_ac: true, ac_status: 'working', status: 'reserved', building: 'main_wing_b', floor: 'ground', notes: 'Reserved for group visit Aug 15', map_position: { row: 4, col: 0, section: 'wing_b' } }),
  makeRoom(35, { room_type: 'dormitory', has_ac: true, ac_status: 'working', capacity: 6, status: 'vacant', building: 'main_wing_b', floor: 'ground', map_position: { row: 5, col: 0, section: 'wing_b' } }),
  makeRoom(36, { room_type: 'non_ac', is_accommodation: false, purpose: 'Storage', capacity: 0, status: 'vacant', building: 'main_wing_b', floor: 'ground', map_position: { row: 6, col: 0, section: 'wing_b' } }),
  makeRoom(37, { room_type: 'non_ac', is_accommodation: false, purpose: 'Storage', capacity: 0, status: 'vacant', building: 'main_wing_b', floor: 'ground', map_position: { row: 7, col: 0, section: 'wing_b' } }),
  makeRoom(38, { room_type: 'non_ac', is_accommodation: false, purpose: 'Office', capacity: 0, status: 'vacant', building: 'main_wing_b', floor: 'ground', map_position: { row: 8, col: 0, section: 'wing_b' } }),
  makeRoom(39, { room_type: 'non_ac', is_accommodation: false, purpose: 'Staff Room', capacity: 0, status: 'vacant', building: 'main_wing_b', floor: 'ground', map_position: { row: 9, col: 0, section: 'wing_b' } }),

  // First Floor (21–29)
  makeRoom(21, { room_type: 'ac', has_ac: true, ac_status: 'working', status: 'occupied', building: 'main_first', floor: 'first', map_position: { row: 0, col: 0, section: 'first_floor' }, last_cleaned_at: '2026-08-13T07:00:00Z', last_cleaned_by: 'Ramesh' },
    [stay('g12', 'room-21', d1)]),
  makeRoom(22, { room_type: 'ac', has_ac: true, ac_status: 'working', status: 'vacant', building: 'main_first', floor: 'first', cleaning_status: 'cleaning_required', map_position: { row: 0, col: 1, section: 'first_floor' } }),
  makeRoom(23, { room_type: 'non_ac', capacity: 3, status: 'occupied', building: 'main_first', floor: 'first', map_position: { row: 0, col: 2, section: 'first_floor' } },
    [stay('g13', 'room-23', d2), stay('g14', 'room-23', d2)]),
  makeRoom(24, { room_type: 'non_ac', is_accommodation: false, purpose: 'Meeting Hall', capacity: 0, status: 'vacant', building: 'main_first', floor: 'first', map_position: { row: 0, col: 3, section: 'first_floor' } }),
  makeRoom(25, { room_type: 'non_ac', is_accommodation: false, purpose: 'Storage', capacity: 0, status: 'vacant', building: 'main_first', floor: 'first', map_position: { row: 0, col: 4, section: 'first_floor' } }),
  makeRoom(26, { room_type: 'ac', has_ac: true, ac_status: 'working', status: 'reserved', building: 'main_first', floor: 'first', notes: 'Reserved for temple event', map_position: { row: 0, col: 5, section: 'first_floor' } }),
  makeRoom(27, { room_type: 'non_ac', is_accommodation: false, purpose: 'Storage', capacity: 0, status: 'vacant', building: 'main_first', floor: 'first', map_position: { row: 0, col: 6, section: 'first_floor' } }),
  makeRoom(28, { room_type: 'ac', has_ac: true, ac_status: 'not_working', status: 'occupied', building: 'main_first', floor: 'first', notes: 'AC not cooling properly', map_position: { row: 0, col: 7, section: 'first_floor' } },
    [stay('g15', 'room-28', d3)]),
  makeRoom(29, { room_type: 'non_ac', is_accommodation: false, purpose: 'Staff Room', capacity: 0, status: 'vacant', building: 'main_first', floor: 'first', map_position: { row: 0, col: 8, section: 'first_floor' } }),

  // Upper Block (40–54)
  makeRoom(40, { room_type: 'ac', has_ac: true, ac_status: 'working', status: 'occupied', building: 'upper_block', floor: 'ground', map_position: { row: 0, col: 0, side: 'left', section: 'upper_block' } },
    [stay('g19', 'room-40', d2), stay('g20', 'room-40', d1)]),
  makeRoom(41, { room_type: 'ac', has_ac: true, ac_status: 'working', status: 'vacant', building: 'upper_block', floor: 'ground', map_position: { row: 0, col: 1, side: 'right', section: 'upper_block' } }),
  makeRoom(42, { room_type: 'non_ac', is_accommodation: false, purpose: 'Classroom', capacity: 0, status: 'vacant', building: 'upper_block', floor: 'ground', map_position: { row: 1, col: 0, side: 'left', section: 'upper_block' } }),
  makeRoom(43, { room_type: 'non_ac', is_accommodation: false, purpose: 'Meeting Hall', capacity: 0, status: 'vacant', building: 'upper_block', floor: 'ground', map_position: { row: 1, col: 1, side: 'right', section: 'upper_block' } }),
  makeRoom(44, { room_type: 'non_ac', is_accommodation: false, purpose: 'Meeting Hall', capacity: 0, status: 'vacant', building: 'upper_block', floor: 'ground', map_position: { row: 2, col: 0, side: 'left', section: 'upper_block' } }),
  makeRoom(45, { room_type: 'non_ac', capacity: 3, status: 'vacant', building: 'upper_block', floor: 'ground', map_position: { row: 2, col: 1, side: 'right', section: 'upper_block' } }),
  makeRoom(46, { room_type: 'non_ac', is_accommodation: false, purpose: 'Classroom', capacity: 0, status: 'vacant', building: 'upper_block', floor: 'ground', map_position: { row: 3, col: 0, side: 'left', section: 'upper_block' } }),
  makeRoom(47, { room_type: 'non_ac', is_accommodation: false, purpose: 'Storage', capacity: 0, status: 'vacant', building: 'upper_block', floor: 'ground', map_position: { row: 3, col: 1, side: 'right', section: 'upper_block' } }),
  makeRoom(48, { room_type: 'non_ac', is_accommodation: false, purpose: 'Storage', capacity: 0, status: 'vacant', building: 'upper_block', floor: 'ground', map_position: { row: 4, col: 0, side: 'left', section: 'upper_block' } }),
  makeRoom(49, { room_type: 'non_ac', is_accommodation: false, purpose: 'Storage', capacity: 0, status: 'vacant', building: 'upper_block', floor: 'ground', map_position: { row: 4, col: 1, side: 'right', section: 'upper_block' } }),
  makeRoom(50, { room_type: 'ac', has_ac: true, ac_status: 'working', status: 'occupied', building: 'upper_block', floor: 'ground', map_position: { row: 5, col: 0, side: 'left', section: 'upper_block' } },
    [stay('g21', 'room-50', d3), stay('g22', 'room-50', d1)]),
  makeRoom(51, { room_type: 'non_ac', is_accommodation: false, purpose: 'Meeting Hall', capacity: 0, status: 'vacant', building: 'upper_block', floor: 'ground', map_position: { row: 5, col: 1, side: 'right', section: 'upper_block' } }),
  makeRoom(52, { room_type: 'non_ac', is_accommodation: false, purpose: 'Storage', capacity: 0, status: 'vacant', building: 'upper_block', floor: 'ground', map_position: { row: 6, col: 0, side: 'left', section: 'upper_block' } }),
  makeRoom(53, { room_type: 'non_ac', is_accommodation: false, purpose: 'Meeting Hall', capacity: 0, status: 'vacant', building: 'upper_block', floor: 'ground', map_position: { row: 6, col: 1, side: 'right', section: 'upper_block' } }),
  makeRoom(54, { room_type: 'non_ac', is_accommodation: false, purpose: 'Office', capacity: 0, status: 'vacant', building: 'upper_block', floor: 'ground', map_position: { row: 7, col: 0, side: 'left', section: 'upper_block' } }),
];

// ---------- MAINTENANCE LOGS ----------

export const DEMO_MAINTENANCE: MaintenanceLog[] = [
  { id: 'ml1', room_id: 'room-18', issue: 'AC not working', description: 'AC compressor stopped functioning', status: 'open', priority: 'high', reported_at: '2026-08-12T04:00:00Z', resolved_at: null, notes: 'Technician called', created_by: null, resolved_by: null, created_at: '2026-08-12T04:00:00Z', updated_at: '2026-08-12T04:00:00Z' },
  { id: 'ml2', room_id: 'room-36', issue: 'Window broken', description: 'Window glass cracked during storm', status: 'in_progress', priority: 'normal', reported_at: '2026-08-10T04:00:00Z', resolved_at: null, notes: 'Glass ordered, expected delivery tomorrow', created_by: null, resolved_by: null, created_at: '2026-08-10T04:00:00Z', updated_at: '2026-08-10T04:00:00Z' },
  { id: 'ml3', room_id: 'room-47', issue: 'Plumbing issue', description: 'Bathroom tap leaking', status: 'open', priority: 'normal', reported_at: '2026-08-11T04:00:00Z', resolved_at: null, notes: 'Plumber scheduled for tomorrow', created_by: null, resolved_by: null, created_at: '2026-08-11T04:00:00Z', updated_at: '2026-08-11T04:00:00Z' },
  { id: 'ml4', room_id: 'room-14', issue: 'AC remote missing', description: 'AC remote control not found', status: 'open', priority: 'low', reported_at: '2026-08-08T04:00:00Z', resolved_at: null, notes: 'Replacement ordered', created_by: null, resolved_by: null, created_at: '2026-08-08T04:00:00Z', updated_at: '2026-08-08T04:00:00Z' },
  { id: 'ml5', room_id: 'room-37', issue: 'AC noise', description: 'AC making loud rattling noise', status: 'in_progress', priority: 'normal', reported_at: '2026-08-09T04:00:00Z', resolved_at: null, notes: 'Under inspection', created_by: null, resolved_by: null, created_at: '2026-08-09T04:00:00Z', updated_at: '2026-08-09T04:00:00Z' },
  { id: 'ml6', room_id: 'room-11', issue: 'Light fixture', description: 'Bathroom light not working', status: 'resolved', priority: 'low', reported_at: '2026-08-03T04:00:00Z', resolved_at: '2026-08-05T04:00:00Z', notes: 'Bulb replaced', created_by: null, resolved_by: null, created_at: '2026-08-03T04:00:00Z', updated_at: '2026-08-05T04:00:00Z' },
  { id: 'ml7', room_id: 'room-30', issue: 'Door lock', description: 'Door lock jammed', status: 'resolved', priority: 'high', reported_at: '2026-08-06T04:00:00Z', resolved_at: '2026-08-07T04:00:00Z', notes: 'Lock mechanism replaced', created_by: null, resolved_by: null, created_at: '2026-08-06T04:00:00Z', updated_at: '2026-08-07T04:00:00Z' },
];

// ---------- ACTIVITY LOGS ----------

export const DEMO_ACTIVITY: ActivityLog[] = [
  { id: 'al1',  user_id: null, user_name: 'Mallik', room_id: 'room-11', room_number: 11, action: 'Guest checked in', entity_type: 'stay', entity_id: null, old_value: null, new_value: 'Arun Kumar', details: {}, created_at: '2026-08-11T04:00:00Z' },
  { id: 'al2',  user_id: null, user_name: 'Mallik', room_id: 'room-11', room_number: 11, action: 'Guest checked in', entity_type: 'stay', entity_id: null, old_value: null, new_value: 'Sneha Kumar', details: {}, created_at: '2026-08-11T04:01:00Z' },
  { id: 'al3',  user_id: null, user_name: 'Mallik', room_id: 'room-11', room_number: 11, action: 'Status changed', entity_type: 'room', entity_id: null, old_value: 'vacant', new_value: 'occupied', details: {}, created_at: '2026-08-11T04:02:00Z' },
  { id: 'al4',  user_id: null, user_name: 'Mallik', room_id: 'room-17', room_number: 17, action: 'Guest checked in', entity_type: 'stay', entity_id: null, old_value: null, new_value: 'Ravi Teja', details: {}, created_at: '2026-08-09T04:00:00Z' },
  { id: 'al5',  user_id: null, user_name: 'Mallik', room_id: 'room-17', room_number: 17, action: 'Guest checked in', entity_type: 'stay', entity_id: null, old_value: null, new_value: 'Padma Latha', details: {}, created_at: '2026-08-09T04:01:00Z' },
  { id: 'al6',  user_id: null, user_name: 'Mallik', room_id: 'room-18', room_number: 18, action: 'AC status changed', entity_type: 'room', entity_id: null, old_value: 'working', new_value: 'not_working', details: {}, created_at: '2026-08-12T04:00:00Z' },
  { id: 'al7',  user_id: null, user_name: 'Mallik', room_id: 'room-18', room_number: 18, action: 'Status changed', entity_type: 'room', entity_id: null, old_value: 'vacant', new_value: 'under_maintenance', details: {}, created_at: '2026-08-12T04:01:00Z' },
  { id: 'al8',  user_id: null, user_name: 'Mallik', room_id: 'room-18', room_number: 18, action: 'Maintenance reported', entity_type: 'maintenance', entity_id: null, old_value: null, new_value: 'AC not working', details: {}, created_at: '2026-08-12T04:02:00Z' },
  { id: 'al9',  user_id: null, user_name: 'Mallik', room_id: 'room-36', room_number: 36, action: 'Maintenance reported', entity_type: 'maintenance', entity_id: null, old_value: null, new_value: 'Window broken', details: {}, created_at: '2026-08-10T04:00:00Z' },
  { id: 'al10', user_id: null, user_name: 'Mallik', room_id: 'room-19', room_number: 19, action: 'Reservation created', entity_type: 'reservation', entity_id: null, old_value: null, new_value: 'Dr. Sundar Rajan', details: {}, created_at: '2026-08-12T04:00:00Z' },
  { id: 'al11', user_id: null, user_name: 'Mallik', room_id: 'room-21', room_number: 21, action: 'Marked clean', entity_type: 'room', entity_id: null, old_value: 'cleaning_required', new_value: 'clean', details: {}, created_at: '2026-08-13T07:00:00Z' },
];

// ---------- RESERVATIONS ----------

export const DEMO_RESERVATIONS: Reservation[] = [
  { id: 'res1', room_id: 'room-19', guest_name: 'Dr. Sundar Rajan', guest_phone: '+91 9800011111', num_guests: 2, reservation_start: '2026-08-15T04:00:00Z', reservation_end: '2026-08-18T04:00:00Z', expected_checkin: '2026-08-15T04:00:00Z', expected_checkout: '2026-08-18T04:00:00Z', status: 'approved', notes: 'VIP — Temple trustee', created_by: null, created_at: '2026-08-12T04:00:00Z', updated_at: '2026-08-12T04:00:00Z' },
  { id: 'res2', room_id: 'room-26', guest_name: 'Temple Event Group', guest_phone: '+91 9800022222', num_guests: 2, reservation_start: '2026-08-16T04:00:00Z', reservation_end: '2026-08-17T04:00:00Z', expected_checkin: '2026-08-16T04:00:00Z', expected_checkout: '2026-08-17T04:00:00Z', status: 'approved', notes: 'Temple annual event', created_by: null, created_at: '2026-08-12T04:00:00Z', updated_at: '2026-08-12T04:00:00Z' },
  { id: 'res3', room_id: 'room-34', guest_name: 'Bhakta Group Visit', guest_phone: '+91 9800033333', num_guests: 2, reservation_start: '2026-08-15T04:00:00Z', reservation_end: '2026-08-16T04:00:00Z', expected_checkin: '2026-08-15T04:00:00Z', expected_checkout: '2026-08-16T04:00:00Z', status: 'approved', notes: 'Group of 10 devotees', created_by: null, created_at: '2026-08-12T04:00:00Z', updated_at: '2026-08-12T04:00:00Z' },
  { id: 'res4', room_id: 'room-44', guest_name: 'Swami Ananda', guest_phone: '+91 9800044444', num_guests: 1, reservation_start: '2026-08-18T04:00:00Z', reservation_end: '2026-08-23T04:00:00Z', expected_checkin: '2026-08-18T04:00:00Z', expected_checkout: '2026-08-23T04:00:00Z', status: 'pending_review', notes: 'Long-term stay request', created_by: null, created_at: '2026-08-12T04:00:00Z', updated_at: '2026-08-12T04:00:00Z' },
];

// ---------- ACCOMMODATION REQUESTS ----------

export const DEMO_REQUESTS: AccommodationRequest[] = [
  { id: 'req1', guest_name: 'Kamala Devi', guest_phone: '+91 9800055555', guest_email: null, num_guests: 3, preferred_room_type: 'ac', preferred_checkin: '2026-08-20T04:00:00Z', preferred_checkout: '2026-08-23T04:00:00Z', purpose: 'Temple darshan', status: 'new', assigned_room_id: null, source: 'manual', external_reference_id: null, notes: 'Family of 3 including elderly parent', processed_by: null, created_at: '2026-08-12T04:00:00Z', updated_at: '2026-08-12T04:00:00Z' },
  { id: 'req2', guest_name: 'Rajan Group', guest_phone: '+91 9800066666', guest_email: null, num_guests: 8, preferred_room_type: 'dormitory', preferred_checkin: '2026-08-16T04:00:00Z', preferred_checkout: '2026-08-17T04:00:00Z', purpose: 'Group visit', status: 'pending_review', assigned_room_id: null, source: 'manual', external_reference_id: null, notes: 'Student group from Hyderabad', processed_by: null, created_at: '2026-08-12T04:00:00Z', updated_at: '2026-08-12T04:00:00Z' },
];

// ---------- CLEANING LOGS ----------

export const DEMO_CLEANING: CleaningLog[] = [
  { id: 'cl1', room_id: 'room-11', status: 'clean', cleaned_at: '2026-08-13T04:00:00Z', cleaned_by: 'Ramesh', notes: '', created_at: '2026-08-13T04:00:00Z' },
  { id: 'cl2', room_id: 'room-12', status: 'clean', cleaned_at: '2026-08-13T05:00:00Z', cleaned_by: 'Ramesh', notes: '', created_at: '2026-08-13T05:00:00Z' },
  { id: 'cl3', room_id: 'room-13', status: 'clean', cleaned_at: '2026-08-13T03:00:00Z', cleaned_by: 'Suresh', notes: '', created_at: '2026-08-13T03:00:00Z' },
  { id: 'cl4', room_id: 'room-17', status: 'clean', cleaned_at: '2026-08-13T02:00:00Z', cleaned_by: 'Ramesh', notes: '', created_at: '2026-08-13T02:00:00Z' },
  { id: 'cl5', room_id: 'room-20', status: 'clean', cleaned_at: '2026-08-13T06:00:00Z', cleaned_by: 'Suresh', notes: '', created_at: '2026-08-13T06:00:00Z' },
  { id: 'cl6', room_id: 'room-21', status: 'clean', cleaned_at: '2026-08-13T07:00:00Z', cleaned_by: 'Ramesh', notes: '', created_at: '2026-08-13T07:00:00Z' },
  { id: 'cl7', room_id: 'room-30', status: 'clean', cleaned_at: '2026-08-13T05:00:00Z', cleaned_by: 'Suresh', notes: '', created_at: '2026-08-13T05:00:00Z' },
];

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
