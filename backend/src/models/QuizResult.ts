import mongoose from 'mongoose';

export interface IQuizResult extends mongoose.Document {
  student: mongoose.Types.ObjectId;
  quiz: mongoose.Types.ObjectId;
  answers: number[];
  score: number;
  totalPoints: number;
  tabSwitchCount: number;
  isCheated: boolean;
  timeTakenSeconds: number;
  submittedAt: Date;
}

const QuizResultSchema = new mongoose.Schema<IQuizResult>({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  answers: [{ type: Number, required: true }],
  score: { type: Number, required: true },
  totalPoints: { type: Number, required: true },
  tabSwitchCount: { type: Number, default: 0 },
  isCheated: { type: Boolean, default: false },
  timeTakenSeconds: { type: Number, required: true },
  submittedAt: { type: Date, default: Date.now }
});

export const QuizResult = mongoose.models.QuizResult || mongoose.model<IQuizResult>('QuizResult', QuizResultSchema);
