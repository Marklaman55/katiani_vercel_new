import dotenv from "dotenv";
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { connectDB } from './src/config/db.js';
import bookingRoutes from './src/routes/bookingRoutes.js';
import serviceRoutes from './src/routes/serviceRoutes.js';
import categoryRoutes from './src/routes/categoryRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import reviewRoutes from './src/routes/reviewRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// 🔥 CRASH HANDLER
process.on('uncaughtException', (err) => {
  console.error("💥 CRITICAL UNCAUGHT EXCEPTION:", err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error("💥 CRITICAL UNHANDLED REJECTION:", reason);
});

// 🔥 GLOBAL LOGGER SYSTEM
const log = {
  server: (msg) => console.log(`🚀 SERVER: ${msg}`),
  db: (msg) => console.log(`🗄️ DATABASE: ${msg}`),
  api: (msg) => console.log(`📡 API: ${msg}`),
  cors: (msg) => console.log(`🌐 CORS: ${msg}`),
  error: (msg) => console.log(`❌ ERROR: ${msg}`),
  success: (msg) => console.log(`✅ SUCCESS: ${msg}`)
};

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // 📡 REQUEST TRACKER
  app.use((req, res, next) => {
    const origin = req.headers.origin || "unknown";
    console.log(`[REQUEST] ${req.method} ${req.url} (Origin: ${origin})`);
    next();
  });

  // 🌐 CORS
  app.use(cors({
    origin: true,
    credentials: true
  }));

  app.use(express.json());

  // 🔥 TEST ENDPOINTS (TOP PRIORITY)
  app.get("/api/connection", (req, res) => {
    res.json({
      success: true,
      message: "Frontend ↔ Backend connection is ACTIVE 🚀",
      time: new Date(),
      env: {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        cwd: process.cwd(),
        __dirname
      }
    });
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', database: mongoose.connection.readyState });
  });

  // DB Connection Status Middleware
  app.use((req, res, next) => {
    if (mongoose.connection.readyState !== 1 && req.path.startsWith('/api')) {
      if (mongoose.connection.readyState === 0) {
        return res.status(503).json({
          success: false,
          message: "Database connection is unavailable."
        });
      }
    }
    next();
  });

  // Routes
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/services', serviceRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/reviews', reviewRoutes);

  // Catch-all for undefined API routes (MUST BE BEFORE VITE)
  app.all('/api/*', (req, res) => {
    console.log(`[CATCH-ALL] Unhandled API request: ${req.method} ${req.url}`);
    res.status(404).json({
      success: false,
      message: `API Route not found: ${req.method} ${req.url}`,
      debug: "BACKEND_CATCH_ALL_HIT"
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    log.server("Integrating Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      root: path.join(__dirname, '../frontend'),
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, '../frontend/dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // 🔥 ERROR LOGGER
  app.use((err, req, res, next) => {
    const errMsg = err.message || 'Internal Server Error';
    log.error(`${req.method} ${req.url} → ${errMsg}`);
    res.status(err.status || 500).json({ success: false, message: errMsg });
  });

  // Database Connection
  try {
    await connectDB();
    log.db("MongoDB connected successfully");

    app.listen(PORT, "0.0.0.0", () => {
      console.log("====================================");
      log.server(`Full-stack server running on port ${PORT}`);
      console.log("====================================");
    });
  } catch (err) {
    log.error(`Startup failed: ${err.message}`);
    process.exit(1);
  }
}

startServer();
