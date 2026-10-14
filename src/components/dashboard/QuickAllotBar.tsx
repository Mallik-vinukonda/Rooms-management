'use client';

import React from 'react';
import { Zap, Clock, Snowflake, BedDouble, CheckCircle, ChevronRight, AlertCircle } from 'lucide-react';
import type { RoomWithOccupancy } from '@/types';
import { getNextAvailableSummary } from '@/lib/checkout-utils';

interface QuickAllotBarProps {
  rooms: RoomWithOccupancy[];
  onRoomSelect: (room: RoomWithOccupancy) => void;
}

export default function QuickAllotBar({ rooms, onRoomSelect }: QuickAllotBarProps) {
  const summary = React.useMemo(() => getNextAvailableSummary(rooms), [rooms]);

  const hasImmediateAvailable =
    summary.readyAC.length > 0 || summary.readyNonAC.length > 0 || summary.readyDorm.length > 0;

  return (
    <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-stone-900 text-white rounded-xl p-3.5 shadow-md">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Section Header */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-400/30">
            <Zap size={16} className="text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-emerald-100 tracking-wide">Quick Allot Assistant</span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Next Available
              </span>
            </div>
            <p className="text-xs text-emerald-200/70">
              Click any room to open check-in drawer instantly
            </p>
          </div>
        </div>

        {/* Right: Quick categories */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* 1. Next AC Room */}
          <div className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 transition-colors border border-white/10 rounded-lg px-2.5 py-1.5">
            <Snowflake size={13} className="text-sky-300" />
            <span className="text-emerald-100 font-medium">Next AC:</span>
            {summary.readyAC.length > 0 ? (
              <button
                onClick={() => onRoomSelect(summary.readyAC[0])}
                className="font-bold text-white hover:text-emerald-300 underline underline-offset-2 flex items-center gap-0.5"
                title="Click to allot Room"
              >
                Room {summary.readyAC[0].room_number}
                <span className="text-[10px] font-normal text-emerald-300">({summary.readyAC.length} ready)</span>
              </button>
            ) : summary.openingToday.some((r) => r.has_ac) ? (
              <span className="text-amber-300 font-semibold flex items-center gap-1">
                <Clock size={11} />
                Room {summary.openingToday.find((r) => r.has_ac)?.room_number} (Out Today)
              </span>
            ) : (
              <span className="text-stone-400">All Full</span>
            )}
          </div>

          {/* 2. Next Non-AC Room */}
          <div className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 transition-colors border border-white/10 rounded-lg px-2.5 py-1.5">
            <BedDouble size={13} className="text-amber-300" />
            <span className="text-emerald-100 font-medium">Next Non-AC:</span>
            {summary.readyNonAC.length > 0 ? (
              <button
                onClick={() => onRoomSelect(summary.readyNonAC[0])}
                className="font-bold text-white hover:text-emerald-300 underline underline-offset-2 flex items-center gap-0.5"
                title="Click to allot Room"
              >
                Room {summary.readyNonAC[0].room_number}
                <span className="text-[10px] font-normal text-emerald-300">({summary.readyNonAC.length} ready)</span>
              </button>
            ) : summary.openingToday.some((r) => !r.has_ac && r.room_type !== 'dormitory') ? (
              <span className="text-amber-300 font-semibold flex items-center gap-1">
                <Clock size={11} />
                Room {summary.openingToday.find((r) => !r.has_ac && r.room_type !== 'dormitory')?.room_number} (Out Today)
              </span>
            ) : (
              <span className="text-stone-400">All Full</span>
            )}
          </div>

          {/* 3. Opening Today (Departures) */}
          {summary.openingToday.length > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-400/40 rounded-lg px-2.5 py-1.5 text-amber-200">
              <Clock size={13} className="text-amber-300" />
              <span className="font-semibold">
                {summary.openingToday.length} room{summary.openingToday.length > 1 ? 's' : ''} vacating today:
              </span>
              <div className="flex items-center gap-1">
                {summary.openingToday.slice(0, 3).map((r) => (
                  <button
                    key={r.room_number}
                    onClick={() => onRoomSelect(r)}
                    className="font-bold text-white hover:underline text-xs bg-amber-600/40 px-1.5 py-0.5 rounded"
                  >
                    R{r.room_number}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. Overdue departures */}
          {summary.overdueCheckouts.length > 0 && (
            <div className="flex items-center gap-1 bg-red-500/20 border border-red-400/40 rounded-lg px-2.5 py-1.5 text-red-200">
              <AlertCircle size={13} className="text-red-300" />
              <span className="font-bold">{summary.overdueCheckouts.length} Overdue</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
