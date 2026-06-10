import express from 'express'
import mongoose from 'mongoose'
import QuizModel from "../models/quizModel.js"
import CategoryModel from "../models/categoryModel.js"
import { quizValidation } from './validations.js'
import { validationResult } from 'express-validator'

const router = express.Router()


router.get("/", async (req, res) => res.send(await QuizModel.find()))

// route to get a quiz by id
router.get("/:id", async (req, res) => {

  //checks of provided id is a mongoose's valid ObjectId (a string of 12 bytes)
  if (mongoose.isValidObjectId(req.params.id)) {
    try {
      const quiz = await QuizModel.findById(req.params.id)
        .populate({ path: 'questions'})
        .populate({ path: 'category', select: 'name' })
      if (quiz) {
        res.send(quiz)
      } else {
        res.status(404).send({ error: "Quiz not found!" }) // catch error when Id is valid but does not exist in db
      }
    } catch (err) {
      res.status(500).send({ error: err.message })
    }
  } else {
    res.status(500).send({ error: 'Id is invalid' })
  }
})

// route to post new quiz
router.post("/", quizValidation(), async (req, res) => {

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  try {
    // 1. extract information from the user's input
    const { category, title, author, image } = req.body

    // 2. Create a new quiz object
    // 2.1 Check if the category exists
    const categoryObject = await CategoryModel.findOne({ name: category })
    if (categoryObject) {
      const newQuiz = { 
        category: categoryObject._id, 
        title, 
        author, 
        image 
      }

      // 2.2. Create a new quiz using newQuiz (sanitised values) 
      const insertedQuiz = await QuizModel.create(newQuiz)

      // 2.3. Send back the new quiz with 201 status
      res.status(201).send(insertedQuiz)
    } else {
      res.status(404).send({ error: 'Category not found' })
    }
  }
  catch (err) {
    if (err.code === 11000) {
      res.status(409).send({ errors: [ {msg: 'Quiz already exists. Please choose a different name.'} ] })
    } else {
      res.status(500).send({ errors: [ {msg: err.message}, ] })
    }
  }
})

router.delete("/:id", async (req, res) => {
  try {
    const quiz = await QuizModel.findByIdAndDelete(req.params.id);
    if (quiz) {
      res.sendStatus(204)
    } else {
      res.status(404).send({ error: 'Quiz not found' })
    }
  } catch (err) {
    res.status(500).send({ error: err.message })
  }
})

// edit a quiz
router.put("/:id", async (req, res) => {
  try {
    // 1. extract information from the user's input
    const { title, author, image } = req.body

    // 2. Create a new quiz object
    // 2.1 Get the quiz from id
    const oldQuiz = await QuizModel.findById(req.params.id)
    let category
    // 2.2 if the category is provided, check if it exists
    if (req.body.category) {  
      const categoryObject = await CategoryModel.findOne({ name: category })
      if (!categoryObject) {
        res.status(404).send({ error: 'Category not found' })
      } else {
        category = categoryObject._id
      }
    }
    // 2.3 if category is not provided, use existing category info
    const newQuiz = { 
      category: category || oldQuiz.category, 
      title: title || oldQuiz.title, 
      author: author || oldQuiz.author, 
      image: image || oldQuiz.image
    }
    // 2.4. Edit the existing quiz with info from newQuiz 
    const quiz = await QuizModel.findByIdAndUpdate(req.params.id, newQuiz, { returnDocument: 'after' })

    //2.5. Send back the updated quiz
    if (quiz) {
      res.send(quiz)
    } else {
      res.status(404).send({ error: 'Quiz not found' })
    }
  } 
  catch (err) {
    res.status(500).send({ error: err.message })
  }
})


export default router
