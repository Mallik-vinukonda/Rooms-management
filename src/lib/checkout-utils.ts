import type { RoomWithOccupancy, StayWithGuest } from '@/types';

export interface CheckoutDetails {
  expectedCheckoutDate: Date | null;
  formattedDate: string;
  isToday: boolean;
  isTomorrow: boolean;
  isOverdue: boolean;
  daysRemaining: number;
  badgeLabel: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

export interface RoomAvailabilityInfo {
  isReadyNow: boolean;
  readyCategory: 'ready_now' | 'vacating_today' | 'vacating_tomorrow' | 'occupied' | 'cleaning' | 'maintenance' | 'unavailable' | 'non_accommodation';
  statusHeading: string;
  statusBadgeText: string;
  statusBadgeColor: string;
  statusBadgeBg: string;
  nextAvailableText: string;
  guestSummary?: {
    name: string;
    phone?: string;
    checkInFormatted: string;
    checkoutFormatted: string;
    isToday: boolean;
    isOverdue: boolean;
    daysRemaining: number;
  };
  compactBadge?: {
    label: string;
    bg: string;
    text: string;
    border: string;
  };
}

/**
 * Parses a date or returns null if invalid
 */
function parseSafeDate(d?: string | Date | null): Date | null {
  if (!d) return null;
  const date = new Date(d);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Returns formatted checkout timing details for a given stay
 */
export function getStayCheckoutDetails(stay: { expected_checkout?: string | null; check_in?: string }): CheckoutDetails | null {
  const checkoutDate = parseSafeDate(stay.expected_checkout);
  if (!checkoutDate) return null;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const checkoutStart = new Date(checkoutDate.getFullYear(), checkoutDate.getMonth(), checkoutDate.getDate()).getTime();
  const diffDays = Math.round((checkoutStart - todayStart) / (1000 * 60 * 60 * 24));

  const isToday = diffDays === 0;
  const isTomorrow = diffDays === 1;
  const isOverdue = diffDays < 0;

  const formattedDate = checkoutDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: checkoutDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });

  let badgeLabel = `Out: ${formattedDate}`;
  let badgeBg = 'bg-stone-100';
  let badgeText = 'text-stone-700';
  let badgeBorder = 'border-stone-200';

  if (isOverdue) {
    badgeLabel = 'Due Checkout';
    badgeBg = 'bg-red-50';
    badgeText = 'text-red-700';
    badgeBorder = 'border-red-200';
  } else if (isToday) {
    badgeLabel = 'Out Today';
    badgeBg = 'bg-amber-50';
    badgeText = 'text-amber-800';
    badgeBorder = 'border-amber-300';
  } else if (isTomorrow) {
    badgeLabel = 'Out Tomorrow';
    badgeBg = 'bg-blue-50';
    badgeText = 'text-blue-700';
    badgeBorder = 'border-blue-200';
  }

  return {
    expectedCheckoutDate: checkoutDate,
    formattedDate,
    isToday,
    isTomorrow,
    isOverdue,
    daysRemaining: diffDays,
    badgeLabel,
    badgeBg,
    badgeText,
    badgeBorder,
  };
}

/**
 * Comprehensive availability and checkout calculation for a room
 */
export function getRoomAvailability(room: RoomWithOccupancy): RoomAvailabilityInfo {
  if (!room.is_accommodation) {
    return {
      isReadyNow: false,
      readyCategory: 'non_accommodation',
      statusHeading: `Non-Accommodation Space (${room.purpose})`,
      statusBadgeText: 'Facility Space',
      statusBadgeColor: 'text-stone-700',
      statusBadgeBg: 'bg-stone-100',
      nextAvailableText: 'Not for guest stay',
    };
  }

  // 1. Ready right now: vacant and clean
  if (room.status === 'vacant' && room.cleaning_status === 'clean') {
    return {
      isReadyNow: true,
      readyCategory: 'ready_now',
      statusHeading: 'Available Immediately',
      statusBadgeText: 'Ready to Allot',
      statusBadgeColor: 'text-emerald-700',
      statusBadgeBg: 'bg-emerald-50',
      nextAvailableText: 'Ready Now ✨',
      compactBadge: {
        label: 'Ready',
        bg: 'bg-emerald-100/90',
        text: 'text-emerald-800',
        border: 'border-emerald-300',
      },
    };
  }

  // 2. Needs cleaning
  if (room.cleaning_status === 'cleaning_required' || room.status === 'cleaning') {
    return {
      isReadyNow: false,
      readyCategory: 'cleaning',
      statusHeading: 'Cleaning Required',
      statusBadgeText: 'Housekeeping Needed',
      statusBadgeColor: 'text-purple-700',
      statusBadgeBg: 'bg-purple-50',
      nextAvailableText: 'Est. 30–45 mins after cleaning',
      compactBadge: {
        label: 'Clean Req.',
        bg: 'bg-purple-100/90',
        text: 'text-purple-800',
        border: 'border-purple-300',
      },
    };
  }

  // 3. Maintenance
  if (room.status === 'under_maintenance') {
    return {
      isReadyNow: false,
      readyCategory: 'maintenance',
      statusHeading: 'Under Maintenance',
      statusBadgeText: 'Maintenance Required',
      statusBadgeColor: 'text-red-700',
      statusBadgeBg: 'bg-red-50',
      nextAvailableText: 'Blocked for repairs',
      compactBadge: {
        label: 'Repair',
        bg: 'bg-red-100/90',
        text: 'text-red-800',
        border: 'border-red-300',
      },
    };
  }

  // 4. Occupied / Partially occupied
  if (room.status === 'occupied' || room.status === 'partially_occupied' || room.current_occupancy > 0) {
    const stays = room.active_stays || [];
    let primaryStay: StayWithGuest | undefined = stays[0];
    
    // Find the earliest checkout stay
    let earliestCheckout: CheckoutDetails | null = null;
    for (const s of stays) {
      const details = getStayCheckoutDetails(s);
      if (details) {
        if (!earliestCheckout || details.expectedCheckoutDate!.getTime() < earliestCheckout.expectedCheckoutDate!.getTime()) {
          earliestCheckout = details;
          primaryStay = s;
        }
      }
    }

    const guestName = primaryStay?.guest?.full_name || room.current_guest_names?.[0] || 'Registered Guest';
    const guestPhone = primaryStay?.guest?.phone || undefined;
    const checkInDate = parseSafeDate(primaryStay?.check_in || room.created_at);
    const checkInFormatted = checkInDate
      ? checkInDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
      : 'Active';

    if (earliestCheckout) {
      let readyCategory: RoomAvailabilityInfo['readyCategory'] = 'occupied';
      let nextAvailableText = `Available ${earliestCheckout.formattedDate} (~12 PM)`;

      if (earliestCheckout.isOverdue) {
        readyCategory = 'occupied';
        nextAvailableText = 'Overdue for checkout';
      } else if (earliestCheckout.isToday) {
        readyCategory = 'vacating_today';
        nextAvailableText = 'Opens Today (~12:00 PM)';
      } else if (earliestCheckout.isTomorrow) {
        readyCategory = 'vacating_tomorrow';
        nextAvailableText = 'Opens Tomorrow (~12:00 PM)';
      } else {
        nextAvailableText = `Opens in ${earliestCheckout.daysRemaining} days (${earliestCheckout.formattedDate})`;
      }

      return {
        isReadyNow: false,
        readyCategory,
        statusHeading: `Occupied by ${guestName}`,
        statusBadgeText: earliestCheckout.badgeLabel,
        statusBadgeColor: earliestCheckout.badgeText,
        statusBadgeBg: earliestCheckout.badgeBg,
        nextAvailableText,
        guestSummary: {
          name: guestName,
          phone: guestPhone,
          checkInFormatted,
          checkoutFormatted: earliestCheckout.formattedDate,
          isToday: earliestCheckout.isToday,
          isOverdue: earliestCheckout.isOverdue,
          daysRemaining: earliestCheckout.daysRemaining,
        },
        compactBadge: {
          label: earliestCheckout.badgeLabel,
          bg: earliestCheckout.badgeBg,
          text: earliestCheckout.badgeText,
          border: earliestCheckout.badgeBorder,
        },
      };
    }

    // Occupied but no expected_checkout recorded yet
    return {
      isReadyNow: false,
      readyCategory: 'occupied',
      statusHeading: `Occupied by ${guestName}`,
      statusBadgeText: 'Occupied',
      statusBadgeColor: 'text-blue-700',
      statusBadgeBg: 'bg-blue-50',
      nextAvailableText: 'Check-out date not set',
      guestSummary: {
        name: guestName,
        phone: guestPhone,
        checkInFormatted,
        checkoutFormatted: 'Unscheduled',
        isToday: false,
        isOverdue: false,
        daysRemaining: 0,
      },
    };
  }

  // Fallback (reserved, unavailable, etc.)
  return {
    isReadyNow: false,
    readyCategory: 'unavailable',
    statusHeading: room.status.replace('_', ' ').toUpperCase(),
    statusBadgeText: room.status.replace('_', ' '),
    statusBadgeColor: 'text-stone-700',
    statusBadgeBg: 'bg-stone-100',
    nextAvailableText: 'Check reservation schedule',
  };
}

/**
 * Summarizes the property for the "Quick Allot / Next Available" bar
 */
export function getNextAvailableSummary(rooms: RoomWithOccupancy[]) {
  const accommodations = rooms.filter((r) => r.is_accommodation);

  // 1. Ready right now
  const readyAC = accommodations.filter(
    (r) => r.has_ac && r.status === 'vacant' && r.cleaning_status === 'clean'
  );
  const readyNonAC = accommodations.filter(
    (r) => !r.has_ac && r.room_type !== 'dormitory' && r.status === 'vacant' && r.cleaning_status === 'clean'
  );
  const readyDorm = accommodations.filter(
    (r) => r.room_type === 'dormitory' && r.current_occupancy < r.capacity
  );

  // 2. Opening today (occupied rooms with expected checkout today)
  const openingToday = accommodations
    .map((r) => ({ room: r, availability: getRoomAvailability(r) }))
    .filter((item) => item.availability.readyCategory === 'vacating_today')
    .map((item) => item.room);

  // 3. Opening tomorrow
  const openingTomorrow = accommodations
    .map((r) => ({ room: r, availability: getRoomAvailability(r) }))
    .filter((item) => item.availability.readyCategory === 'vacating_tomorrow')
    .map((item) => item.room);

  // 4. Overdue checkouts
  const overdueCheckouts = accommodations
    .map((r) => ({ room: r, availability: getRoomAvailability(r) }))
    .filter((item) => item.availability.guestSummary?.isOverdue)
    .map((item) => item.room);

  return {
    readyAC,
    readyNonAC,
    readyDorm,
    openingToday,
    openingTomorrow,
    overdueCheckouts,
  };
}
