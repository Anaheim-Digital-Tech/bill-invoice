import type { LineItem, TaxMode } from './types';
import { TAX_RATE } from './constants';

export function formatMoney(n: number): string {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatDate(iso: string): string {
  if (!iso) return '-';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function calcTotals(
  items: LineItem[],
  discountPercent: number,
  taxMode: TaxMode
) {
  const subtotal = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const discount = subtotal * (discountPercent / 100);
  const afterDiscount = subtotal - discount;

  let beforeTax: number, tax: number, total: number;
  if (taxMode === 'excluded') {
    beforeTax = afterDiscount;
    tax = beforeTax * TAX_RATE;
    total = beforeTax + tax;
  } else if (taxMode === 'included') {
    total = afterDiscount;
    tax = total * (TAX_RATE / (1 + TAX_RATE));
    beforeTax = total - tax;
  } else {
    beforeTax = afterDiscount;
    tax = 0;
    total = afterDiscount;
  }
  return { subtotal, discount, beforeTax, tax, total };
}

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function addDaysISO(iso: string, days: number): string {
  const [y, m, day] = iso.split('-').map(Number);
  const d = new Date(y, m - 1, day + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
