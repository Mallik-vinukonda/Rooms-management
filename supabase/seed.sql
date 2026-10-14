-- ============================================================
-- Sri Villa Guest House — Room Seed Data & Classifications
-- Rooms 10–53 (44 Rooms Total)
-- ============================================================
-- Classifications:
-- • Rooms 11, 12: Self Use (Non-Accommodation)
-- • Rooms 40, 41, 47, 48: Meeting Halls (Non-Accommodation)
-- • Rooms 21, 42, 44, 46, 49: Staff Rooms (Non-Accommodation)
-- • Rooms 10, 20, 28, 29, 30, 38, 39: Dormitories (Room 10 is AC Dorm, others Non-AC)
-- • Rooms 22 to 27: AC Guest Rooms
-- • Rooms 32 to 37: AC Guest Rooms
-- • Room 53: AC Guest Room
-- • Remaining (13-19, 31, 43, 45, 50, 51, 52): Non-AC Guest Rooms
-- ============================================================

-- Clean up any existing dummy guest, stay, and log data
TRUNCATE TABLE stays, guests, reservations, maintenance_logs, cleaning_logs, activity_logs, accommodation_requests CASCADE;

-- Clean up existing room classifications to apply new layout
DELETE FROM rooms;

-- ============================================================
-- ROOMS INSERTION (Rooms 10–53)
-- All rooms initialized as vacant and clean (zero dummy guests)
-- ============================================================

INSERT INTO rooms (
  room_number,
  room_type,
  purpose,
  capacity,
  floor,
  building,
  status,
  has_ac,
  ac_status,
  cleaning_status,
  is_accommodation,
  notes,
  map_position,
  display_order
) VALUES
-- ------------------------------------------------------------
-- Ground Floor — Wing A (Rooms 10–20)
-- ------------------------------------------------------------
(10, 'dormitory', 'AC Dormitory', 6, 'ground', 'main_wing_a', 'vacant', true,  'working',        'clean', true,  'AC Dormitory',                   '{"row": 0, "col": 0, "section": "wing_a"}', 0),
(11, 'non_ac',    'Self Use',     0, 'ground', 'main_wing_a', 'vacant', false, 'not_applicable', 'clean', false, 'Self Use — Non-Accommodation',   '{"row": 0, "col": 1, "section": "wing_a"}', 1),
(12, 'non_ac',    'Self Use',     0, 'ground', 'main_wing_a', 'vacant', false, 'not_applicable', 'clean', false, 'Self Use — Non-Accommodation',   '{"row": 0, "col": 2, "section": "wing_a"}', 2),
(13, 'non_ac',    'Guest Room',   2, 'ground', 'main_wing_a', 'vacant', false, 'not_applicable', 'clean', true,  '',                               '{"row": 0, "col": 3, "section": "wing_a"}', 3),
(14, 'non_ac',    'Guest Room',   2, 'ground', 'main_wing_a', 'vacant', false, 'not_applicable', 'clean', true,  '',                               '{"row": 0, "col": 4, "section": "wing_a"}', 4),
(15, 'non_ac',    'Guest Room',   2, 'ground', 'main_wing_a', 'vacant', false, 'not_applicable', 'clean', true,  '',                               '{"row": 0, "col": 5, "section": "wing_a"}', 5),
(16, 'non_ac',    'Guest Room',   2, 'ground', 'main_wing_a', 'vacant', false, 'not_applicable', 'clean', true,  '',                               '{"row": 0, "col": 6, "section": "wing_a"}', 6),
(17, 'non_ac',    'Guest Room',   2, 'ground', 'main_wing_a', 'vacant', false, 'not_applicable', 'clean', true,  '',                               '{"row": 0, "col": 7, "section": "wing_a"}', 7),
(18, 'non_ac',    'Guest Room',   2, 'ground', 'main_wing_a', 'vacant', false, 'not_applicable', 'clean', true,  '',                               '{"row": 0, "col": 8, "section": "wing_a"}', 8),
(19, 'non_ac',    'Guest Room',   2, 'ground', 'main_wing_a', 'vacant', false, 'not_applicable', 'clean', true,  '',                               '{"row": 0, "col": 9, "section": "wing_a"}', 9),
(20, 'dormitory', 'Dormitory',    6, 'ground', 'main_wing_a', 'vacant', false, 'not_applicable', 'clean', true,  'Non-AC Dormitory',               '{"row": 0, "col": 10, "section": "wing_a"}', 10),

-- ------------------------------------------------------------
-- First Floor — Main Building (Rooms 21–30, 40)
-- ------------------------------------------------------------
(21, 'other',     'Staff Room',   0, 'first',  'main_first',  'vacant', false, 'not_applicable', 'clean', false, 'Staff Room — Non-Accommodation', '{"row": 0, "col": 0, "section": "first_floor"}', 11),
(22, 'ac',        'Guest Room',   2, 'first',  'main_first',  'vacant', true,  'working',        'clean', true,  'AC Guest Room',                  '{"row": 0, "col": 1, "section": "first_floor"}', 12),
(23, 'ac',        'Guest Room',   2, 'first',  'main_first',  'vacant', true,  'working',        'clean', true,  'AC Guest Room',                  '{"row": 0, "col": 2, "section": "first_floor"}', 13),
(24, 'ac',        'Guest Room',   2, 'first',  'main_first',  'vacant', true,  'working',        'clean', true,  'AC Guest Room',                  '{"row": 0, "col": 3, "section": "first_floor"}', 14),
(25, 'ac',        'Guest Room',   2, 'first',  'main_first',  'vacant', true,  'working',        'clean', true,  'AC Guest Room',                  '{"row": 0, "col": 4, "section": "first_floor"}', 15),
(26, 'ac',        'Guest Room',   2, 'first',  'main_first',  'vacant', true,  'working',        'clean', true,  'AC Guest Room',                  '{"row": 0, "col": 5, "section": "first_floor"}', 16),
(27, 'ac',        'Guest Room',   2, 'first',  'main_first',  'vacant', true,  'working',        'clean', true,  'AC Guest Room',                  '{"row": 0, "col": 6, "section": "first_floor"}', 17),
(28, 'dormitory', 'Dormitory',    6, 'first',  'main_first',  'vacant', false, 'not_applicable', 'clean', true,  'Non-AC Dormitory',               '{"row": 0, "col": 7, "section": "first_floor"}', 18),
(29, 'dormitory', 'Dormitory',    6, 'first',  'main_first',  'vacant', false, 'not_applicable', 'clean', true,  'Non-AC Dormitory',               '{"row": 0, "col": 8, "section": "first_floor"}', 19),
(30, 'dormitory', 'Dormitory',    6, 'first',  'main_first',  'vacant', false, 'not_applicable', 'clean', true,  'Non-AC Dormitory',               '{"row": 0, "col": 9, "section": "first_floor"}', 20),
(40, 'other',     'Meeting Hall', 0, 'first',  'main_first',  'vacant', false, 'not_applicable', 'clean', false, 'Meeting Hall — Non-Accommodation','{"row": 0, "col": 10, "section": "first_floor"}', 21),

-- ------------------------------------------------------------
-- Second Floor — Main Building Wing B (Rooms 31–39)
-- ------------------------------------------------------------
(31, 'non_ac',    'Guest Room',   2, 'second', 'main_second', 'vacant', false, 'not_applicable', 'clean', true,  '',                               '{"row": 1, "col": 0, "section": "wing_b"}', 22),
(32, 'ac',        'Guest Room',   2, 'second', 'main_second', 'vacant', true,  'working',        'clean', true,  'AC Guest Room',                  '{"row": 2, "col": 0, "section": "wing_b"}', 23),
(33, 'ac',        'Guest Room',   2, 'second', 'main_second', 'vacant', true,  'working',        'clean', true,  'AC Guest Room',                  '{"row": 3, "col": 0, "section": "wing_b"}', 24),
(34, 'ac',        'Guest Room',   2, 'second', 'main_second', 'vacant', true,  'working',        'clean', true,  'AC Guest Room',                  '{"row": 4, "col": 0, "section": "wing_b"}', 25),
(35, 'ac',        'Guest Room',   2, 'second', 'main_second', 'vacant', true,  'working',        'clean', true,  'AC Guest Room',                  '{"row": 5, "col": 0, "section": "wing_b"}', 26),
(36, 'ac',        'Guest Room',   2, 'second', 'main_second', 'vacant', true,  'working',        'clean', true,  'AC Guest Room',                  '{"row": 6, "col": 0, "section": "wing_b"}', 27),
(37, 'ac',        'Guest Room',   2, 'second', 'main_second', 'vacant', true,  'working',        'clean', true,  'AC Guest Room',                  '{"row": 7, "col": 0, "section": "wing_b"}', 28),
(38, 'dormitory', 'Dormitory',    6, 'second', 'main_second', 'vacant', false, 'not_applicable', 'clean', true,  'Non-AC Dormitory',               '{"row": 8, "col": 0, "section": "wing_b"}', 29),
(39, 'dormitory', 'Dormitory',    6, 'second', 'main_second', 'vacant', false, 'not_applicable', 'clean', true,  'Non-AC Dormitory',               '{"row": 9, "col": 0, "section": "wing_b"}', 30),

-- ------------------------------------------------------------
-- Separate Block (Rooms 41–53)
-- ------------------------------------------------------------
(41, 'other',     'Meeting Hall', 0, 'separate_block', 'separate_block', 'vacant', false, 'not_applicable', 'clean', false, 'Meeting Hall — Non-Accommodation', '{"row": 0, "col": 0, "side": "left", "section": "upper_block"}', 31),
(42, 'other',     'Staff Room',   0, 'separate_block', 'separate_block', 'vacant', false, 'not_applicable', 'clean', false, 'Staff Room — Non-Accommodation',   '{"row": 0, "col": 1, "side": "right", "section": "upper_block"}', 32),
(43, 'non_ac',    'Guest Room',   2, 'separate_block', 'separate_block', 'vacant', false, 'not_applicable', 'clean', true,  '',                                 '{"row": 1, "col": 0, "side": "left", "section": "upper_block"}', 33),
(44, 'other',     'Staff Room',   0, 'separate_block', 'separate_block', 'vacant', false, 'not_applicable', 'clean', false, 'Staff Room — Non-Accommodation',   '{"row": 1, "col": 1, "side": "right", "section": "upper_block"}', 34),
(45, 'non_ac',    'Guest Room',   2, 'separate_block', 'separate_block', 'vacant', false, 'not_applicable', 'clean', true,  '',                                 '{"row": 2, "col": 0, "side": "left", "section": "upper_block"}', 35),
(46, 'other',     'Staff Room',   0, 'separate_block', 'separate_block', 'vacant', false, 'not_applicable', 'clean', false, 'Staff Room — Non-Accommodation',   '{"row": 2, "col": 1, "side": "right", "section": "upper_block"}', 36),
(47, 'other',     'Meeting Hall', 0, 'separate_block', 'separate_block', 'vacant', false, 'not_applicable', 'clean', false, 'Meeting Hall — Non-Accommodation', '{"row": 3, "col": 0, "side": "left", "section": "upper_block"}', 37),
(48, 'other',     'Meeting Hall', 0, 'separate_block', 'separate_block', 'vacant', false, 'not_applicable', 'clean', false, 'Meeting Hall — Non-Accommodation', '{"row": 3, "col": 1, "side": "right", "section": "upper_block"}', 38),
(49, 'other',     'Staff Room',   0, 'separate_block', 'separate_block', 'vacant', false, 'not_applicable', 'clean', false, 'Staff Room — Non-Accommodation',   '{"row": 4, "col": 0, "side": "left", "section": "upper_block"}', 39),
(50, 'non_ac',    'Guest Room',   2, 'separate_block', 'separate_block', 'vacant', false, 'not_applicable', 'clean', true,  '',                                 '{"row": 4, "col": 1, "side": "right", "section": "upper_block"}', 40),
(51, 'non_ac',    'Guest Room',   2, 'separate_block', 'separate_block', 'vacant', false, 'not_applicable', 'clean', true,  '',                                 '{"row": 5, "col": 0, "side": "left", "section": "upper_block"}', 41),
(52, 'non_ac',    'Guest Room',   2, 'separate_block', 'separate_block', 'vacant', false, 'not_applicable', 'clean', true,  '',                                 '{"row": 5, "col": 1, "side": "right", "section": "upper_block"}', 42),
(53, 'ac',        'Guest Room',   2, 'separate_block', 'separate_block', 'vacant', true,  'working',        'clean', true,  'AC Guest Room',                    '{"row": 6, "col": 0, "side": "left", "section": "upper_block"}', 43);
