import type { Subscription, InvoiceDoc } from './types';

export async function getAllSubscriptions(): Promise<Subscription[]> {
  const res = await fetch('/api/subscriptions');
  if (!res.ok) throw new Error('Failed to load subscriptions');
  return res.json();
}

export async function getSubscription(id: string): Promise<Subscription | null> {
  const res = await fetch(`/api/subscriptions/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to load subscription');
  return res.json();
}

export async function saveSubscription(sub: Subscription): Promise<void> {
  const res = await fetch('/api/subscriptions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sub),
  });
  if (!res.ok) throw new Error('Failed to save subscription');
}

export async function deleteSubscription(id: string): Promise<void> {
  const res = await fetch(`/api/subscriptions/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete subscription');
}

export async function generateBilling(opts?: {
  subscriptionId?: string;
  force?: boolean;
  period?: string;
}): Promise<{ generated: number; invoices: { subscriptionId: string; invoiceId: string; docNumber: string; period: string }[] }> {
  const res = await fetch('/api/subscriptions/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(opts ?? {}),
  });
  if (!res.ok) throw new Error('Failed to generate billing');
  return res.json();
}

export async function getSubscriptionInvoices(subscriptionId: string): Promise<InvoiceDoc[]> {
  const res = await fetch(`/api/subscriptions/${subscriptionId}/invoices`);
  if (!res.ok) throw new Error('Failed to load invoices');
  return res.json();
}
