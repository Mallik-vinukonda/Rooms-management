'use client';

import { useState, useMemo } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import RoomCard from '@/components/rooms/RoomCard';
import RoomDetailsDrawer from '@/components/rooms/RoomDetailsDrawer';
import { useRooms } from '@/context/RoomContext';
import {
  roomStatusConfig,
  roomTypeLabels,
  acStatusConfig,
  cleaningStatusConfig,
} from '@/lib/utils';
import {
  LayoutGrid,
  List,
  Search,
  User,
  Snowflake,
  CheckCircle,
  AlertTriangle,
  Package,
  Building2,
  Users,
} from 'lucide-react';
import type { RoomWithOccupancy } from '@/types';
import { getRoomAvailability } from '@/lib/checkout-utils';

type ViewMode = 'table' | 'grid';

export default function RoomsPage() {
  const { rooms, updateRoom } = useRooms();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'accommodation' | 'facility'>('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<string>('room_number');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) || null;

  const filteredRooms = useMemo(() => {
    let result = [...rooms];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.room_number.toString().includes(q) ||
          r.room_type.toLowerCase().includes(q) ||
          (r.purpose && r.purpose.toLowerCase().includes(q)) ||
          r.status.toLowerCase().includes(q) ||
          r.current_guest_names.some((n) => n.toLowerCase().includes(q))
      );
    }

    // Category filter (accommodation vs facility)
    if (categoryFilter === 'accommodation') {
      result = result.filter((r) => r.is_accommodation);
    } else if (categoryFilter === 'facility') {
      result = result.filter((r) => !r.is_accommodation);
    }

    // Type / Purpose filter
    if (typeFilter !== 'all') {
      if (typeFilter === 'ac') {
        result = result.filter((r) => r.has_ac && r.is_accommodation);
      } else if (typeFilter === 'non_ac') {
        result = result.filter((r) => !r.has_ac && r.is_accommodation);
      } else if (typeFilter === 'dormitory') {
        result = result.filter((r) => r.room_type === 'dormitory');
      } else if (typeFilter === 'storage') {
        result = result.filter((r) => r.purpose.toLowerCase().includes('stor'));
      } else if (typeFilter === 'office') {
        result = result.filter((r) => r.purpose.toLowerCase().includes('office'));
      } else if (typeFilter === 'kitchen') {
        result = result.filter((r) => r.purpose.toLowerCase().includes('kitchen'));
      } else if (typeFilter === 'hall') {
        result = result.filter((r) => r.purpose.toLowerCase().includes('hall'));
      } else if (typeFilter === 'classroom') {
        result = result.filter((r) => r.purpose.toLowerCase().includes('class'));
      } else {
        result = result.filter((r) => r.room_type === typeFilter);
      }
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((r) => r.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'room_number':
          cmp = a.room_number - b.room_number;
          break;
        case 'purpose':
          cmp = (a.purpose || '').localeCompare(b.purpose || '');
          break;
        case 'capacity':
          cmp = a.capacity - b.capacity;
          break;
        case 'occupancy':
          cmp = a.current_occupancy - b.current_occupancy;
          break;
        case 'status':
          cmp = a.status.localeCompare(b.status);
          break;
        case 'room_type':
          cmp = a.room_type.localeCompare(b.room_type);
          break;
        default:
          cmp = a.room_number - b.room_number;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [rooms, searchQuery, categoryFilter, typeFilter, statusFilter, sortField, sortDir]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleUpdateRoom = (roomId: string, updates: Partial<RoomWithOccupancy>) => {
    updateRoom(roomId, updates);
  };

  const SortHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <th
      className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none"
      onClick={() => handleSort(field)}
    >
      <span className="flex items-center gap-1">
        {children}
        {sortField === field && (
          <span className="text-emerald-600">{sortDir === 'asc' ? '↑' : '↓'}</span>
        )}
      </span>
    </th>
  );

  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header rooms={rooms} onRoomSelect={(r) => setSelectedRoomId(r.id)} />
        <main className="flex-1 p-4 md:p-6 space-y-4 overflow-auto">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Rooms & Facilities</h2>
              <p className="text-sm text-gray-500">
                {filteredRooms.length} of {rooms.length} spaces (
                {rooms.filter((r) => r.is_accommodation).length} Accommodation,{' '}
                {rooms.filter((r) => !r.is_accommodation).length} Non-Accommodation Facilities)
              </p>
            </div>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
              {[
                { mode: 'table' as ViewMode, icon: <List size={16} />, label: 'Table' },
                { mode: 'grid' as ViewMode, icon: <LayoutGrid size={16} />, label: 'Grid' },
              ].map((v) => (
                <button
                  key={v.mode}
                  onClick={() => setViewMode(v.mode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    viewMode === v.mode
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {v.icon}
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search room #, purpose, guest…"
                className="search-input text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium bg-white"
            >
              <option value="all">All Categories</option>
              <option value="accommodation">Accommodation Only</option>
              <option value="facility">Non-Accommodation Facilities</option>
            </select>

            {/* Space Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium bg-white"
            >
              <option value="all">All Space Types</option>
              <option value="ac">AC Rooms</option>
              <option value="non_ac">Non-AC Rooms</option>
              <option value="dormitory">Dormitory</option>
              <option value="storage">Storage / Store</option>
              <option value="office">Office</option>
              <option value="kitchen">Kitchen</option>
              <option value="hall">Meeting Hall</option>
              <option value="classroom">Classroom</option>
              <option value="non_functioning">Non-Functioning</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="vacant">Vacant</option>
              <option value="occupied">Occupied</option>
              <option value="partially_occupied">Partially Occupied</option>
              <option value="reserved">Reserved</option>
              <option value="under_maintenance">Maintenance</option>
              <option value="cleaning">Cleaning</option>
              <option value="non_functioning">Non-Functioning</option>
            </select>
          </div>

          {/* Table View */}
          {viewMode === 'table' && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <SortHeader field="room_number">Room</SortHeader>
                      <SortHeader field="purpose">Role / Purpose</SortHeader>
                      <SortHeader field="room_type">Type</SortHeader>
                      <SortHeader field="capacity">Capacity</SortHeader>
                      <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Occupancy
                      </th>
                      <SortHeader field="status">Status</SortHeader>
                      <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        AC
                      </th>
                      <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Cleaning
                      </th>
                      <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Current Guests / Info
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredRooms.map((room) => {
                      const sc = roomStatusConfig[room.status];
                      const availability = getRoomAvailability(room);
                      return (
                        <tr
                          key={room.id}
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => setSelectedRoomId(room.id)}
                        >
                          <td className="px-3 py-3">
                            <span className="font-bold text-sm text-gray-900">
                              {room.room_number}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-sm">
                            <div className="flex items-center gap-1.5">
                              {room.is_accommodation ? (
                                <span className={`badge text-xs ${
                                  room.room_type === 'dormitory'
                                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}>
                                  {room.room_type === 'dormitory' ? '🏢 Dormitory' : `🛏️ ${room.purpose}`}
                                </span>
                              ) : (
                                <span className="badge bg-stone-100 text-stone-700 border border-stone-300 text-xs">
                                  🏛️ {room.purpose}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-xs text-gray-600 font-medium">
                            {roomTypeLabels[room.room_type] || room.room_type}
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-600 font-medium">
                            {room.is_accommodation ? (
                              <span>{room.capacity} {room.room_type === 'dormitory' ? 'beds' : ''}</span>
                            ) : (
                              <span className="text-xs text-stone-400">—</span>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            {room.is_accommodation ? (
                              <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(room.current_occupancy, 4) }).map(
                                  (_, i) => (
                                    <User
                                      key={i}
                                      size={12}
                                      className="text-blue-500"
                                      fill="currentColor"
                                    />
                                  )
                                )}
                                {room.current_occupancy > 4 && (
                                  <span className="text-xs text-blue-600 font-medium">
                                    +{room.current_occupancy - 4}
                                  </span>
                                )}
                                <span className="text-xs text-gray-400 ml-1">
                                  {room.current_occupancy}/{room.capacity}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs text-stone-400 italic">Facility</span>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <span className={`badge ${sc.bgColor} ${sc.color}`}>
                              <span className={`status-dot ${sc.dotColor}`} />
                              {sc.label}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            {room.has_ac ? (
                              <span
                                className={`flex items-center gap-1 text-xs ${
                                  acStatusConfig[room.ac_status].color
                                }`}
                              >
                                <Snowflake size={12} />
                                {acStatusConfig[room.ac_status].label}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className={`flex items-center gap-1 text-xs ${
                                cleaningStatusConfig[room.cleaning_status].color
                              }`}
                            >
                              {room.cleaning_status === 'clean' ? (
                                <CheckCircle size={12} />
                              ) : (
                                <AlertTriangle size={12} />
                              )}
                              {cleaningStatusConfig[room.cleaning_status].label}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-600 max-w-[200px] truncate">
                            {room.is_accommodation ? (
                              room.current_guest_names.length > 0 ? (
                                room.current_guest_names.join(', ')
                              ) : (
                                <span className="text-gray-400 italic">Vacant</span>
                              )
                            ) : (
                              <span className="text-xs text-stone-500">{room.purpose}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {filteredRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onClick={(r) => setSelectedRoomId(r.id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {selectedRoom && (
        <RoomDetailsDrawer
          room={selectedRoom}
          onClose={() => setSelectedRoomId(null)}
          onUpdateRoom={handleUpdateRoom}
        />
      )}
    </div>
  );
}
