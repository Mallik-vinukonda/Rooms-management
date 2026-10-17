import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

// GET: Fetch all reservations with associated room info
export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data: reservations, error } = await supabase
      .from('reservations')
      .select('*, room:rooms(*)')
      .order('expected_checkin', { ascending: true });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, reservations: reservations || [] });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST: Create a new advance reservation / pre-booking
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      roomId,
      roomNumber,
      guestName,
      guestPhone,
      numGuests = 1,
      expectedCheckin,
      expectedCheckout,
      notes,
      status = 'approved',
    } = body;

    if (!guestName || !guestName.trim()) {
      return NextResponse.json(
        { success: false, error: 'Guest name is required' },
        { status: 400 }
      );
    }

    if (!expectedCheckin || !expectedCheckout) {
      return NextResponse.json(
        { success: false, error: 'Check-in and check-out dates are required' },
        { status: 400 }
      );
    }

    const checkInDate = new Date(expectedCheckin);
    const checkOutDate = new Date(expectedCheckout);
    if (checkOutDate.getTime() <= checkInDate.getTime()) {
      return NextResponse.json(
        { success: false, error: 'Check-out date must be after check-in date' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 1. Resolve room ID if roomNumber is provided
    let resolvedRoomId = roomId || null;
    let targetRoom: any = null;

    if (!resolvedRoomId && roomNumber) {
      const { data: foundRoom } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_number', roomNumber)
        .single();
      if (foundRoom) {
        resolvedRoomId = foundRoom.id;
        targetRoom = foundRoom;
      }
    } else if (resolvedRoomId) {
      const { data: foundRoom } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', resolvedRoomId)
        .single();
      if (foundRoom) {
        targetRoom = foundRoom;
      }
    }

    // 2. Insert into reservations table
    const { data: newReservation, error: insertError } = await supabase
      .from('reservations')
      .insert({
        room_id: resolvedRoomId,
        guest_name: guestName.trim(),
        guest_phone: guestPhone?.trim() || null,
        num_guests: Number(numGuests) || 1,
        reservation_start: checkInDate.toISOString(),
        reservation_end: checkOutDate.toISOString(),
        expected_checkin: checkInDate.toISOString(),
        expected_checkout: checkOutDate.toISOString(),
        status,
        notes: notes?.trim() || '',
      })
      .select('*, room:rooms(*)')
      .single();

    if (insertError || !newReservation) {
      return NextResponse.json(
        { success: false, error: 'Failed to create reservation: ' + insertError?.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reservation: {
        ...newReservation,
        room: targetRoom || newReservation.room,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PATCH: Update reservation
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Reservation ID is required' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const payload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.status) payload.status = updates.status;
    if (updates.notes !== undefined) payload.notes = updates.notes;
    if (updates.guest_name) payload.guest_name = updates.guest_name;
    if (updates.guest_phone !== undefined) payload.guest_phone = updates.guest_phone;
    if (updates.num_guests !== undefined) payload.num_guests = updates.num_guests;
    if (updates.expected_checkin) {
      payload.expected_checkin = updates.expected_checkin;
      payload.reservation_start = updates.expected_checkin;
    }
    if (updates.expected_checkout) {
      payload.expected_checkout = updates.expected_checkout;
      payload.reservation_end = updates.expected_checkout;
    }
    if (updates.room_id !== undefined) payload.room_id = updates.room_id;

    const { data: updated, error } = await supabase
      .from('reservations')
      .update(payload)
      .eq('id', id)
      .select('*, room:rooms(*)')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, reservation: updated });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE: Cancel or remove reservation
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'id parameter is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Mark as cancelled rather than destructive delete
    const { data, error } = await supabase
      .from('reservations')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, cancelled: data });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
