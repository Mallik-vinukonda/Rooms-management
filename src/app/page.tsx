'use client';

import { useState, useCallback } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import DashboardStatsCards, { AttentionAlerts } from '@/components/dashboard/DashboardStats';
import DashboardFilters from '@/components/dashboard/DashboardFilters';
import Legend from '@/components/dashboard/Legend';
import RoomMap from '@/components/rooms/RoomMap';
import RoomDetailsDrawer from '@/components/rooms/RoomDetailsDrawer';
import { DEMO_ROOMS, calculateDemoStats } from '@/lib/demo-data';
import type { RoomWithOccupancy } from '@/types';

export default function DashboardPage() {
  const [rooms, setRooms] = useState<RoomWithOccupancy[]>(DEMO_ROOMS);
  const [selectedRoom, setSelectedRoom] = useState<RoomWithOccupancy | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const stats = calculateDemoStats();

  // Recalculate stats from current room state
  const accommodationRooms = rooms.filter(r => r.is_accommodation);
  const currentStats = {
    ...stats,
    available: accommodationRooms.filter(r => r.status === 'vacant').length,
    occupied: accommodationRooms.filter(r => r.status === 'occupied').length,
    partially_occupied: accommodationRooms.filter(r => r.status === 'partially_occupied').length,
    reserved: accommodationRooms.filter(r => r.status === 'reserved').length,
    under_maintenance: accommodationRooms.filter(r => r.status === 'under_maintenance').length,
    cleaning_required: accommodationRooms.filter(r => r.cleaning_status === 'cleaning_required').length,
    non_functioning: accommodationRooms.filter(r => r.status === 'non_functioning').length,
    ac_working: accommodationRooms.filter(r => r.has_ac && r.ac_status === 'working').length,
    total_ac_rooms: accommodationRooms.filter(r => r.has_ac).length,
    total_occupants: accommodationRooms.reduce((sum, r) => sum + r.current_occupancy, 0),
    total_capacity: accommodationRooms.reduce((sum, r) => sum + r.capacity, 0),
  };

  const handleRoomClick = useCallback((room: RoomWithOccupancy) => {
    setSelectedRoom(room);
  }, []);

  const handleUpdateRoom = useCallback((roomId: string, updates: Partial<RoomWithOccupancy>) => {
    setRooms(prev => prev.map(r => {
      if (r.id === roomId) {
        const updated = { ...r, ...updates };
        // If this is the selected room, update it too
        setSelectedRoom(current => current?.id === roomId ? updated : current);
        return updated;
      }
      return r;
    }));
  }, []);

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
          onClose={() => setSelectedRoom(null)}
          onUpdateRoom={handleUpdateRoom}
        />
      )}
    </div>
  );
}
