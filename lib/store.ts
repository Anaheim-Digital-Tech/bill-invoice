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

export interface SaveDocResult {
  ok: boolean;
  receiptDocNumber?: string;
}

export async function saveDoc(doc: InvoiceDoc): Promise<SaveDocResult> {
  try {
    const res = await fetch(BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc),
    });
    checkAuth(res);
    if (!res.ok) return { ok: false };
    const data = await res.json().catch(() => ({}));
    return { ok: true, receiptDocNumber: data.receiptDocNumber as string | undefined };
  } catch {
    return { ok: false };
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

export async function getReceiptForInvoice(invoiceId: string): Promise<InvoiceDoc | null> {
  try {
    const res = await fetch(`${BASE}/${invoiceId}/receipt`, { cache: 'no-store' });
    checkAuth(res);
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function createReceiptFromInvoiceId(
  invoiceId: string
): Promise<{ receipt: InvoiceDoc | null; error?: string }> {
  try {
    const res = await fetch(`${BASE}/${invoiceId}/receipt`, { method: 'POST' });
    checkAuth(res);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { receipt: null, error: (data as { error?: string }).error ?? 'request failed' };
    }
    return { receipt: data as InvoiceDoc };
  } catch {
    return { receipt: null, error: 'network error' };
  }
}

export async function generateDocNumber(docType: DocType): Promise<string> {
  try {
    const res = await fetch(`${BASE}/next-number?docType=${docType}`, { cache: 'no-store' });
    checkAuth(res);
    if (!res.ok) throw new Error('failed');
    const data = await res.json();
    return data.docNumber as string;
  } catch {
    const prefix = DOC_TYPE_PREFIX[docType];
    const now = new Date();
    const yy = String(now.getFullYear()).slice(2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const header = `${prefix}${yy}${mm}`;
    const all = await getAllDocs();
    const count = all.filter((d) => d.docNumber.startsWith(header)).length;
    return `${header}${String(count + 1).padStart(3, '0')}`;
  }
}
