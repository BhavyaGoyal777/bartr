import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAccount extends Document {
  _id: string;
  userId: string;
  accountId: string;
  providerId: string;
  accessToken?: string;
  refreshToken?: string;
  idToken?: string;
  accessTokenExpiresAt?: Date;
  refreshTokenExpiresAt?: Date;
  scope?: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AccountSchema = new Schema<IAccount>(
  {
    userId: { type: String, required: true, ref: 'User' },
    accountId: { type: String, required: true },
    providerId: { type: String, required: true },
    accessToken: { type: String, required: false },
    refreshToken: { type: String, required: false },
    idToken: { type: String, required: false },
    accessTokenExpiresAt: { type: Date, required: false },
    refreshTokenExpiresAt: { type: Date, required: false },
    scope: { type: String, required: false },
    password: { type: String, required: false },
  },
  {
    timestamps: true,
    collection: 'account' // Use singular to match better-auth
  }
);

// Indexes
AccountSchema.index({ userId: 1 });
AccountSchema.index({ providerId: 1, accountId: 1 }, { unique: true });

export const Account: Model<IAccount> = mongoose.models.Account || mongoose.model<IAccount>('Account', AccountSchema);
