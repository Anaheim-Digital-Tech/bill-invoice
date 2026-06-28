import mongoose, { Schema } from 'mongoose';

const SUBSCRIPTION_STATUSES = ['active', 'paused', 'cancelled'] as const;

const SubscriptionSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    customerName: String,
    customerAddress: String,
    customerTaxId: String,
    customerPhone: String,
    customerEmail: String,
    description: String,
    monthlyAmount: { type: Number, default: 0 },
    qty: { type: Number, default: 1 },
    unit: { type: String, default: 'เดือน' },
    taxMode: { type: String, enum: ['excluded', 'included', 'none'], default: 'excluded' },
    discountPercent: { type: Number, default: 0 },
    billingDay: { type: Number, default: 1 },
    dueDays: { type: Number, default: 7 },
    startDate: String,
    endDate: String,
    status: { type: String, enum: SUBSCRIPTION_STATUSES, default: 'active' },
    lastBilledPeriod: String,
    notes: String,
    withholdingTaxPercent: { type: Number, default: 0 },
    isRentalIncome: { type: Boolean, default: false },
    autoCreateReceipt: { type: Boolean, default: true },
    proRataEnabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const SubscriptionModel =
  mongoose.models.Subscription ?? mongoose.model('Subscription', SubscriptionSchema);
