import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createAdminClient();

    // 1. Fetch all rooms
    const { data: dbRooms, error: roomsError } = await supabase
      .from('rooms')
      .select('*')
      .order('room_number', { ascending: true });

    if (roomsError) {
      return NextResponse.json(
        { success: false, error: roomsError.message },
        { status: 500 }
      );
    }

    if (!dbRooms || dbRooms.length === 0) {
      return NextResponse.json({ success: true, rooms: [] });
    }

    // 2. Fetch active stays with guest details
    let activeStays: any[] = [];
    try {
      const { data: staysData } = await supabase
        .from('stays')
        .select('*, guest:guests(*)')
        .eq('status', 'active');
      if (staysData) {
        activeStays = staysData.map((stay: any) => {
          let expected_checkout = stay.expected_checkout || null;
          let notes = stay.notes || '';
          if (!expected_checkout && notes) {
            try {
              const parsed = JSON.parse(notes);
              if (parsed && typeof parsed === 'object') {
                if (parsed.expected_checkout) expected_checkout = parsed.expected_checkout;
                if (parsed.note !== undefined) notes = parsed.note;
              }
            } catch {}
          }
          return {
            ...stay,
            expected_checkout,
            notes,
          };
        });
      }
    } catch (e) {
      console.warn('Could not fetch stays, proceeding with rooms:', e);
    }

    // 3. Merge occupancy and active stays
    const enrichedRooms = dbRooms.map((room) => {
      const roomStays = activeStays.filter((s) => s.room_id === room.id);
      const guestNames = roomStays
        .map((s) => s.guest?.full_name)
        .filter(Boolean);

      return {
        ...room,
        current_occupancy: roomStays.length,
        current_guest_names: guestNames,
        active_stays: roomStays,
      };
    });

    return NextResponse.json({ success: true, rooms: enrichedRooms });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, room_number, updates } = body;

    if (!id && !room_number) {
      return NextResponse.json(
        { success: false, error: 'id or room_number is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const payload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    const allowedFields = [
      'room_type',
      'purpose',
      'capacity',
      'floor',
      'building',
      'status',
      'has_ac',
      'ac_status',
      'cleaning_status',
      'last_cleaned_at',
      'last_cleaned_by',
      'notes',
      'is_accommodation',
      'map_position',
      'display_order',
    ];

    for (const key of allowedFields) {
      if (key in updates) {
        payload[key] = updates[key];
      }
    }

    let query = supabase.from('rooms').update(payload);

    if (room_number) {
      query = query.eq('room_number', room_number);
    } else {
      query = query.eq('id', id);
    }

    const { data, error } = await query.select();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (payload.status === 'vacant' && data && data[0]) {
      try {
        await supabase
          .from('stays')
          .update({
            status: 'checked_out',
            check_out: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('room_id', data[0].id)
          .eq('status', 'active');
      } catch (e) {
        console.warn('Could not checkout stays for vacated room:', e);
      }
    }

    return NextResponse.json({ success: true, updated: data });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
