'use client';

import { useState, useMemo } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useRooms } from '@/context/RoomContext';
import { Search, User, Phone, BedDouble, Calendar, Clock, AlertCircle } from 'lucide-react';
import { getStayCheckoutDetails } from '@/lib/checkout-utils';

export default function GuestsPage() {
  const { rooms } = useRooms();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'tomorrow'>('all');

  // Extract all current guests with their room info & checkout details
  const guests = useMemo(() => {
    const list: {
      name: string;
      roomNumber: number;
      roomType: string;
      checkIn: string;
      expectedCheckout?: string | null;
      checkoutBadge?: { label: string; bg: string; text: string; border: string; isToday: boolean; isOverdue: boolean } | null;
      phone?: string;
    }[] = [];

    rooms.forEach(room => {
      if (room.active_stays && room.active_stays.length > 0) {
        room.active_stays.forEach(stay => {
          const checkoutDetails = getStayCheckoutDetails(stay);
          list.push({
            name: stay.guest.full_name,
            roomNumber: room.room_number,
            roomType: room.room_type,
            checkIn: stay.check_in,
            expectedCheckout: stay.expected_checkout,
            checkoutBadge: checkoutDetails ? {
              label: checkoutDetails.badgeLabel,
              bg: checkoutDetails.badgeBg,
              text: checkoutDetails.badgeText,
              border: checkoutDetails.badgeBorder,
              isToday: checkoutDetails.isToday,
              isOverdue: checkoutDetails.isOverdue,
            } : null,
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

  const todayDeparturesCount = useMemo(() => {
    return guests.filter(g => g.checkoutBadge?.isToday).length;
  }, [guests]);

  const tomorrowDeparturesCount = useMemo(() => {
    return guests.filter(g => g.checkoutBadge?.label.includes('Tomorrow')).length;
  }, [guests]);

  const filteredGuests = useMemo(() => {
    let result = guests;

    if (activeTab === 'today') {
      result = result.filter(g => g.checkoutBadge?.isToday || g.checkoutBadge?.isOverdue);
    } else if (activeTab === 'tomorrow') {
      result = result.filter(g => g.checkoutBadge?.label.includes('Tomorrow'));
    }

    if (!searchQuery.trim()) return result;
    const q = searchQuery.toLowerCase();
    return result.filter(g =>
      g.name.toLowerCase().includes(q) ||
      g.roomNumber.toString().includes(q) ||
      g.phone?.includes(q)
    );
  }, [guests, searchQuery, activeTab]);

  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header rooms={rooms} />
        <main className="flex-1 p-4 md:p-6 space-y-4 overflow-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Guest Stays & Departures</h2>
              <p className="text-sm text-gray-500">
                {guests.length} active occupants · {todayDeparturesCount} scheduled to check out today
              </p>
            </div>

            {/* Quick departure summary pills */}
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 p-1 rounded-xl text-xs">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'bg-stone-900 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All Guests ({guests.length})
              </button>
              <button
                onClick={() => setActiveTab('today')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                  activeTab === 'today'
                    ? 'bg-amber-600 text-white font-semibold'
                    : 'text-amber-800 hover:bg-amber-50'
                }`}
              >
                <Clock size={12} />
                Out Today ({todayDeparturesCount})
              </button>
              <button
                onClick={() => setActiveTab('tomorrow')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  activeTab === 'tomorrow'
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-blue-800 hover:bg-blue-50'
                }`}
              >
                Out Tomorrow ({tomorrowDeparturesCount})
              </button>
            </div>
          </div>

          <div className="relative max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, room, phone…"
              className="search-input text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Guest</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Room</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Check-in</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Expected Check-out</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Timing Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredGuests.map((guest, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <User size={14} className="text-blue-600" />
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{guest.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {guest.phone ? (
                        <span className="flex items-center gap-1 font-medium">
                          <Phone size={12} className="text-gray-400" />
                          {guest.phone}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-sm">
                        <BedDouble size={14} className="text-gray-400" />
                        <span className="font-semibold text-gray-900">Room {guest.roomNumber}</span>
                        <span className="text-xs text-gray-400 uppercase">
                          ({guest.roomType === 'ac' ? 'AC' : guest.roomType === 'non_ac' ? 'Non-AC' : 'Dorm'})
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {new Date(guest.checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {guest.expectedCheckout ? (
                        <span className="font-semibold flex items-center gap-1 text-gray-800">
                          <Calendar size={12} className="text-emerald-700" />
                          {new Date(guest.expectedCheckout).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Unscheduled</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {guest.checkoutBadge ? (
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${guest.checkoutBadge.bg} ${guest.checkoutBadge.text} ${guest.checkoutBadge.border}`}>
                          {guest.checkoutBadge.isToday && <Clock size={10} />}
                          {guest.checkoutBadge.isOverdue && <AlertCircle size={10} />}
                          {guest.checkoutBadge.label}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredGuests.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">
                      No guests match the selected filter
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
