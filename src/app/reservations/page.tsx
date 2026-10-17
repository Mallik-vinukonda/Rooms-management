'use client';

import { useState, useMemo } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useRooms } from '@/context/RoomContext';
import { formatDateTime } from '@/lib/utils';
import {
  CalendarClock,
  User,
  Phone,
  BedDouble,
  Search,
  Plus,
  CheckCircle,
  Clock,
  X,
  AlertTriangle,
  Calendar,
  Sparkles,
  Users,
  Snowflake,
  Loader2,
  Check,
  Ban,
  ArrowRight,
} from 'lucide-react';
import type { RoomWithOccupancy, Reservation, RoomType } from '@/types';
import { checkRoomDateAvailability, getAvailableRoomsForDates } from '@/lib/reservation-utils';
import RoomDetailsDrawer from '@/components/rooms/RoomDetailsDrawer';

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  new: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  pending_review: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  assigned: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  rejected: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  completed: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
  cancelled: { bg: 'bg-stone-100', text: 'text-stone-500', border: 'border-stone-300' },
};

const formatDateForInput = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTomorrowDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return formatDateForInput(d);
};

const getDayAfterTomorrowDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return formatDateForInput(d);
};

export default function ReservationsPage() {
  const {
    rooms,
    reservations,
    isLoadingReservations,
    addReservation,
    cancelReservation,
    checkInReservation,
    updateRoom,
  } = useRooms();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'today' | 'completed' | 'cancelled'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoomForDrawer, setSelectedRoomForDrawer] = useState<RoomWithOccupancy | null>(null);

  // Modal Form State
  const [checkInDate, setCheckInDate] = useState<string>(getTomorrowDate());
  const [checkOutDate, setCheckOutDate] = useState<string>(getDayAfterTomorrowDate());
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [roomTypeFilter, setRoomTypeFilter] = useState<'all' | 'ac' | 'non_ac' | 'dormitory'>('all');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [numGuests, setNumGuests] = useState(1);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const roomMap = useMemo(() => new Map(rooms.map((r) => [r.id, r])), [rooms]);

  // Selected room object
  const selectedRoom = useMemo(() => {
    return rooms.find((r) => r.id === selectedRoomId) || null;
  }, [rooms, selectedRoomId]);

  // Real-time availability for selected room
  const selectedRoomAvailability = useMemo(() => {
    if (!selectedRoom) return null;
    return checkRoomDateAvailability(selectedRoom, checkInDate, checkOutDate, reservations, numGuests);
  }, [selectedRoom, checkInDate, checkOutDate, reservations, numGuests]);

  // Accommodation rooms filtered by room type
  const accommodationRooms = useMemo(() => {
    return rooms.filter((r) => {
      if (!r.is_accommodation) return false;
      if (roomTypeFilter === 'ac') return r.has_ac;
      if (roomTypeFilter === 'non_ac') return !r.has_ac && r.room_type !== 'dormitory';
      if (roomTypeFilter === 'dormitory') return r.room_type === 'dormitory';
      return true;
    });
  }, [rooms, roomTypeFilter]);

  // Summary of available rooms for selected date window
  const dateSummary = useMemo(() => {
    return getAvailableRoomsForDates(rooms, reservations, checkInDate, checkOutDate, numGuests);
  }, [rooms, reservations, checkInDate, checkOutDate, numGuests]);

  // Reservations stats
  const stats = useMemo(() => {
    const todayStr = new Date().toDateString();
    const upcoming = reservations.filter(
      (r) => r.status !== 'cancelled' && r.status !== 'completed'
    );
    const arrivingToday = upcoming.filter((r) => {
      const d = new Date(r.expected_checkin || r.reservation_start);
      return d.toDateString() === todayStr;
    });
    const completed = reservations.filter((r) => r.status === 'completed');
    const cancelled = reservations.filter((r) => r.status === 'cancelled');

    return {
      total: reservations.length,
      upcoming: upcoming.length,
      arrivingToday: arrivingToday.length,
      completed: completed.length,
      cancelled: cancelled.length,
    };
  }, [reservations]);

  // Filtered reservations list
  const filteredReservations = useMemo(() => {
    const todayStr = new Date().toDateString();

    return reservations.filter((res) => {
      // Status Filter
      if (statusFilter === 'upcoming') {
        if (res.status === 'cancelled' || res.status === 'completed') return false;
      } else if (statusFilter === 'today') {
        const d = new Date(res.expected_checkin || res.reservation_start);
        if (d.toDateString() !== todayStr || res.status === 'cancelled') return false;
      } else if (statusFilter === 'completed') {
        if (res.status !== 'completed') return false;
      } else if (statusFilter === 'cancelled') {
        if (res.status !== 'cancelled') return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const room = res.room_id ? roomMap.get(res.room_id) : null;
        const matchesName = res.guest_name.toLowerCase().includes(q);
        const matchesPhone = res.guest_phone?.toLowerCase().includes(q) || false;
        const matchesRoom = room ? room.room_number.toString().includes(q) : false;
        const matchesNotes = res.notes ? res.notes.toLowerCase().includes(q) : false;
        return matchesName || matchesPhone || matchesRoom || matchesNotes;
      }

      return true;
    });
  }, [reservations, statusFilter, searchQuery, roomMap]);

  // Quick duration selection
  const handleQuickDuration = (nights: number) => {
    const d = new Date(checkInDate);
    d.setDate(d.getDate() + nights);
    setCheckOutDate(formatDateForInput(d));
  };

  // Submit Advance Booking
  const handleCreateReservation = async () => {
    if (!guestName.trim()) {
      setFeedback({ type: 'error', message: 'Guest full name is required' });
      return;
    }
    if (!selectedRoomId) {
      setFeedback({ type: 'error', message: 'Please select a room to allot' });
      return;
    }
    if (selectedRoomAvailability && !selectedRoomAvailability.isAvailable) {
      setFeedback({ type: 'error', message: selectedRoomAvailability.message });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const checkinParts = checkInDate.split('-');
    const checkinObj = new Date(
      parseInt(checkinParts[0]),
      parseInt(checkinParts[1]) - 1,
      parseInt(checkinParts[2]),
      12, 0, 0
    );

    const checkoutParts = checkOutDate.split('-');
    const checkoutObj = new Date(
      parseInt(checkoutParts[0]),
      parseInt(checkoutParts[1]) - 1,
      parseInt(checkoutParts[2]),
      11, 0, 0
    );

    const res = await addReservation({
      roomId: selectedRoom?.id,
      roomNumber: selectedRoom?.room_number,
      guestName: guestName.trim(),
      guestPhone: guestPhone.trim() || undefined,
      numGuests: Number(numGuests),
      expectedCheckin: checkinObj.toISOString(),
      expectedCheckout: checkoutObj.toISOString(),
      notes: notes.trim(),
    });

    setIsSubmitting(false);

    if (!res.success) {
      setFeedback({ type: 'error', message: res.error || 'Failed to create reservation' });
      return;
    }

    setFeedback({
      type: 'success',
      message: `Room ${selectedRoom?.room_number} successfully booked in advance for ${guestName.trim()}!`,
    });

    // Reset Form
    setGuestName('');
    setGuestPhone('');
    setNotes('');
    setIsModalOpen(false);
  };

  // 1-Click Check In Guest from Reservation
  const handleCheckInGuest = async (resId: string) => {
    const res = await checkInReservation(resId);
    if (!res.success) {
      alert(`Could not check in guest: ${res.error}`);
    }
  };

  // Cancel Reservation
  const handleCancel = async (resId: string) => {
    if (!confirm('Are you sure you want to cancel this advance reservation?')) return;
    await cancelReservation(resId);
  };

  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header rooms={rooms} onRoomSelect={(room) => setSelectedRoomForDrawer(room)} />

        <main className="flex-1 p-4 md:p-6 space-y-5 overflow-auto">
          {/* Header Title & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">Advance Room Allotments</h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Pre-Bookings
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                Reserve rooms in advance, verify real-time date availability, and check in arriving guests.
              </p>
            </div>

            <button
              onClick={() => {
                setIsModalOpen(true);
                setFeedback(null);
                if (!selectedRoomId && dateSummary.available[0]) {
                  setSelectedRoomId(dateSummary.available[0].id);
                }
              }}
              className="action-btn primary text-sm font-semibold flex items-center gap-2 shadow-sm"
            >
              <Plus size={16} />
              + New Advance Booking
            </button>
          </div>

          {/* Feedback banner */}
          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center justify-between border ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {feedback.type === 'success' ? (
                  <CheckCircle size={16} className="text-emerald-600" />
                ) : (
                  <AlertTriangle size={16} className="text-red-600" />
                )}
                <span className="font-medium">{feedback.message}</span>
              </div>
              <button onClick={() => setFeedback(null)} className="text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            </div>
          )}

          {/* KPI Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Upcoming Bookings</span>
                <CalendarClock size={18} className="text-emerald-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900 mt-1">{stats.upcoming}</span>
              <span className="text-[11px] text-emerald-700 font-medium">Active reservations</span>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Arriving Today</span>
                <Clock size={18} className="text-amber-600" />
              </div>
              <span className="text-2xl font-bold text-amber-700 mt-1">{stats.arrivingToday}</span>
              <span className="text-[11px] text-amber-800 font-medium">Due for check-in</span>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Completed Stays</span>
                <CheckCircle size={18} className="text-blue-600" />
              </div>
              <span className="text-2xl font-bold text-blue-700 mt-1">{stats.completed}</span>
              <span className="text-[11px] text-blue-700 font-medium">Checked-in & vacated</span>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500">Available to Pre-Book</span>
                <BedDouble size={18} className="text-stone-600" />
              </div>
              <span className="text-2xl font-bold text-stone-800 mt-1">{dateSummary.totalAvailable}</span>
              <span className="text-[11px] text-stone-500 font-medium">Rooms free for tomorrow</span>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-200">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search guest, room number, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input text-xs pl-8 w-full"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              {[
                { id: 'all', label: `All (${reservations.length})` },
                { id: 'upcoming', label: `Upcoming (${stats.upcoming})` },
                { id: 'today', label: `Arriving Today (${stats.arrivingToday})` },
                { id: 'completed', label: `Completed (${stats.completed})` },
                { id: 'cancelled', label: `Cancelled (${stats.cancelled})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    statusFilter === tab.id
                      ? 'bg-stone-900 text-white'
                      : 'bg-stone-50 text-gray-600 hover:bg-stone-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reservations Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Guest Details</th>
                    <th className="px-4 py-3">Allotted Room</th>
                    <th className="px-4 py-3">Check-in Date</th>
                    <th className="px-4 py-3">Check-out Date</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {filteredReservations.map((res) => {
                    const sc = statusColors[res.status] || statusColors.new;
                    const room = res.room_id ? roomMap.get(res.room_id) : res.room;
                    const inDate = new Date(res.expected_checkin || res.reservation_start);
                    const outDate = new Date(res.expected_checkout || res.reservation_end || res.reservation_start);
                    const isToday = inDate.toDateString() === new Date().toDateString();

                    const diffTime = outDate.getTime() - inDate.getTime();
                    const nights = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));

                    return (
                      <tr key={res.id} className="hover:bg-stone-50/70 transition-colors">
                        {/* Guest */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                              {res.guest_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                                <span>{res.guest_name}</span>
                                {isToday && res.status !== 'completed' && res.status !== 'cancelled' && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                                    Today
                                  </span>
                                )}
                              </div>
                              {res.guest_phone && (
                                <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                                  <Phone size={10} className="text-gray-400" />
                                  {res.guest_phone}
                                </p>
                              )}
                              <span className="text-[10px] text-gray-400">
                                {res.num_guests} Guest{res.num_guests > 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Room */}
                        <td className="px-4 py-3.5">
                          {room ? (
                            <button
                              onClick={() => {
                                const found = rooms.find((r) => r.id === room.id);
                                if (found) setSelectedRoomForDrawer(found);
                              }}
                              className="text-left group"
                            >
                              <span className="font-bold text-gray-900 group-hover:text-emerald-700 flex items-center gap-1">
                                <BedDouble size={13} className="text-emerald-600" />
                                Room {room.room_number}
                              </span>
                              <span className="text-[10px] text-gray-500 block uppercase font-medium">
                                {room.room_type === 'ac' ? 'AC Room' : room.room_type === 'dormitory' ? 'Dormitory' : 'Non-AC'} · {room.floor} fl
                              </span>
                            </button>
                          ) : (
                            <span className="text-stone-400 italic">Unassigned</span>
                          )}
                        </td>

                        {/* Check-in */}
                        <td className="px-4 py-3.5">
                          <span className="font-semibold text-gray-800 block">
                            {inDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="text-[10px] text-gray-400">~12:00 PM</span>
                        </td>

                        {/* Check-out */}
                        <td className="px-4 py-3.5">
                          <span className="font-semibold text-gray-800 block">
                            {outDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="text-[10px] text-gray-400">~11:00 AM</span>
                        </td>

                        {/* Duration */}
                        <td className="px-4 py-3.5">
                          <span className="text-xs font-medium text-gray-700 bg-stone-100 px-2 py-0.5 rounded">
                            {nights} Night{nights > 1 ? 's' : ''}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${sc.bg} ${sc.text} ${sc.border}`}>
                            {res.status === 'completed' && <Check size={10} />}
                            {res.status === 'cancelled' && <X size={10} />}
                            {res.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {res.status !== 'completed' && res.status !== 'cancelled' && (
                              <button
                                onClick={() => handleCheckInGuest(res.id)}
                                className="action-btn primary text-[11px] py-1 px-2.5 font-semibold flex items-center gap-1 shadow-xs"
                                title="Allot room and check in guest now"
                              >
                                <Check size={12} />
                                Check In
                              </button>
                            )}

                            {res.status !== 'cancelled' && res.status !== 'completed' && (
                              <button
                                onClick={() => handleCancel(res.id)}
                                className="action-btn text-[11px] py-1 px-2 text-red-600 hover:text-red-800 hover:bg-red-50"
                                title="Cancel this reservation"
                              >
                                Cancel
                              </button>
                            )}

                            {room && (
                              <button
                                onClick={() => {
                                  const found = rooms.find((r) => r.id === room.id);
                                  if (found) setSelectedRoomForDrawer(found);
                                }}
                                className="action-btn text-[11px] py-1 px-2 text-stone-600 hover:bg-stone-100"
                              >
                                View Room
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredReservations.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                        <CalendarClock size={28} className="mx-auto text-gray-300 mb-2" />
                        <p className="font-semibold text-gray-600 text-sm">No advance bookings found</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Click &quot;+ New Advance Booking&quot; above to allot a room in advance.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* ======================================================== */}
      {/* ADVANCE BOOKING MODAL (Selectable dates & room availability check) */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-400/30">
                  <CalendarClock size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-wide text-white">Pre-Book Room in Advance</h3>
                  <p className="text-[11px] text-emerald-200/80">Select dates, check real-time availability, and reserve room</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Step 1: Check-in and Check-out Date Selection */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
                <span className="font-bold text-gray-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <Calendar size={13} className="text-emerald-700" />
                  Step 1: Select Stay Dates
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-700 mb-1 block">Check-in Date *</label>
                    <input
                      type="date"
                      min={formatDateForInput(new Date())}
                      value={checkInDate}
                      onChange={(e) => {
                        setCheckInDate(e.target.value);
                        if (e.target.value >= checkOutDate) {
                          const nextDay = new Date(e.target.value);
                          nextDay.setDate(nextDay.getDate() + 1);
                          setCheckOutDate(formatDateForInput(nextDay));
                        }
                      }}
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                    <span className="text-[10px] text-gray-400 mt-1 block">Standard Check-in: 12:00 PM</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-700 mb-1 block">Check-out Date *</label>
                    <input
                      type="date"
                      min={checkInDate}
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                    <span className="text-[10px] text-gray-400 mt-1 block">Standard Check-out: 11:00 AM</span>
                  </div>
                </div>

                {/* Quick Stay Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-gray-500 font-medium mr-1">Quick Nights:</span>
                  {[
                    { label: '1 Night', nights: 1 },
                    { label: '2 Nights', nights: 2 },
                    { label: '3 Nights', nights: 3 },
                    { label: '5 Nights', nights: 5 },
                    { label: '1 Week', nights: 7 },
                  ].map((chip) => (
                    <button
                      key={chip.nights}
                      type="button"
                      onClick={() => handleQuickDuration(chip.nights)}
                      className="text-[11px] font-semibold px-2 py-0.5 rounded bg-white text-gray-700 border border-gray-200 hover:bg-emerald-50 hover:border-emerald-300 transition-colors"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Room Selection & Date Availability Indicator */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
                    <BedDouble size={13} className="text-emerald-700" />
                    Step 2: Choose Room (Live Availability for Selected Dates)
                  </span>

                  {/* Room Type Filter Pills */}
                  <div className="flex items-center gap-1 text-[11px]">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'ac', label: 'AC' },
                      { id: 'non_ac', label: 'Non-AC' },
                      { id: 'dormitory', label: 'Dorm' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setRoomTypeFilter(tab.id as any)}
                        className={`px-2 py-0.5 rounded font-medium ${
                          roomTypeFilter === tab.id
                            ? 'bg-emerald-700 text-white'
                            : 'bg-stone-100 text-gray-600 hover:bg-stone-200'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rooms Grid with live availability badges */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1 bg-stone-50 rounded-xl border border-stone-200">
                  {accommodationRooms.map((room) => {
                    const avail = checkRoomDateAvailability(
                      room,
                      checkInDate,
                      checkOutDate,
                      reservations,
                      numGuests
                    );
                    const isSelected = selectedRoomId === room.id;

                    return (
                      <button
                        key={room.id}
                        type="button"
                        onClick={() => setSelectedRoomId(room.id)}
                        className={`p-2 rounded-lg border text-left flex flex-col justify-between transition-all relative ${
                          isSelected
                            ? 'ring-2 ring-emerald-600 border-emerald-600 bg-emerald-50 shadow-xs'
                            : avail.isAvailable
                            ? 'bg-white border-gray-200 hover:border-emerald-300 hover:shadow-xs'
                            : 'bg-stone-100/80 border-gray-200 text-stone-500 opacity-80'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-gray-900">R{room.room_number}</span>
                          {room.has_ac ? (
                            <Snowflake size={11} className="text-sky-500" />
                          ) : room.room_type === 'dormitory' ? (
                            <Users size={11} className="text-indigo-500" />
                          ) : null}
                        </div>

                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-[10px] text-gray-400 capitalize">
                            {room.room_type === 'dormitory' ? 'Dorm' : room.room_type === 'ac' ? 'AC' : 'Non-AC'}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1 rounded ${
                              avail.isAvailable
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {avail.isAvailable ? 'Free' : 'Busy'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Room Status Banner */}
                {selectedRoom && selectedRoomAvailability && (
                  <div
                    className={`p-3 rounded-xl border text-xs transition-all ${selectedRoomAvailability.badgeBg} ${selectedRoomAvailability.badgeBorder}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {selectedRoomAvailability.isAvailable ? (
                          <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
                        ) : (
                          <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
                        )}
                        <div>
                          <span className={`font-bold block ${selectedRoomAvailability.badgeTextCol}`}>
                            Room {selectedRoom.room_number}: {selectedRoomAvailability.heading}
                          </span>
                          <span className="text-[11px] text-stone-600">{selectedRoomAvailability.message}</span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${selectedRoomAvailability.badgeBg} ${selectedRoomAvailability.badgeTextCol} border-current/20 uppercase`}
                      >
                        {selectedRoomAvailability.isAvailable ? 'Available to Allot' : 'Conflict'}
                      </span>
                    </div>

                    {/* Conflict details if occupied/reserved */}
                    {selectedRoomAvailability.conflictingStays.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-red-200/60 text-[11px] text-red-700 space-y-0.5">
                        {selectedRoomAvailability.conflictingStays.map((s, i) => (
                          <p key={i}>• Occupied by <strong>{s.guestName}</strong> (departing {s.checkoutFormatted})</p>
                        ))}
                      </div>
                    )}
                    {selectedRoomAvailability.conflictingReservations.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-amber-200/60 text-[11px] text-amber-800 space-y-0.5">
                        {selectedRoomAvailability.conflictingReservations.map((r, i) => (
                          <p key={i}>• Reserved by <strong>{r.guestName}</strong> ({r.checkInFormatted} to {r.checkoutFormatted})</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Step 3: Guest Information */}
              <div className="space-y-2.5 pt-2 border-t border-gray-200">
                <span className="font-bold text-gray-900 text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <User size={13} className="text-emerald-700" />
                  Step 3: Guest & Stay Details
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-700 mb-1 block">Guest Full Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Anand Varma"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-700 mb-1 block">Phone Number (Optional)</label>
                    <input
                      type="text"
                      placeholder="+91 98765 43210"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-gray-700 mb-1 block">
                      Number of Occupants (Max {selectedRoom?.capacity || 2})
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={selectedRoom?.capacity || 10}
                      value={numGuests}
                      onChange={(e) => setNumGuests(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-gray-700 mb-1 block">Purpose / Notes</label>
                    <input
                      type="text"
                      placeholder="e.g. Devotee pilgrimage, VIP visit..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="text-xs text-gray-500">
                {selectedRoom ? (
                  <span>
                    Allotting <strong>Room {selectedRoom.room_number}</strong> for {checkInDate} → {checkOutDate}
                  </span>
                ) : (
                  <span>Select an available room to continue</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="action-btn text-xs px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateReservation}
                  disabled={
                    Boolean(
                      isSubmitting ||
                      !guestName.trim() ||
                      !selectedRoomId ||
                      (selectedRoomAvailability && !selectedRoomAvailability.isAvailable)
                    )
                  }
                  className={`action-btn text-xs px-5 py-2 font-semibold flex items-center gap-1.5 ${
                    guestName.trim() && selectedRoomId && selectedRoomAvailability?.isAvailable
                      ? 'primary'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-200'
                  }`}
                >
                  {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <CalendarClock size={13} />}
                  Confirm Pre-Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Room Details Drawer when opened from table */}
      {selectedRoomForDrawer && (
        <RoomDetailsDrawer
          room={selectedRoomForDrawer}
          onClose={() => setSelectedRoomForDrawer(null)}
          onUpdateRoom={updateRoom}
        />
      )}
    </div>
  );
}
