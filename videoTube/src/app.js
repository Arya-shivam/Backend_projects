import express from 'express'
import cors from 'cors'
import healthCheckRouter from './routes/healthCheck.route.js'
import cookieParser from 'cookie-parser';
import userRouter from './routes/userRoute.js'

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
app.use("api/v1/user",userRouter)




export {app}