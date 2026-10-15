'use client';

import { CheckCircle, User, CalendarClock, Wrench, Ban, Sparkles, CircleX } from 'lucide-react';

interface LegendProps {
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
}

export default function Legend({ activeFilter, onFilterChange }: LegendProps = {}) {
  const items = [
    { icon: <CheckCircle size={12} />, label: 'Available', dotColor: 'bg-emerald-500', filterId: 'vacant' },
    { icon: <User size={12} />, label: 'Occupied', dotColor: 'bg-blue-500', filterId: 'occupied' },
    { icon: <User size={12} />, label: 'Partial', dotColor: 'bg-sky-500', filterId: 'partially_occupied' },
    { icon: <CalendarClock size={12} />, label: 'Reserved', dotColor: 'bg-amber-500', filterId: 'reserved' },
    { icon: <Wrench size={12} />, label: 'Maintenance', dotColor: 'bg-red-500', filterId: 'under_maintenance' },
    { icon: <Sparkles size={12} />, label: 'Cleaning Req.', dotColor: 'bg-violet-500', filterId: 'cleaning_required' },
    { icon: <Ban size={12} />, label: 'Unavailable', dotColor: 'bg-gray-400', filterId: 'unavailable' },
    { icon: <CircleX size={12} />, label: 'Non-Function.', dotColor: 'bg-gray-400', filterId: 'non_functioning' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-600">
      <span className="font-medium text-gray-500 mr-1 select-none">Legend:</span>
      {items.map((item) => {
        const isActive = activeFilter === item.filterId;
        return (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              if (onFilterChange) {
                onFilterChange(isActive ? 'all' : item.filterId);
              }
            }}
            className={`
              flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all text-xs
              ${onFilterChange ? 'cursor-pointer' : 'cursor-default'}
              ${
                isActive
                  ? 'bg-gray-900 text-white border-gray-900 font-medium shadow-xs'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
            `}
            title={onFilterChange ? `Filter by ${item.label} (click to toggle)` : undefined}
          >
            <span
              className={`status-dot ${item.dotColor} ${
                isActive ? 'ring-1 ring-white' : ''
              }`}
            />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
