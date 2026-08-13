'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { DEMO_ROOMS, DEMO_ACTIVITY } from '@/lib/demo-data';
import { formatDateTime, formatTimeAgo } from '@/lib/utils';
import { ClipboardList, User, Wrench, BedDouble, Snowflake, Sparkles, CalendarClock } from 'lucide-react';

export default function ActivityPage() {
  const [rooms] = useState(DEMO_ROOMS);

  // Sort by newest first
  const sortedLogs = [...DEMO_ACTIVITY].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const getActionIcon = (action: string) => {
    if (action.includes('Guest')) return <User size={14} className="text-blue-500" />;
    if (action.includes('AC')) return <Snowflake size={14} className="text-sky-500" />;
    if (action.includes('Maintenance') || action.includes('maintenance')) return <Wrench size={14} className="text-red-500" />;
    if (action.includes('clean') || action.includes('Clean')) return <Sparkles size={14} className="text-violet-500" />;
    if (action.includes('Reservation') || action.includes('reservation')) return <CalendarClock size={14} className="text-amber-500" />;
    if (action.includes('Status') || action.includes('status')) return <BedDouble size={14} className="text-emerald-500" />;
    return <ClipboardList size={14} className="text-gray-400" />;
  };

  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header rooms={rooms} />
        <main className="flex-1 p-4 md:p-6 space-y-4 overflow-auto">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Activity Log</h2>
            <p className="text-sm text-gray-500">Audit trail of all operations</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="divide-y divide-gray-100">
              {sortedLogs.map(log => (
                <div key={log.id} className="px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors">
                  <div className="mt-0.5 flex-shrink-0">
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-800">
                      <span className="font-medium text-gray-900">{log.user_name || 'System'}</span>
                      {' '}
                      <span className="text-gray-600">{log.action.toLowerCase()}</span>
                      {log.room_number && (
                        <>
                          {' on '}
                          <span className="font-medium">Room {log.room_number}</span>
                        </>
                      )}
                    </div>
                    {(log.old_value || log.new_value) && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        {log.old_value && <span className="line-through text-red-400 mr-1">{log.old_value}</span>}
                        {log.old_value && log.new_value && <span className="mr-1">→</span>}
                        {log.new_value && <span className="text-emerald-600 font-medium">{log.new_value}</span>}
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-xs text-gray-400" title={formatDateTime(log.created_at)}>
                      {formatTimeAgo(log.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
