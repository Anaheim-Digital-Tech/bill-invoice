import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/db';
import { InvoiceModel } from '../../../models/Invoice';
import { ARCHIVE_AFTER_YEARS, OPERATIONAL_DOC_TYPES } from '../../../lib/constants';

function archiveCutoffISO(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - ARCHIVE_AFTER_YEARS);
  return d.toISOString().split('T')[0];
}

export async function GET(req: Request) {
  await connectDB();

  const today = new Date().toISOString().split('T')[0];
  await InvoiceModel.updateMany(
    { status: 'sent', dueDate: { $lt: today } },
    { $set: { status: 'overdue' } }
  );

  const cutoff = archiveCutoffISO();
  await InvoiceModel.updateMany(
    {
      docType: { $in: OPERATIONAL_DOC_TYPES },
      issueDate: { $lt: cutoff },
      isArchive: { $ne: true },
    },
    { $set: { isArchive: true } }
  );

  const { searchParams } = new URL(req.url);
  const includeArchive = searchParams.get('includeArchive') === '1';

  const query = includeArchive ? {} : { isArchive: { $ne: true } };
  const docs = await InvoiceModel.find(query).sort({ createdAt: -1 }).lean();
  return NextResponse.json(docs);
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();

  if (OPERATIONAL_DOC_TYPES.includes(body.docType)) {
    body.isArchive = body.isArchive ?? false;
    body.taxMode = body.taxMode ?? 'none';
  }

  const existing = await InvoiceModel.findOne({ id: body.id });
  if (existing) {
    if (OPERATIONAL_DOC_TYPES.includes(existing.docType)) {
      body.docNumber = existing.docNumber;
    }
    await InvoiceModel.updateOne({ id: body.id }, { $set: body });
  } else {
    await InvoiceModel.create(body);
  }
  return NextResponse.json({ ok: true });
}
