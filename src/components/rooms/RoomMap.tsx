'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Building, Layers, Map as MapIcon } from 'lucide-react';
import type { RoomWithOccupancy } from '@/types';
import type { FloorFilter } from '@/types';
import { FLOOR_CONFIGS, getCorridorPairs } from '@/lib/room-layout';
import RoomCard from './RoomCard';

interface RoomMapProps {
  rooms: RoomWithOccupancy[];
  onRoomClick: (room: RoomWithOccupancy) => void;
  activeFilter?: FloorFilter | 'aerial';
  statusFilter?: string;
}

export default function RoomMap({ rooms, onRoomClick, activeFilter = 'all', statusFilter }: RoomMapProps) {
  const [selectedFloor, setSelectedFloor] = useState<FloorFilter | 'aerial'>(activeFilter);

  const roomByNumber = new Map<number, RoomWithOccupancy>();
  rooms.forEach(r => roomByNumber.set(r.room_number, r));

  // Apply status filter
  const filteredRoomNumbers = new Set(
    rooms
      .filter(r => {
        if (!statusFilter || statusFilter === 'all') return true;
        if (statusFilter === 'ac_issue') return r.has_ac && r.ac_status !== 'working' && r.ac_status !== 'not_applicable';
        if (statusFilter === 'cleaning_required') return r.cleaning_status === 'cleaning_required';
        if (statusFilter === 'ac') return r.has_ac;
        if (statusFilter === 'non_ac') return !r.has_ac;
        if (statusFilter === 'dormitory') return r.room_type === 'dormitory';
        return r.status === statusFilter;
      })
      .map(r => r.room_number)
  );

  const floorsToShow = selectedFloor === 'all'
    ? FLOOR_CONFIGS
    : selectedFloor === 'aerial'
    ? []
    : FLOOR_CONFIGS.filter(f => f.id === selectedFloor);

  return (
    <div>
      {/* Floor Tabs */}
      <div className="flex items-center gap-1 mb-5 border-b border-gray-200 pb-0">
        {[
          { id: 'all' as FloorFilter | 'aerial', label: 'All Buildings', icon: <Layers size={14} />, showCount: true },
          ...FLOOR_CONFIGS.map(f => ({
            id: f.id as FloorFilter | 'aerial',
            label: f.shortLabel,
            icon: <Building size={14} />,
            showCount: true,
          })),
          { id: 'aerial' as FloorFilter | 'aerial', label: 'Aerial View', icon: <MapIcon size={14} />, showCount: false },
        ].map((tab) => {
          const count = tab.id === 'all'
            ? rooms.length
            : tab.id === 'aerial'
            ? 0
            : rooms.filter(r => {
                const floorConf = FLOOR_CONFIGS.find(f => f.id === tab.id);
                return floorConf?.buildings.some(b => b.rooms.includes(r.room_number));
              }).length;

          return (
            <button
              key={tab.id}
              onClick={() => setSelectedFloor(tab.id)}
              className={`
                flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors
                ${selectedFloor === tab.id
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {tab.icon}
              {tab.label}
              {tab.showCount && (
                <span className={`text-xs ml-1 px-1.5 py-0.5 rounded-full ${
                  selectedFloor === tab.id ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Floor Plans */}
      <div className="space-y-8">
        {selectedFloor === 'aerial' ? (
          <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl border border-gray-200">
            <div className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <MapIcon size={16} />
              Sri Villa Guest House — Aerial Reference (L-Shaped building)
            </div>
            <div className="relative overflow-hidden rounded-xl border border-gray-300 shadow-sm max-w-full" style={{ width: '400px', height: '400px' }}>
              <Image
                src="/devipuram-badge.jpeg"
                alt="Sri Villa Guest House Aerial Layout"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <p className="text-xs text-stone-500 mt-4 text-center max-w-md">
              The property structure consists of an L-shaped building: Wing A (rooms 11-20) horizontal, and Wing B (rooms 30-39) vertical, with the upper block corridor at the top.
            </p>
          </div>
        ) : (
          floorsToShow.map((floor) => (
          <div key={floor.id}>
            {/* Floor Header */}
            <div className="floor-header mb-3">
              <Building size={14} />
              {floor.label}
            </div>            {/* Buildings */}
            {floor.buildings.map((building) => {
              return (
                <div key={building.id} className="mb-5 last:mb-0">
                  <div className="text-xs font-medium text-stone-500 mb-2">{building.label}</div>
                  <div className="flex flex-wrap gap-2">
                    {building.rooms.map((roomNum) => {
                      const room = roomByNumber.get(roomNum);
                      if (!room) return null;
                      const dimmed = statusFilter && statusFilter !== 'all' && !filteredRoomNumbers.has(roomNum);
                      return (
                        <div key={roomNum} className={`flex-shrink-0 ${dimmed ? 'opacity-25' : ''}`}>
                          <RoomCard room={room} onClick={onRoomClick} compact />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )))}
      </div>
    </div>
  );
}
