import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProfile extends Document {
  _id: string;
  userId: string;
  bio?: string;
  location?: string;
  memberSince: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>(
  {
    userId: { type: String, required: true, unique: true, ref: 'User' },
    bio: { type: String, required: false },
    location: { type: String, required: false },
    memberSince: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Indexes
ProfileSchema.index({ userId: 1 }, { unique: true });

export const Profile: Model<IProfile> = mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema);
