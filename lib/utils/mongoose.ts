import mongoose from 'mongoose';

/**
 * Convert a string ID to ObjectId if valid
 * This is needed because we store user IDs as strings but MongoDB uses ObjectId
 */
export function toObjectId(id: string | mongoose.Types.ObjectId): mongoose.Types.ObjectId | string {
  if (!id) return id;
  if (typeof id !== 'string') return id;

  return mongoose.Types.ObjectId.isValid(id)
    ? new mongoose.Types.ObjectId(id)
    : id;
}
