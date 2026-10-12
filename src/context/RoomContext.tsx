'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { RoomWithOccupancy, DashboardStats } from '@/types';
import { DEMO_ROOMS, calculateDemoStats } from '@/lib/demo-data';
import { createClient } from '@/lib/supabase/client';

export type SyncStatus = 'checking' | 'supabase_connected' | 'local_storage';

interface RoomContextType {
  rooms: RoomWithOccupancy[];
  isLoading: boolean;
  syncStatus: SyncStatus;
  supabaseError: string | null;
  updateRoom: (roomId: string, updates: Partial<RoomWithOccupancy>) => Promise<void>;
  resetRooms: () => void;
  refreshRooms: () => Promise<void>;
  stats: DashboardStats;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'sri_villa_rooms_v1';

export function RoomProvider({ children }: { children: React.ReactNode }) {
  const [rooms, setRooms] = useState<RoomWithOccupancy[]>(DEMO_ROOMS);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('checking');
  const [supabaseError, setSupabaseError] = useState<string | null>(null);

  // Initialize data: check localStorage first, then verify Supabase
  const initData = useCallback(async () => {
    setIsLoading(true);
    let initialRooms: RoomWithOccupancy[] = DEMO_ROOMS;

    // 1. Check local storage
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            initialRooms = parsed;
            setRooms(parsed);
          }
        }
      } catch (err) {
        console.warn('Failed to read from localStorage:', err);
      }
    }

    // 2. Try Supabase
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from('rooms').select('*').order('room_number', { ascending: true });

      if (error) {
        console.info('Supabase rooms table not ready, using persistent local storage mode:', error.message);
        setSupabaseError(error.message);
        setSyncStatus('local_storage');
        // Ensure localStorage has the rooms
        if (typeof window !== 'undefined' && !localStorage.getItem(LOCAL_STORAGE_KEY)) {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialRooms));
        }
      } else if (data && data.length > 0) {
        // Successfully connected to Supabase and fetched rooms!
        // Merge Supabase room fields with in-memory occupancy/guest mappings
        const merged: RoomWithOccupancy[] = data.map((dbRoom) => {
          const localMatch = initialRooms.find(r => r.room_number === dbRoom.room_number);
          return {
            id: dbRoom.id || `room-${dbRoom.room_number}`,
            room_number: dbRoom.room_number,
            room_type: dbRoom.room_type || 'non_ac',
            purpose: dbRoom.purpose || 'Guest Room',
            capacity: dbRoom.capacity ?? 2,
            floor: dbRoom.floor || 'ground',
            building: dbRoom.building || 'main_wing_a',
            status: dbRoom.status || 'vacant',
            has_ac: dbRoom.has_ac ?? false,
            ac_status: dbRoom.ac_status || 'not_applicable',
            cleaning_status: dbRoom.cleaning_status || 'clean',
            last_cleaned_at: dbRoom.last_cleaned_at || null,
            last_cleaned_by: dbRoom.last_cleaned_by || null,
            notes: dbRoom.notes || '',
            is_accommodation: dbRoom.is_accommodation ?? true,
            map_position: dbRoom.map_position || (localMatch?.map_position ?? { row: 0, col: 0, section: 'wing_a' }),
            display_order: dbRoom.display_order ?? dbRoom.room_number,
            created_at: dbRoom.created_at || new Date().toISOString(),
            updated_at: dbRoom.updated_at || new Date().toISOString(),
            current_occupancy: localMatch?.current_occupancy ?? 0,
            current_guest_names: localMatch?.current_guest_names ?? [],
            active_stays: localMatch?.active_stays ?? [],
          };
        });

        setRooms(merged);
        setSyncStatus('supabase_connected');
        setSupabaseError(null);
        if (typeof window !== 'undefined') {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
        }
      } else {
        // Table exists but is empty
        setSyncStatus('supabase_connected');
        setSupabaseError('Supabase table "rooms" exists but has 0 records. Run seed.sql to populate.');
      }
    } catch (err: any) {
      console.warn('Supabase initialization check error:', err);
      setSupabaseError(err?.message || 'Could not connect to Supabase');
      setSyncStatus('local_storage');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initData();
  }, [initData]);

  // Update room function: optimistic update, persists to localStorage, syncs to Supabase if connected
  const updateRoom = useCallback(async (roomId: string, updates: Partial<RoomWithOccupancy>) => {
    setRooms(prev => {
      const next = prev.map(r => {
        if (r.id === roomId || r.room_number.toString() === roomId) {
          const updated = { ...r, ...updates, updated_at: new Date().toISOString() };
          return updated;
        }
        return r;
      });

      // Save to localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
        } catch (e) {
          console.error('Failed to save to localStorage:', e);
        }
      }

      return next;
    });

    // If Supabase is connected, sync updates
    if (syncStatus === 'supabase_connected') {
      try {
        const supabase = createClient();
        const payload: Record<string, any> = {
          updated_at: new Date().toISOString(),
        };

        if ('room_type' in updates) payload.room_type = updates.room_type;
        if ('purpose' in updates) payload.purpose = updates.purpose;
        if ('capacity' in updates) payload.capacity = updates.capacity;
        if ('status' in updates) payload.status = updates.status;
        if ('has_ac' in updates) payload.has_ac = updates.has_ac;
        if ('ac_status' in updates) payload.ac_status = updates.ac_status;
        if ('cleaning_status' in updates) payload.cleaning_status = updates.cleaning_status;
        if ('notes' in updates) payload.notes = updates.notes;
        if ('is_accommodation' in updates) payload.is_accommodation = updates.is_accommodation;

        // Try updating by id first, or fallback to room_number
        const currentRoom = rooms.find(r => r.id === roomId || r.room_number.toString() === roomId);
        if (currentRoom) {
          await supabase.from('rooms').update(payload).eq('room_number', currentRoom.room_number);
        }
      } catch (err) {
        console.warn('Supabase remote sync warning (local storage succeeded):', err);
      }
    }
  }, [syncStatus, rooms]);

  // Reset to default seed
  const resetRooms = useCallback(() => {
    setRooms(DEMO_ROOMS);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEMO_ROOMS));
    }
  }, []);

  // Compute live statistics based on accommodation-only rooms
  const accommodationRooms = rooms.filter(r => r.is_accommodation);
  const acRooms = accommodationRooms.filter(r => r.has_ac);

  const stats: DashboardStats = {
    total_rooms: accommodationRooms.length,
    available: accommodationRooms.filter(r => r.status === 'vacant').length,
    occupied: accommodationRooms.filter(r => r.status === 'occupied').length,
    partially_occupied: accommodationRooms.filter(r => r.status === 'partially_occupied').length,
    reserved: accommodationRooms.filter(r => r.status === 'reserved').length,
    under_maintenance: accommodationRooms.filter(r => r.status === 'under_maintenance').length,
    cleaning_required: accommodationRooms.filter(r => r.cleaning_status === 'cleaning_required').length,
    non_functioning: accommodationRooms.filter(r => r.status === 'non_functioning').length,
    unavailable: accommodationRooms.filter(r => r.status === 'unavailable').length,
    total_ac_rooms: acRooms.length,
    ac_working: acRooms.filter(r => r.ac_status === 'working').length,
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
