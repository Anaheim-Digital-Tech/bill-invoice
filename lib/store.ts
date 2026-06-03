import type { DocType, InvoiceDoc } from './types';
import { DOC_TYPE_PREFIX } from './constants';

const BASE = '/api/invoices';

export async function getAllDocs(): Promise<InvoiceDoc[]> {
  const res = await fetch(BASE, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export async function getDoc(id: string): Promise<InvoiceDoc | null> {
  const res = await fetch(`${BASE}/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export async function saveDoc(doc: InvoiceDoc): Promise<void> {
  await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(doc),
  });
}

export async function deleteDoc(id: string): Promise<void> {
  await fetch(`${BASE}/${id}`, { method: 'DELETE' });
}

export async function generateDocNumber(docType: DocType): Promise<string> {
  const prefix = DOC_TYPE_PREFIX[docType];
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const header = `${prefix}${yy}${mm}`;
  const all = await getAllDocs();
  const count = all.filter((d) => d.docNumber.startsWith(header)).length;
  return `${header}${String(count + 1).padStart(3, '0')}`;
}
