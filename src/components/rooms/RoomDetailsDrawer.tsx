'use client';

import { useState, useEffect } from 'react';
import {
  X,
  User as UserIcon,
  Snowflake,
  Wrench,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  CalendarClock,
  Ban,
  CircleX,
  Phone,
  Edit,
  UserPlus,
  UserMinus,
  ArrowRightLeft,
  LogOut,
  Clipboard,
  History,
  ChevronDown,
  ChevronUp,
  Settings2,
  Package,
  Briefcase,
  Utensils,
  Landmark,
  GraduationCap,
  UserCheck,
  BedDouble,
  Users,
  Check,
  Calendar,
  Clock,
  Loader2,
} from 'lucide-react';
import type { RoomWithOccupancy, RoomStatus, ACStatus, CleaningStatus, RoomType, StayWithGuest } from '@/types';
import { useRooms } from '@/context/RoomContext';
import {
  roomStatusConfig,
  roomTypeLabels,
  acStatusConfig,
  cleaningStatusConfig,
  formatDateTime,
  getBuildingLabel,
} from '@/lib/utils';
import { getStayCheckoutDetails } from '@/lib/checkout-utils';

interface RoomDetailsDrawerProps {
  room: RoomWithOccupancy | null;
  onClose: () => void;
  onUpdateRoom?: (roomId: string, updates: Partial<RoomWithOccupancy>) => void;
}

const formatDateForInput = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTodayInputDate = () => formatDateForInput(new Date());

const getTomorrowInputDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return formatDateForInput(d);
};

export default function RoomDetailsDrawer({ room, onClose, onUpdateRoom }: RoomDetailsDrawerProps) {
  const { addGuestToRoom, updateGuestStay, removeGuestFromRoom, vacateRoom } = useRooms();
  const [isSubmittingGuest, setIsSubmittingGuest] = useState(false);
  const [guestFeedback, setGuestFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Edit Guest State
  const [editingStay, setEditingStay] = useState<StayWithGuest | null>(null);
  const [editGuestName, setEditGuestName] = useState('');
  const [editGuestPhone, setEditGuestPhone] = useState('');
  const [editCheckInDate, setEditCheckInDate] = useState('');
  const [editCheckoutDate, setEditCheckoutDate] = useState('');

  const [showActions, setShowActions] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);
  const [editingAC, setEditingAC] = useState(false);
  const [editingCleaning, setEditingCleaning] = useState(false);
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestPhone, setNewGuestPhone] = useState('');
  const [expectedCheckoutDate, setExpectedCheckoutDate] = useState<string>(getTomorrowInputDate());
  const [stayNights, setStayNights] = useState<number>(1);

  // Space Classification & Purpose Editing
  const [editingClassification, setEditingClassification] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'accommodation' | 'non_accommodation'>(
    room?.is_accommodation ? 'accommodation' : 'non_accommodation'
  );
  const [purposeInput, setPurposeInput] = useState(room?.purpose || 'Guest Room');
  const [roomTypeInput, setRoomTypeInput] = useState<RoomType>(room?.room_type || 'non_ac');
  const [capacityInput, setCapacityInput] = useState<number>(room?.capacity ?? 2);
  const [hasACInput, setHasACInput] = useState<boolean>(room?.has_ac ?? false);

  // Sync state whenever room changes
  useEffect(() => {
    if (room) {
      setSelectedCategory(room.is_accommodation ? 'accommodation' : 'non_accommodation');
      setPurposeInput(room.purpose || (room.is_accommodation ? 'Guest Room' : 'Storage'));
      setRoomTypeInput(room.room_type);
      setCapacityInput(room.capacity);
      setHasACInput(room.has_ac);
      setEditingClassification(false);
      setEditingStatus(false);
      setEditingAC(false);
      setEditingCleaning(false);
      setShowAddGuest(false);
    }
  }, [room?.id, room?.updated_at]);

  if (!room) return null;

  const statusConf = roomStatusConfig[room.status];
  const typeLabel = roomTypeLabels[room.room_type] || room.room_type;
  const acConf = room.has_ac ? acStatusConfig[room.ac_status] : null;
  const cleanConf = cleaningStatusConfig[room.cleaning_status];

  const CLASSIFICATION_PRESETS = [
    {
      id: 'ac_room',
      title: 'AC Room',
      icon: <Snowflake size={14} className="text-sky-600" />,
      category: 'accommodation' as const,
      purpose: 'Guest Room',
      room_type: 'ac' as RoomType,
      capacity: 2,
      has_ac: true,
      color: 'bg-sky-50 border-sky-200 text-sky-800',
    },
    {
      id: 'non_ac_room',
      title: 'Non-AC Room',
      icon: <BedDouble size={14} className="text-emerald-600" />,
      category: 'accommodation' as const,
      purpose: 'Guest Room',
      room_type: 'non_ac' as RoomType,
      capacity: 2,
      has_ac: false,
      color: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    },
    {
      id: 'dormitory',
      title: 'Dormitory',
      icon: <Users size={14} className="text-indigo-600" />,
      category: 'accommodation' as const,
      purpose: 'Dormitory',
      room_type: 'dormitory' as RoomType,
      capacity: 8,
      has_ac: true,
      color: 'bg-indigo-50 border-indigo-200 text-indigo-800',
    },
    {
      id: 'store',
      title: 'Store / Storage',
      icon: <Package size={14} className="text-amber-600" />,
      category: 'non_accommodation' as const,
      purpose: 'Storage',
      room_type: 'non_ac' as RoomType,
      capacity: 0,
      has_ac: false,
      color: 'bg-amber-50 border-amber-200 text-amber-800',
    },
    {
      id: 'office',
      title: 'Office',
      icon: <Briefcase size={14} className="text-slate-600" />,
      category: 'non_accommodation' as const,
      purpose: 'Office',
      room_type: 'non_ac' as RoomType,
      capacity: 0,
      has_ac: false,
      color: 'bg-slate-50 border-slate-200 text-slate-800',
    },
    {
      id: 'kitchen',
      title: 'Mega Kitchen',
      icon: <Utensils size={14} className="text-orange-600" />,
      category: 'non_accommodation' as const,
      purpose: 'Mega Kitchen',
      room_type: 'non_ac' as RoomType,
      capacity: 0,
      has_ac: false,
      color: 'bg-orange-50 border-orange-200 text-orange-800',
    },
    {
      id: 'hall',
      title: 'Meeting Hall',
      icon: <Landmark size={14} className="text-purple-600" />,
      category: 'non_accommodation' as const,
      purpose: 'Meeting Hall',
      room_type: 'non_ac' as RoomType,
      capacity: 0,
      has_ac: false,
      color: 'bg-purple-50 border-purple-200 text-purple-800',
    },
    {
      id: 'classroom',
      title: 'Classroom',
      icon: <GraduationCap size={14} className="text-blue-600" />,
      category: 'non_accommodation' as const,
      purpose: 'Classroom',
      room_type: 'non_ac' as RoomType,
      capacity: 0,
      has_ac: false,
      color: 'bg-blue-50 border-blue-200 text-blue-800',
    },
    {
      id: 'staff_room',
      title: 'Staff Room',
      icon: <UserCheck size={14} className="text-teal-600" />,
      category: 'non_accommodation' as const,
      purpose: 'Staff Room',
      room_type: 'non_ac' as RoomType,
      capacity: 0,
      has_ac: false,
      color: 'bg-teal-50 border-teal-200 text-teal-800',
    },
  ];

  const applyPreset = (preset: typeof CLASSIFICATION_PRESETS[0]) => {
    setSelectedCategory(preset.category);
    setPurposeInput(preset.purpose);
    setRoomTypeInput(preset.room_type);
    setCapacityInput(preset.capacity);
    setHasACInput(preset.has_ac);
  };

  const handleSaveClassification = () => {
    const isAccom = selectedCategory === 'accommodation';
    if (!isAccom && room.current_occupancy > 0) {
      if (
        !confirm(
          `Room ${room.room_number} currently has ${room.current_occupancy} guest(s) checked in. Converting this room to a non-accommodation space (${purposeInput}) will vacate the guests. Do you want to continue?`
        )
      ) {
        return;
      }
    }

    const updates: Partial<RoomWithOccupancy> = {
      is_accommodation: isAccom,
      purpose: purposeInput.trim() || (isAccom ? 'Guest Room' : 'Storage'),
      room_type: roomTypeInput,
      capacity: isAccom ? Math.max(1, capacityInput) : Math.max(0, capacityInput),
      has_ac: hasACInput,
      ac_status: hasACInput
        ? room.ac_status === 'not_applicable'
          ? 'working'
          : room.ac_status
        : 'not_applicable',
    };

    if (!isAccom && room.current_occupancy > 0) {
      updates.current_occupancy = 0;
      updates.current_guest_names = [];
      updates.status = 'vacant';
    }

    onUpdateRoom?.(room.id, updates);
    setEditingClassification(false);
  };

  const handleStatusChange = (newStatus: RoomStatus) => {
    onUpdateRoom?.(room.id, { status: newStatus });
    setEditingStatus(false);
  };

  const handleACChange = (newAC: ACStatus) => {
    onUpdateRoom?.(room.id, { ac_status: newAC });
    setEditingAC(false);
  };

  const handleCleaningChange = (newCleaning: CleaningStatus) => {
    onUpdateRoom?.(room.id, { cleaning_status: newCleaning });
    setEditingCleaning(false);
  };

  const handleQuickDuration = (nights: number) => {
    setStayNights(nights);
    const d = new Date();
    d.setDate(d.getDate() + nights);
    setExpectedCheckoutDate(formatDateForInput(d));
  };

  const handleAddGuest = async () => {
    if (!room || !newGuestName.trim()) return;

    setIsSubmittingGuest(true);
    setGuestFeedback(null);

    // Build the expected checkout ISO string (12:00 PM standard checkout)
    const checkoutParts = expectedCheckoutDate.split('-');
    const checkoutObj = new Date(
      parseInt(checkoutParts[0]),
      parseInt(checkoutParts[1]) - 1,
      parseInt(checkoutParts[2]),
      12, 0, 0
    );

    const res = await addGuestToRoom(room.id, {
      fullName: newGuestName.trim(),
      phone: newGuestPhone.trim() || undefined,
      expectedCheckout: checkoutObj.toISOString(),
    });

    setIsSubmittingGuest(false);

    if (!res.success) {
      setGuestFeedback({ type: 'error', message: res.error || 'Failed to add guest to Supabase' });
      return;
    }

    setGuestFeedback({
      type: 'success',
      message: `Guest "${newGuestName.trim()}" checked in and saved to Supabase!`,
    });
    setNewGuestName('');
    setNewGuestPhone('');
    setExpectedCheckoutDate(getTomorrowInputDate());
    setStayNights(1);
    setShowAddGuest(false);
  };

  const handleRemoveGuest = async (stay: StayWithGuest) => {
    if (!room) return;
    setIsSubmittingGuest(true);
    setGuestFeedback(null);

    const res = await removeGuestFromRoom(stay.id, room.id);
    setIsSubmittingGuest(false);

    if (!res.success) {
      setGuestFeedback({ type: 'error', message: res.error || 'Failed to check out guest in Supabase' });
      return;
    }

    setGuestFeedback({
      type: 'success',
      message: `${stay.guest?.full_name || 'Guest'} checked out and updated in Supabase`,
    });
  };

  const handleVacateRoom = async () => {
    if (!room) return;
    if (!confirm(`Vacate all guests from Room ${room.room_number}?`)) return;

    setIsSubmittingGuest(true);
    setGuestFeedback(null);

    const res = await vacateRoom(room.id);
    setIsSubmittingGuest(false);

    if (!res.success) {
      setGuestFeedback({ type: 'error', message: res.error || 'Failed to vacate room in Supabase' });
      return;
    }

    setGuestFeedback({
      type: 'success',
      message: `Room ${room.room_number} vacated and marked vacant in Supabase`,
    });
  };

  const handleStartEditGuest = (stay: StayWithGuest) => {
    setEditingStay(stay);
    setEditGuestName(stay.guest?.full_name || '');
    setEditGuestPhone(stay.guest?.phone || '');
    setEditCheckInDate(
      stay.check_in ? formatDateForInput(new Date(stay.check_in)) : getTodayInputDate()
    );
    setEditCheckoutDate(
      stay.expected_checkout
        ? formatDateForInput(new Date(stay.expected_checkout))
        : getTomorrowInputDate()
    );
    setGuestFeedback(null);
  };

  const handleSaveEditGuest = async () => {
    if (!editingStay || !editGuestName.trim()) return;

    setIsSubmittingGuest(true);
    setGuestFeedback(null);

    let checkInISO: string | undefined = undefined;
    if (editCheckInDate) {
      const [y, m, d] = editCheckInDate.split('-').map(Number);
      checkInISO = new Date(y, m - 1, d, 12, 0, 0).toISOString();
    }

    let checkoutISO: string | undefined = undefined;
    if (editCheckoutDate) {
      const [y, m, d] = editCheckoutDate.split('-').map(Number);
      checkoutISO = new Date(y, m - 1, d, 12, 0, 0).toISOString();
    }

    const res = await updateGuestStay(editingStay.id, {
      fullName: editGuestName.trim(),
      phone: editGuestPhone.trim() || undefined,
      checkIn: checkInISO,
      expectedCheckout: checkoutISO,
    });

    setIsSubmittingGuest(false);

    if (!res.success) {
      setGuestFeedback({ type: 'error', message: res.error || 'Failed to update guest in Supabase' });
      return;
    }

    setGuestFeedback({
      type: 'success',
      message: `Guest details updated and saved to Supabase!`,
    });
    setEditingStay(null);
  };

  const allStatuses: RoomStatus[] = [
    'vacant',
    'occupied',
    'partially_occupied',
    'reserved',
    'under_maintenance',
    'cleaning',
    'unavailable',
    'non_functioning',
  ];
  const allACStatuses: ACStatus[] = ['working', 'not_working', 'under_repair', 'not_applicable'];
  const allCleaningStatuses: CleaningStatus[] = ['clean', 'cleaning_required', 'cleaning_in_progress'];

  return (
    <>
      {/* Overlay */}
      <div className="drawer-overlay" onClick={onClose} />

      {/* Panel */}
      <div className="drawer-panel">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between z-10">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">Room {room.room_number}</h2>
              {room.is_accommodation ? (
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  room.room_type === 'dormitory'
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}>
                  {room.room_type === 'dormitory' ? 'Dormitory' : 'Guest Room'}
                </span>
              ) : (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-300">
                  {room.purpose}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {room.is_accommodation
                ? `${typeLabel} · Capacity: ${room.capacity} · ${getBuildingLabel(room.building)}`
                : `Non-Accommodation Space · ${getBuildingLabel(room.building)}`}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* ======================================================== */}
          {/* SPACE CLASSIFICATION & PURPOSE (Room, Store, Dormitory, Kitchen, Office, Hall) */}
          {/* ======================================================== */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings2 size={16} className="text-emerald-700" />
                <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                  Space Classification & Purpose
                </span>
              </div>
              <button
                onClick={() => setEditingClassification(!editingClassification)}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
              >
                <Edit size={12} />
                {editingClassification ? 'Cancel' : 'Change Type'}
              </button>
            </div>

            {/* Read-Only Summary */}
            {!editingClassification ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs py-1 border-b border-stone-200/60">
                  <span className="text-stone-500">Current Role:</span>
                  <span className="font-semibold text-gray-900">
                    {room.purpose} ({room.is_accommodation ? 'Accommodation' : 'Facility'})
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs py-1 border-b border-stone-200/60">
                  <span className="text-stone-500">Room Type:</span>
                  <span className="font-semibold text-gray-900">
                    {roomTypeLabels[room.room_type] || room.room_type} {room.has_ac ? '(AC)' : '(Non-AC)'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-stone-500">Guest Capacity:</span>
                  <span className="font-semibold text-gray-900">
                    {room.is_accommodation ? `${room.capacity} Person(s)` : '0 (Non-Accommodation)'}
                  </span>
                </div>
              </div>
            ) : (
              /* Edit Space Classification Form */
              <div className="space-y-4 pt-1">
                {/* 1-Click Presets */}
                <div>
                  <label className="text-[11px] font-semibold text-gray-600 block mb-1.5 uppercase tracking-wide">
                    Quick Presets (1-Click Switch)
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {CLASSIFICATION_PRESETS.map((p) => {
                      const isSelected =
                        selectedCategory === p.category &&
                        purposeInput.toLowerCase() === p.purpose.toLowerCase() &&
                        (p.category === 'non_accommodation' || roomTypeInput === p.room_type);

                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => applyPreset(p)}
                          className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium border text-left transition-all ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                          }`}
                        >
                          <span className={isSelected ? 'text-white' : ''}>{p.icon}</span>
                          <span className="truncate">{p.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Configuration Form */}
                <div className="space-y-3 bg-white p-3 rounded-lg border border-stone-200">
                  {/* Category Toggle */}
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                      Space Category
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory('accommodation');
                          if (purposeInput === 'Storage' || purposeInput === 'Office') {
                            setPurposeInput('Guest Room');
                          }
                          if (capacityInput === 0) setCapacityInput(2);
                        }}
                        className={`px-3 py-2 text-xs font-medium rounded-md border text-center transition-colors ${
                          selectedCategory === 'accommodation'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold'
                            : 'bg-stone-50 border-gray-200 text-gray-600 hover:bg-stone-100'
                        }`}
                      >
                        🛏️ Accommodation
                        <span className="block text-[10px] text-gray-400 font-normal">
                          Guest stays & booking
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory('non_accommodation');
                          if (purposeInput === 'Guest Room' || purposeInput === 'Dormitory') {
                            setPurposeInput('Storage');
                          }
                          setCapacityInput(0);
                        }}
                        className={`px-3 py-2 text-xs font-medium rounded-md border text-center transition-colors ${
                          selectedCategory === 'non_accommodation'
                            ? 'bg-amber-50 border-amber-500 text-amber-800 font-bold'
                            : 'bg-stone-50 border-gray-200 text-gray-600 hover:bg-stone-100'
                        }`}
                      >
                        🏛️ Non-Accommodation
                        <span className="block text-[10px] text-gray-400 font-normal">
                          Store, Office, Kitchen, Hall
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Purpose / Space Label */}
                  <div>
                    <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                      Purpose / Space Label
                    </label>
                    <input
                      type="text"
                      value={purposeInput}
                      onChange={(e) => setPurposeInput(e.target.value)}
                      placeholder="e.g. Storage, Office, Mega Kitchen, Dormitory, Classroom..."
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {['Guest Room', 'Dormitory', 'Storage', 'Office', 'Mega Kitchen', 'Meeting Hall', 'Classroom', 'Staff Room'].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            setPurposeInput(tag);
                            if (tag === 'Guest Room' || tag === 'Dormitory') {
                              setSelectedCategory('accommodation');
                              if (tag === 'Dormitory') {
                                setRoomTypeInput('dormitory');
                                setCapacityInput(8);
                              } else {
                                setCapacityInput(2);
                              }
                            } else {
                              setSelectedCategory('non_accommodation');
                              setCapacityInput(0);
                            }
                          }}
                          className="text-[10px] px-2 py-0.5 bg-stone-100 text-stone-600 rounded hover:bg-stone-200 border border-stone-200"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Room Type & AC (for Accommodation) */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                        Room Type
                      </label>
                      <select
                        value={roomTypeInput}
                        onChange={(e) => {
                          const val = e.target.value as RoomType;
                          setRoomTypeInput(val);
                          if (val === 'ac') setHasACInput(true);
                          if (val === 'non_ac') setHasACInput(false);
                          if (val === 'dormitory') {
                            setPurposeInput('Dormitory');
                            setSelectedCategory('accommodation');
                            if (capacityInput <= 2) setCapacityInput(8);
                          }
                        }}
                        className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="ac">AC Room</option>
                        <option value="non_ac">Non-AC Room</option>
                        <option value="dormitory">Dormitory</option>
                        <option value="non_functioning">Non-Functioning</option>
                        <option value="other">Other / Custom</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-gray-600 block mb-1">
                        Capacity (Persons)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={capacityInput}
                        onChange={(e) => setCapacityInput(parseInt(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Has AC Toggle */}
                  <div className="flex items-center justify-between pt-1 border-t border-stone-100">
                    <span className="text-xs text-gray-700 font-medium flex items-center gap-1.5">
                      <Snowflake size={14} className={hasACInput ? 'text-sky-500' : 'text-gray-400'} />
                      Equipped with AC
                    </span>
                    <button
                      type="button"
                      onClick={() => setHasACInput(!hasACInput)}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        hasACInput ? 'bg-sky-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          hasACInput ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Save / Cancel Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleSaveClassification}
                      className="action-btn primary text-xs flex-1 justify-center py-2"
                    >
                      <Check size={14} />
                      Save Classification
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingClassification(false)}
                      className="action-btn text-xs px-3 py-2"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Operational Status Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Operational Status
              </span>
              <button
                onClick={() => setEditingStatus(!editingStatus)}
                className="text-xs text-emerald-600 hover:underline"
              >
                {editingStatus ? 'Cancel' : 'Change'}
              </button>
            </div>
            {editingStatus ? (
              <div className="grid grid-cols-2 gap-1.5">
                {allStatuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    className={`text-left px-3 py-2 rounded-md text-xs font-medium border transition-colors ${
                      room.status === s
                        ? `${roomStatusConfig[s].bgColor} ${roomStatusConfig[s].borderColor} ${roomStatusConfig[s].color}`
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {roomStatusConfig[s].label}
                  </button>
                ))}
              </div>
            ) : (
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${statusConf.bgColor} ${statusConf.color} text-sm font-medium`}
              >
                <span
                  className="status-dot"
                  style={{ backgroundColor: statusConf.dotColor.replace('bg-', '') }}
                />
                {statusConf.label}
              </div>
            )}
          </div>

          {/* Capacity & Occupancy and Guests (Only for Accommodations) */}
          {room.is_accommodation ? (
            <>
              {/* Capacity & Occupancy */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Capacity
                  </span>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {room.capacity}{' '}
                    <span className="text-xs text-gray-400 font-normal">
                      {room.room_type === 'dormitory' ? 'beds' : 'persons'}
                    </span>
                  </p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Occupancy
                  </span>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {room.current_occupancy} / {room.capacity}
                    {room.current_occupancy >= room.capacity && room.current_occupancy > 0 && (
                      <span className="text-xs text-red-500 ml-1.5">Full</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Guests */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Guests
                  </span>
                  {room.current_occupancy < room.capacity && (
                    <button
                      onClick={() => {
                        setShowAddGuest(!showAddGuest);
                        setEditingStay(null);
                        setGuestFeedback(null);
                      }}
                      className="text-xs text-emerald-600 hover:underline flex items-center gap-1"
                    >
                      <UserPlus size={12} />
                      Add Guest
                    </button>
                  )}
                </div>

                {/* Feedback banner */}
                {guestFeedback && (
                  <div
                    className={`p-2.5 rounded-lg text-xs flex items-center justify-between mb-3 border ${
                      guestFeedback.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-red-50 text-red-800 border-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {guestFeedback.type === 'success' ? (
                        <Check size={14} className="text-emerald-600 flex-shrink-0" />
                      ) : (
                        <AlertTriangle size={14} className="text-red-600 flex-shrink-0" />
                      )}
                      <span>{guestFeedback.message}</span>
                    </div>
                    <button
                      onClick={() => setGuestFeedback(null)}
                      className="text-gray-400 hover:text-gray-600 ml-2"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                {/* Edit Guest Form */}
                {editingStay && (
                  <div className="mb-3 p-3.5 bg-blue-50/80 rounded-xl border border-blue-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-900 uppercase tracking-wide flex items-center gap-1">
                        <Edit size={13} className="text-blue-700" />
                        Edit Guest Details
                      </span>
                      <span className="text-[11px] text-blue-700 font-semibold">Room {room.room_number}</span>
                    </div>

                    <div className="space-y-2.5">
                      <div>
                        <label className="text-[11px] font-medium text-gray-700 mb-1 block">Guest Full Name *</label>
                        <input
                          type="text"
                          value={editGuestName}
                          onChange={(e) => setEditGuestName(e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-medium text-gray-700 mb-1 block">Phone Number</label>
                        <input
                          type="text"
                          value={editGuestPhone}
                          onChange={(e) => setEditGuestPhone(e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-medium text-gray-700 mb-1 block">Check-in Date</label>
                          <input
                            type="date"
                            value={editCheckInDate}
                            onChange={(e) => setEditCheckInDate(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-medium text-gray-700 mb-1 block">Expected Check-out</label>
                          <input
                            type="date"
                            value={editCheckoutDate}
                            onChange={(e) => setEditCheckoutDate(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1 border-t border-blue-200">
                      <button
                        onClick={handleSaveEditGuest}
                        disabled={isSubmittingGuest || !editGuestName.trim()}
                        className="action-btn text-xs flex-1 justify-center py-2 font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
                      >
                        {isSubmittingGuest ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                        Save Changes
                      </button>
                      <button
                        onClick={() => setEditingStay(null)}
                        disabled={isSubmittingGuest}
                        className="action-btn text-xs px-3 py-2"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Non-Accommodation Notice */
            <div className="bg-stone-100/80 border border-dashed border-stone-300 rounded-xl p-3.5 text-xs text-stone-700 space-y-1">
              <div className="font-semibold text-stone-800 flex items-center gap-1.5">
                <Package size={14} className="text-amber-600" />
                Non-Accommodation Space ({room.purpose})
              </div>
              <p className="text-stone-500 text-[11px] leading-relaxed">
                This space is designated for administrative or utility use. It does not accept guest bookings and is excluded from guest house accommodation metrics.
              </p>
            </div>
          )}

          {/* AC Status */}
          {room.has_ac && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Air Conditioning
                </span>
                <button
                  onClick={() => setEditingAC(!editingAC)}
                  className="text-xs text-emerald-600 hover:underline"
                >
                  {editingAC ? 'Cancel' : 'Change'}
                </button>
              </div>
              {editingAC ? (
                <div className="grid grid-cols-2 gap-1.5">
                  {allACStatuses.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleACChange(s)}
                      className={`text-left px-3 py-2 rounded-md text-xs font-medium border transition-colors ${
                        room.ac_status === s
                          ? 'bg-sky-50 border-sky-200 text-sky-700'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {acStatusConfig[s].label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Snowflake size={16} className={acConf?.color} />
                  <span className={`text-sm font-medium ${acConf?.color}`}>
                    AC — {acConf?.label}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Cleaning */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Housekeeping
              </span>
              <button
                onClick={() => setEditingCleaning(!editingCleaning)}
                className="text-xs text-emerald-600 hover:underline"
              >
                {editingCleaning ? 'Cancel' : 'Change'}
              </button>
            </div>
            {editingCleaning ? (
              <div className="space-y-1.5">
                {allCleaningStatuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleCleaningChange(s)}
                    className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium border transition-colors ${
                      room.cleaning_status === s
                        ? `${cleaningStatusConfig[s].bgColor} border-emerald-200 ${cleaningStatusConfig[s].color}`
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {cleaningStatusConfig[s].label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {room.cleaning_status === 'clean' ? (
                  <CheckCircle size={16} className="text-emerald-500" />
                ) : room.cleaning_status === 'cleaning_required' ? (
                  <AlertTriangle size={16} className="text-amber-500" />
                ) : (
                  <Sparkles size={16} className="text-violet-500" />
                )}
                <span className={`text-sm font-medium ${cleanConf.color}`}>
                  {cleanConf.label}
                </span>
                {room.last_cleaned_at && (
                  <span className="text-xs text-gray-400 ml-auto">
                    Last: {formatDateTime(room.last_cleaned_at)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          {room.notes && (
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes</span>
              <p className="text-sm text-gray-700 mt-1 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                {room.notes}
              </p>
            </div>
          )}

          {/* Quick Actions */}
          <div>
            <button
              onClick={() => setShowActions(!showActions)}
              className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700"
            >
              Actions
              {showActions ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            {showActions && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {room.is_accommodation && room.current_occupancy < room.capacity && (
                  <button onClick={() => setShowAddGuest(true)} className="action-btn primary text-xs">
                    <UserPlus size={13} />
                    Add Guest
                  </button>
                )}
                {room.is_accommodation && room.current_occupancy > 0 && (
                  <button onClick={handleVacateRoom} className="action-btn danger text-xs">
                    <LogOut size={13} />
                    Vacate Room
                  </button>
                )}
                <button
                  onClick={() => {
                    const newStatus =
                      room.cleaning_status === 'clean' ? 'cleaning_required' : 'clean';
                    handleCleaningChange(newStatus as CleaningStatus);
                  }}
                  className="action-btn text-xs"
                >
                  <Sparkles size={13} />
                  {room.cleaning_status === 'clean' ? 'Mark Dirty' : 'Mark Clean'}
                </button>
                {room.has_ac && (
                  <button
                    onClick={() => {
                      const newAC = room.ac_status === 'working' ? 'not_working' : 'working';
                      handleACChange(newAC as ACStatus);
                    }}
                    className="action-btn text-xs"
                  >
                    <Snowflake size={13} />
                    {room.ac_status === 'working' ? 'AC → Not Working' : 'AC → Working'}
                  </button>
                )}
                <button
                  onClick={() => setEditingClassification(true)}
                  className="action-btn text-xs"
                >
                  <Settings2 size={13} />
                  Reclassify Room
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
