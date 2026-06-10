import express, { request } from "express"
import { validationResult } from "express-validator"
import QuestionModel from "../models/questionModel.js"
import QuizModel from "../models/quizModel.js"
import { questionValidation } from "./validations.js"

const router = express.Router();

router.get("/", async (req, res) => res.send(await QuestionModel.find()))

router.get("/:id", async (req, res) => {
  try {
    const question = await QuestionModel.findById(req.params.id)
    if (question) {      
      res.send(question)
    } else {
      res.status(404).send({ error: "Question not found!" })
    }
  } catch (err) {
    res.status(500).send({ error: err.message })
  }
})

// route to post new questions
router.post("/", questionValidation(), async (req, res) => {

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  try {
    //1. Extract question's info from the user input
    const { quizId, question, correctAnswer, incorrectAnswers} = req.body

    // Checks if the array length is equal to 3
    if (!incorrectAnswers) {
      res.send({ error: 'Please provide 3 incorrect answers' })
    } else if (incorrectAnswers && incorrectAnswers.length !== 3){
      res.send({ error: 'Please provide 3 incorrect answers' })
    } else {
      //2. Create new question object
      //2.1. Check if quiz exists
      const quiz = await QuizModel.findById(quizId)
      if (quiz) {
        //2.2. create a new question object
        const newQuestion = { quizId, question, correctAnswer, incorrectAnswers }
        const insertedQuestion = await QuestionModel.create(newQuestion)

        //2.3. add the question id into the correct quiz
        quiz.questions.push(insertedQuestion._id)
        await quiz.save()
        res.status(201).send(insertedQuestion)
      } else {
        res.status(404).send({ error: 'Quiz not found' })
    }
    }
  } catch (err) {
    if (err.code === 11000) {
      res.status(409).send({ errors: 
        [ {msg: 'Question already exists in this quiz. Please provide a different question.'} ] })
    } else {
      res.status(500).send({ errors: [ {msg: err.message}, ] })
    }
  }
})


router.delete("/:id", async (req, res) => {
  try {
    const question = await QuestionModel.findByIdAndDelete(req.params.id)
    if (question) {
      const quiz = await QuizModel.findById(question.quizId)
      const index = quiz.questions.indexOf(question._id)
      const removedQuestion = quiz.questions.splice(index, 1)
      await quiz.save()
      res.sendStatus(204)
    } else {
      res.status(404).send({ error: "Question not found!" })
    }
  } catch (err) {
    res.status(500).send({ error: err.message })
  }
})

router.put('/:id', questionValidation(), async (req, res) => {

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  try {
    const { question, correctAnswer, incorrectAnswers } = req.body

    const newQuestion = {
      question: question,
      correctAnswer: correctAnswer, 
      incorrectAnswers: incorrectAnswers
    }
    const updatedQuestion = await QuestionModel.findByIdAndUpdate(req.params.id, newQuestion, { returnDocument: 'after' })
    res.send(updatedQuestion)
  } catch (err) {
    res.status(500).send({ error: err.message })
  }
  }
)

export default router
