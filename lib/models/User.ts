import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  name?: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  role: 'ADMIN' | 'USER' | 'GUEST';
  bartrCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    emailVerified: { type: Boolean, default: false },
    image: { type: String, required: false },
    role: {
      type: String,
      enum: ['ADMIN', 'USER', 'GUEST'],
      default: 'USER'
    },
    bartrCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    collection: 'user' // Use singular 'user' to match better-auth
  }
);

// Indexes
UserSchema.index({ email: 1 });

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
