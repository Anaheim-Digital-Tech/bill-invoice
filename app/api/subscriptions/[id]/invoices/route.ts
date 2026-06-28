import { NextResponse } from 'next/server';
import { connectDB } from '../../../../../lib/db';
import { InvoiceModel } from '../../../../../models/Invoice';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;
  const invoices = await InvoiceModel.find({
    subscriptionId: id,
    docType: 'invoice',
  })
    .sort({ billingPeriod: -1, createdAt: -1 })
    .lean();
  return NextResponse.json(invoices);
}
