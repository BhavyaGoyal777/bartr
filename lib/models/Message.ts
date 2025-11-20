import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessage extends Document {
  _id: string;
  bartrId: string;
  senderId: string;
  content: string;
  messageType: 'TEXT' | 'CLOSE_DEAL_REQUEST' | 'CLOSE_DEAL_ACCEPTED' | 'CLOSE_DEAL_REJECTED';
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    bartrId: { type: String, required: true, ref: 'Bartr' },
    senderId: { type: String, required: true, ref: 'User' },
    content: { type: String, required: true },
    messageType: {
      type: String,
      enum: ['TEXT', 'CLOSE_DEAL_REQUEST', 'CLOSE_DEAL_ACCEPTED', 'CLOSE_DEAL_REJECTED'],
      default: 'TEXT'
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes
MessageSchema.index({ bartrId: 1 });

export const Message: Model<IMessage> = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
