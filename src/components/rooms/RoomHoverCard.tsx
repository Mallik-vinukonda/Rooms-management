'use client';

import React from 'react';
import { User, Snowflake, CheckCircle, Sparkles, AlertTriangle, Wrench, Clock, Calendar, Phone, ArrowRight } from 'lucide-react';
import type { RoomWithOccupancy } from '@/types';
import { roomTypeLabels } from '@/lib/utils';
import { getRoomAvailability } from '@/lib/checkout-utils';

interface RoomHoverCardProps {
  room: RoomWithOccupancy;
  children: React.ReactNode;
}

export default function RoomHoverCard({ room, children }: RoomHoverCardProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [position, setPosition] = React.useState<'top' | 'bottom'>('top');
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const availability = React.useMemo(() => getRoomAvailability(room), [room]);
  const typeLabel = roomTypeLabels[room.room_type] || room.room_type;

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    // Snappy 120ms delay so it doesn't flicker while mouse travels
    hoverTimeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        // If too close to viewport top, show below
        if (rect.top < 240) {
          setPosition('bottom');
        } else {
          setPosition('top');
        }
      }
      setIsOpen(true);
    }, 120);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 100);
  };

  React.useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  return (
    <div
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {/* Floating Hover Card */}
      {isOpen && (
        <div
          className={`
            absolute z-50 left-1/2 -translate-x-1/2 w-72 pointer-events-none
            animate-in fade-in zoom-in-95 duration-150
            ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'}
          `}
          style={{ filter: 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.12))' }}
        >
          <div className="bg-white rounded-xl border border-gray-200 shadow-xl p-3.5 text-left text-xs space-y-2.5">
            {/* Header: Room Number, Type, Location */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-gray-900 text-sm">Room {room.room_number}</span>
                  <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-stone-100 text-stone-700">
                    {room.floor} fl
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 font-medium">{typeLabel}</p>
              </div>

              {/* Status Badge */}
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${availability.statusBadgeBg} ${availability.statusBadgeColor} border-current/20`}>
                {availability.statusBadgeText}
              </span>
            </div>

            {/* Next Availability Highlight */}
            <div className="bg-stone-50 border border-stone-200/80 rounded-lg p-2 flex items-center justify-between">
              <span className="text-[10px] font-semibold text-stone-500 flex items-center gap-1 uppercase tracking-wide">
                <Clock size={11} className="text-emerald-600" />
                Next Available
              </span>
              <span className={`font-bold text-[11px] ${availability.isReadyNow ? 'text-emerald-700' : 'text-stone-800'}`}>
                {availability.nextAvailableText}
              </span>
            </div>

            {/* Guest & Checkout Details (If Occupied) */}
            {availability.guestSummary && (
              <div className="bg-blue-50/60 border border-blue-100 rounded-lg p-2 space-y-1.5 text-blue-950">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-semibold text-xs">
                    <User size={12} className="text-blue-600" />
                    <span>{availability.guestSummary.name}</span>
                  </div>
                  {availability.guestSummary.phone && (
                    <span className="text-[10px] text-blue-700 flex items-center gap-0.5">
                      <Phone size={9} />
                      {availability.guestSummary.phone}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-blue-100/60 text-blue-800">
                  <div>
                    <span className="text-blue-500 block">Check-in:</span>
                    <span className="font-medium">{availability.guestSummary.checkInFormatted}</span>
                  </div>
                  <div>
                    <span className="text-blue-500 block">Check-out:</span>
                    <span className={`font-bold ${availability.guestSummary.isToday ? 'text-amber-700 font-extrabold' : ''}`}>
                      {availability.guestSummary.checkoutFormatted}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Features & Condition Row */}
            <div className="flex items-center justify-between text-[11px] text-gray-500 pt-0.5">
              <div className="flex items-center gap-1">
                <User size={12} className="text-gray-400" />
                <span>{room.current_occupancy}/{room.capacity} beds</span>
              </div>

              {room.has_ac && (
                <div className="flex items-center gap-1">
                  <Snowflake size={11} className={room.ac_status === 'working' ? 'text-sky-500' : 'text-red-500'} />
                  <span className={room.ac_status === 'working' ? 'text-sky-700' : 'text-red-700 font-medium'}>
                    AC {room.ac_status === 'working' ? 'OK' : 'Issue'}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-1">
                {room.cleaning_status === 'clean' ? (
                  <>
                    <CheckCircle size={11} className="text-emerald-500" />
                    <span className="text-emerald-700 font-medium">Clean</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={11} className="text-purple-500" />
                    <span className="text-purple-700 font-medium">Needs Clean</span>
                  </>
                )}
              </div>
            </div>

            {/* Footer prompt */}
            <div className="text-[10px] text-stone-400 text-center flex items-center justify-center gap-1 pt-1 border-t border-gray-100">
              <span>Click to {availability.isReadyNow ? 'check-in guest' : 'view room details'}</span>
              <ArrowRight size={10} />
            </div>
          </div>

          {/* Tooltip arrow */}
          <div
            className={`
              absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-gray-200 rotate-45
              ${position === 'top' ? 'bottom-[-6px] border-r border-b' : 'top-[-6px] border-l border-t'}
            `}
          />
        </div>
      )}
    </div>
  );
}
