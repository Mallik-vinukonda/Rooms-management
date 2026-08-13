'use client';

import { useState, useMemo } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { DEMO_ROOMS } from '@/lib/demo-data';
import { Search, User, Phone, BedDouble } from 'lucide-react';
import type { RoomWithOccupancy } from '@/types';

export default function GuestsPage() {
  const [rooms] = useState<RoomWithOccupancy[]>(DEMO_ROOMS);
  const [searchQuery, setSearchQuery] = useState('');

  // Extract all current guests with their room info
  const guests = useMemo(() => {
    const list: { name: string; roomNumber: number; roomType: string; checkIn: string; phone?: string }[] = [];
    rooms.forEach(room => {
      if (room.active_stays) {
        room.active_stays.forEach(stay => {
          list.push({
            name: stay.guest.full_name,
            roomNumber: room.room_number,
            roomType: room.room_type,
            checkIn: stay.check_in,
            phone: stay.guest.phone || undefined,
          });
        });
      } else {
        room.current_guest_names.forEach(name => {
          list.push({
            name,
            roomNumber: room.room_number,
            roomType: room.room_type,
            checkIn: room.created_at,
          });
        });
      }
    });
    return list;
  }, [rooms]);

  const filteredGuests = useMemo(() => {
    if (!searchQuery.trim()) return guests;
    const q = searchQuery.toLowerCase();
    return guests.filter(g =>
      g.name.toLowerCase().includes(q) ||
      g.roomNumber.toString().includes(q) ||
      g.phone?.includes(q)
    );
  }, [guests, searchQuery]);

  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header rooms={rooms} />
        <main className="flex-1 p-4 md:p-6 space-y-4 overflow-auto">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Guests</h2>
              <p className="text-sm text-gray-500">{filteredGuests.length} current guests across all rooms</p>
            </div>
          </div>

          <div className="relative max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search guests…"
              className="search-input text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Guest</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Room</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Check-in</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredGuests.map((guest, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <User size={14} className="text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{guest.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {guest.phone ? (
                        <span className="flex items-center gap-1">
                          <Phone size={12} className="text-gray-400" />
                          {guest.phone}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-sm">
                        <BedDouble size={14} className="text-gray-400" />
                        <span className="font-medium">Room {guest.roomNumber}</span>
                        <span className="text-xs text-gray-400">
                          ({guest.roomType === 'ac' ? 'AC' : guest.roomType === 'non_ac' ? 'Non-AC' : 'Dorm'})
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(guest.checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
                {filteredGuests.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-400">
                      No guests found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
