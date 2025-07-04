import {app} from './app.js'
import dotenv from 'dotenv'
import connectDB from './db/databaseConnect.js'

dotenv.config({
    path:'src/.env'
})

const PORT = process.env.PORT || 8001

connectDB()
.then(app.listen(PORT,()=>{
    console.log(`server is running on ${PORT}`)
}))
.catch((err)=>{
    console.log("DB error",err)
})


