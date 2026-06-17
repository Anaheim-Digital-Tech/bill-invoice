import type { DocType, InvoiceDoc } from './types';
import { DOC_TYPE_PREFIX } from './constants';

const BASE = '/api/invoices';

/** ถ้า session หมด (401) โยน error พิเศษเพื่อให้ caller redirect ไป /signin */
function checkAuth(res: Response) {
  if (res.status === 401) {
    if (typeof window !== 'undefined') window.location.href = '/signin';
    throw new Error('Unauthorized');
  }
}

export async function getAllDocs(includeArchive = false): Promise<InvoiceDoc[]> {
  try {
    const url = includeArchive ? `${BASE}?includeArchive=1` : BASE;
    const res = await fetch(url, { cache: 'no-store' });
    checkAuth(res);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getDoc(id: string): Promise<InvoiceDoc | null> {
  try {
    const res = await fetch(`${BASE}/${id}`, { cache: 'no-store' });
    checkAuth(res);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function saveDoc(doc: InvoiceDoc): Promise<boolean> {
  try {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc),
    });
    checkAuth(res);
    return res.ok;
  } catch {
    return false;
  }
}

export async function deleteDoc(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
    checkAuth(res);
    return res.ok;
  } catch {
    return false;
  }
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
