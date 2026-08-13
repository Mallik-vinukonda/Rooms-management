'use client';

import { useState } from 'react';
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
} from 'lucide-react';
import type { RoomWithOccupancy, RoomStatus, ACStatus, CleaningStatus } from '@/types';
import { roomStatusConfig, roomTypeLabels, acStatusConfig, cleaningStatusConfig, formatDateTime, getBuildingLabel } from '@/lib/utils';

interface RoomDetailsDrawerProps {
  room: RoomWithOccupancy | null;
  onClose: () => void;
  onUpdateRoom?: (roomId: string, updates: Partial<RoomWithOccupancy>) => void;
}

export default function RoomDetailsDrawer({ room, onClose, onUpdateRoom }: RoomDetailsDrawerProps) {
  const [showActions, setShowActions] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);
  const [editingAC, setEditingAC] = useState(false);
  const [editingCleaning, setEditingCleaning] = useState(false);
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestPhone, setNewGuestPhone] = useState('');

  if (!room) return null;

  const statusConf = roomStatusConfig[room.status];
  const typeLabel = roomTypeLabels[room.room_type] || room.room_type;
  const acConf = room.has_ac ? acStatusConfig[room.ac_status] : null;
  const cleanConf = cleaningStatusConfig[room.cleaning_status];

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

  const handleAddGuest = () => {
    if (!newGuestName.trim()) return;
    // In demo mode, we just add to the local state
    const updated: Partial<RoomWithOccupancy> = {
      current_occupancy: room.current_occupancy + 1,
      current_guest_names: [...room.current_guest_names, newGuestName.trim()],
      status: room.current_occupancy + 1 >= room.capacity ? 'occupied' : 'partially_occupied',
    };
    onUpdateRoom?.(room.id, updated);
    setNewGuestName('');
    setNewGuestPhone('');
    setShowAddGuest(false);
  };

  const handleRemoveGuest = (guestName: string) => {
    const newGuests = room.current_guest_names.filter(n => n !== guestName);
    const updated: Partial<RoomWithOccupancy> = {
      current_occupancy: newGuests.length,
      current_guest_names: newGuests,
      status: newGuests.length === 0 ? 'vacant' : newGuests.length < room.capacity ? 'partially_occupied' : 'occupied',
    };
    onUpdateRoom?.(room.id, updated);
  };

  const handleVacateRoom = () => {
    if (!confirm(`Vacate all guests from Room ${room.room_number}?`)) return;
    onUpdateRoom?.(room.id, {
      current_occupancy: 0,
      current_guest_names: [],
      status: 'vacant',
    });
  };

  const allStatuses: RoomStatus[] = ['vacant', 'occupied', 'partially_occupied', 'reserved', 'under_maintenance', 'cleaning', 'unavailable', 'non_functioning'];
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
            <h2 className="text-lg font-bold text-gray-900">Room {room.room_number}</h2>
            <p className="text-xs text-gray-500">{typeLabel} · {getBuildingLabel(room.building)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Status Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</span>
              <button onClick={() => setEditingStatus(!editingStatus)} className="text-xs text-emerald-600 hover:underline">
                {editingStatus ? 'Cancel' : 'Change'}
              </button>
            </div>
            {editingStatus ? (
              <div className="grid grid-cols-2 gap-1.5">
                {allStatuses.map(s => (
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
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${statusConf.bgColor} ${statusConf.color} text-sm font-medium`}>
                <span className="status-dot" style={{ backgroundColor: statusConf.dotColor.replace('bg-', '') }} />
                {statusConf.label}
              </div>
            )}
          </div>

          {/* Capacity & Occupancy and Guests (Only for Accommodations) */}
          {room.is_accommodation && (
            <>
              {/* Capacity & Occupancy */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Capacity</span>
                  <p className="text-lg font-bold text-gray-900 mt-1">{room.capacity}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Occupancy</span>
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
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Guests</span>
                  {room.current_occupancy < room.capacity && (
                    <button
                      onClick={() => setShowAddGuest(!showAddGuest)}
                      className="text-xs text-emerald-600 hover:underline flex items-center gap-1"
                    >
                      <UserPlus size={12} />
                      Add Guest
                    </button>
                  )}
                </div>
                {room.current_guest_names.length > 0 ? (
                  <div className="space-y-1.5">
                    {room.current_guest_names.map((name, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                          <UserIcon size={14} className="text-blue-500" />
                          <span className="text-sm font-medium text-gray-800">{name}</span>
                        </div>
                        <button
                          onClick={() => {
                            if (confirm(`Remove ${name} from Room ${room.room_number}?`)) {
                              handleRemoveGuest(name);
                            }
                          }}
                          className="text-gray-400 hover:text-red-500 p-1"
                          title="Remove guest"
                        >
                          <UserMinus size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">No guests assigned</p>
                )}

                {/* Add Guest Form */}
                {showAddGuest && (
                  <div className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200 space-y-2">
                    <input
                      type="text"
                      placeholder="Guest name"
                      value={newGuestName}
                      onChange={(e) => setNewGuestName(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      autoFocus
                    />
                    <input
                      type="text"
                      placeholder="Phone (optional)"
                      value={newGuestPhone}
                      onChange={(e) => setNewGuestPhone(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <div className="flex gap-2">
                      <button onClick={handleAddGuest} className="action-btn primary text-xs">
                        <UserPlus size={13} />
                        Add
                      </button>
                      <button onClick={() => { setShowAddGuest(false); setNewGuestName(''); setNewGuestPhone(''); }} className="action-btn text-xs">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* AC Status */}
          {room.has_ac && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Facilities</span>
                <button onClick={() => setEditingAC(!editingAC)} className="text-xs text-emerald-600 hover:underline">
                  {editingAC ? 'Cancel' : 'Change'}
                </button>
              </div>
              {editingAC ? (
                <div className="grid grid-cols-2 gap-1.5">
                  {allACStatuses.map(s => (
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
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Housekeeping</span>
              <button onClick={() => setEditingCleaning(!editingCleaning)} className="text-xs text-emerald-600 hover:underline">
                {editingCleaning ? 'Cancel' : 'Change'}
              </button>
            </div>
            {editingCleaning ? (
              <div className="space-y-1.5">
                {allCleaningStatuses.map(s => (
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
                    const newStatus = room.cleaning_status === 'clean' ? 'cleaning_required' : 'clean';
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
                <button className="action-btn text-xs">
                  <Wrench size={13} />
                  Report Issue
                </button>
                <button className="action-btn text-xs">
                  <History size={13} />
                  View History
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
