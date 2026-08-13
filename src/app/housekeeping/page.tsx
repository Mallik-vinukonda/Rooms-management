'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { DEMO_ROOMS } from '@/lib/demo-data';
import { cleaningStatusConfig, formatDateTime } from '@/lib/utils';
import { Sparkles, CheckCircle, AlertTriangle, Loader } from 'lucide-react';
import type { RoomWithOccupancy } from '@/types';

export default function HousekeepingPage() {
  const [rooms, setRooms] = useState<RoomWithOccupancy[]>(DEMO_ROOMS);

  const cleaningRequired = rooms.filter(r => r.cleaning_status === 'cleaning_required');
  const cleaningInProgress = rooms.filter(r => r.cleaning_status === 'cleaning_in_progress');
  const clean = rooms.filter(r => r.cleaning_status === 'clean');

  const handleToggleCleaning = (roomId: string) => {
    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        return {
          ...r,
          cleaning_status: r.cleaning_status === 'clean' ? 'cleaning_required' : 'clean',
          last_cleaned_at: r.cleaning_status !== 'clean' ? new Date().toISOString() : r.last_cleaned_at,
        };
      }
      return r;
    }));
  };

  const RoomCleaningCard = ({ room }: { room: RoomWithOccupancy }) => {
    const conf = cleaningStatusConfig[room.cleaning_status];
    return (
      <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-gray-800">Room {room.room_number}</span>
          <span className={`badge ${conf.bgColor} ${conf.color}`}>
            {room.cleaning_status === 'clean' ? <CheckCircle size={12} /> :
             room.cleaning_status === 'cleaning_required' ? <AlertTriangle size={12} /> :
             <Loader size={12} />}
            {conf.label}
          </span>
          {room.last_cleaned_at && (
            <span className="text-xs text-gray-400">
              Last: {formatDateTime(room.last_cleaned_at)}
              {room.last_cleaned_by && ` by ${room.last_cleaned_by}`}
            </span>
          )}
        </div>
        <button
          onClick={() => handleToggleCleaning(room.id)}
          className={`action-btn text-xs ${
            room.cleaning_status === 'clean' ? '' : 'primary'
          }`}
        >
          <Sparkles size={13} />
          {room.cleaning_status === 'clean' ? 'Mark Dirty' : 'Mark Clean'}
        </button>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header rooms={rooms} />
        <main className="flex-1 p-4 md:p-6 space-y-5 overflow-auto">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Housekeeping</h2>
            <p className="text-sm text-gray-500">{cleaningRequired.length} rooms require cleaning</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="stat-card">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-500" />
                <span className="text-xs text-gray-500">Cleaning Required</span>
              </div>
              <span className="text-2xl font-bold text-amber-700">{cleaningRequired.length}</span>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-2">
                <Loader size={16} className="text-violet-500" />
                <span className="text-xs text-gray-500">In Progress</span>
              </div>
              <span className="text-2xl font-bold text-violet-700">{cleaningInProgress.length}</span>
            </div>
            <div className="stat-card">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-500" />
                <span className="text-xs text-gray-500">Clean</span>
              </div>
              <span className="text-2xl font-bold text-emerald-700">{clean.length}</span>
            </div>
          </div>

          {/* Rooms requiring cleaning first */}
          {cleaningRequired.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-amber-700 mb-2 flex items-center gap-2">
                <AlertTriangle size={14} />
                Requires Cleaning ({cleaningRequired.length})
              </h3>
              <div className="space-y-2">
                {cleaningRequired.map(room => <RoomCleaningCard key={room.id} room={room} />)}
              </div>
            </div>
          )}

          {/* Clean rooms */}
          <div>
            <h3 className="text-sm font-semibold text-emerald-700 mb-2 flex items-center gap-2">
              <CheckCircle size={14} />
              Clean ({clean.length})
            </h3>
            <div className="space-y-2">
              {clean.map(room => <RoomCleaningCard key={room.id} room={room} />)}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
