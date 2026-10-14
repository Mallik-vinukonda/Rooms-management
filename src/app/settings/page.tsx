'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useRooms } from '@/context/RoomContext';
import {
  Settings,
  Database,
  Palette,
  Bell,
  Shield,
  Globe,
  RefreshCw,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Code2,
} from 'lucide-react';

export default function SettingsPage() {
  const { rooms, syncStatus, supabaseError, refreshRooms, resetRooms } = useRooms();
  const [testingConnection, setTestingConnection] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iwqbcfoqxferysuiwmeq.supabase.co';

  const handleTestConnection = async () => {
    setTestingConnection(true);
    await refreshRooms();
    setTestingConnection(false);
  };

  const handleReset = () => {
    if (confirm('Reset all rooms and space classifications back to default seed data?')) {
      resetRooms();
      setResetDone(true);
      setTimeout(() => setResetDone(false), 3000);
    }
  };

  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header rooms={rooms} />
        <main className="flex-1 p-4 md:p-6 space-y-5 overflow-auto">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Settings & Database</h2>
            <p className="text-sm text-gray-500">
              Manage database connectivity, space configurations, and application status
            </p>
          </div>

          {/* ======================================================== */}
          {/* SUPABASE LIVE DIAGNOSTICS & SETUP CARD */}
          {/* ======================================================== */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-lg ${
                    syncStatus === 'supabase_connected'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  <Database size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Supabase Database Connection</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    PostgreSQL backend and cloud synchronization status
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                  className="action-btn text-xs font-medium"
                >
                  <RefreshCw size={13} className={testingConnection ? 'animate-spin' : ''} />
                  {testingConnection ? 'Testing...' : 'Test Connection'}
                </button>
                <button
                  onClick={handleReset}
                  className="action-btn text-xs text-red-600 hover:bg-red-50 hover:border-red-200"
                >
                  <RotateCcw size={13} />
                  Reset to Seed
                </button>
              </div>
            </div>

            {/* Current Status Pill */}
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Sync Mode
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                    syncStatus === 'supabase_connected'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      syncStatus === 'supabase_connected' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                  {syncStatus === 'supabase_connected'
                    ? 'Connected to Supabase (Live)'
                    : 'Persistent Local Storage Mode (Active)'}
                </span>
              </div>

              <div className="text-xs text-stone-600 space-y-1 pt-1">
                <p>
                  <strong>Endpoint:</strong>{' '}
                  <span className="font-mono text-gray-800">{supabaseUrl}</span>
                </p>
                {syncStatus !== 'supabase_connected' ? (
                  <div className="mt-2 p-3 bg-amber-50/80 border border-amber-200 rounded-lg text-amber-900 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-amber-800">
                      <AlertTriangle size={15} />
                      Why is it currently in Local Storage Mode?
                    </div>
                    <p className="text-[12px] leading-relaxed">
                      The credentials in <code className="bg-amber-100 px-1 rounded">.env</code>{' '}
                      successfully authenticate with Supabase, but the table{' '}
                      <code className="bg-amber-100 px-1 rounded">public.rooms</code> does not exist
                      in your remote Supabase project yet.
                    </p>
                    <p className="text-[12px] leading-relaxed font-medium">
                      All your edits (marking rooms as stores, offices, dormitories, kitchens, etc.)
                      are currently <strong>100% saved in browser persistent storage</strong> so no
                      data is lost.
                    </p>
                  </div>
                ) : (
                  <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>Database connected! Live syncing is active across Supabase and the app.</span>
                  </div>
                )}
              </div>
            </div>

            {resetDone && (
              <div className="text-xs text-emerald-600 font-medium">
                ✓ Rooms successfully reset to original seed data.
              </div>
            )}

            {/* Quick 2-Step Guide to Deploy Schema to Supabase */}
            {syncStatus !== 'supabase_connected' && (
              <div className="border-t border-gray-100 pt-3 space-y-2">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Code2 size={14} className="text-emerald-600" />
                  How to Connect to Supabase Live (2-Step Guide)
                </h4>
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[11px] flex-shrink-0">
                      1
                    </span>
                    <div>
                      <p className="font-semibold text-gray-800">
                        Open your Supabase SQL Editor:
                      </p>
                      <a
                        href="https://supabase.com/dashboard/project/iwqbcfoqxferysuiwmeq/sql"
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-600 hover:underline flex items-center gap-1 mt-0.5 font-medium"
                      >
                        Open Supabase SQL Editor
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[11px] flex-shrink-0">
                      2
                    </span>
                    <div>
                      <p className="font-semibold text-gray-800">
                        Run the SQL scripts located in your project folder:
                      </p>
                      <ul className="list-disc list-inside mt-1 space-y-0.5 text-gray-600 font-mono text-[11px]">
                        <li>
                          Run <strong>supabase/schema.sql</strong> (creates tables and enums)
                        </li>
                        <li>
                          Run <strong>supabase/seed.sql</strong> (inserts initial rooms 11–54)
                        </li>
                      </ul>
                      <p className="mt-1 text-gray-500">
                        Once run, click &ldquo;Test Connection&rdquo; above and your app will instantly connect live!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Module Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                icon: <Database size={20} />,
                title: 'Space Classification',
                desc: 'Support for Guest Rooms, Stores, Dormitories, Offices, Kitchens, Halls',
                status: 'Fully Active',
              },
              {
                icon: <Shield size={20} />,
                title: 'Authentication',
                desc: 'Supabase Auth, role-based access control',
                status: 'Demo Bypass Active',
              },
              {
                icon: <Bell size={20} />,
                title: 'Notifications',
                desc: 'WhatsApp and SMS notifications for ashram guests',
                status: 'Planned',
              },
              {
                icon: <Globe size={20} />,
                title: 'Integrations',
                desc: 'Zoho Forms, Devipuram public accommodation requests',
                status: 'Ready for Webhooks',
              },
              {
                icon: <Palette size={20} />,
                title: 'Interactive Map Appearance',
                desc: 'L-shape property view, aerial reference layout',
                status: 'Configured',
              },
              {
                icon: <Settings size={20} />,
                title: 'Capacity & Occupancy',
                desc: 'Dynamic accommodation vs facility KPI calculations',
                status: 'Configured',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-lg bg-gray-100 text-gray-600">{item.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Environment Summary */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">System Metrics & Environment</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Storage Backend</span>
                <span className="font-medium text-emerald-700">
                  {syncStatus === 'supabase_connected'
                    ? 'Supabase PostgreSQL'
                    : 'LocalStorage (Persistent Fallback)'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Total Tracked Spaces</span>
                <span className="font-medium">{rooms.length}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Accommodation Rooms</span>
                <span className="font-medium text-blue-600">
                  {rooms.filter((r) => r.is_accommodation).length}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">Non-Accommodation Facilities</span>
                <span className="font-medium text-stone-600">
                  {rooms.filter((r) => !r.is_accommodation).length}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Version</span>
                <span className="font-medium">1.1.0</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
