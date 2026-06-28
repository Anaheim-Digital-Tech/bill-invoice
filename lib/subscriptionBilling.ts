import type { InvoiceDoc, Subscription, TaxMode } from './types';
import { THAI_MONTHS } from './constants';
import { addDaysISO, todayISO, uid } from './utils';

export function periodFromDate(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function thaiPeriodLabel(period: string): string {
  const [y, m] = period.split('-').map(Number);
  return `${THAI_MONTHS[m - 1]} ${y + 543}`;
}

export function shouldBillSubscription(sub: Subscription, today = new Date()): boolean {
  if (sub.status !== 'active') return false;
  const todayStr = todayISOFromDate(today);
  if (sub.startDate > todayStr) return false;
  if (sub.endDate && sub.endDate < todayStr) return false;

  const period = periodFromDate(today);
  if (sub.lastBilledPeriod === period) return false;

  const day = today.getDate();
  return day >= sub.billingDay;
}

function todayISOFromDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function buildInvoiceFromSubscription(
  sub: Subscription,
  period: string,
  docNumber: string
): InvoiceDoc {
  const periodLabel = thaiPeriodLabel(period);
  const description = sub.description.includes('{period}')
    ? sub.description.replace('{period}', periodLabel)
    : `${sub.description} (${periodLabel})`;

  const issueDate = todayISO();
  const now = new Date().toISOString();

  return {
    id: uid(),
    docNumber,
    docType: 'invoice',
    issueDate,
    dueDate: addDaysISO(issueDate, sub.dueDays),
    status: 'sent',
    customerName: sub.customerName,
    customerAddress: sub.customerAddress,
    customerTaxId: sub.customerTaxId,
    customerPhone: sub.customerPhone,
    customerEmail: sub.customerEmail,
    items: [
      {
        id: uid(),
        description,
        qty: sub.qty,
        unit: sub.unit,
        unitPrice: sub.monthlyAmount,
      },
    ],
    discountPercent: sub.discountPercent,
    taxMode: sub.taxMode as TaxMode,
    notes: sub.notes ? `${sub.notes}\nงวด: ${periodLabel}` : `งวด: ${periodLabel}`,
    subscriptionId: sub.id,
    billingPeriod: period,
    createdAt: now,
    updatedAt: now,
  };
}
