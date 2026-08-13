'use client';

import { CheckCircle, User, CalendarClock, Wrench, Ban, Sparkles, CircleX } from 'lucide-react';

export default function Legend() {
  const items = [
    { icon: <CheckCircle size={12} />, label: 'Available', dotColor: 'bg-emerald-500' },
    { icon: <User size={12} />, label: 'Occupied', dotColor: 'bg-blue-500' },
    { icon: <User size={12} />, label: 'Partial', dotColor: 'bg-sky-500' },
    { icon: <CalendarClock size={12} />, label: 'Reserved', dotColor: 'bg-amber-500' },
    { icon: <Wrench size={12} />, label: 'Maintenance', dotColor: 'bg-red-500' },
    { icon: <Sparkles size={12} />, label: 'Cleaning Req.', dotColor: 'bg-violet-500' },
    { icon: <Ban size={12} />, label: 'Unavailable', dotColor: 'bg-gray-400' },
    { icon: <CircleX size={12} />, label: 'Non-Function.', dotColor: 'bg-gray-400' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
      <span className="font-medium text-gray-500">Legend:</span>
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span className={`status-dot ${item.dotColor}`} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
