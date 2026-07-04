import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import transactionRoutes from './routes/transactionRoutes';
import budgetRoutes from './routes/budgetRoutes';
import chatRoutes from './routes/chatRoutes';

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // In production, replace with frontend URL on Vercel
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Keep-alive/awake Ping Route (Render Free-Tier support)
app.get('/ping', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'FinBot Server is active', timestamp: new Date() });
});

app.get('/api/ping', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'FinBot Server API is active', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/chat', chatRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    message: 'An internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
