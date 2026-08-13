import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // ============================================================
  // DEMO MODE: Auth middleware is disabled.
  // When Supabase is configured, uncomment the block below
  // to enable authentication and session management.
  // ============================================================

  // import { updateSession } from '@/lib/supabase/middleware';
  // return await updateSession(request);

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
