import mongoose from 'mongoose';

export interface IAssessmentSubmission extends mongoose.Document {
  assessment: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  codeHtml?: string;
  codeCss?: string;
  codeJs?: string;
  scoreGained: number;
  passedAll: boolean;
  completedAt: Date;
}

const AssessmentSubmissionSchema = new mongoose.Schema<IAssessmentSubmission>({
  assessment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  codeHtml: { type: String, default: '' },
  codeCss: { type: String, default: '' },
  codeJs: { type: String, default: '' },
  scoreGained: { type: Number, required: true },
  passedAll: { type: Boolean, default: false },
  completedAt: { type: Date, default: Date.now }
});

export const AssessmentSubmission = mongoose.models.AssessmentSubmission || mongoose.model<IAssessmentSubmission>('AssessmentSubmission', AssessmentSubmissionSchema);
