import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import { processBilling } from '../../../../lib/billingEngine';

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get('authorization');

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  await connectDB();
  const result = await processBilling();
  return NextResponse.json({
    ok: true,
    at: new Date().toISOString(),
    ...result,
  });
}
