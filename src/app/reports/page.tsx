'use client';

import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { DEMO_ROOMS, calculateDemoStats } from '@/lib/demo-data';
import { BarChart3, BedDouble, Users, Snowflake, Wrench, Sparkles, Download } from 'lucide-react';

export default function ReportsPage() {
  const rooms = DEMO_ROOMS;
  const stats = calculateDemoStats();

  const occupancyRate = stats.total_rooms > 0
    ? Math.round(((stats.occupied + stats.partially_occupied) / stats.total_rooms) * 100)
    : 0;

  const acHealthRate = stats.total_ac_rooms > 0
    ? Math.round((stats.ac_working / stats.total_ac_rooms) * 100)
    : 0;

  const handleExportCSV = () => {
    const headers = ['Room', 'Type', 'Capacity', 'Occupancy', 'Status', 'AC', 'Cleaning', 'Guests'];
    const rows = rooms.map(r => [
      r.room_number,
      r.room_type,
      r.capacity,
      `${r.current_occupancy}/${r.capacity}`,
      r.status,
      r.has_ac ? r.ac_status : 'N/A',
      r.cleaning_status,
      r.current_guest_names.join('; '),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sri-villa-rooms-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header rooms={rooms} />
        <main className="flex-1 p-4 md:p-6 space-y-5 overflow-auto">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Reports</h2>
              <p className="text-sm text-gray-500">Operational overview and data export</p>
            </div>
            <button onClick={handleExportCSV} className="action-btn primary text-sm">
              <Download size={15} />
              Export CSV
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="stat-card">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 size={18} className="text-indigo-500" />
                <span className="text-sm font-semibold text-gray-700">Occupancy Rate</span>
              </div>
              <div className="text-3xl font-bold text-indigo-700">{occupancyRate}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-indigo-500 h-2 rounded-full transition-all" style={{ width: `${occupancyRate}%` }} />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.occupied + stats.partially_occupied} of {stats.total_rooms} rooms occupied
              </p>
            </div>

            <div className="stat-card">
              <div className="flex items-center gap-2 mb-3">
                <Snowflake size={18} className="text-sky-500" />
                <span className="text-sm font-semibold text-gray-700">AC Health</span>
              </div>
              <div className="text-3xl font-bold text-sky-700">{acHealthRate}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className={`h-2 rounded-full transition-all ${acHealthRate >= 80 ? 'bg-emerald-500' : acHealthRate >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${acHealthRate}%` }} />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.ac_working} of {stats.total_ac_rooms} AC units working
              </p>
            </div>

            <div className="stat-card">
              <div className="flex items-center gap-2 mb-3">
                <Users size={18} className="text-blue-500" />
                <span className="text-sm font-semibold text-gray-700">Total Guests</span>
              </div>
              <div className="text-3xl font-bold text-blue-700">{stats.total_occupants}</div>
              <p className="text-xs text-gray-500 mt-1">
                Total capacity: {stats.total_capacity} beds
              </p>
            </div>
          </div>

          {/* Room Type Breakdown */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Room Type Breakdown</h3>
            <div className="space-y-3">
              {[
                { label: 'AC Rooms', count: rooms.filter(r => r.room_type === 'ac').length, color: 'bg-sky-500' },
                { label: 'Non-AC Rooms', count: rooms.filter(r => r.room_type === 'non_ac').length, color: 'bg-gray-500' },
                { label: 'Dormitories', count: rooms.filter(r => r.room_type === 'dormitory').length, color: 'bg-indigo-500' },
                { label: 'Non-Functioning', count: rooms.filter(r => r.room_type === 'non_functioning' || r.status === 'non_functioning').length, color: 'bg-gray-400' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-32">{item.label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-5 relative overflow-hidden">
                    <div
                      className={`${item.color} h-full rounded-full transition-all flex items-center justify-end pr-2`}
                      style={{ width: `${(item.count / rooms.length) * 100}%`, minWidth: item.count > 0 ? '30px' : '0' }}
                    >
                      <span className="text-[10px] font-bold text-white">{item.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Status Distribution</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Vacant', count: stats.available, color: 'text-emerald-700', bg: 'bg-emerald-50' },
                { label: 'Occupied', count: stats.occupied, color: 'text-blue-700', bg: 'bg-blue-50' },
                { label: 'Partial', count: stats.partially_occupied, color: 'text-sky-700', bg: 'bg-sky-50' },
                { label: 'Reserved', count: stats.reserved, color: 'text-amber-700', bg: 'bg-amber-50' },
                { label: 'Maintenance', count: stats.under_maintenance, color: 'text-red-700', bg: 'bg-red-50' },
                { label: 'Non-Function.', count: stats.non_functioning, color: 'text-gray-600', bg: 'bg-gray-50' },
                { label: 'Unavailable', count: stats.unavailable, color: 'text-gray-500', bg: 'bg-gray-50' },
                { label: 'Cleaning Req.', count: stats.cleaning_required, color: 'text-violet-700', bg: 'bg-violet-50' },
              ].map(item => (
                <div key={item.label} className={`${item.bg} rounded-lg p-3 text-center`}>
                  <div className={`text-2xl font-bold ${item.color}`}>{item.count}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
