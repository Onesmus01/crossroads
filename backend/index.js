import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import connectDb from './config/db.js'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import userRouter from './routes/userRoute.js'
import paymentRouter from './routes/paymentRoute.js'
import wishlistRouter from './routes/wishlistRoute.js'
import bookRouter from './routes/bookRoute.js'
import notificationRouter from './routes/notificationRoute.js'
import path from 'path';
import { fileURLToPath } from 'url';


// ✅ Convert import.meta.url to __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(helmet())
app.use(cors({
    origin: ["http://localhost:3000","https://christianitycrossroads.onrender.com"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))

app.get("/api", (req, res) => {
  res.json({ message: "API is running 🚀" });
});
app.use('/api/user',userRouter)
app.use('/api/payment',paymentRouter)
app.use('/api/wishlist',wishlistRouter)
app.use('/api/book',bookRouter)
app.use('/api/notification', notificationRouter)


connectDb()

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const PORT = process.env.PORT || 8080;

app.listen(PORT,()=> console.log(`server is running at port ${PORT}`))