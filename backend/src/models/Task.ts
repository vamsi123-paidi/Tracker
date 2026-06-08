import mongoose from 'mongoose';

export interface ITask extends mongoose.Document {
  title: string;
  description: string;
  dueDate: Date;
  college: mongoose.Types.ObjectId;
  trainer: mongoose.Types.ObjectId;
  createdAt: Date;
}

const TaskSchema = new mongoose.Schema<ITask>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  dueDate: { type: Date, required: true },
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Task = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
