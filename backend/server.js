import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoute.js';
import chatRoutes from './routes/chatRoute.js';
import financeRoutes from './routes/financeRoute.js';

dotenv.config();
connectDB();

const app = express();

// ✅ CORS Middleware — allow requests from frontend
app.use(cors({
  origin: ['http://localhost:5173', 'https://finbot-ten.vercel.app'], // allow both local and production
  credentials: true,
}));

app.use(express.json()); // Middleware to parse JSON bodies

// Routes
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api', financeRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
