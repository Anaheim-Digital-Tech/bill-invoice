import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { timingSafeEqual } from 'crypto';

const PASSWORD = process.env.APP_PASSWORD ?? 'admin1234';
const SESSION_SECRET = process.env.SESSION_SECRET ?? 'insecure-default-change-me';
const SESSION_COOKIE = 'adt-session';

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

export async function POST(req: Request) {
  const { password } = await req.json();
  if (!safeCompare(password, PASSWORD)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, SESSION_SECRET, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });
  return NextResponse.json({ ok: true });
}
