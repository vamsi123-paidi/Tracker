import express from 'express'
import CategoryModel from '../models/categoryModel.js'
import mongoose from 'mongoose'
import { categoryValidation } from './validations.js'
import { validationResult } from 'express-validator'


const router = express.Router()

// route to get all categories
router.get('/', async (req, res) => res.send(await CategoryModel.find()))

// route to get category by id
router.get('/:id', async (req, res) => {
  //checks of provided id is a mongoose's valid ObjectId (a string of 12 bytes)
  if (mongoose.isValidObjectId(req.params.id)) {
    try {
      const cat = await CategoryModel.findById(req.params.id)
      if (cat) {
        res.send(cat)
      } else {
        res.status(404).send({ error: 'Category not found!' }) // catch error when Id is valid but does not exist in db
      }
    } catch (err) {
      console.log({ error: err.message })
    }
  } else {
    res.status(500).send({ error: 'Invalid Id!' })
  }
})

//route to create a new category with validation
router.post('/', categoryValidation(), async (req, res) => {

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  try {
    const newCategory = new CategoryModel(req.body)
    await newCategory.save()
    res.status(201).send(newCategory)
  } catch (err) {
    if (err.code === 11000) {
      res.status(409).send({ errors: [ {msg: 'Category already exists. Please choose a different name.'} ] })
    } else {
      res.status(500).send({ errors: [ {msg: err.message}, ] })
    }
  } 
})

// route to delete a category
router.delete('/:id', async (req, res) => {
  try {
    const deletedCategory = await CategoryModel.findByIdAndDelete(req.params.id)
    if (deletedCategory) {
      res.sendStatus(204)
    } else {
      res.status(404).send({ error: 'Category not found!' })
    }
  } catch (err) {
    res.status(500).send({ error: err.message })
  }
})

router.put('/:id', async (req, res) => {
  const { name } = req.body
  const newCategory = { name }

  try {
    const updatedCategory = await CategoryModel.findByIdAndUpdate(req.params.id, newCategory, { returnDocument: 'after' })
    if (updatedCategory) {
      res.send(updatedCategory)
    } else {
      res.status(404).send({ error: 'Category not found!' })
    }
  } catch (err) {
    res.status(500).send({ error: err.message })
  }
})

export default router