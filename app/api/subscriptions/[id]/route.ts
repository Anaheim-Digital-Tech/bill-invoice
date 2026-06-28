import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import { SubscriptionModel } from '../../../../models/Subscription';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;
  const sub = await SubscriptionModel.findOne({ id }).lean();
  if (!sub) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(sub);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;
  await SubscriptionModel.updateOne({ id }, { $set: { status: 'cancelled' } });
  return NextResponse.json({ ok: true });
}
