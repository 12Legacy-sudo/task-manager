import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import {connectDB} from'./config/db.js'

import userRouter from './routes/userRoute.js'
import taskRouter from './routes/taskRoute.js'

const app = express ()
const port = process.env.PORT || 7000;

//MIDDLEWARE
app.use(express.json())
app.use(cors({
    origin: ['', 'http://localhost:5173'],
    credentials: true
})) 
app.use(express.urlencoded({extended: true}))

//DB CONNECTION
connectDB();

//ROUTES
app.use("/api/user", userRouter);
app.use("/api/tasks", taskRouter);

app.get('/', (req, res) => {
    res.send('API WORKING');
})

app.listen(port, () => {
    console.log(`Server Started on http://localhost:${port}`) 
})  
