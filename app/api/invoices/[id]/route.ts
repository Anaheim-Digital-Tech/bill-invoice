import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import { InvoiceModel } from '../../../../models/Invoice';
import { OPERATIONAL_DOC_TYPES } from '../../../../lib/constants';

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
  const existing = await InvoiceModel.findOne({ id });
  if (existing) {
    body.docNumber = existing.docNumber;
  }
  await InvoiceModel.updateOne({ id }, { $set: body }, { upsert: true });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  const existing = await InvoiceModel.findOne({ id });
  if (existing && OPERATIONAL_DOC_TYPES.includes(existing.docType)) {
    return NextResponse.json({ ok: false, error: 'ไม่สามารถลบเอกสารประเภทนี้ได้' }, { status: 403 });
  }
  await InvoiceModel.deleteOne({ id });
  return NextResponse.json({ ok: true });
}
