import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserBadge extends Document {
  _id: string;
  userId: string;
  badgeId: string;
  earnedAt: Date;
}

const UserBadgeSchema = new Schema<IUserBadge>(
  {
    userId: { type: String, required: true, ref: 'User' },
    badgeId: { type: String, required: true, ref: 'Badge' },
    earnedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
  }
);

// Indexes
UserBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });
UserBadgeSchema.index({ userId: 1 });

export const UserBadge: Model<IUserBadge> = mongoose.models.UserBadge || mongoose.model<IUserBadge>('UserBadge', UserBadgeSchema);
