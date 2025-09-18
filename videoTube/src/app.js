import express from 'express'
import cors from 'cors'
import healthCheckRouter from './routes/healthCheck.route.js'
import cookieParser from 'cookie-parser';
import userRouter from './routes/userRoute.js'
import videoRouter from './routes/videoRoute.js'
import channelRouter from './routes/channelRoute.js'
import subscriptionRouter from './routes/subscriptionRoute.js'
import searchRouter from './routes/searchRoute.js'

const app = express()

//common middlewares
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use(express.static("public"))
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

// routes for health Check

app.use("/api/v1/healthCheck",healthCheckRouter)

// Simple test route (using proper pattern)
app.get('/api/v1/test', (req, res) => {
    res.json({ message: 'Server is working!' });
});
app.use("/api/v1/users",userRouter)
app.use("/api/v1/videos",videoRouter)
app.use("/api/v1/channels",channelRouter)
app.use("/api/v1/subscriptions",subscriptionRouter)
app.use("/api/v1/search",searchRouter)

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);

    // If it's an API error with statuscode, use it
    if (err.statuscode) {
        return res.status(err.statuscode).json({
            success: false,
            message: err.message || 'Something went wrong',
            error: err.error || [],
            data: null
        });
    }

    // Default server error
    return res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: [err.message],
        data: null
    });
});

// 404 handler for undefined routes (using proper pattern)
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
        error: [],
        data: null
    });
});

export {app}