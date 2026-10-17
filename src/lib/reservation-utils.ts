import type { RoomWithOccupancy, Reservation } from '@/types';

export interface RoomDateAvailability {
  isAvailable: boolean;
  status: 'available' | 'occupied_conflict' | 'reservation_conflict' | 'under_maintenance' | 'non_accommodation' | 'exceeds_capacity';
  badgeText: string;
  badgeBg: string;
  badgeTextCol: string;
  badgeBorder: string;
  heading: string;
  message: string;
  totalNights: number;
  conflictingStays: Array<{
    guestName: string;
    checkInFormatted: string;
    checkoutFormatted: string;
  }>;
  conflictingReservations: Array<{
    guestName: string;
    checkInFormatted: string;
    checkoutFormatted: string;
    status: string;
  }>;
}

/**
 * Normalizes input date/time to a Date object.
 * If only a date string is passed (e.g. YYYY-MM-DD), attaches default hours.
 */
export function normalizeDate(dateStr: string | Date, defaultHour = 12, defaultMinute = 0): Date {
  if (dateStr instanceof Date) return dateStr;
  if (!dateStr) return new Date();

  // If format is YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d, defaultHour, defaultMinute, 0);
  }

  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date() : d;
}

/**
 * Checks if two time intervals [startA, endA] and [startB, endB] overlap.
 * Intervals are considered open on checkout / closed on check-in
 * (e.g., checkout at 11 AM and check-in at 12 PM do NOT overlap).
 */
export function doIntervalsOverlap(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
  return startA.getTime() < endB.getTime() && endA.getTime() > startB.getTime();
}

/**
 * Checks availability of a specific room for a given check-in and check-out window.
 */
export function checkRoomDateAvailability(
  room: RoomWithOccupancy,
  checkInStr: string,
  checkOutStr: string,
  reservations: Reservation[] = [],
  requestedGuests = 1
): RoomDateAvailability {
  // 1. Non-accommodation check
  if (!room.is_accommodation) {
    return {
      isAvailable: false,
      status: 'non_accommodation',
      badgeText: 'Non-Accommodation Space',
      badgeBg: 'bg-stone-100',
      badgeTextCol: 'text-stone-700',
      badgeBorder: 'border-stone-300',
      heading: `Facility Space (${room.purpose})`,
      message: 'This space is reserved for administrative or utility use and cannot be allotted to guests.',
      totalNights: 0,
      conflictingStays: [],
      conflictingReservations: [],
    };
  }

  // 2. Under maintenance
  if (room.status === 'under_maintenance') {
    return {
      isAvailable: false,
      status: 'under_maintenance',
      badgeText: 'Under Maintenance',
      badgeBg: 'bg-red-50',
      badgeTextCol: 'text-red-700',
      badgeBorder: 'border-red-200',
      heading: 'Room Under Maintenance',
      message: 'This room is currently blocked for maintenance repairs and cannot be booked in advance.',
      totalNights: 0,
      conflictingStays: [],
      conflictingReservations: [],
    };
  }

  // 3. Parse and validate dates
  const reqCheckIn = normalizeDate(checkInStr, 12, 0); // standard 12:00 PM check-in
  const reqCheckOut = normalizeDate(checkOutStr, 11, 0); // standard 11:00 AM check-out

  const diffTime = reqCheckOut.getTime() - reqCheckIn.getTime();
  const totalNights = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));

  if (reqCheckOut.getTime() <= reqCheckIn.getTime()) {
    return {
      isAvailable: false,
      status: 'occupied_conflict',
      badgeText: 'Invalid Date Range',
      badgeBg: 'bg-red-50',
      badgeTextCol: 'text-red-700',
      badgeBorder: 'border-red-200',
      heading: 'Invalid Dates',
      message: 'Check-out date and time must be after check-in date.',
      totalNights: 0,
      conflictingStays: [],
      conflictingReservations: [],
    };
  }

  // 4. Capacity check (for regular rooms vs dormitories)
  if (room.room_type !== 'dormitory' && requestedGuests > room.capacity) {
    return {
      isAvailable: false,
      status: 'exceeds_capacity',
      badgeText: 'Exceeds Capacity',
      badgeBg: 'bg-amber-50',
      badgeTextCol: 'text-amber-800',
      badgeBorder: 'border-amber-300',
      heading: `Capacity Limit (${room.capacity} Max)`,
      message: `Requested ${requestedGuests} guests exceeds maximum room capacity of ${room.capacity}.`,
      totalNights,
      conflictingStays: [],
      conflictingReservations: [],
    };
  }

  // 5. Check conflicts with Active Stays
  const conflictingStays: RoomDateAvailability['conflictingStays'] = [];
  const activeStays = room.active_stays || [];

  for (const stay of activeStays) {
    const stayStart = normalizeDate(stay.check_in, 12, 0);
    // If no expected checkout is specified, assume at least through tomorrow 12:00 PM
    const stayEnd = stay.expected_checkout
      ? normalizeDate(stay.expected_checkout, 11, 0)
      : new Date(Math.max(Date.now() + 86400000, reqCheckIn.getTime() + 86400000));

    if (doIntervalsOverlap(reqCheckIn, reqCheckOut, stayStart, stayEnd)) {
      conflictingStays.push({
        guestName: stay.guest?.full_name || 'Current Guest',
        checkInFormatted: stayStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        checkoutFormatted: stayEnd.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      });
    }
  }

  // For dormitories, check if total beds overlap
  if (room.room_type === 'dormitory') {
    const currentOccupants = room.current_occupancy || activeStays.length;
    if (currentOccupants + requestedGuests > room.capacity) {
      // Overlaps now
      if (conflictingStays.length > 0) {
        return {
          isAvailable: false,
          status: 'occupied_conflict',
          badgeText: 'Dorm Fully Booked',
          badgeBg: 'bg-red-50',
          badgeTextCol: 'text-red-700',
          badgeBorder: 'border-red-200',
          heading: `Dormitory Space Full (${currentOccupants}/${room.capacity} beds)`,
          message: `Only ${room.capacity - currentOccupants} bed(s) available. Cannot accommodate ${requestedGuests} guests.`,
          totalNights,
          conflictingStays,
          conflictingReservations: [],
        };
      }
    }
  } else if (conflictingStays.length > 0) {
    const firstConflict = conflictingStays[0];
    return {
      isAvailable: false,
      status: 'occupied_conflict',
      badgeText: 'Occupied on these dates',
      badgeBg: 'bg-red-50',
      badgeTextCol: 'text-red-700',
      badgeBorder: 'border-red-200',
      heading: `Occupied by ${firstConflict.guestName}`,
      message: `Room is currently occupied until ${firstConflict.checkoutFormatted}. Requested check-in conflicts with this stay.`,
      totalNights,
      conflictingStays,
      conflictingReservations: [],
    };
  }

  // 6. Check conflicts with existing advance Reservations
  const conflictingReservations: RoomDateAvailability['conflictingReservations'] = [];
  const roomReservations = reservations.filter(
    (r) =>
      (r.room_id === room.id || (r.room && r.room.room_number === room.room_number)) &&
      r.status !== 'cancelled' &&
      r.status !== 'rejected' &&
      r.status !== 'completed'
  );

  for (const res of roomReservations) {
    const resStart = normalizeDate(res.expected_checkin || res.reservation_start, 12, 0);
    const resEnd = normalizeDate(res.expected_checkout || res.reservation_end || res.reservation_start, 11, 0);

    if (doIntervalsOverlap(reqCheckIn, reqCheckOut, resStart, resEnd)) {
      conflictingReservations.push({
        guestName: res.guest_name,
        checkInFormatted: resStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        checkoutFormatted: resEnd.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        status: res.status,
      });
    }
  }

  if (room.room_type === 'dormitory') {
    const totalReservedGuests = conflictingReservations.reduce((sum, r) => sum + 1, 0);
    if (totalReservedGuests + requestedGuests > room.capacity) {
      return {
        isAvailable: false,
        status: 'reservation_conflict',
        badgeText: 'Reserved on these dates',
        badgeBg: 'bg-amber-50',
        badgeTextCol: 'text-amber-800',
        badgeBorder: 'border-amber-300',
        heading: 'Dormitory Beds Reserved',
        message: `Existing advance bookings occupy ${totalReservedGuests} beds for this date range.`,
        totalNights,
        conflictingStays: [],
        conflictingReservations,
      };
    }
  } else if (conflictingReservations.length > 0) {
    const firstRes = conflictingReservations[0];
    return {
      isAvailable: false,
      status: 'reservation_conflict',
      badgeText: 'Already Reserved',
      badgeBg: 'bg-amber-50',
      badgeTextCol: 'text-amber-800',
      badgeBorder: 'border-amber-300',
      heading: `Reserved for ${firstRes.guestName}`,
      message: `Room has an advance reservation from ${firstRes.checkInFormatted} to ${firstRes.checkoutFormatted}.`,
      totalNights,
      conflictingStays: [],
      conflictingReservations,
    };
  }

  // 7. Success: Room is AVAILABLE for these dates!
  const formattedIn = reqCheckIn.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const formattedOut = reqCheckOut.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return {
    isAvailable: true,
    status: 'available',
    badgeText: 'Available for these dates',
    badgeBg: 'bg-emerald-50',
    badgeTextCol: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
    heading: `Room ${room.room_number} is Free`,
    message: `Available for ${totalNights} night${totalNights > 1 ? 's' : ''} (${formattedIn} – ${formattedOut}). Ready to pre-book!`,
    totalNights,
    conflictingStays: [],
    conflictingReservations: [],
  };
}

/**
 * Filter all rooms by availability for a chosen date window.
 */
export function getAvailableRoomsForDates(
  rooms: RoomWithOccupancy[],
  reservations: Reservation[],
  checkInStr: string,
  checkOutStr: string,
  requestedGuests = 1
) {
  const accommodationRooms = rooms.filter((r) => r.is_accommodation);

  const evaluated = accommodationRooms.map((room) => {
    const availability = checkRoomDateAvailability(room, checkInStr, checkOutStr, reservations, requestedGuests);
    return {
      room,
      availability,
    };
  });

  const available = evaluated.filter((e) => e.availability.isAvailable).map((e) => e.room);
  const unavailable = evaluated.filter((e) => !e.availability.isAvailable);

  return {
    available,
    unavailable,
    totalAvailable: available.length,
    availableAC: available.filter((r) => r.has_ac),
    availableNonAC: available.filter((r) => !r.has_ac && r.room_type !== 'dormitory'),
    availableDorm: available.filter((r) => r.room_type === 'dormitory'),
  };
}
