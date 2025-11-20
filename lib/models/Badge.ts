import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBadge extends Document {
  _id: string;
  name: string;
  description: string;
  icon?: string;
  createdAt: Date;
}

const BadgeSchema = new Schema<IBadge>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    icon: { type: String, required: false },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes
BadgeSchema.index({ name: 1 }, { unique: true });

export const Badge: Model<IBadge> = mongoose.models.Badge || mongoose.model<IBadge>('Badge', BadgeSchema);
