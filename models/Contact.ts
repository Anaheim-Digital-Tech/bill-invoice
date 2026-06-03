import mongoose, { Schema } from 'mongoose';

const ContactSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    address: String,
    taxId: String,
    phone: String,
    email: String,
  },
  { timestamps: true }
);

export const ContactModel =
  mongoose.models.Contact ?? mongoose.model('Contact', ContactSchema);
