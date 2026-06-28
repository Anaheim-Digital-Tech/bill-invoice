import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/db';
import { SubscriptionModel } from '../../../models/Subscription';

export async function GET() {
  await connectDB();
  const subs = await SubscriptionModel.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(subs);
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const existing = await SubscriptionModel.findOne({ id: body.id });
  if (existing) {
    await SubscriptionModel.updateOne({ id: body.id }, { $set: body });
  } else {
    await SubscriptionModel.create(body);
  }
  return NextResponse.json({ ok: true });
}
