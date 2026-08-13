'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { DEMO_ROOMS, DEMO_RESERVATIONS } from '@/lib/demo-data';
import { formatDateTime } from '@/lib/utils';
import { CalendarClock, User, Phone, BedDouble } from 'lucide-react';

const statusColors: Record<string, { bg: string; text: string }> = {
  new: { bg: 'bg-blue-50', text: 'text-blue-700' },
  pending_review: { bg: 'bg-amber-50', text: 'text-amber-700' },
  approved: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  assigned: { bg: 'bg-sky-50', text: 'text-sky-700' },
  rejected: { bg: 'bg-red-50', text: 'text-red-700' },
  completed: { bg: 'bg-gray-50', text: 'text-gray-600' },
  cancelled: { bg: 'bg-gray-50', text: 'text-gray-500' },
};

export default function ReservationsPage() {
  const [rooms] = useState(DEMO_ROOMS);
  const roomMap = new Map(rooms.map(r => [r.id, r]));

  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header rooms={rooms} />
        <main className="flex-1 p-4 md:p-6 space-y-4 overflow-auto">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Reservations</h2>
              <p className="text-sm text-gray-500">{DEMO_RESERVATIONS.length} reservations</p>
            </div>
            <button className="action-btn primary text-sm">
              <CalendarClock size={15} />
              New Reservation
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Guest</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Room</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Check-in</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Check-out</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Guests</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {DEMO_RESERVATIONS.map(res => {
                  const sc = statusColors[res.status] || statusColors.new;
                  const room = res.room_id ? roomMap.get(res.room_id) : null;
                  return (
                    <tr key={res.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-gray-400" />
                          <div>
                            <span className="text-sm font-medium text-gray-900">{res.guest_name}</span>
                            {res.guest_phone && (
                              <p className="text-xs text-gray-400 flex items-center gap-1">
                                <Phone size={10} /> {res.guest_phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {room ? (
                          <span className="flex items-center gap-1 text-sm font-medium">
                            <BedDouble size={14} className="text-gray-400" />
                            Room {room.room_number}
                          </span>
                        ) : <span className="text-gray-400 text-sm">Unassigned</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDateTime(res.expected_checkin)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDateTime(res.expected_checkout)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{res.num_guests}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${sc.bg} ${sc.text}`}>{res.status.replace('_', ' ')}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate">{res.notes || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
