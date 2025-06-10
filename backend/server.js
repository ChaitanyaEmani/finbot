import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import userRouter from './routes/userRoute.js';
import dotenv from 'dotenv';
import chatRouter from './routes/chatRoute.js';
import financeRouter from './routes/financeRoute.js';
dotenv.config();


const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(cors());


// db connection
connectDB();

// api endpoints
app.use('/api/user',userRouter);
app.use('/api/chat',chatRouter);
app.use('/api',financeRouter);

app.get('/',(req,res)=>{
    res.send("Welcome to the backend server!");
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? 'Loaded' : 'Missing');
});

