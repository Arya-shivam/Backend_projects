import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { DB_NAME } from '../contants.js'

dotenv.config({
    path:'src/.env'
})

const connectDB=async()=>{
    try {
        const dbName = process.env.DB_NAME || DB_NAME;
        const mongoUri = process.env.MONGO_URI;

        if (!mongoUri) {
            throw new Error('MONGO_URI is not defined in environment variables');
        }

        const connectionString = `${mongoUri}/${dbName}`;
        console.log(`Connecting to MongoDB: ${mongoUri}/${dbName}`);

        const ConnectionInstance = await mongoose.connect(connectionString);
        console.log(`MongoDB connected successfully!`);
        console.log(`Host: ${ConnectionInstance.connection.host}`);
        console.log(`Database: ${ConnectionInstance.connection.name}`);
    } catch (error) {
        console.log('MongoDB connection error:', error.message);
        process.exit(1);
    }
}

export default connectDB

