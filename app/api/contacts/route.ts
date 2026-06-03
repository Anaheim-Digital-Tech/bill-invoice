import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/db';
import { ContactModel } from '../../../models/Contact';
import { COMPANY } from '../../../lib/constants';

const SEED = [
  {
    id: 'company-self',
    name: COMPANY.name,
    address: COMPANY.address,
    taxId: COMPANY.taxId,
    phone: COMPANY.contacts[0].phone,
    email: '',
  },
];

export async function GET() {
  await connectDB();
  let contacts = await ContactModel.find().sort({ createdAt: 1 }).lean();
  if (contacts.length === 0) {
    await ContactModel.insertMany(SEED);
    contacts = await ContactModel.find().sort({ createdAt: 1 }).lean();
  }
  return NextResponse.json(contacts);
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const existing = await ContactModel.findOne({ id: body.id });
  if (existing) {
    await ContactModel.updateOne({ id: body.id }, { $set: body });
  } else {
    await ContactModel.create(body);
  }
  return NextResponse.json({ ok: true });
}
