import mongoose from 'mongoose';

const MoodRecordSchema = new mongoose.Schema({
  userId: { type: String, index: true },
  source: { type: String, enum: ['text', 'image', 'audio'], required: true },
  mood: { type: String, required: true },
  score: { type: Number, required: true },
  label: { type: String },
  metadata: { type: Object },
  createdAt: { type: Date, default: Date.now, index: true }
});

MoodRecordSchema.index({ createdAt: 1 }, { expireAfterSeconds: Number(process.env.TTL_SECONDS || 60 * 60 * 24 * 30) });

export const MoodRecord = mongoose.models.MoodRecord || mongoose.model('MoodRecord', MoodRecordSchema);

export async function ensureTtlIndex() {
  await MoodRecord.createCollection();
  await MoodRecord.collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: Number(process.env.TTL_SECONDS || 60 * 60 * 24 * 30) });
}


