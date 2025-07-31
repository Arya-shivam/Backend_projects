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
app.use("/api/v1/users",userRouter)
app.use("/api/v1/videos",videoRouter)
app.use("/api/v1/channels",channelRouter)
app.use("/api/v1/subscriptions",subscriptionRouter)
app.use("/api/v1/search",searchRouter)




export {app}