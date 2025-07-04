import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { DB_NAME } from '../contants.js'

dotenv.config({
    path:'src/.env'
})

const connectDB=async()=>{
    try {
        const ConnectionInstance = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
        console.log(`MongoDB connected , HOST:${ConnectionInstance.connection.host}`)
    } catch (error) {
        console.log('MongoDB connection error',error)
        process.exit(1)
    }
}

export default connectDB

