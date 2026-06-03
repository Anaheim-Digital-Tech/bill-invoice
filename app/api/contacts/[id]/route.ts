import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import { ContactModel } from '../../../../models/Contact';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await connectDB();
  const { id } = await params;
  await ContactModel.deleteOne({ id });
  return NextResponse.json({ ok: true });
}
