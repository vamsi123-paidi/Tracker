import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

mongoose.set('strictQuery', true)

async function dbClose() {
    await mongoose.connection.close()
    console.log('Mongoose disconnected!')
}
// Connect to MongoDB via Mongoose
async function dbConnect(databaseURL) {
    try {
        const m = await mongoose.connect(databaseURL)
        console.log(m.connection._readyState === 1 ? console.log('Mongoose connected!') : console.log('Mongoose failed to connect'))
    }
    catch (err) {
        console.log(err)
    }
}


export { dbClose, dbConnect }

