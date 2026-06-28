import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import { SubscriptionModel } from '../../../../models/Subscription';
import { InvoiceModel } from '../../../../models/Invoice';
import { generateDocNumber } from '../../../../lib/docNumber';
import {
  buildInvoiceFromSubscription,
  periodFromDate,
  shouldBillSubscription,
} from '../../../../lib/subscriptionBilling';
import type { Subscription } from '../../../../lib/types';

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json().catch(() => ({}));
  const { subscriptionId, force, period: requestedPeriod } = body as {
    subscriptionId?: string;
    force?: boolean;
    period?: string;
  };

  let subs: Subscription[];
  if (subscriptionId) {
    const one = await SubscriptionModel.findOne({ id: subscriptionId }).lean();
    if (!one) return NextResponse.json({ error: 'not found' }, { status: 404 });
    subs = [one as Subscription];
  } else {
    subs = (await SubscriptionModel.find({ status: 'active' }).lean()) as Subscription[];
  }

  const generated: {
    subscriptionId: string;
    invoiceId: string;
    docNumber: string;
    period: string;
  }[] = [];

  for (const sub of subs) {
    if (!force && !shouldBillSubscription(sub)) continue;
    if (sub.status !== 'active' && !force) continue;

    const period = requestedPeriod ?? periodFromDate();
    if (sub.lastBilledPeriod === period && !force) continue;

    const existing = await InvoiceModel.findOne({
      subscriptionId: sub.id,
      billingPeriod: period,
    });
    if (existing) continue;

    const docNumber = await generateDocNumber('invoice');
    const invoice = buildInvoiceFromSubscription(sub, period, docNumber);
    await InvoiceModel.create(invoice);
    await SubscriptionModel.updateOne(
      { id: sub.id },
      { $set: { lastBilledPeriod: period } }
    );
    generated.push({
      subscriptionId: sub.id,
      invoiceId: invoice.id,
      docNumber: invoice.docNumber,
      period,
    });
  }

  return NextResponse.json({ generated: generated.length, invoices: generated });
}
