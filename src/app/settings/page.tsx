'use client';

import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { DEMO_ROOMS } from '@/lib/demo-data';
import { Settings, Database, Palette, Bell, Shield, Globe } from 'lucide-react';

export default function SettingsPage() {
  const rooms = DEMO_ROOMS;

  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header rooms={rooms} />
        <main className="flex-1 p-4 md:p-6 space-y-5 overflow-auto">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Settings</h2>
            <p className="text-sm text-gray-500">Application configuration</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: <Database size={20} />, title: 'Database', desc: 'Supabase connection and data management', status: 'Demo Mode' },
              { icon: <Shield size={20} />, title: 'Authentication', desc: 'Supabase Auth, role-based access control', status: 'Not configured' },
              { icon: <Bell size={20} />, title: 'Notifications', desc: 'WhatsApp and email notifications', status: 'Coming soon' },
              { icon: <Globe size={20} />, title: 'Integrations', desc: 'Zoho Forms, external APIs', status: 'Coming soon' },
              { icon: <Palette size={20} />, title: 'Appearance', desc: 'Theme, branding, room card styling', status: 'Default' },
              { icon: <Settings size={20} />, title: 'Room Config', desc: 'Room types, purposes, default capacities', status: 'Configurable' },
            ].map((item) => (
              <div key={item.title} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-lg bg-gray-100 text-gray-600">{item.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Environment</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Mode</span>
                <span className="font-medium text-amber-600">Demo (In-Memory Data)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Supabase URL</span>
                <span className="font-mono text-xs text-gray-400">Not configured</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Total Rooms</span>
                <span className="font-medium">{rooms.length}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Version</span>
                <span className="font-medium">1.0.0</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
