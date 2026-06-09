import mongoose from 'mongoose';

export interface ITest {
  description: string;
  assertCode: string;
}

export interface IAssessment extends mongoose.Document {
  title: string;
  description: string;
  type: 'html' | 'css' | 'javascript';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  templateHtml?: string;
  templateCss?: string;
  templateJs?: string;
  testCases: ITest[];
  createdAt: Date;
}

const TestSchema = new mongoose.Schema({
  description: { type: String, required: true },
  assertCode: { type: String, required: true }
});

const AssessmentSchema = new mongoose.Schema<IAssessment>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['html', 'css', 'javascript'], required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  points: { type: Number, required: true },
  templateHtml: { type: String, default: '' },
  templateCss: { type: String, default: '' },
  templateJs: { type: String, default: '' },
  testCases: [TestSchema],
  createdAt: { type: Date, default: Date.now }
});

export const Assessment = mongoose.models.Assessment || mongoose.model<IAssessment>('Assessment', AssessmentSchema);
