'use client';

import {
  BedDouble,
  CheckCircle,
  User as UserIcon,
  Users,
  CalendarClock,
  Wrench,
  Sparkles,
  Snowflake,
  AlertTriangle,
  BarChart3,
} from 'lucide-react';
import type { DashboardStats } from '@/types';

interface DashboardStatsProps {
  stats: DashboardStats;
  onFilterClick?: (filter: string) => void;
}

export default function DashboardStatsCards({ stats, onFilterClick }: DashboardStatsProps) {
  const cards = [
    {
      label: 'Total Rooms',
      value: stats.total_rooms,
      icon: <BedDouble size={20} className="text-gray-500" />,
      color: 'text-gray-900',
      filter: 'all',
    },
    {
      label: 'Available',
      value: stats.available,
      icon: <CheckCircle size={20} className="text-emerald-500" />,
      color: 'text-emerald-700',
      bgAccent: 'bg-emerald-50',
      filter: 'vacant',
    },
    {
      label: 'Occupied',
      value: stats.occupied + stats.partially_occupied,
      subtitle: stats.partially_occupied > 0 ? `(${stats.partially_occupied} partial)` : undefined,
      icon: <UserIcon size={20} className="text-blue-500" />,
      color: 'text-blue-700',
      bgAccent: 'bg-blue-50',
      filter: 'occupied',
    },
    {
      label: 'Reserved',
      value: stats.reserved,
      icon: <CalendarClock size={20} className="text-amber-500" />,
      color: 'text-amber-700',
      bgAccent: 'bg-amber-50',
      filter: 'reserved',
    },
    {
      label: 'Maintenance',
      value: stats.under_maintenance,
      icon: <Wrench size={20} className="text-red-500" />,
      color: 'text-red-700',
      bgAccent: 'bg-red-50',
      filter: 'under_maintenance',
    },
    {
      label: 'Cleaning Req.',
      value: stats.cleaning_required,
      icon: <Sparkles size={20} className="text-violet-500" />,
      color: 'text-violet-700',
      bgAccent: 'bg-violet-50',
      filter: 'cleaning_required',
    },
    {
      label: 'AC Working',
      value: `${stats.ac_working}/${stats.total_ac_rooms}`,
      icon: <Snowflake size={20} className="text-sky-500" />,
      color: stats.ac_working < stats.total_ac_rooms ? 'text-amber-700' : 'text-sky-700',
      bgAccent: stats.ac_working < stats.total_ac_rooms ? 'bg-amber-50' : 'bg-sky-50',
      filter: 'ac_issue',
    },
    {
      label: 'Occupancy',
      value: `${stats.total_occupants}/${stats.total_capacity}`,
      icon: <BarChart3 size={20} className="text-indigo-500" />,
      color: 'text-indigo-700',
      bgAccent: 'bg-indigo-50',
      filter: null,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {cards.map((card) => (
        <button
          key={card.label}
          onClick={() => card.filter && onFilterClick?.(card.filter)}
          className={`stat-card hover:shadow-sm transition-shadow ${card.filter ? 'cursor-pointer' : 'cursor-default'}`}
        >
          <div className="flex items-center justify-between">
            {card.icon}
          </div>
          <div className={`text-xl font-bold ${card.color} mt-1`}>
            {card.value}
          </div>
          <div className="text-xs text-gray-500 leading-tight">
            {card.label}
            {card.subtitle && (
              <span className="text-gray-400 ml-1">{card.subtitle}</span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

// ---------- Attention Alerts ----------

interface AttentionAlertsProps {
  stats: DashboardStats;
  rooms: { room_number: number; status: string; has_ac: boolean; ac_status: string; cleaning_status: string; current_occupancy: number; capacity: number }[];
}

export function AttentionAlerts({ stats, rooms }: AttentionAlertsProps) {
  const alerts: { icon: React.ReactNode; message: string; color: string; borderColor: string; bgColor: string }[] = [];

  const acIssues = stats.total_ac_rooms - stats.ac_working;
  if (acIssues > 0) {
    alerts.push({
      icon: <Snowflake size={16} />,
      message: `${acIssues} room${acIssues > 1 ? 's' : ''} with AC issues`,
      color: 'text-red-700',
      borderColor: 'border-red-200',
      bgColor: 'bg-red-50',
    });
  }

  if (stats.cleaning_required > 0) {
    alerts.push({
      icon: <Sparkles size={16} />,
      message: `${stats.cleaning_required} room${stats.cleaning_required > 1 ? 's' : ''} require cleaning`,
      color: 'text-amber-700',
      borderColor: 'border-amber-200',
      bgColor: 'bg-amber-50',
    });
  }

  if (stats.under_maintenance > 0) {
    alerts.push({
      icon: <Wrench size={16} />,
      message: `${stats.under_maintenance} room${stats.under_maintenance > 1 ? 's' : ''} under maintenance`,
      color: 'text-red-700',
      borderColor: 'border-red-200',
      bgColor: 'bg-red-50',
    });
  }

  const overCapacity = rooms.filter(r => r.current_occupancy > r.capacity);
  if (overCapacity.length > 0) {
    alerts.push({
      icon: <AlertTriangle size={16} />,
      message: `${overCapacity.length} room${overCapacity.length > 1 ? 's' : ''} over capacity`,
      color: 'text-orange-700',
      borderColor: 'border-orange-200',
      bgColor: 'bg-orange-50',
    });
  }

  if (alerts.length === 0) {
    return (
      <div className="attention-card border-emerald-200 bg-emerald-50 text-emerald-700">
        <CheckCircle size={16} />
        All systems operational — no issues require attention
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle size={14} className="text-amber-600" />
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Attention Required</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {alerts.map((alert, i) => (
          <div key={i} className={`attention-card ${alert.borderColor} ${alert.bgColor} ${alert.color}`}>
            {alert.icon}
            {alert.message}
          </div>
        ))}
      </div>
    </div>
  );
}
