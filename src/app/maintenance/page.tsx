'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { DEMO_ROOMS, DEMO_MAINTENANCE } from '@/lib/demo-data';
import { maintenanceStatusLabels, formatDateTime } from '@/lib/utils';
import { Wrench, AlertCircle, CheckCircle, Clock, ChevronDown } from 'lucide-react';
import type { RoomWithOccupancy } from '@/types';

export default function MaintenancePage() {
  const [rooms] = useState<RoomWithOccupancy[]>(DEMO_ROOMS);

  const roomNumberMap = new Map(rooms.map(r => [r.id, r.room_number]));

  const statusColors: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    open: { bg: 'bg-red-50', text: 'text-red-700', icon: <AlertCircle size={14} /> },
    in_progress: { bg: 'bg-amber-50', text: 'text-amber-700', icon: <Clock size={14} /> },
    resolved: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: <CheckCircle size={14} /> },
    closed: { bg: 'bg-gray-50', text: 'text-gray-600', icon: <CheckCircle size={14} /> },
  };

  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header rooms={rooms} />
        <main className="flex-1 p-4 md:p-6 space-y-4 overflow-auto">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Maintenance</h2>
              <p className="text-sm text-gray-500">{DEMO_MAINTENANCE.filter(m => m.status !== 'resolved' && m.status !== 'closed').length} active issues</p>
            </div>
            <button className="action-btn primary text-sm">
              <Wrench size={15} />
              Report Issue
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Room</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Issue</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reported</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Resolved</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {DEMO_MAINTENANCE.map(log => {
                  const sc = statusColors[log.status] || statusColors.open;
                  const roomNum = roomNumberMap.get(log.room_id) || '?';
                  return (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-sm">Room {roomNum}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{log.issue}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${sc.bg} ${sc.text}`}>
                          {sc.icon}
                          {maintenanceStatusLabels[log.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${
                          log.priority === 'high' ? 'text-red-600' :
                          log.priority === 'low' ? 'text-gray-500' : 'text-amber-600'
                        }`}>
                          {log.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDateTime(log.reported_at)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{log.resolved_at ? formatDateTime(log.resolved_at) : '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate">{log.notes || '—'}</td>
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
