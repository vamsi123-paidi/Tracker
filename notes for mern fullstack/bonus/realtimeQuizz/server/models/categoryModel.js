import mongoose from 'mongoose'
import { dbConnect } from '../db.js'

dbConnect(process.env.ATLAS_DB_URL)
const Schema = mongoose.Schema

const categorySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }
})

const CategoryModel = mongoose.model('Category', categorySchema)

export default CategoryModel
