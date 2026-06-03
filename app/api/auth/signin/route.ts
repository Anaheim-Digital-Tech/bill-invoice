import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const PASSWORD = process.env.APP_PASSWORD ?? 'admin1234';
const SESSION_COOKIE = 'adt-session';

export async function POST(req: Request) {
  const { password } = await req.json();
  if (password !== PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 วัน
    path: '/',
  });
  return NextResponse.json({ ok: true });
}
