import mongoose, { Schema } from 'mongoose';

const LineItemSchema = new Schema(
  {
    id: String,
    description: String,
    qty: Number,
    unit: String,
    unitPrice: Number,
    serialNo: String,
    condition: String,
  },
  { _id: false }
);

const DOC_TYPES = [
  'salesorder',
  'quotation',
  'invoice',
  'receipt',
  'goodsreceipt',
  'equipmentcheck',
  'equipmentloan',
] as const;

const DOC_STATUSES = [
  'draft',
  'sent',
  'paid',
  'overdue',
  'cancelled',
  'completed',
] as const;

const InvoiceSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    docNumber: { type: String, required: true },
    docType: { type: String, enum: DOC_TYPES, default: 'invoice' },
    issueDate: String,
    dueDate: String,
    status: {
      type: String,
      enum: DOC_STATUSES,
      default: 'draft',
    },
    customerName: String,
    customerAddress: String,
    customerTaxId: String,
    customerPhone: String,
    customerEmail: String,
    items: [LineItemSchema],
    discountPercent: { type: Number, default: 0 },
    taxMode: { type: String, enum: ['excluded', 'included', 'none'], default: 'excluded' },
    notes: String,
    paymentMethod: String,
    paymentDate: String,
    refDocId: String,
    refDocNumber: String,
    isArchive: { type: Boolean, default: false },
    handoverSenderName: String,
    handoverReceiverName: String,
    loanStartDate: String,
    loanEndDate: String,
    subscriptionId: String,
    subscriptionName: String,
    billingPeriod: String,
    proRataDays: Number,
    proRataTotalDays: Number,
    withholdingTaxPercent: Number,
    eTaxStatus: { type: String, enum: ['none', 'ready', 'submitted'], default: 'none' },
  },
  { timestamps: true }
);

InvoiceSchema.index(
  { subscriptionId: 1, billingPeriod: 1 },
  {
    unique: true,
    partialFilterExpression: {
      docType: 'invoice',
      subscriptionId: { $type: 'string' },
      billingPeriod: { $type: 'string' },
    },
  }
);

export const InvoiceModel =
  mongoose.models.Invoice ?? mongoose.model('Invoice', InvoiceSchema);
