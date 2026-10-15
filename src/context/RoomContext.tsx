'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { RoomWithOccupancy, DashboardStats, RoomStatus, StayWithGuest } from '@/types';
import { DEMO_ROOMS } from '@/lib/demo-data';

export type SyncStatus = 'checking' | 'supabase_connected' | 'local_storage';

interface RoomContextType {
  rooms: RoomWithOccupancy[];
  isLoading: boolean;
  syncStatus: SyncStatus;
  supabaseError: string | null;
  updateRoom: (roomId: string, updates: Partial<RoomWithOccupancy>) => Promise<void>;
  resetRooms: () => void;
  refreshRooms: () => Promise<void>;
  addGuestToRoom: (
    roomId: string,
    guestData: {
      fullName: string;
      phone?: string;
      checkIn?: string;
      expectedCheckout?: string;
      notes?: string;
    }
  ) => Promise<{ success: boolean; error?: string }>;
  updateGuestStay: (
    stayId: string,
    updates: {
      fullName?: string;
      phone?: string;
      checkIn?: string;
      expectedCheckout?: string;
      notes?: string;
    }
  ) => Promise<{ success: boolean; error?: string }>;
  removeGuestFromRoom: (stayId: string, roomId: string) => Promise<{ success: boolean; error?: string }>;
  vacateRoom: (roomId: string) => Promise<{ success: boolean; error?: string }>;
  stats: DashboardStats;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'sri_villa_rooms_v4';

export function RoomProvider({ children }: { children: React.ReactNode }) {
  const [rooms, setRooms] = useState<RoomWithOccupancy[]>(DEMO_ROOMS);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('checking');
  const [supabaseError, setSupabaseError] = useState<string | null>(null);

  // Initialize data: check localStorage cache, then sync from /api/rooms
  const initData = useCallback(async () => {
    setIsLoading(true);

    // 1. Initial cached data from localStorage for zero-latency load
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRooms(parsed);
          }
        }
      } catch (err) {
        console.warn('Failed to read from localStorage:', err);
      }
    }

    // 2. Fetch live data from /api/rooms (connected to Supabase)
    try {
      const res = await fetch('/api/rooms', { cache: 'no-store' });
      const json = await res.json();

      if (json.success && Array.isArray(json.rooms) && json.rooms.length > 0) {
        setRooms(json.rooms);
        setSyncStatus('supabase_connected');
        setSupabaseError(null);
        if (typeof window !== 'undefined') {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(json.rooms));
        }
      } else {
        const msg = json.error || 'No rooms found in Supabase database';
        setSupabaseError(msg);
        setSyncStatus('local_storage');
      }
    } catch (err: any) {
      console.warn('Could not fetch from /api/rooms, using local storage mode:', err);
      setSupabaseError(err?.message || 'Could not connect to Supabase server');
      setSyncStatus('local_storage');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initData();
  }, [initData]);

  // Update room function: optimistic local update + persistent storage + live Supabase sync
  const updateRoom = useCallback(async (roomId: string, updates: Partial<RoomWithOccupancy>) => {
    // 1. Optimistic local state update
    setRooms((prev) => {
      const next = prev.map((r) => {
        if (r.id === roomId || r.room_number.toString() === roomId) {
          return { ...r, ...updates, updated_at: new Date().toISOString() };
        }
        return r;
      });

      // 2. Cache in localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
        } catch (e) {
          console.error('Failed to save to localStorage:', e);
        }
      }

      return next;
    });

    // 3. Sync live to Supabase via /api/rooms
    try {
      const currentRoom = rooms.find(
        (r) => r.id === roomId || r.room_number.toString() === roomId
      );

      const res = await fetch('/api/rooms', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: roomId,
          room_number: currentRoom?.room_number,
          updates,
        }),
      });

      const resJson = await res.json();
      if (!resJson.success) {
        console.warn('Supabase remote sync warning:', resJson.error);
      }
    } catch (err) {
      console.warn('Supabase network sync error (local changes preserved):', err);
    }
  }, [rooms]);

  // Add Guest: persist to Supabase /api/stays and update local state
  const addGuestToRoom = useCallback(
    async (
      roomId: string,
      guestData: {
        fullName: string;
        phone?: string;
        checkIn?: string;
        expectedCheckout?: string;
        notes?: string;
      }
    ) => {
      try {
        const targetRoom = rooms.find(
          (r) => r.id === roomId || r.room_number.toString() === roomId
        );

        const res = await fetch('/api/stays', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId,
            roomNumber: targetRoom?.room_number,
            fullName: guestData.fullName,
            phone: guestData.phone,
            checkIn: guestData.checkIn,
            expectedCheckout: guestData.expectedCheckout,
            notes: guestData.notes,
          }),
        });

        const json = await res.json();
        if (!json.success) {
          return { success: false, error: json.error || 'Failed to add guest' };
        }

        const newStay = json.stay;
        const newStatus = json.roomStatus;

        // Update local state
        setRooms((prev) => {
          const next = prev.map((r) => {
            if (r.id === roomId || r.room_number.toString() === roomId || (json.roomId && r.id === json.roomId)) {
              const currentStays = r.active_stays || [];
              const updatedStays = [...currentStays, newStay];
              const updatedGuestNames = [...r.current_guest_names, newStay.guest.full_name];
              return {
                ...r,
                active_stays: updatedStays,
                current_guest_names: updatedGuestNames,
                current_occupancy: updatedStays.length,
                status: (newStatus as RoomStatus) || (updatedStays.length >= r.capacity ? 'occupied' : 'partially_occupied'),
                updated_at: new Date().toISOString(),
              };
            }
            return r;
          });

          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
            } catch (e) {}
          }
          return next;
        });

        return { success: true };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Network error while adding guest' };
      }
    },
    [rooms]
  );

  // Update Guest: persist to Supabase /api/stays and update local state
  const updateGuestStay = useCallback(
    async (
      stayId: string,
      updates: {
        fullName?: string;
        phone?: string;
        checkIn?: string;
        expectedCheckout?: string;
        notes?: string;
      }
    ) => {
      try {
        const res = await fetch('/api/stays', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stayId,
            fullName: updates.fullName,
            phone: updates.phone,
            checkIn: updates.checkIn,
            expectedCheckout: updates.expectedCheckout,
            notes: updates.notes,
          }),
        });

        const json = await res.json();
        if (!json.success) {
          return { success: false, error: json.error || 'Failed to update guest' };
        }

        const updatedStay = json.stay;

        // Update local state
        setRooms((prev) => {
          const next = prev.map((r) => {
            if (r.active_stays?.some((s) => s.id === stayId)) {
              const updatedStays = r.active_stays.map((s) => (s.id === stayId ? updatedStay : s));
              const updatedGuestNames = updatedStays.map((s) => s.guest?.full_name).filter(Boolean);
              return {
                ...r,
                active_stays: updatedStays,
                current_guest_names: updatedGuestNames,
                updated_at: new Date().toISOString(),
              };
            }
            return r;
          });

          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
            } catch (e) {}
          }
          return next;
        });

        return { success: true };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Network error while updating guest' };
      }
    },
    []
  );

  // Remove Guest / Check Out: persist to Supabase /api/stays and update local state
  const removeGuestFromRoom = useCallback(
    async (stayId: string, roomId: string) => {
      try {
        const res = await fetch(`/api/stays?stayId=${encodeURIComponent(stayId)}`, {
          method: 'DELETE',
        });

        const json = await res.json();
        if (!json.success) {
          return { success: false, error: json.error || 'Failed to check out guest' };
        }

        const newStatus = json.roomStatus;

        // Update local state
        setRooms((prev) => {
          const next = prev.map((r) => {
            if (r.id === roomId || r.room_number.toString() === roomId || (json.roomId && r.id === json.roomId)) {
              const updatedStays = (r.active_stays || []).filter((s) => s.id !== stayId);
              const updatedGuestNames = updatedStays.map((s) => s.guest?.full_name).filter(Boolean);
              return {
                ...r,
                active_stays: updatedStays,
                current_guest_names: updatedGuestNames,
                current_occupancy: updatedStays.length,
                status:
                  (newStatus as RoomStatus) ||
                  (updatedStays.length === 0
                    ? 'vacant'
                    : updatedStays.length >= r.capacity
                    ? 'occupied'
                    : 'partially_occupied'),
                updated_at: new Date().toISOString(),
              };
            }
            return r;
          });

          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
            } catch (e) {}
          }
          return next;
        });

        return { success: true };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Network error while removing guest' };
      }
    },
    []
  );

  // Vacate Room: persist to Supabase /api/stays/vacate and update local state
  const vacateRoom = useCallback(
    async (roomId: string) => {
      try {
        const targetRoom = rooms.find(
          (r) => r.id === roomId || r.room_number.toString() === roomId
        );

        const res = await fetch('/api/stays/vacate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId,
            roomNumber: targetRoom?.room_number,
          }),
        });

        const json = await res.json();
        if (!json.success) {
          return { success: false, error: json.error || 'Failed to vacate room' };
        }

        // Update local state
        setRooms((prev) => {
          const next = prev.map((r) => {
            if (r.id === roomId || r.room_number.toString() === roomId || (json.roomId && r.id === json.roomId)) {
              return {
                ...r,
                active_stays: [],
                current_guest_names: [],
                current_occupancy: 0,
                status: 'vacant' as RoomStatus,
                updated_at: new Date().toISOString(),
              };
            }
            return r;
          });

          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
            } catch (e) {}
          }
          return next;
        });

        return { success: true };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Network error while vacating room' };
      }
    },
    [rooms]
  );

  // Reset to default seed
  const resetRooms = useCallback(() => {
    setRooms(DEMO_ROOMS);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEMO_ROOMS));
    }
  }, []);

  // Compute live statistics based on accommodation-only rooms
  const accommodationRooms = rooms.filter((r) => r.is_accommodation);
  const acRooms = accommodationRooms.filter((r) => r.has_ac);

  const stats: DashboardStats = {
    total_rooms: accommodationRooms.length,
    available: accommodationRooms.filter((r) => r.status === 'vacant').length,
    occupied: accommodationRooms.filter((r) => r.status === 'occupied').length,
    partially_occupied: accommodationRooms.filter((r) => r.status === 'partially_occupied').length,
    reserved: accommodationRooms.filter((r) => r.status === 'reserved').length,
    under_maintenance: accommodationRooms.filter((r) => r.status === 'under_maintenance').length,
    cleaning_required: accommodationRooms.filter((r) => r.cleaning_status === 'cleaning_required').length,
    non_functioning: accommodationRooms.filter((r) => r.status === 'non_functioning').length,
    unavailable: accommodationRooms.filter((r) => r.status === 'unavailable').length,
    total_ac_rooms: acRooms.length,
    ac_working: acRooms.filter((r) => r.ac_status === 'working').length,
    total_capacity: accommodationRooms.reduce((sum, r) => sum + r.capacity, 0),
    total_occupants: accommodationRooms.reduce((sum, r) => sum + r.current_occupancy, 0),
  };

  return (
    <RoomContext.Provider
      value={{
        rooms,
        isLoading,
        syncStatus,
        supabaseError,
        updateRoom,
        resetRooms,
        refreshRooms: initData,
        addGuestToRoom,
        updateGuestStay,
        removeGuestFromRoom,
        vacateRoom,
        stats,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}

export function useRooms() {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRooms must be used within a RoomProvider');
  }
  return context;
}
