import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview extends Document {
  _id: string;
  reviewerId: string;
  revieweeId: string;
  bartrId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    reviewerId: { type: String, required: true, ref: 'User' },
    revieweeId: { type: String, required: true, ref: 'User' },
    bartrId: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: false },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes
ReviewSchema.index({ reviewerId: 1, bartrId: 1 }, { unique: true });
ReviewSchema.index({ revieweeId: 1 });

export const Review: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
