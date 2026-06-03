import mongoose, { Schema } from 'mongoose';

const LineItemSchema = new Schema(
  {
    id: String,
    description: String,
    qty: Number,
    unit: String,
    unitPrice: Number,
  },
  { _id: false }
);

const InvoiceSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    docNumber: { type: String, required: true },
    docType: { type: String, enum: ['quotation', 'invoice', 'receipt'], default: 'invoice' },
    issueDate: String,
    dueDate: String,
    status: {
      type: String,
      enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
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
    refDocId: String,
    refDocNumber: String,
  },
  { timestamps: true }
);

export const InvoiceModel =
  mongoose.models.Invoice ?? mongoose.model('Invoice', InvoiceSchema);
