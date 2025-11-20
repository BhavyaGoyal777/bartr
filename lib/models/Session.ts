import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISession extends Document {
  _id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    token: { type: String, required: true, unique: true },
    userId: { type: String, required: true, ref: 'User' },
    expiresAt: { type: Date, required: true },
    ipAddress: { type: String, required: false },
    userAgent: { type: String, required: false },
  },
  {
    timestamps: true,
    collection: 'session' // Use singular to match better-auth
  }
);

// Indexes
SessionSchema.index({ userId: 1 });
SessionSchema.index({ token: 1 }, { unique: true });

export const Session: Model<ISession> = mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);
