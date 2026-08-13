'use client';

import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { DEMO_ROOMS } from '@/lib/demo-data';
import { UserCog, Shield, User } from 'lucide-react';

export default function UsersPage() {
  const rooms = DEMO_ROOMS;

  const demoUsers = [
    { name: 'Mallik', role: 'admin', email: 'mallik@devipuram.com', status: 'Active' },
    { name: 'Ramesh', role: 'staff', email: 'ramesh@devipuram.com', status: 'Active' },
    { name: 'Suresh', role: 'staff', email: 'suresh@devipuram.com', status: 'Active' },
  ];

  const roleColors: Record<string, { bg: string; text: string }> = {
    admin: { bg: 'bg-purple-50', text: 'text-purple-700' },
    staff: { bg: 'bg-blue-50', text: 'text-blue-700' },
    supervisor: { bg: 'bg-amber-50', text: 'text-amber-700' },
  };

  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header rooms={rooms} />
        <main className="flex-1 p-4 md:p-6 space-y-4 overflow-auto">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Users</h2>
              <p className="text-sm text-gray-500">Manage staff and admin accounts</p>
            </div>
            <button className="action-btn primary text-sm">
              <UserCog size={15} />
              Add User
            </button>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
            💡 User management requires Supabase Auth. The users below are demo placeholders.
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {demoUsers.map((user, i) => {
                  const rc = roleColors[user.role] || roleColors.staff;
                  return (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            {user.role === 'admin' ? <Shield size={14} className="text-purple-500" /> : <User size={14} className="text-gray-500" />}
                          </div>
                          <span className="text-sm font-medium text-gray-900">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${rc.bg} ${rc.text} capitalize`}>{user.role}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge bg-emerald-50 text-emerald-700">
                          <span className="status-dot bg-emerald-500" />
                          {user.status}
                        </span>
                      </td>
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
