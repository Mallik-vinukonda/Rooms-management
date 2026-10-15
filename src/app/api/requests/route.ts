import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

// GET: Fetch all accommodation requests from Supabase accommodation_requests table
export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data: requests, error } = await supabase
      .from('accommodation_requests')
      .select('*, assigned_room:rooms(id, room_number, room_type)')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, requests: requests || [] });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST: Create a new accommodation request in accommodation_requests table
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      guest_name,
      guest_phone,
      guest_email,
      num_guests,
      preferred_room_type,
      preferred_checkin,
      preferred_checkout,
      purpose,
      notes,
      source,
    } = body;

    if (!guest_name || !guest_name.trim()) {
      return NextResponse.json(
        { success: false, error: 'guest_name is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('accommodation_requests')
      .insert({
        guest_name: guest_name.trim(),
        guest_phone: guest_phone?.trim() || null,
        guest_email: guest_email?.trim() || null,
        num_guests: Math.max(1, parseInt(num_guests) || 1),
        preferred_room_type: preferred_room_type || 'non_ac',
        preferred_checkin: preferred_checkin || new Date().toISOString(),
        preferred_checkout: preferred_checkout || null,
        purpose: purpose?.trim() || '',
        notes: notes?.trim() || '',
        status: 'new',
        source: source || 'manual',
      })
      .select('*, assigned_room:rooms(id, room_number, room_type)')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, request: data });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PATCH: Update request status or room assignment in accommodation_requests table
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, assigned_room_id, notes } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'id is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (status !== undefined) updates.status = status;
    if (assigned_room_id !== undefined) updates.assigned_room_id = assigned_room_id || null;
    if (notes !== undefined) updates.notes = notes;

    const { data, error } = await supabase
      .from('accommodation_requests')
      .update(updates)
      .eq('id', id)
      .select('*, assigned_room:rooms(id, room_number, room_type)')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, request: data });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete an accommodation request
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'id is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from('accommodation_requests')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
