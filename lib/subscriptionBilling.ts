export {
  periodFromDate,
  thaiPeriodLabel,
  proRataForPeriod,
  periodsDue,
  buildInvoiceFromSubscription,
} from './billingCore';

import type { Subscription } from './types';
import { periodsDue } from './billingCore';

export function shouldBillSubscription(sub: Subscription, today = new Date()): boolean {
  return periodsDue(sub, today, false).length > 0;
}
