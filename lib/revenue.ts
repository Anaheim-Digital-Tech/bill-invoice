import type { InvoiceDoc } from './types';
import { calcTotals } from './utils';

const FINANCIAL_TYPES = new Set(['quotation', 'salesorder', 'invoice', 'receipt']);

export function docAmount(doc: InvoiceDoc): number {
  return calcTotals(doc.items, doc.discountPercent, doc.taxMode).total;
}

function hasActiveChildDoc(docId: string, allDocs: InvoiceDoc[]): boolean {
  return allDocs.some((d) => d.refDocId === docId && d.status !== 'cancelled');
}

/** นับยอดครั้งเดียวต่อธุรกรรม — ไม่นับ QT/SO ที่แปลงแล้ว, IV ที่มี RC */
export function shouldCountInRevenue(doc: InvoiceDoc, allDocs: InvoiceDoc[]): boolean {
  if (!FINANCIAL_TYPES.has(doc.docType)) return false;
  if (doc.status === 'cancelled') return false;

  if (doc.docType === 'receipt') return true;

  if (doc.docType === 'invoice') {
    return !allDocs.some(
      (r) => r.docType === 'receipt' && r.refDocId === doc.id && r.status !== 'cancelled'
    );
  }

  if (doc.docType === 'quotation' || doc.docType === 'salesorder') {
    return !hasActiveChildDoc(doc.id, allDocs);
  }

  return true;
}

export function isPaidRevenueDoc(doc: InvoiceDoc, allDocs: InvoiceDoc[]): boolean {
  return doc.status === 'paid' && shouldCountInRevenue(doc, allDocs);
}

export function sumPaidRevenue(docs: InvoiceDoc[]): number {
  return docs
    .filter((d) => isPaidRevenueDoc(d, docs))
    .reduce((s, d) => s + docAmount(d), 0);
}

export function sumPendingRevenue(docs: InvoiceDoc[]): number {
  return docs
    .filter((d) => {
      if (d.docType !== 'invoice' && d.docType !== 'salesorder') return false;
      if (d.status !== 'sent' && d.status !== 'overdue') return false;
      return shouldCountInRevenue(d, docs);
    })
    .reduce((s, d) => s + docAmount(d), 0);
}

export function sumRevenueDocs(docs: InvoiceDoc[]): number {
  return docs
    .filter((d) => shouldCountInRevenue(d, docs))
    .filter((d) => d.status !== 'cancelled')
    .reduce((s, d) => s + docAmount(d), 0);
}
