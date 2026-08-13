'use client';

import { User, Snowflake, Wrench, Ban, CircleX, CalendarClock, Sparkles, CheckCircle, AlertTriangle, Minus } from 'lucide-react';
import type { RoomWithOccupancy } from '@/types';
import { roomStatusConfig, roomTypeLabels, acStatusConfig } from '@/lib/utils';

interface RoomCardProps {
  room: RoomWithOccupancy;
  onClick?: (room: RoomWithOccupancy) => void;
  compact?: boolean;
}

const statusColorVars: Record<string, string> = {
  vacant: '#10b981',
  occupied: '#3b82f6',
  partially_occupied: '#0ea5e9',
  reserved: '#f59e0b',
  under_maintenance: '#ef4444',
  cleaning: '#8b5cf6',
  unavailable: '#9ca3af',
  non_functioning: '#9ca3af',
};

export default function RoomCard({ room, onClick, compact = false }: RoomCardProps) {
  const statusConf = roomStatusConfig[room.status];
  const typeLabel = roomTypeLabels[room.room_type] || room.room_type;
  const acConf = room.has_ac ? acStatusConfig[room.ac_status] : null;

  if (!room.is_accommodation) {
    const shortPurpose = room.purpose === 'Mega Kitchen' ? 'KITCHEN' :
                         room.purpose === 'Classroom' ? 'CLASS' :
                         room.purpose === 'Meeting Hall' ? 'HALL' :
                         room.purpose === 'Office' ? 'OFFICE' :
                         room.purpose === 'Storage' ? 'STORE' :
                         room.purpose === 'Staff Room' ? 'STAFF' : room.purpose.toUpperCase();

    if (compact) {
      return (
        <button
          onClick={() => onClick?.(room)}
          className="room-card flex flex-col gap-1 min-w-[80px] bg-stone-100/70 border-dashed border-stone-300 hover:border-stone-400"
          style={{ '--room-status-color': '#78716c' } as React.CSSProperties}
          title={`Room ${room.room_number} — ${room.purpose}`}
        >
          <div className="flex items-center justify-between pl-2">
            <span className="text-xs font-bold text-stone-600">{room.room_number}</span>
          </div>
          <div className="pl-2 pb-1 text-[10px] font-bold text-stone-500 tracking-wider uppercase">
            {shortPurpose}
          </div>
        </button>
      );
    }

    return (
      <button
        onClick={() => onClick?.(room)}
        className="room-card flex flex-col gap-1.5 w-full text-left bg-stone-100/70 border-dashed border-stone-300 hover:border-stone-400"
        style={{ '--room-status-color': '#78716c' } as React.CSSProperties}
      >
        <div className="flex items-center justify-between pl-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-stone-800">{room.room_number}</span>
            <span className="badge bg-stone-200 text-stone-700 border border-stone-300">
              {room.purpose}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 pl-2 text-xs text-stone-500">
          <span>Non-Accommodation</span>
        </div>
      </button>
    );
  }

  // Occupancy icons
  const renderOccupancy = () => {
    if (room.current_occupancy === 0) return null;
    if (room.current_occupancy <= 3) {
      return (
        <div className="flex items-center gap-0.5">
          {Array.from({ length: room.current_occupancy }).map((_, i) => (
            <User key={i} size={12} className="text-blue-600" fill="currentColor" />
          ))}
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-xs text-blue-600">
        <User size={12} fill="currentColor" />
        <span className="font-medium">×{room.current_occupancy}</span>
      </div>
    );
  };

  // AC indicator
  const renderAC = () => {
    if (!room.has_ac) return null;
    if (room.ac_status === 'working') {
      return <Snowflake size={11} className="text-sky-500" />;
    }
    if (room.ac_status === 'not_working') {
      return <Snowflake size={11} className="text-red-400" />;
    }
    if (room.ac_status === 'under_repair') {
      return <Wrench size={11} className="text-amber-500" />;
    }
    return null;
  };

  // Cleaning indicator
  const renderCleaning = () => {
    if (room.cleaning_status === 'clean') {
      return <CheckCircle size={11} className="text-emerald-500" />;
    }
    if (room.cleaning_status === 'cleaning_required') {
      return <AlertTriangle size={11} className="text-amber-500" />;
    }
    return <Sparkles size={11} className="text-violet-500" />;
  };

  // Status icon
  const StatusIcon = () => {
    switch (room.status) {
      case 'vacant': return <CheckCircle size={12} className={statusConf.color} />;
      case 'occupied': return <User size={12} className={statusConf.color} />;
      case 'partially_occupied': return <User size={12} className={statusConf.color} />;
      case 'reserved': return <CalendarClock size={12} className={statusConf.color} />;
      case 'under_maintenance': return <Wrench size={12} className={statusConf.color} />;
      case 'cleaning': return <Sparkles size={12} className={statusConf.color} />;
      case 'unavailable': return <Ban size={12} className={statusConf.color} />;
      case 'non_functioning': return <CircleX size={12} className={statusConf.color} />;
      default: return <Minus size={12} />;
    }
  };

  if (compact) {
    return (
      <button
        onClick={() => onClick?.(room)}
        className="room-card flex flex-col gap-1 min-w-[80px]"
        style={{ '--room-status-color': statusColorVars[room.status] } as React.CSSProperties}
        title={`Room ${room.room_number} — ${statusConf.label}`}
      >
        <div className="flex items-center justify-between pl-2">
          <span className="text-xs font-bold text-gray-800">{room.room_number}</span>
          <StatusIcon />
        </div>
        <div className="flex items-center justify-between pl-2">
          {renderOccupancy()}
          <div className="flex items-center gap-1">
            {renderAC()}
            {renderCleaning()}
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={() => onClick?.(room)}
      className="room-card flex flex-col gap-1.5 w-full text-left"
      style={{ '--room-status-color': statusColorVars[room.status] } as React.CSSProperties}
    >
      {/* Header */}
      <div className="flex items-center justify-between pl-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-800">{room.room_number}</span>
          <span className={`badge ${statusConf.bgColor} ${statusConf.color}`}>
            <StatusIcon />
            {statusConf.label}
          </span>
        </div>
      </div>

      {/* Type & Capacity */}
      <div className="flex items-center gap-2 pl-2 text-xs text-gray-500">
        <span>{typeLabel}</span>
        <span>·</span>
        <span>{room.current_occupancy}/{room.capacity}</span>
      </div>

      {/* Occupancy */}
      <div className="pl-2">
        {renderOccupancy()}
      </div>

      {/* Footer icons */}
      <div className="flex items-center gap-2 pl-2 border-t border-gray-100 pt-1.5 mt-0.5">
        {renderAC()}
        {renderCleaning()}
        {room.has_ac && (
          <span className="text-[10px] text-gray-400 ml-auto">
            {acConf?.label}
          </span>
        )}
      </div>
    </button>
  );
}
