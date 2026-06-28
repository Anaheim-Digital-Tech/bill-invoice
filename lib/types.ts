export type DocType =
  | 'salesorder'
  | 'quotation'
  | 'invoice'
  | 'receipt'
  | 'goodsreceipt'
  | 'equipmentcheck'
  | 'equipmentloan';

export type TaxMode = 'excluded' | 'included' | 'none';
export type DocStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'completed';

export interface LineItem {
  id: string;
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
  serialNo?: string;
  condition?: string;
}

export interface InvoiceDoc {
  id: string;
  docNumber: string;
  docType: DocType;
  issueDate: string;
  dueDate: string;
  status: DocStatus;
  customerName: string;
  customerAddress: string;
  customerTaxId: string;
  customerPhone: string;
  customerEmail: string;
  items: LineItem[];
  discountPercent: number;
  taxMode: TaxMode;
  notes: string;
  paymentMethod?: string;
  paymentDate?: string;
  refDocId?: string;
  refDocNumber?: string;
  isArchive?: boolean;
  handoverSenderName?: string;
  handoverReceiverName?: string;
  loanStartDate?: string;
  loanEndDate?: string;
  subscriptionId?: string;
  billingPeriod?: string;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionStatus = 'active' | 'paused' | 'cancelled';

export interface Subscription {
  id: string;
  name: string;
  customerName: string;
  customerAddress: string;
  customerTaxId: string;
  customerPhone: string;
  customerEmail: string;
  description: string;
  monthlyAmount: number;
  qty: number;
  unit: string;
  taxMode: TaxMode;
  discountPercent: number;
  billingDay: number;
  dueDays: number;
  startDate: string;
  endDate?: string;
  status: SubscriptionStatus;
  lastBilledPeriod?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}
