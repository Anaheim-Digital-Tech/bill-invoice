import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/db';
import { InvoiceModel } from '../../../models/Invoice';

export async function GET() {
  await connectDB();

  // Auto-mark overdue: sent docs ที่ dueDate < วันนี้
  const today = new Date().toISOString().split('T')[0];
  await InvoiceModel.updateMany(
    { status: 'sent', dueDate: { $lt: today } },
    { $set: { status: 'overdue' } }
  );

  const docs = await InvoiceModel.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(docs);
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const existing = await InvoiceModel.findOne({ id: body.id });
  if (existing) {
    await InvoiceModel.updateOne({ id: body.id }, { $set: body });
  } else {
    await InvoiceModel.create(body);
  }
  return NextResponse.json({ ok: true });
}
