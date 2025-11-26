import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

// ⚠️ CRITICAL: Load environment variables FIRST
dotenv.config();

// 🔍 DEBUG: Check if environment variables are loaded
console.log('\n=== Environment Variables Debug ===');
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ Loaded' : '❌ Missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Loaded' : '❌ Missing');
console.log('OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? '✅ Loaded' : '❌ Missing');

if (process.env.OPENROUTER_API_KEY) {
  console.log('API Key Preview:', process.env.OPENROUTER_API_KEY.substring(0, 20) + '...');
  console.log('API Key Length:', process.env.OPENROUTER_API_KEY.length, 'characters');
} else {
  console.error('❌ CRITICAL: OPENROUTER_API_KEY is NOT loaded!');
  console.error('   Please check:');
  console.error('   1. .env file exists in root directory');
  console.error('   2. .env contains OPENROUTER_API_KEY=sk-or-v1-...');
  console.error('   3. Server was completely restarted');
}
console.log('=====================================\n');

// NOW import other modules that depend on env variables
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { generalLimiter } from './middleware/rateLimiter.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Security Middleware
app.use(helmet()); // Sets various HTTP headers for security
app.use(compression()); // Compress response bodies

// CORS Configuration
app.use(cors());

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate Limiting
app.use('/api', generalLimiter);

// Health Check Route (Enhanced with env check)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'success', 
    message: 'FinBot API is running',
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasMongoUri: !!process.env.MONGO_URI,
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasOpenRouterKey: !!process.env.OPENROUTER_API_KEY,
      openRouterKeyLength: process.env.OPENROUTER_API_KEY?.length || 0
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port http://localhost:${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🤖 Chat endpoint: http://localhost:${PORT}/api/chat/send`);
});

export default app;