import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

function formatStay(stay: any) {
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
}

// GET: Fetch all active stays with guest details
export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data: stays, error } = await supabase
      .from('stays')
      .select('*, guest:guests(*)')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const formatted = (stays || []).map(formatStay);
    return NextResponse.json({ success: true, stays: formatted });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST: Add new guest and check in to room
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { roomId, roomNumber, fullName, phone, checkIn, expectedCheckout, notes } = body;

    if (!fullName || !fullName.trim()) {
      return NextResponse.json(
        { success: false, error: 'Guest full name is required' },
        { status: 400 }
      );
    }

    if (!roomId && !roomNumber) {
      return NextResponse.json(
        { success: false, error: 'Room ID or room number is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 1. Resolve room
    let roomQuery = supabase
      .from('rooms')
      .select('id, room_number, capacity, status, is_accommodation');

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

    // 2. Insert guest into guests table
    const { data: guest, error: guestError } = await supabase
      .from('guests')
      .insert({
        full_name: fullName.trim(),
        phone: phone?.trim() || null,
        notes: notes?.trim() || '',
      })
      .select()
      .single();

    if (guestError || !guest) {
      return NextResponse.json(
        { success: false, error: 'Failed to create guest: ' + guestError?.message },
        { status: 500 }
      );
    }

    // 3. Prepare notes with expected checkout metadata
    const stayNotesPayload = JSON.stringify({
      expected_checkout: expectedCheckout || null,
      note: notes?.trim() || '',
    });

    // 4. Insert stay record
    const { data: stay, error: stayError } = await supabase
      .from('stays')
      .insert({
        room_id: room.id,
        guest_id: guest.id,
        check_in: checkIn || new Date().toISOString(),
        status: 'active',
        source: 'manual',
        notes: stayNotesPayload,
      })
      .select('*, guest:guests(*)')
      .single();

    if (stayError || !stay) {
      // Cleanup guest on failure
      await supabase.from('guests').delete().eq('id', guest.id);
      return NextResponse.json(
        { success: false, error: 'Failed to record stay: ' + stayError?.message },
        { status: 500 }
      );
    }

    // 5. Update room status based on active stays count
    const { data: activeStays } = await supabase
      .from('stays')
      .select('id')
      .eq('room_id', room.id)
      .eq('status', 'active');

    const activeCount = activeStays?.length || 1;
    let newStatus = room.status;
    if (
      room.status === 'vacant' ||
      room.status === 'occupied' ||
      room.status === 'partially_occupied'
    ) {
      newStatus = activeCount >= room.capacity ? 'occupied' : 'partially_occupied';
    }

    await supabase
      .from('rooms')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', room.id);

    return NextResponse.json({
      success: true,
      stay: formatStay(stay),
      roomStatus: newStatus,
      occupancy: activeCount,
      roomId: room.id,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PATCH: Edit existing guest & stay details
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { stayId, fullName, phone, checkIn, expectedCheckout, notes } = body;

    if (!stayId) {
      return NextResponse.json(
        { success: false, error: 'stayId is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 1. Fetch current stay
    const { data: existingStay, error: findError } = await supabase
      .from('stays')
      .select('*, guest:guests(*)')
      .eq('id', stayId)
      .single();

    if (findError || !existingStay) {
      return NextResponse.json(
        { success: false, error: 'Stay record not found' },
        { status: 404 }
      );
    }

    // 2. Update guest in guests table
    const guestUpdates: any = { updated_at: new Date().toISOString() };
    if (fullName !== undefined && fullName.trim()) guestUpdates.full_name = fullName.trim();
    if (phone !== undefined) guestUpdates.phone = phone.trim() || null;
    if (notes !== undefined) guestUpdates.notes = notes.trim();

    const { error: guestError } = await supabase
      .from('guests')
      .update(guestUpdates)
      .eq('id', existingStay.guest_id);

    if (guestError) {
      return NextResponse.json(
        { success: false, error: 'Failed to update guest: ' + guestError.message },
        { status: 500 }
      );
    }

    // 3. Update stay in stays table
    let existingMeta: any = {};
    try {
      existingMeta = JSON.parse(existingStay.notes || '{}');
      if (typeof existingMeta !== 'object' || existingMeta === null) existingMeta = {};
    } catch {
      existingMeta = {};
    }

    if (expectedCheckout !== undefined) existingMeta.expected_checkout = expectedCheckout;
    if (notes !== undefined) existingMeta.note = notes;

    const stayUpdates: any = {
      updated_at: new Date().toISOString(),
      notes: JSON.stringify(existingMeta),
    };
    if (checkIn) stayUpdates.check_in = checkIn;

    const { data: updatedStay, error: stayError } = await supabase
      .from('stays')
      .update(stayUpdates)
      .eq('id', stayId)
      .select('*, guest:guests(*)')
      .single();

    if (stayError || !updatedStay) {
      return NextResponse.json(
        { success: false, error: 'Failed to update stay: ' + stayError?.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      stay: formatStay(updatedStay),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE: Check out guest from stay
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let stayId = searchParams.get('stayId');

    if (!stayId) {
      try {
        const body = await request.json();
        stayId = body.stayId;
      } catch {}
    }

    if (!stayId) {
      return NextResponse.json(
        { success: false, error: 'stayId is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 1. Fetch current stay
    const { data: existingStay, error: findError } = await supabase
      .from('stays')
      .select('id, room_id, guest_id, status')
      .eq('id', stayId)
      .single();

    if (findError || !existingStay) {
      return NextResponse.json(
        { success: false, error: 'Stay not found' },
        { status: 404 }
      );
    }

    // 2. Mark stay as checked_out
    const { error: checkoutError } = await supabase
      .from('stays')
      .update({
        status: 'checked_out',
        check_out: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', stayId);

    if (checkoutError) {
      return NextResponse.json(
        { success: false, error: 'Failed to checkout stay: ' + checkoutError.message },
        { status: 500 }
      );
    }

    // 3. Recount remaining active stays for room
    const { data: remainingStays } = await supabase
      .from('stays')
      .select('id')
      .eq('room_id', existingStay.room_id)
      .eq('status', 'active');

    const count = remainingStays?.length || 0;

    const { data: room } = await supabase
      .from('rooms')
      .select('capacity, status')
      .eq('id', existingStay.room_id)
      .single();

    let newStatus = room?.status || 'vacant';
    let newCleaningStatus: string | undefined = undefined;
    if (count === 0) {
      newStatus = 'vacant';
      newCleaningStatus = 'cleaning_required';
    } else if (room && count >= room.capacity) {
      newStatus = 'occupied';
    } else {
      newStatus = 'partially_occupied';
    }

    const roomUpdates: Record<string, any> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };
    if (newCleaningStatus) {
      roomUpdates.cleaning_status = newCleaningStatus;
    }

    await supabase
      .from('rooms')
      .update(roomUpdates)
      .eq('id', existingStay.room_id);

    return NextResponse.json({
      success: true,
      roomId: existingStay.room_id,
      remainingCount: count,
      roomStatus: newStatus,
      cleaningStatus: newCleaningStatus,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
