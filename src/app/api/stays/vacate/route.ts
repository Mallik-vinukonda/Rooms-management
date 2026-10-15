import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { roomId, roomNumber } = body;

    if (!roomId && !roomNumber) {
      return NextResponse.json(
        { success: false, error: 'roomId or roomNumber is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 1. Resolve room
    let roomQuery = supabase.from('rooms').select('id, room_number');
    if (roomId && roomId.length === 36 && roomId.includes('-')) {
      roomQuery = roomQuery.eq('id', roomId);
    } else if (roomNumber) {
      roomQuery = roomQuery.eq('room_number', roomNumber);
    } else {
      roomQuery = roomQuery.eq('id', roomId);
    }

    const { data: room, error: roomError } = await roomQuery.single();
    if (roomError || !room) {
      return NextResponse.json(
        { success: false, error: 'Room not found in database' },
        { status: 404 }
      );
    }

    // 2. Mark all active stays for room as checked_out
    const { error: staysError } = await supabase
      .from('stays')
      .update({
        status: 'checked_out',
        check_out: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('room_id', room.id)
      .eq('status', 'active');

    if (staysError) {
      return NextResponse.json(
        { success: false, error: 'Failed to update stays: ' + staysError.message },
        { status: 500 }
      );
    }

    // 3. Mark room as vacant
    const { error: updateRoomError } = await supabase
      .from('rooms')
      .update({
        status: 'vacant',
        updated_at: new Date().toISOString(),
      })
      .eq('id', room.id);

    if (updateRoomError) {
      return NextResponse.json(
        { success: false, error: 'Failed to update room: ' + updateRoomError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      roomId: room.id,
      roomNumber: room.room_number,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
