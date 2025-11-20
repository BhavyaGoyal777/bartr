import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBartr extends Document {
  _id: string;
  initiatorId: string;
  receiverId: string;
  listingId: string;
  offeredListingId?: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED' | 'CANCELLED';
  message?: string;
  initiatorConfirmed: boolean;
  receiverConfirmed: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BartrSchema = new Schema<IBartr>(
  {
    initiatorId: { type: String, required: true, ref: 'User' },
    receiverId: { type: String, required: true, ref: 'User' },
    listingId: { type: String, required: true, ref: 'Listing' },
    offeredListingId: { type: String, required: false },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'DECLINED', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING'
    },
    message: { type: String, required: false },
    initiatorConfirmed: { type: Boolean, default: false },
    receiverConfirmed: { type: Boolean, default: false },
    completedAt: { type: Date, required: false },
  },
  {
    timestamps: true,
  }
);

// Indexes
BartrSchema.index({ initiatorId: 1 });
BartrSchema.index({ receiverId: 1 });
BartrSchema.index({ status: 1 });

export const Bartr: Model<IBartr> = mongoose.models.Bartr || mongoose.model<IBartr>('Bartr', BartrSchema);
