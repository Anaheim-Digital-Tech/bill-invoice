import type { InvoiceDoc, Subscription } from './types';
import { todayISO, uid } from './utils';
import { generateDocNumber } from './docNumber';
import {
  buildInvoiceFromSubscription,
  comparePeriod,
  periodsDue,
  isBillablePeriod,
} from './billingCore';
import { InvoiceModel } from '../models/Invoice';
import { SubscriptionModel } from '../models/Subscription';

export async function syncSubscriptionLastBilledPeriod(subscriptionId: string): Promise<void> {
  const invoices = await InvoiceModel.find({
    subscriptionId,
    docType: 'invoice',
    billingPeriod: { $exists: true, $nin: [null, ''] },
    status: { $ne: 'cancelled' },
  })
    .select('billingPeriod')
    .lean();

  if (invoices.length === 0) {
    await SubscriptionModel.updateOne(
      { id: subscriptionId },
      { $unset: { lastBilledPeriod: '' } }
    );
    return;
  }

  const maxPeriod = invoices.reduce((max, inv) => {
    const p = inv.billingPeriod as string;
    return comparePeriod(p, max) > 0 ? p : max;
  }, invoices[0].billingPeriod as string);

  await SubscriptionModel.updateOne(
    { id: subscriptionId },
    { $set: { lastBilledPeriod: maxPeriod } }
  );
}

export interface BillingResult {
  subscriptionId: string;
  invoiceId: string;
  docNumber: string;
  period: string;
}

function periodsToBill(
  sub: Subscription,
  today: Date,
  force: boolean,
  singlePeriod?: string
): string[] {
  if (singlePeriod) {
    if (!isBillablePeriod(sub, singlePeriod)) return [];
    if (!force) {
      const due = periodsDue(sub, today, false);
      if (!due.includes(singlePeriod)) return [];
    }
    return [singlePeriod];
  }
  return periodsDue(sub, today, force);
}

export async function processBilling(opts?: {
  subscriptionId?: string;
  force?: boolean;
  period?: string;
}): Promise<{ generated: number; invoices: BillingResult[] }> {
  const { subscriptionId, force = false, period: singlePeriod } = opts ?? {};

  let subs: Subscription[];
  if (subscriptionId) {
    const one = await SubscriptionModel.findOne({ id: subscriptionId }).lean();
    if (!one) return { generated: 0, invoices: [] };
    subs = [one as Subscription];
  } else {
    subs = (await SubscriptionModel.find({ status: 'active' }).lean()) as Subscription[];
  }

  const today = new Date();
  const generated: BillingResult[] = [];

  for (const sub of subs) {
    const periods = periodsToBill(sub, today, force, singlePeriod);

    for (const period of periods) {
      if (!force && sub.status !== 'active') break;

      const existing = await InvoiceModel.findOne({
        subscriptionId: sub.id,
        billingPeriod: period,
        docType: 'invoice',
        status: { $ne: 'cancelled' },
      });
      if (existing) continue;

      if (!isBillablePeriod(sub, period)) continue;

      const docNumber = await generateDocNumber('invoice');
      const invoice = buildInvoiceFromSubscription(sub, period, docNumber);
      try {
        await InvoiceModel.create(invoice);
      } catch (err) {
        const dup = err as { code?: number };
        if (dup.code === 11000) continue;
        throw err;
      }

      generated.push({
        subscriptionId: sub.id,
        invoiceId: invoice.id,
        docNumber: invoice.docNumber,
        period,
      });
    }

    await syncSubscriptionLastBilledPeriod(sub.id);
  }

  return { generated: generated.length, invoices: generated };
}

export async function createReceiptFromInvoice(
  invoice: InvoiceDoc
): Promise<InvoiceDoc | null> {
  const existing = await InvoiceModel.findOne({
    refDocId: invoice.id,
    docType: 'receipt',
    status: { $ne: 'cancelled' },
  }).lean();

  if (existing) {
    await markInvoicePaid(invoice.id, existing.paymentMethod ?? invoice.paymentMethod);
    return existing as InvoiceDoc;
  }

  const docNumber = await generateDocNumber('receipt');
  const now = new Date().toISOString();
  const paymentMethod = invoice.paymentMethod ?? 'transfer';
  const paymentDate = todayISO();

  const receipt: InvoiceDoc = {
    id: uid(),
    docType: 'receipt',
    docNumber,
    issueDate: paymentDate,
    dueDate: paymentDate,
    status: 'paid',
    customerName: invoice.customerName,
    customerAddress: invoice.customerAddress,
    customerTaxId: invoice.customerTaxId,
    customerPhone: invoice.customerPhone,
    customerEmail: invoice.customerEmail,
    items: invoice.items.map((item) => ({ ...item })),
    discountPercent: invoice.discountPercent,
    taxMode: invoice.taxMode,
    notes: invoice.notes,
    paymentMethod,
    paymentDate,
    refDocId: invoice.id,
    refDocNumber: invoice.docNumber,
    withholdingTaxPercent: invoice.withholdingTaxPercent,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await InvoiceModel.create(receipt);
  } catch (err) {
    console.error('createReceiptFromInvoice failed:', err);
    return null;
  }

  try {
    await markInvoicePaid(invoice.id, paymentMethod);
    return receipt;
  } catch (err) {
    await InvoiceModel.deleteOne({ id: receipt.id });
    console.error('markInvoicePaid failed, rolled back receipt:', err);
    return null;
  }
}

async function markInvoicePaid(invoiceId: string, paymentMethod?: string): Promise<void> {
  await InvoiceModel.updateOne(
    { id: invoiceId, docType: 'invoice' },
    {
      $set: {
        status: 'paid',
        paymentDate: todayISO(),
        paymentMethod: paymentMethod ?? 'transfer',
      },
    }
  );
}

export async function handleInvoiceStatusChange(
  invoiceId: string,
  previousStatus?: string
): Promise<{ receiptId?: string; receiptDocNumber?: string }> {
  const invoice = await InvoiceModel.findOne({ id: invoiceId }).lean();
  if (!invoice) return {};
  if (invoice.status !== 'paid' || previousStatus === 'paid') return {};
  if (!invoice.subscriptionId) return {};

  const sub = await SubscriptionModel.findOne({ id: invoice.subscriptionId }).lean();
  if (!sub || sub.autoCreateReceipt === false) return {};

  const receipt = await createReceiptFromInvoice(invoice as InvoiceDoc);
  if (!receipt) return {};

  return { receiptId: receipt.id, receiptDocNumber: receipt.docNumber };
}
