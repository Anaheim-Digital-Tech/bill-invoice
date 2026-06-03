import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/signin', '/api/auth/signin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths and static assets
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/logo') ||
    pathname.startsWith('/kbank') ||
    pathname.startsWith('/banks-logo') ||
    pathname.startsWith('/api/auth')
  ) {
    return NextResponse.next();
  }

  const session = request.cookies.get('adt-session');
  const SESSION_SECRET = process.env.SESSION_SECRET ?? 'insecure-default-change-me';
  const authenticated = !!session?.value && session.value === SESSION_SECRET;

  if (!authenticated) {
    // API routes → 401 JSON (ไม่ redirect เพื่อป้องกัน SyntaxError ใน fetch)
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Page routes → redirect ไป signin
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
