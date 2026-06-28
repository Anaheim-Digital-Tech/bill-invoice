import type { InvoiceDoc, Subscription } from './types';
import { THAI_MONTHS } from './constants';
import { addDaysISO, todayISO, uid } from './utils';

export function periodFromDate(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function thaiPeriodLabel(period: string): string {
  const [y, m] = period.split('-').map(Number);
  return `${THAI_MONTHS[m - 1]} ${y + 543}`;
}

export function daysInMonth(y: number, m: number): number {
  return new Date(y, m, 0).getDate();
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function getPeriodBounds(period: string): { start: string; end: string } {
  const [y, m] = period.split('-').map(Number);
  const last = daysInMonth(y, m);
  return { start: `${y}-${pad2(m)}-01`, end: `${y}-${pad2(m)}-${pad2(last)}` };
}

export function nextPeriod(period: string): string {
  const [y, m] = period.split('-').map(Number);
  if (m === 12) return `${y + 1}-01`;
  return `${y}-${pad2(m + 1)}`;
}

export function comparePeriod(a: string, b: string): number {
  return a.localeCompare(b);
}

export function periodBillingDueDate(period: string, billingDay: number): string {
  const [y, m] = period.split('-').map(Number);
  const d = Math.min(billingDay, daysInMonth(y, m));
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

function todayISOFromDate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function daysInclusive(start: string, end: string): number {
  const [ys, ms, ds] = start.split('-').map(Number);
  const [ye, me, de] = end.split('-').map(Number);
  const a = new Date(ys, ms - 1, ds);
  const b = new Date(ye, me - 1, de);
  return Math.floor((b.getTime() - a.getTime()) / 86400000) + 1;
}

function isPeriodInContract(sub: Subscription, period: string): boolean {
  const { start, end } = getPeriodBounds(period);
  if (sub.endDate && sub.endDate < start) return false;
  if (sub.startDate > end) return false;
  return true;
}

export function proRataForPeriod(
  sub: Subscription,
  period: string
): { factor: number; days: number; totalDays: number } {
  const { start: pStart, end: pEnd } = getPeriodBounds(period);
  const totalDays = daysInMonth(
    Number(period.split('-')[0]),
    Number(period.split('-')[1])
  );

  let billStart = pStart;
  let billEnd = pEnd;
  if (sub.startDate > billStart) billStart = sub.startDate;
  if (sub.endDate && sub.endDate < billEnd) billEnd = sub.endDate;

  if (billStart > billEnd) return { factor: 0, days: 0, totalDays };

  const days = daysInclusive(billStart, billEnd);
  return { factor: days / totalDays, days, totalDays };
}

export function periodsDue(
  sub: Subscription,
  today = new Date(),
  force = false
): string[] {
  if (sub.status !== 'active' && !force) return [];

  const todayStr = todayISOFromDate(today);
  if (sub.startDate > todayStr) return [];

  const current = periodFromDate(today);
  const firstPeriod = periodFromDate(new Date(sub.startDate));
  let cursor = firstPeriod;

  const result: string[] = [];
  while (comparePeriod(cursor, current) <= 0) {
    if (isPeriodInContract(sub, cursor)) {
      const pr = proRataForPeriod(sub, cursor);
      const due = periodBillingDueDate(cursor, sub.billingDay);
      if (pr.days > 0 && (force || todayStr >= due)) {
        result.push(cursor);
      }
    }
    cursor = nextPeriod(cursor);
  }
  return result;
}

export function buildInvoiceFromSubscription(
  sub: Subscription,
  period: string,
  docNumber: string
): InvoiceDoc {
  const periodLabel = thaiPeriodLabel(period);
  const pr = proRataForPeriod(sub, period);
  const effectivePrice = Math.round(sub.monthlyAmount * pr.factor * 100) / 100;

  let description = sub.description.includes('{period}')
    ? sub.description.replace('{period}', periodLabel)
    : `${sub.description} (${periodLabel})`;

  if (pr.factor < 1) {
    description += ` (${pr.days}/${pr.totalDays} วัน)`;
  }

  const issueDate = todayISO();
  const now = new Date().toISOString();
  const whtPercent = sub.withholdingTaxPercent ?? 0;

  return {
    id: uid(),
    docNumber,
    docType: 'invoice',
    issueDate,
    dueDate: addDaysISO(issueDate, sub.dueDays),
    status: 'draft',
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
        unitPrice: effectivePrice,
      },
    ],
    discountPercent: sub.discountPercent,
    taxMode: sub.taxMode,
    notes: sub.notes
      ? `${sub.notes}\nงวด: ${periodLabel}`
      : `งวด: ${periodLabel}`,
    subscriptionId: sub.id,
    billingPeriod: period,
    proRataDays: pr.days,
    proRataTotalDays: pr.totalDays,
    withholdingTaxPercent: whtPercent,
    eTaxStatus: whtPercent > 0 || sub.isRentalIncome ? 'ready' : 'none',
    createdAt: now,
    updatedAt: now,
  };
}
