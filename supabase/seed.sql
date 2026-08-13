-- ============================================================
-- Sri Villa Guest House — Seed Data
-- Realistic demo data for rooms 11–54
-- ============================================================
-- NOTE: This is DEMO/SEED data. Replace with actual room data.
-- ============================================================

-- ============================================================
-- ROOMS (11–54) — 44 rooms total
-- ============================================================

-- Ground Floor — Main Building Wing A (Rooms 11–20)
INSERT INTO rooms (room_number, room_type, purpose, capacity, floor, building, status, has_ac, ac_status, cleaning_status, notes, map_position, display_order) VALUES
(11, 'ac',       'Guest Room', 2, 'ground', 'main_wing_a', 'occupied',           true,  'working',       'clean',              'Corner room with extra ventilation', '{"row": 0, "col": 0, "section": "wing_a"}', 1),
(12, 'ac',       'Guest Room', 2, 'ground', 'main_wing_a', 'occupied',           true,  'working',       'clean',              '', '{"row": 0, "col": 1, "section": "wing_a"}', 2),
(13, 'ac',       'Guest Room', 2, 'ground', 'main_wing_a', 'vacant',             true,  'working',       'clean',              '', '{"row": 0, "col": 2, "section": "wing_a"}', 3),
(14, 'ac',       'Guest Room', 2, 'ground', 'main_wing_a', 'vacant',             true,  'not_working',   'cleaning_required',  'AC remote missing', '{"row": 0, "col": 3, "section": "wing_a"}', 4),
(15, 'dormitory','Guest Room', 8, 'ground', 'main_wing_a', 'partially_occupied', true,  'working',       'clean',              'Large dormitory', '{"row": 0, "col": 4, "section": "wing_a"}', 5),
(16, 'non_ac',   'Guest Room', 3, 'ground', 'main_wing_a', 'vacant',             false, 'not_applicable','clean',              '', '{"row": 0, "col": 5, "section": "wing_a"}', 6),
(17, 'ac',       'Guest Room', 2, 'ground', 'main_wing_a', 'occupied',           true,  'working',       'clean',              '', '{"row": 0, "col": 6, "section": "wing_a"}', 7),
(18, 'ac',       'Guest Room', 2, 'ground', 'main_wing_a', 'under_maintenance',  true,  'not_working',   'cleaning_required',  'AC compressor issue reported', '{"row": 0, "col": 7, "section": "wing_a"}', 8),
(19, 'non_ac',   'Guest Room', 2, 'ground', 'main_wing_a', 'reserved',           false, 'not_applicable','clean',              'Reserved for VIP guest', '{"row": 0, "col": 8, "section": "wing_a"}', 9),
(20, 'ac',       'Guest Room', 2, 'ground', 'main_wing_a', 'vacant',             true,  'working',       'clean',              'Corner room — connects to Wing B', '{"row": 0, "col": 9, "section": "wing_a"}', 10);

-- Ground Floor — Main Building Wing B (Rooms 30–39)
INSERT INTO rooms (room_number, room_type, purpose, capacity, floor, building, status, has_ac, ac_status, cleaning_status, notes, map_position, display_order) VALUES
(30, 'ac',       'Guest Room', 2, 'ground', 'main_wing_b', 'occupied',           true,  'working',       'clean',              '', '{"row": 0, "col": 0, "section": "wing_b"}', 20),
(31, 'non_ac',   'Guest Room', 2, 'ground', 'main_wing_b', 'vacant',             false, 'not_applicable','clean',              '', '{"row": 1, "col": 0, "section": "wing_b"}', 21),
(32, 'ac',       'Guest Room', 2, 'ground', 'main_wing_b', 'occupied',           true,  'working',       'cleaning_required',  '', '{"row": 2, "col": 0, "section": "wing_b"}', 22),
(33, 'non_ac',   'Guest Room', 3, 'ground', 'main_wing_b', 'vacant',             false, 'not_applicable','clean',              '', '{"row": 3, "col": 0, "section": "wing_b"}', 23),
(34, 'ac',       'Guest Room', 2, 'ground', 'main_wing_b', 'reserved',           true,  'working',       'clean',              'Reserved for group visit Aug 15', '{"row": 4, "col": 0, "section": "wing_b"}', 24),
(35, 'dormitory','Guest Room', 6, 'ground', 'main_wing_b', 'partially_occupied', true,  'working',       'clean',              '', '{"row": 5, "col": 0, "section": "wing_b"}', 25),
(36, 'non_ac',   'Guest Room', 2, 'ground', 'main_wing_b', 'under_maintenance',  false, 'not_applicable','cleaning_required',  'Window needs repair', '{"row": 6, "col": 0, "section": "wing_b"}', 26),
(37, 'ac',       'Guest Room', 2, 'ground', 'main_wing_b', 'vacant',             true,  'under_repair',  'clean',              'AC making noise', '{"row": 7, "col": 0, "section": "wing_b"}', 27),
(38, 'non_ac',   'Guest Room', 2, 'ground', 'main_wing_b', 'occupied',           false, 'not_applicable','clean',              '', '{"row": 8, "col": 0, "section": "wing_b"}', 28),
(39, 'ac',       'Guest Room', 2, 'ground', 'main_wing_b', 'vacant',             true,  'working',       'clean',              '', '{"row": 9, "col": 0, "section": "wing_b"}', 29);

-- First Floor — Main Building (Rooms 21–29)
INSERT INTO rooms (room_number, room_type, purpose, capacity, floor, building, status, has_ac, ac_status, cleaning_status, notes, map_position, display_order) VALUES
(21, 'ac',       'Guest Room', 2, 'first',  'main_first',  'occupied',           true,  'working',       'clean',              '', '{"row": 0, "col": 0, "section": "first_floor"}', 11),
(22, 'ac',       'Guest Room', 2, 'first',  'main_first',  'vacant',             true,  'working',       'cleaning_required',  '', '{"row": 0, "col": 1, "section": "first_floor"}', 12),
(23, 'non_ac',   'Guest Room', 3, 'first',  'main_first',  'occupied',           false, 'not_applicable','clean',              '', '{"row": 0, "col": 2, "section": "first_floor"}', 13),
(24, 'ac',       'Guest Room', 2, 'first',  'main_first',  'vacant',             true,  'working',       'clean',              '', '{"row": 0, "col": 3, "section": "first_floor"}', 14),
(25, 'dormitory','Guest Room', 8, 'first',  'main_first',  'partially_occupied', false, 'not_applicable','clean',              'Large dormitory — first floor', '{"row": 0, "col": 4, "section": "first_floor"}', 15),
(26, 'ac',       'Guest Room', 2, 'first',  'main_first',  'reserved',           true,  'working',       'clean',              'Reserved for temple event', '{"row": 0, "col": 5, "section": "first_floor"}', 16),
(27, 'non_ac',   'Guest Room', 2, 'first',  'main_first',  'vacant',             false, 'not_applicable','clean',              '', '{"row": 0, "col": 6, "section": "first_floor"}', 17),
(28, 'ac',       'Guest Room', 2, 'first',  'main_first',  'occupied',           true,  'not_working',   'clean',              'AC not cooling properly', '{"row": 0, "col": 7, "section": "first_floor"}', 18),
(29, 'non_ac',   'Guest Room', 2, 'first',  'main_first',  'vacant',             false, 'not_applicable','cleaning_required',  '', '{"row": 0, "col": 8, "section": "first_floor"}', 19);

-- Upper Block (Rooms 40–54) — Corridor layout
INSERT INTO rooms (room_number, room_type, purpose, capacity, floor, building, status, has_ac, ac_status, cleaning_status, notes, map_position, display_order) VALUES
(40, 'ac',       'Guest Room', 2, 'ground', 'upper_block', 'occupied',            true,  'working',       'clean',              '', '{"row": 0, "col": 0, "side": "left", "section": "upper_block"}', 30),
(41, 'ac',       'Guest Room', 2, 'ground', 'upper_block', 'vacant',              true,  'working',       'clean',              '', '{"row": 0, "col": 1, "side": "right", "section": "upper_block"}', 31),
(42, 'non_ac',   'Guest Room', 2, 'ground', 'upper_block', 'occupied',            false, 'not_applicable','clean',              '', '{"row": 1, "col": 0, "side": "left", "section": "upper_block"}', 32),
(43, 'ac',       'Guest Room', 2, 'ground', 'upper_block', 'vacant',              true,  'working',       'cleaning_required',  '', '{"row": 1, "col": 1, "side": "right", "section": "upper_block"}', 33),
(44, 'ac',       'Guest Room', 2, 'ground', 'upper_block', 'reserved',            true,  'working',       'clean',              '', '{"row": 2, "col": 0, "side": "left", "section": "upper_block"}', 34),
(45, 'non_ac',   'Guest Room', 3, 'ground', 'upper_block', 'vacant',              false, 'not_applicable','clean',              '', '{"row": 2, "col": 1, "side": "right", "section": "upper_block"}', 35),
(46, 'ac',       'Guest Room', 2, 'ground', 'upper_block', 'occupied',            true,  'working',       'clean',              '', '{"row": 3, "col": 0, "side": "left", "section": "upper_block"}', 36),
(47, 'ac',       'Guest Room', 2, 'ground', 'upper_block', 'under_maintenance',   true,  'not_working',   'cleaning_required',  'Plumbing issue', '{"row": 3, "col": 1, "side": "right", "section": "upper_block"}', 37),
(48, 'dormitory','Guest Room', 6, 'ground', 'upper_block', 'partially_occupied',  false, 'not_applicable','clean',              '', '{"row": 4, "col": 0, "side": "left", "section": "upper_block"}', 38),
(49, 'non_ac',   'Guest Room', 2, 'ground', 'upper_block', 'vacant',              false, 'not_applicable','clean',              '', '{"row": 4, "col": 1, "side": "right", "section": "upper_block"}', 39),
(50, 'ac',       'Guest Room', 2, 'ground', 'upper_block', 'occupied',            true,  'working',       'clean',              '', '{"row": 5, "col": 0, "side": "left", "section": "upper_block"}', 40),
(51, 'ac',       'Guest Room', 2, 'ground', 'upper_block', 'vacant',              true,  'working',       'clean',              '', '{"row": 5, "col": 1, "side": "right", "section": "upper_block"}', 41),
(52, 'non_ac',   'Guest Room', 2, 'ground', 'upper_block', 'non_functioning',     false, 'not_applicable','cleaning_required',  'Needs full renovation', '{"row": 6, "col": 0, "side": "left", "section": "upper_block"}', 42),
(53, 'ac',       'Guest Room', 2, 'ground', 'upper_block', 'vacant',              true,  'under_repair',  'clean',              'AC unit being replaced', '{"row": 6, "col": 1, "side": "right", "section": "upper_block"}', 43),
(54, 'non_ac',   'Office',     1, 'ground', 'upper_block', 'unavailable',         false, 'not_applicable','clean',              'Used as storage/office', '{"row": 7, "col": 0, "side": "left", "section": "upper_block"}', 44);

-- ============================================================
-- DEMO GUESTS
-- ============================================================

INSERT INTO guests (id, full_name, phone, notes) VALUES
('a0000000-0000-0000-0000-000000000001', 'Arun Kumar',      '+91 9876543210', 'Regular visitor'),
('a0000000-0000-0000-0000-000000000002', 'Sneha Kumar',     '+91 9876543211', ''),
('a0000000-0000-0000-0000-000000000003', 'Priya Sharma',    '+91 9876543212', ''),
('a0000000-0000-0000-0000-000000000004', 'Rahul Reddy',     '+91 9876543213', ''),
('a0000000-0000-0000-0000-000000000005', 'Lakshmi Devi',    '+91 9876543214', 'Temple committee member'),
('a0000000-0000-0000-0000-000000000006', 'Suresh Babu',     '+91 9876543215', ''),
('a0000000-0000-0000-0000-000000000007', 'Anitha Rao',      '+91 9876543216', ''),
('a0000000-0000-0000-0000-000000000008', 'Venkat Prasad',   '+91 9876543217', ''),
('a0000000-0000-0000-0000-000000000009', 'Meera Krishnan',  '+91 9876543218', ''),
('a0000000-0000-0000-0000-000000000010', 'Ravi Teja',       '+91 9876543219', ''),
('a0000000-0000-0000-0000-000000000011', 'Padma Latha',     '+91 9876543220', ''),
('a0000000-0000-0000-0000-000000000012', 'Ganesh Mohan',    '+91 9876543221', 'Arriving from Chennai'),
('a0000000-0000-0000-0000-000000000013', 'Sita Ram',        '+91 9876543222', ''),
('a0000000-0000-0000-0000-000000000014', 'Deepa Nair',      '+91 9876543223', ''),
('a0000000-0000-0000-0000-000000000015', 'Karthik Iyer',    '+91 9876543224', ''),
('a0000000-0000-0000-0000-000000000016', 'Sunita Reddy',    '+91 9876543225', ''),
('a0000000-0000-0000-0000-000000000017', 'Balaji Naidu',    '+91 9876543226', ''),
('a0000000-0000-0000-0000-000000000018', 'Revathi Sundaram','+91 9876543227', '');

-- ============================================================
-- DEMO STAYS (Active allocations)
-- ============================================================

-- Room 11 (capacity 2) — 2 guests
INSERT INTO stays (guest_id, room_id, check_in, status) VALUES
('a0000000-0000-0000-0000-000000000001', (SELECT id FROM rooms WHERE room_number = 11), NOW() - INTERVAL '2 days', 'active'),
('a0000000-0000-0000-0000-000000000002', (SELECT id FROM rooms WHERE room_number = 11), NOW() - INTERVAL '2 days', 'active');

-- Room 12 (capacity 2) — 2 guests
INSERT INTO stays (guest_id, room_id, check_in, status) VALUES
('a0000000-0000-0000-0000-000000000003', (SELECT id FROM rooms WHERE room_number = 12), NOW() - INTERVAL '1 day', 'active'),
('a0000000-0000-0000-0000-000000000004', (SELECT id FROM rooms WHERE room_number = 12), NOW() - INTERVAL '1 day', 'active');

-- Room 15 (dormitory capacity 8) — 5 guests (partially occupied)
INSERT INTO stays (guest_id, room_id, check_in, status) VALUES
('a0000000-0000-0000-0000-000000000005', (SELECT id FROM rooms WHERE room_number = 15), NOW() - INTERVAL '3 days', 'active'),
('a0000000-0000-0000-0000-000000000006', (SELECT id FROM rooms WHERE room_number = 15), NOW() - INTERVAL '3 days', 'active'),
('a0000000-0000-0000-0000-000000000007', (SELECT id FROM rooms WHERE room_number = 15), NOW() - INTERVAL '2 days', 'active'),
('a0000000-0000-0000-0000-000000000008', (SELECT id FROM rooms WHERE room_number = 15), NOW() - INTERVAL '1 day', 'active'),
('a0000000-0000-0000-0000-000000000009', (SELECT id FROM rooms WHERE room_number = 15), NOW() - INTERVAL '1 day', 'active');

-- Room 17 (capacity 2) — 2 guests
INSERT INTO stays (guest_id, room_id, check_in, status) VALUES
('a0000000-0000-0000-0000-000000000010', (SELECT id FROM rooms WHERE room_number = 17), NOW() - INTERVAL '4 days', 'active'),
('a0000000-0000-0000-0000-000000000011', (SELECT id FROM rooms WHERE room_number = 17), NOW() - INTERVAL '4 days', 'active');

-- Room 21 (capacity 2) — 1 guest
INSERT INTO stays (guest_id, room_id, check_in, status) VALUES
('a0000000-0000-0000-0000-000000000012', (SELECT id FROM rooms WHERE room_number = 21), NOW() - INTERVAL '1 day', 'active');

-- Room 23 (capacity 3) — 2 guests
INSERT INTO stays (guest_id, room_id, check_in, status) VALUES
('a0000000-0000-0000-0000-000000000013', (SELECT id FROM rooms WHERE room_number = 23), NOW() - INTERVAL '2 days', 'active'),
('a0000000-0000-0000-0000-000000000014', (SELECT id FROM rooms WHERE room_number = 23), NOW() - INTERVAL '2 days', 'active');

-- Room 28 (capacity 2) — 1 guest
INSERT INTO stays (guest_id, room_id, check_in, status) VALUES
('a0000000-0000-0000-0000-000000000015', (SELECT id FROM rooms WHERE room_number = 28), NOW() - INTERVAL '3 days', 'active');

-- Room 30 (capacity 2) — 2 guests
INSERT INTO stays (guest_id, room_id, check_in, status) VALUES
('a0000000-0000-0000-0000-000000000016', (SELECT id FROM rooms WHERE room_number = 30), NOW() - INTERVAL '1 day', 'active'),
('a0000000-0000-0000-0000-000000000017', (SELECT id FROM rooms WHERE room_number = 30), NOW() - INTERVAL '1 day', 'active');

-- Room 32 (capacity 2) — 1 guest
INSERT INTO stays (guest_id, room_id, check_in, status) VALUES
('a0000000-0000-0000-0000-000000000018', (SELECT id FROM rooms WHERE room_number = 32), NOW() - INTERVAL '2 days', 'active');

-- Room 35 (dormitory capacity 6) — 3 guests (partially occupied) — reuse guests
INSERT INTO stays (guest_id, room_id, check_in, status)
SELECT 'a0000000-0000-0000-0000-000000000001', id, NOW() - INTERVAL '5 days', 'checked_out'
FROM rooms WHERE room_number = 35;
-- Note: checked_out stay above is historical

-- Room 38 (capacity 2) — using a new guest inline
INSERT INTO guests (id, full_name, phone, notes) VALUES
('a0000000-0000-0000-0000-000000000019', 'Kavitha Menon', '+91 9876543228', '');
INSERT INTO stays (guest_id, room_id, check_in, status) VALUES
('a0000000-0000-0000-0000-000000000019', (SELECT id FROM rooms WHERE room_number = 38), NOW() - INTERVAL '1 day', 'active');

-- Rooms 40, 42, 46, 50 (upper block occupied)
INSERT INTO guests (id, full_name, phone, notes) VALUES
('a0000000-0000-0000-0000-000000000020', 'Arjun Nair',     '+91 9876543229', ''),
('a0000000-0000-0000-0000-000000000021', 'Divya Pillai',   '+91 9876543230', ''),
('a0000000-0000-0000-0000-000000000022', 'Mohan Das',      '+91 9876543231', ''),
('a0000000-0000-0000-0000-000000000023', 'Rekha Varma',    '+91 9876543232', '');

INSERT INTO stays (guest_id, room_id, check_in, status) VALUES
('a0000000-0000-0000-0000-000000000020', (SELECT id FROM rooms WHERE room_number = 40), NOW() - INTERVAL '2 days', 'active'),
('a0000000-0000-0000-0000-000000000021', (SELECT id FROM rooms WHERE room_number = 42), NOW() - INTERVAL '1 day', 'active'),
('a0000000-0000-0000-0000-000000000022', (SELECT id FROM rooms WHERE room_number = 46), NOW() - INTERVAL '3 days', 'active'),
('a0000000-0000-0000-0000-000000000023', (SELECT id FROM rooms WHERE room_number = 50), NOW() - INTERVAL '1 day', 'active');

-- Room 48 (dormitory cap 6) — 2 guests
INSERT INTO guests (id, full_name, phone, notes) VALUES
('a0000000-0000-0000-0000-000000000024', 'Srinivas Rao',  '+91 9876543233', ''),
('a0000000-0000-0000-0000-000000000025', 'Chandra Sekhar', '+91 9876543234', '');

INSERT INTO stays (guest_id, room_id, check_in, status) VALUES
('a0000000-0000-0000-0000-000000000024', (SELECT id FROM rooms WHERE room_number = 48), NOW() - INTERVAL '2 days', 'active'),
('a0000000-0000-0000-0000-000000000025', (SELECT id FROM rooms WHERE room_number = 48), NOW() - INTERVAL '2 days', 'active');

-- ============================================================
-- DEMO MAINTENANCE LOGS
-- ============================================================

INSERT INTO maintenance_logs (room_id, issue, description, status, reported_at, resolved_at, notes) VALUES
((SELECT id FROM rooms WHERE room_number = 18), 'AC not working', 'AC compressor stopped functioning', 'open', NOW() - INTERVAL '1 day', NULL, 'Technician called'),
((SELECT id FROM rooms WHERE room_number = 36), 'Window broken', 'Window glass cracked during storm', 'in_progress', NOW() - INTERVAL '3 days', NULL, 'Glass ordered, expected delivery tomorrow'),
((SELECT id FROM rooms WHERE room_number = 47), 'Plumbing issue', 'Bathroom tap leaking', 'open', NOW() - INTERVAL '2 days', NULL, 'Plumber scheduled for tomorrow'),
((SELECT id FROM rooms WHERE room_number = 14), 'AC remote missing', 'AC remote control not found', 'open', NOW() - INTERVAL '5 days', NULL, 'Replacement ordered'),
((SELECT id FROM rooms WHERE room_number = 37), 'AC noise', 'AC making loud rattling noise', 'in_progress', NOW() - INTERVAL '4 days', NULL, 'Under inspection'),
-- Historical resolved issues
((SELECT id FROM rooms WHERE room_number = 11), 'Light fixture', 'Bathroom light not working', 'resolved', NOW() - INTERVAL '10 days', NOW() - INTERVAL '8 days', 'Bulb replaced'),
((SELECT id FROM rooms WHERE room_number = 30), 'Door lock', 'Door lock jammed', 'resolved', NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days', 'Lock mechanism replaced');

-- ============================================================
-- DEMO CLEANING LOGS
-- ============================================================

INSERT INTO cleaning_logs (room_id, status, cleaned_at, cleaned_by, notes) VALUES
((SELECT id FROM rooms WHERE room_number = 11), 'clean', NOW() - INTERVAL '4 hours', 'Ramesh', ''),
((SELECT id FROM rooms WHERE room_number = 12), 'clean', NOW() - INTERVAL '3 hours', 'Ramesh', ''),
((SELECT id FROM rooms WHERE room_number = 13), 'clean', NOW() - INTERVAL '5 hours', 'Suresh', ''),
((SELECT id FROM rooms WHERE room_number = 17), 'clean', NOW() - INTERVAL '6 hours', 'Ramesh', ''),
((SELECT id FROM rooms WHERE room_number = 20), 'clean', NOW() - INTERVAL '2 hours', 'Suresh', ''),
((SELECT id FROM rooms WHERE room_number = 21), 'clean', NOW() - INTERVAL '1 hour', 'Ramesh', ''),
((SELECT id FROM rooms WHERE room_number = 30), 'clean', NOW() - INTERVAL '3 hours', 'Suresh', '');

-- ============================================================
-- DEMO RESERVATIONS
-- ============================================================

INSERT INTO reservations (room_id, guest_name, guest_phone, num_guests, reservation_start, reservation_end, expected_checkin, expected_checkout, status, notes) VALUES
((SELECT id FROM rooms WHERE room_number = 19), 'Dr. Sundar Rajan', '+91 9800011111', 2, NOW() + INTERVAL '2 days', NOW() + INTERVAL '5 days', NOW() + INTERVAL '2 days', NOW() + INTERVAL '5 days', 'approved', 'VIP — Temple trustee'),
((SELECT id FROM rooms WHERE room_number = 26), 'Temple Event Group', '+91 9800022222', 2, NOW() + INTERVAL '3 days', NOW() + INTERVAL '4 days', NOW() + INTERVAL '3 days', NOW() + INTERVAL '4 days', 'approved', 'Temple annual event'),
((SELECT id FROM rooms WHERE room_number = 34), 'Bhakta Group Visit', '+91 9800033333', 2, NOW() + INTERVAL '2 days', NOW() + INTERVAL '3 days', NOW() + INTERVAL '2 days', NOW() + INTERVAL '3 days', 'approved', 'Group of 10 devotees — 5 rooms needed'),
((SELECT id FROM rooms WHERE room_number = 44), 'Swami Ananda', '+91 9800044444', 1, NOW() + INTERVAL '5 days', NOW() + INTERVAL '10 days', NOW() + INTERVAL '5 days', NOW() + INTERVAL '10 days', 'pending_review', 'Long-term stay request');

-- ============================================================
-- DEMO ACTIVITY LOGS
-- ============================================================

INSERT INTO activity_logs (user_name, room_id, room_number, action, entity_type, old_value, new_value, created_at) VALUES
('Mallik', (SELECT id FROM rooms WHERE room_number = 11), 11, 'Guest checked in', 'stay', NULL, 'Arun Kumar', NOW() - INTERVAL '2 days'),
('Mallik', (SELECT id FROM rooms WHERE room_number = 11), 11, 'Guest checked in', 'stay', NULL, 'Sneha Kumar', NOW() - INTERVAL '2 days'),
('Mallik', (SELECT id FROM rooms WHERE room_number = 11), 11, 'Status changed', 'room', 'vacant', 'occupied', NOW() - INTERVAL '2 days'),
('Mallik', (SELECT id FROM rooms WHERE room_number = 17), 17, 'Guest checked in', 'stay', NULL, 'Ravi Teja', NOW() - INTERVAL '4 days'),
('Mallik', (SELECT id FROM rooms WHERE room_number = 17), 17, 'Guest checked in', 'stay', NULL, 'Padma Latha', NOW() - INTERVAL '4 days'),
('Mallik', (SELECT id FROM rooms WHERE room_number = 18), 18, 'AC status changed', 'room', 'working', 'not_working', NOW() - INTERVAL '1 day'),
('Mallik', (SELECT id FROM rooms WHERE room_number = 18), 18, 'Status changed', 'room', 'vacant', 'under_maintenance', NOW() - INTERVAL '1 day'),
('Mallik', (SELECT id FROM rooms WHERE room_number = 18), 18, 'Maintenance reported', 'maintenance', NULL, 'AC not working', NOW() - INTERVAL '1 day'),
('Mallik', (SELECT id FROM rooms WHERE room_number = 36), 36, 'Maintenance reported', 'maintenance', NULL, 'Window broken', NOW() - INTERVAL '3 days'),
('Mallik', (SELECT id FROM rooms WHERE room_number = 19), 19, 'Reservation created', 'reservation', NULL, 'Dr. Sundar Rajan', NOW() - INTERVAL '1 day'),
('Mallik', (SELECT id FROM rooms WHERE room_number = 21), 21, 'Marked clean', 'room', 'cleaning_required', 'clean', NOW() - INTERVAL '1 hour');

-- ============================================================
-- DEMO ACCOMMODATION REQUESTS
-- ============================================================

INSERT INTO accommodation_requests (guest_name, guest_phone, num_guests, preferred_room_type, preferred_checkin, preferred_checkout, purpose, status, source, notes) VALUES
('Kamala Devi', '+91 9800055555', 3, 'ac', NOW() + INTERVAL '7 days', NOW() + INTERVAL '10 days', 'Temple darshan', 'new', 'manual', 'Family of 3 including elderly parent'),
('Rajan Group', '+91 9800066666', 8, 'dormitory', NOW() + INTERVAL '3 days', NOW() + INTERVAL '4 days', 'Group visit', 'pending_review', 'manual', 'Student group from Hyderabad');
