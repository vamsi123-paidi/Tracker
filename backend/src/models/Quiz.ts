import mongoose from 'mongoose';

export interface IQuizQuestion {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  points: number;
}

export interface IQuiz extends mongoose.Document {
  title: string;
  description: string;
  questions: IQuizQuestion[];
  college: mongoose.Types.ObjectId;
  durationMinutes: number;
  isActive: boolean;
  createdAt: Date;
}

const QuizQuestionSchema = new mongoose.Schema<IQuizQuestion>({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOptionIndex: { type: Number, required: true },
  points: { type: Number, default: 1 }
});

const QuizSchema = new mongoose.Schema<IQuiz>({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  questions: [QuizQuestionSchema],
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: false },
  durationMinutes: { type: Number, default: 15 },
  isActive: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

QuizSchema.index({ college: 1 });
QuizSchema.index({ isActive: 1 });

export const Quiz = mongoose.models.Quiz || mongoose.model<IQuiz>('Quiz', QuizSchema);
