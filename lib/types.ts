export type DocType = 'salesorder' | 'quotation' | 'invoice' | 'receipt';
export type TaxMode = 'excluded' | 'included' | 'none';
export type DocStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface LineItem {
  id: string;
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
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
  createdAt: string;
  updatedAt: string;
}
