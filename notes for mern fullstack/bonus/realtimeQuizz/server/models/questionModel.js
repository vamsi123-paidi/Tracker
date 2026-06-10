import mongoose from 'mongoose'

const Schema = mongoose.Schema

const questionSchema = new Schema({
    quizId: {
        type: mongoose.ObjectId,
        ref: 'Quiz', 
        required: true
    },
    question: {
        type: String,
        required: true
    },
    correctAnswer: {
        type: String,
        required: true
    },
    incorrectAnswers: {
        type: Array,
        required: true
    }
})

//ensure the combination of question and quizId is unique
questionSchema.index({ quizId: 1, question: 1 }, { unique: true })

const QuestionModel = mongoose.model('Question', questionSchema)

export default QuestionModel
