import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import { processBilling } from '../../../../lib/billingEngine';

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json().catch(() => ({}));
  const { subscriptionId, force, period } = body as {
    subscriptionId?: string;
    force?: boolean;
    period?: string;
  };

  const result = await processBilling({ subscriptionId, force, period });
  return NextResponse.json(result);
}
