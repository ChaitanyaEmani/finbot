import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import dotenv from "dotenv";

dotenv.config();

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import { generalLimiter } from "./middleware/rateLimiter.js";

const app = express();

// IMPORTANT: Render requires this
const PORT = process.env.PORT || 5000;

// Connect DB
connectDB();

// Security
app.use(helmet());
app.use(compression());

// FIXED CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Handle preflight
app.options("*", cors());

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logs
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Rate limiting
app.use("/api", generalLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/budget", budgetRoutes);
app.use("/api/analytics", analyticsRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handler
app.use(errorHandler);

// START SERVER — FIXED 🔥
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
