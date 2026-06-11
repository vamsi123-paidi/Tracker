import mongoose from 'mongoose';

export interface ISubmission extends mongoose.Document {
  task: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  screenshotUrl: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
  reviewedAt?: Date;
  createdAt: Date;
}

const SubmissionSchema = new mongoose.Schema<ISubmission>({
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  screenshotUrl: { type: String, required: true },
  notes: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  feedback: { type: String },
  reviewedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

SubmissionSchema.index({ task: 1 });
SubmissionSchema.index({ student: 1 });
SubmissionSchema.index({ status: 1 });

export const Submission = mongoose.models.Submission || mongoose.model<ISubmission>('Submission', SubmissionSchema);
