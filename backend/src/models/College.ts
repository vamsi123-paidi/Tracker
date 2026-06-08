import mongoose from 'mongoose';

export interface ICollege extends mongoose.Document {
  name: string;
  code: string;
  createdAt: Date;
}

const CollegeSchema = new mongoose.Schema<ICollege>({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  createdAt: { type: Date, default: Date.now }
});

export const College = mongoose.models.College || mongoose.model<ICollege>('College', CollegeSchema);
