import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'trainer' | 'student';
  college?: mongoose.Types.ObjectId;
  profileImage?: string;
  createdAt: Date;
  studyNotesCount: number;
  playgroundRuns: number;
  compilerRuns: number;
  notesReadCount: number;
  badgesUnlocked: string[];
  points: number;
}

const UserSchema = new mongoose.Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['trainer', 'student'], default: 'student' },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
  profileImage: { type: String },
  createdAt: { type: Date, default: Date.now },
  studyNotesCount: { type: Number, default: 0 },
  playgroundRuns: { type: Number, default: 0 },
  compilerRuns: { type: Number, default: 0 },
  notesReadCount: { type: Number, default: 0 },
  badgesUnlocked: { type: [String], default: [] },
  points: { type: Number, default: 0 }
});

UserSchema.index({ role: 1 });
UserSchema.index({ college: 1 });
UserSchema.index({ email: 1 });

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

