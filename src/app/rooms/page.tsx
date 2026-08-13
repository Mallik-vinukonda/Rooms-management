'use client';

import { useState, useMemo } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import RoomCard from '@/components/rooms/RoomCard';
import RoomDetailsDrawer from '@/components/rooms/RoomDetailsDrawer';
import { DEMO_ROOMS } from '@/lib/demo-data';
import { roomStatusConfig, roomTypeLabels, acStatusConfig, cleaningStatusConfig, formatDateTime } from '@/lib/utils';
import { LayoutGrid, List, Map, Search, Filter, User, Snowflake, CheckCircle, AlertTriangle } from 'lucide-react';
import type { RoomWithOccupancy } from '@/types';

type ViewMode = 'table' | 'grid' | 'floor';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<RoomWithOccupancy[]>(DEMO_ROOMS);
  const [selectedRoom, setSelectedRoom] = useState<RoomWithOccupancy | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<string>('room_number');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const filteredRooms = useMemo(() => {
    let result = [...rooms];
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.room_number.toString().includes(q) ||
        r.room_type.includes(q) ||
        r.status.includes(q) ||
        r.current_guest_names.some(n => n.toLowerCase().includes(q))
      );
    }
    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter(r => r.room_type === typeFilter);
    }
    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(r => r.status === statusFilter);
    }
    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'room_number': cmp = a.room_number - b.room_number; break;
        case 'capacity': cmp = a.capacity - b.capacity; break;
        case 'occupancy': cmp = a.current_occupancy - b.current_occupancy; break;
        case 'status': cmp = a.status.localeCompare(b.status); break;
        case 'room_type': cmp = a.room_type.localeCompare(b.room_type); break;
        default: cmp = a.room_number - b.room_number;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [rooms, searchQuery, typeFilter, statusFilter, sortField, sortDir]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleUpdateRoom = (roomId: string, updates: Partial<RoomWithOccupancy>) => {
    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        const updated = { ...r, ...updates };
        setSelectedRoom(current => current?.id === roomId ? updated : current);
        return updated;
      }
      return r;
    }));
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
        <Header rooms={rooms} onRoomSelect={setSelectedRoom} />
        <main className="flex-1 p-4 md:p-6 space-y-4 overflow-auto">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Rooms</h2>
              <p className="text-sm text-gray-500">{filteredRooms.length} of {rooms.length} rooms</p>
            </div>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
              {[
                { mode: 'table' as ViewMode, icon: <List size={16} />, label: 'Table' },
                { mode: 'grid' as ViewMode, icon: <LayoutGrid size={16} />, label: 'Grid' },
              ].map(v => (
                <button
                  key={v.mode}
                  onClick={() => setViewMode(v.mode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    viewMode === v.mode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {v.icon}
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search rooms, guests…"
                className="search-input text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
            >
              <option value="all">All Types</option>
              <option value="ac">AC</option>
              <option value="non_ac">Non-AC</option>
              <option value="dormitory">Dormitory</option>
              <option value="non_functioning">Non-Functioning</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="vacant">Vacant</option>
              <option value="occupied">Occupied</option>
              <option value="partially_occupied">Partially Occupied</option>
              <option value="reserved">Reserved</option>
              <option value="under_maintenance">Maintenance</option>
              <option value="non_functioning">Non-Functioning</option>
            </select>
          </div>

          {/* Table View */}
          {viewMode === 'table' && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <SortHeader field="room_number">Room</SortHeader>
                      <SortHeader field="room_type">Type</SortHeader>
                      <SortHeader field="capacity">Capacity</SortHeader>
                      <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Occupancy</th>
                      <SortHeader field="status">Status</SortHeader>
                      <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">AC</th>
                      <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cleaning</th>
                      <th className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Guests</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredRooms.map(room => {
                      const sc = roomStatusConfig[room.status];
                      return (
                        <tr
                          key={room.id}
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => setSelectedRoom(room)}
                        >
                          <td className="px-3 py-3">
                            <span className="font-bold text-sm text-gray-900">{room.room_number}</span>
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-600">
                            {roomTypeLabels[room.room_type]}
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-600">{room.capacity}</td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-1">
                              {Array.from({ length: Math.min(room.current_occupancy, 4) }).map((_, i) => (
                                <User key={i} size={12} className="text-blue-500" fill="currentColor" />
                              ))}
                              {room.current_occupancy > 4 && (
                                <span className="text-xs text-blue-600 font-medium">+{room.current_occupancy - 4}</span>
                              )}
                              <span className="text-xs text-gray-400 ml-1">
                                {room.current_occupancy}/{room.capacity}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <span className={`badge ${sc.bgColor} ${sc.color}`}>
                              <span className={`status-dot ${sc.dotColor}`} />
                              {sc.label}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            {room.has_ac ? (
                              <span className={`flex items-center gap-1 text-xs ${acStatusConfig[room.ac_status].color}`}>
                                <Snowflake size={12} />
                                {acStatusConfig[room.ac_status].label}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <span className={`flex items-center gap-1 text-xs ${cleaningStatusConfig[room.cleaning_status].color}`}>
                              {room.cleaning_status === 'clean' ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                              {cleaningStatusConfig[room.cleaning_status].label}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-600 max-w-[200px] truncate">
                            {room.current_guest_names.length > 0
                              ? room.current_guest_names.join(', ')
                              : <span className="text-gray-400">—</span>
                            }
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
              {filteredRooms.map(room => (
                <RoomCard key={room.id} room={room} onClick={setSelectedRoom} />
              ))}
            </div>
          )}
        </main>
      </div>

      {selectedRoom && (
        <RoomDetailsDrawer
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)}
          onUpdateRoom={handleUpdateRoom}
        />
      )}
    </div>
  );
}
