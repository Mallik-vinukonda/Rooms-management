'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Bell, User, AlertTriangle, X } from 'lucide-react';
import type { RoomWithOccupancy } from '@/types';

interface HeaderProps {
  rooms: RoomWithOccupancy[];
  onRoomSelect?: (room: RoomWithOccupancy) => void;
}

export default function Header({ rooms, onRoomSelect }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<RoomWithOccupancy[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Count attention items
  const acIssues = rooms.filter(r => r.has_ac && r.ac_status !== 'working' && r.ac_status !== 'not_applicable').length;
  const cleaningNeeded = rooms.filter(r => r.cleaning_status === 'cleaning_required').length;
  const maintenanceRooms = rooms.filter(r => r.status === 'under_maintenance').length;
  const totalAlerts = acIssues + cleaningNeeded + maintenanceRooms;

  // Search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase().trim();
    const results = rooms.filter(room => {
      if (room.room_number.toString().includes(q)) return true;
      if (room.room_type.toLowerCase().includes(q)) return true;
      if (room.status.toLowerCase().includes(q)) return true;
      if (room.purpose.toLowerCase().includes(q)) return true;
      if (room.current_guest_names.some(n => n.toLowerCase().includes(q))) return true;
      if (q === 'ac' && room.has_ac) return true;
      if (q === 'maintenance' && room.status === 'under_maintenance') return true;
      if (q === 'vacant' && room.status === 'vacant') return true;
      if (q === 'occupied' && (room.status === 'occupied' || room.status === 'partially_occupied')) return true;
      return false;
    });
    setSearchResults(results.slice(0, 10));
  }, [searchQuery, rooms]);

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const statusDot = (color: string) => (
    <span className="status-dot" style={{ backgroundColor: color }} />
  );

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 md:px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Title */}
        <div className="flex items-center gap-3 min-w-0 pl-10 md:pl-0">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 leading-tight">
              Sri Villa Guest House
            </h1>
            <p className="text-xs text-gray-500">
              {rooms.length} Rooms · Internal Management
            </p>
          </div>
        </div>

        {/* Center: Search */}
        <div ref={searchRef} className="relative flex-1 max-w-md hidden sm:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search rooms, guests, status… ⌘K"
            className="search-input"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setSearchResults([]); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}

          {/* Search Results Dropdown */}
          {searchOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-80 overflow-y-auto">
              {searchResults.map(room => (
                <button
                  key={room.id}
                  onClick={() => {
                    onRoomSelect?.(room);
                    setSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 flex items-center gap-3"
                >
                  {statusDot(
                    room.status === 'vacant' ? '#10b981' :
                    room.status === 'occupied' ? '#3b82f6' :
                    room.status === 'reserved' ? '#f59e0b' :
                    room.status === 'under_maintenance' ? '#ef4444' : '#9ca3af'
                  )}
                  <div className="min-w-0">
                    <div className="text-sm font-medium">Room {room.room_number}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {room.room_type === 'ac' ? 'AC' : room.room_type === 'non_ac' ? 'Non-AC' : room.room_type === 'dormitory' ? 'Dormitory' : room.room_type}
                      {' · '}
                      {room.current_occupancy}/{room.capacity} occupied
                      {room.current_guest_names.length > 0 && ` · ${room.current_guest_names.join(', ')}`}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {searchOpen && searchQuery && searchResults.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-sm text-gray-500">
              No rooms or guests found for &ldquo;{searchQuery}&rdquo;
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile search toggle */}
          <button
            className="sm:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            onClick={() => {
              setSearchOpen(!searchOpen);
              setTimeout(() => inputRef.current?.focus(), 100);
            }}
          >
            <Search size={18} />
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-600" title="Attention items">
            <Bell size={18} />
            {totalAlerts > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalAlerts}
              </span>
            )}
          </button>

          {/* User */}
          <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 text-gray-600">
            <User size={18} />
            <span className="hidden lg:inline text-sm font-medium">Admin</span>
          </button>
        </div>
      </div>

      {/* Mobile search bar (shown when toggled) */}
      {searchOpen && (
        <div className="sm:hidden mt-3" ref={searchRef}>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search rooms, guests, status…"
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}
    </header>
  );
}
