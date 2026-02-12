import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import connectDb from './config/db.js'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import userRouter from './routes/userRoute.js'
import paymentRouter from './routes/paymentRoute.js'
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(helmet())
app.use(cors({
    origin: ["http://localhost:3000"],
    credentials: true
}))
app.use('/api/user',userRouter)
app.use('/api/payment',paymentRouter)

connectDb()

const PORT = process.env.PORT || 8080;

app.listen(PORT,()=> console.log(`server is running at port ${PORT}`))