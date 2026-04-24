import dotenv from "dotenv";
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectDB } from './src/config/db.js';
import bookingRoutes from './src/routes/bookingRoutes.js';
import serviceRoutes from './src/routes/serviceRoutes.js';
import categoryRoutes from './src/routes/categoryRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import reviewRoutes from './src/routes/reviewRoutes.js';

dotenv.config();

const app = express();
const PORT = 5000; // Hardcode to 5000 to avoid conflicts with AI Studio's PORT env var

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "https://katiani-styles.vercel.app",
    /\.ngrok\.io$/,
    /https:\/\/.*\.ngrok\.io/
  ],
  credentials: true
}));
app.use(express.json());

// DB Connection Status Middleware
app.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1 && req.path.startsWith('/api')) {
    // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
    if (mongoose.connection.readyState === 0) {
      return res.status(503).json({
        success: false,
        message: "Database connection is unavailable. Please check backend configuration."
      });
    }
  }
  next();
});

// Database Connection
connectDB();

// Routes
app.use('/api/bookings', bookingRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
