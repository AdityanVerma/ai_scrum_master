import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE } from '@/lib/auth/constants';

// Convenience only: sends visitors without a session cookie to /login.
// It does not check that the cookie is valid. The real protection is the
// check inside each API route (see src/lib/auth/dal.ts).
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = pathname === '/login' || pathname.startsWith('/api/auth/');

  if (isPublic || request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json(
      { success: false, error: 'Not signed in.' },
      { status: 401 },
    );
  }

  return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
