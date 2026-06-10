import express from 'express'
import { body } from 'express-validator'

function questionValidation() {
  return [
    body('question')
      .exists()
      .withMessage('Please provide a question')
      .isLength({ min: 5 })
      .withMessage('Question must be longer than 5 characters'),
    body('correctAnswer')
      .exists()
      .withMessage('Please provide a correct answer'),
    body('incorrectAnswers')
      .exists()
      .withMessage('Please provide incorrect answers')
      .custom( value => {
        if (value) {
          let filtered = value.filter(el => el != '')
        if (filtered.length < 3) {
          throw new Error('Please provide 3 incorrect answers')
        }
        return true
        }
      })
  ]
}

function quizValidation() {
  return [
    body('title')
      .exists()
      .withMessage('Please provide a title')
      .isLength({ min: 4 })
      .withMessage('Title must be at least 4 characters'),
    body('author')
      .exists()
      .withMessage("Please provide an author's name"),
    body('category')
      .exists()
      .withMessage('Please choose a category'),
    body('image')
      .exists()
      .withMessage('Please select an image')
  ]
}

function categoryValidation() {
  return [
    body('name')
      .exists()
      .withMessage('Please provide a title')
      .isLength({ min: 4 })
      .withMessage('Title must be at least 4 characters'),
  ]
}

export { questionValidation, quizValidation, categoryValidation }