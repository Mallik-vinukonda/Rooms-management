'use client';

import { useState, useCallback } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import DashboardStatsCards, { AttentionAlerts } from '@/components/dashboard/DashboardStats';
import DashboardFilters from '@/components/dashboard/DashboardFilters';
import Legend from '@/components/dashboard/Legend';
import QuickAllotBar from '@/components/dashboard/QuickAllotBar';
import RoomMap from '@/components/rooms/RoomMap';
import RoomDetailsDrawer from '@/components/rooms/RoomDetailsDrawer';
import { useRooms } from '@/context/RoomContext';
import type { RoomWithOccupancy } from '@/types';

export default function DashboardPage() {
  const { rooms, stats: currentStats, updateRoom } = useRooms();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const selectedRoom = rooms.find(r => r.id === selectedRoomId) || null;

  const handleRoomClick = useCallback((room: RoomWithOccupancy) => {
    setSelectedRoomId(room.id);
  }, []);

  const handleUpdateRoom = useCallback((roomId: string, updates: Partial<RoomWithOccupancy>) => {
    updateRoom(roomId, updates);
  }, [updateRoom]);

  const handleFilterClick = useCallback((filter: string) => {
    setStatusFilter(filter);
  }, []);

  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header rooms={rooms} onRoomSelect={handleRoomClick} />

        <main className="flex-1 p-4 md:p-6 space-y-5 overflow-auto">
          {/* Stats Cards */}
          <DashboardStatsCards stats={currentStats} onFilterClick={handleFilterClick} />

          {/* Attention Alerts */}
          <AttentionAlerts stats={currentStats} rooms={rooms} />

          {/* Next Available Quick Allot Assistant */}
          <QuickAllotBar rooms={rooms} onRoomSelect={handleRoomClick} />

          {/* Filters */}
          <div className="space-y-3">
            <DashboardFilters activeFilter={statusFilter} onFilterChange={setStatusFilter} />
            <Legend />
          </div>

          {/* Property Map */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6">
            <RoomMap
              rooms={rooms}
              onRoomClick={handleRoomClick}
              statusFilter={statusFilter}
            />
          </div>
        </main>
      </div>

      {/* Room Details Drawer */}
      {selectedRoom && (
        <RoomDetailsDrawer
          room={selectedRoom}
          onClose={() => setSelectedRoomId(null)}
          onUpdateRoom={handleUpdateRoom}
        />
      )}
    </div>
  );
}
