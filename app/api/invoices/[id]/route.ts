import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import { InvoiceModel } from '../../../../models/Invoice';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const doc = await InvoiceModel.findOne({ id }).lean();
  if (!doc) return NextResponse.json(null, { status: 404 });
  return NextResponse.json(doc);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const body = await req.json();
  await InvoiceModel.updateOne({ id }, { $set: body }, { upsert: true });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  await InvoiceModel.deleteOne({ id });
  return NextResponse.json({ ok: true });
}
