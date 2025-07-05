import express from 'express'
import cors from 'cors'
import healthCheckRouter from './routes/healthCheck.route.js'

const app = express()


app.use(express.json())
app.use(express.urlencoded({extended:true}))

// routes for health Check

app.use("/api/v1/healthCheck",healthCheckRouter)


app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

export {app}