import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVerification extends Document {
  _id: string;
  identifier: string;
  value: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const VerificationSchema = new Schema<IVerification>(
  {
    identifier: { type: String, required: true, unique: true },
    value: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: true,
    collection: 'verification' // Use singular to match better-auth
  }
);

// Indexes
VerificationSchema.index({ identifier: 1 }, { unique: true });

export const Verification: Model<IVerification> = mongoose.models.Verification || mongoose.model<IVerification>('Verification', VerificationSchema);
