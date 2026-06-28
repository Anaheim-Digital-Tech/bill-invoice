import { NextResponse } from 'next/server';
import { connectDB } from '../../../../../lib/db';
import { InvoiceModel } from '../../../../../models/Invoice';
import { createReceiptFromInvoice } from '../../../../../lib/billingEngine';
import type { InvoiceDoc } from '../../../../../lib/types';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;
  const receipt = await InvoiceModel.findOne({ refDocId: id, docType: 'receipt' }).lean();
  if (!receipt) return NextResponse.json(null, { status: 404 });
  return NextResponse.json(receipt);
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;
  const invoice = await InvoiceModel.findOne({ id }).lean();
  if (!invoice) return NextResponse.json({ error: 'not found' }, { status: 404 });
  if (invoice.docType !== 'invoice') {
    return NextResponse.json({ error: 'only invoice can become receipt' }, { status: 400 });
  }

  const receipt = await createReceiptFromInvoice(invoice as InvoiceDoc);
  if (!receipt) {
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
  return NextResponse.json(receipt);
}
