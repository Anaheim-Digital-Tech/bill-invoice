import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import { generateDocNumber } from '../../../../lib/docNumber';
import { DOC_TYPE_PREFIX } from '../../../../lib/constants';
import type { DocType } from '../../../../lib/types';

export async function GET(req: Request) {
  await connectDB();
  const docType = new URL(req.url).searchParams.get('docType') as DocType | null;
  if (!docType || !(docType in DOC_TYPE_PREFIX)) {
    return NextResponse.json({ error: 'invalid docType' }, { status: 400 });
  }
  const docNumber = await generateDocNumber(docType);
  return NextResponse.json({ docNumber });
}
