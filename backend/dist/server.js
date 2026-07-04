"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./config/db");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const transactionRoutes_1 = __importDefault(require("./routes/transactionRoutes"));
const budgetRoutes_1 = __importDefault(require("./routes/budgetRoutes"));
const chatRoutes_1 = __importDefault(require("./routes/chatRoutes"));
// Load environment variables
dotenv_1.default.config();
// Connect to Database
(0, db_1.connectDB)();
const app = (0, express_1.default)();
// Middlewares
app.use((0, cors_1.default)({
    origin: '*', // In production, replace with frontend URL on Vercel
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
// Keep-alive/awake Ping Route (Render Free-Tier support)
app.get('/ping', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'FinBot Server is active', timestamp: new Date() });
});
app.get('/api/ping', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'FinBot Server API is active', timestamp: new Date() });
});
// API Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/transactions', transactionRoutes_1.default);
app.use('/api/budgets', budgetRoutes_1.default);
app.use('/api/chat', chatRoutes_1.default);
// 404 Handler
app.use((req, res) => {
    res.status(404).json({ message: 'API route not found' });
});
// Error handling middleware
app.use((err, req, res, next) => {
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
