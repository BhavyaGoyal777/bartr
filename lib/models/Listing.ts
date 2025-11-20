import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IListing extends Document {
  _id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  listingType: 'BARTER' | 'DONATION';
  swapPreferences?: string;
  userId: string;
  imageUrl?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'TRADED';
  createdAt: Date;
  updatedAt: Date;
}

const ListingSchema = new Schema<IListing>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    condition: { type: String, required: true },
    listingType: {
      type: String,
      enum: ['BARTER', 'DONATION'],
      required: true
    },
    swapPreferences: { type: String, required: false },
    userId: { type: String, required: true, ref: 'User' },
    imageUrl: { type: String, required: false },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'COMPLETED', 'TRADED'],
      default: 'ACTIVE'
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ListingSchema.index({ userId: 1 });
ListingSchema.index({ status: 1 });

export const Listing: Model<IListing> = mongoose.models.Listing || mongoose.model<IListing>('Listing', ListingSchema);
