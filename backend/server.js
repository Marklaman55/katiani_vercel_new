import 'dotenv/config';
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
  const PORT = 3000;
  
  console.log(`📡 [DEBUG] NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`📡 [DEBUG] CWD: ${process.cwd()}`);
  console.log(`📡 [DEBUG] __dirname: ${__dirname}`);
  app.use((req, res, next) => {
    const origin = req.headers.origin || "unknown";
    console.log(`📡 [EXPRESS-REQ] ${req.method} ${req.url} (Origin: ${origin}, Content-Type: ${req.headers['content-type']})`);
    next();
  });

  // 🌐 CORS
  app.use(cors({
    origin: true,
    credentials: true
  }));

  app.use(express.json());

  // --- API ROUTES ---
  // We mount directly on app to avoid any ambiguity with nested routers
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/services', serviceRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/reviews', reviewRoutes);

  // Alias for M-Pesa callback to match common env patterns
  app.use('/api/mpesa', paymentRoutes);

  // API Connection Test
  app.get("/api/connection", (req, res) => {
    res.json({
      success: true,
      message: "Frontend ↔ Backend connection is ACTIVE 🚀",
      database: mongoose.connection.readyState,
      time: new Date()
    });
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      database: mongoose.connection.readyState
    });
  });

  // CRITICAL: Catch-all for ANY /api request that didn't match above
  // This prevents it from falling through to Vite's HTML fallback
  app.all('/api/*', (req, res) => {
    console.log(`📡 [API-404] Unhandled route: ${req.method} ${req.url}`);
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

  // Start listening immediately to avoid AI Studio timeout fallbacks
  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log("====================================");
    log.server(`Full-stack server running on port ${PORT}`);
    console.log("====================================");
  });

  // Database Connection (in background)
  connectDB()
    .then(() => {
      log.db("MongoDB connected successfully");
      console.log(`📡 [SERVER-INFO] Database State: ${mongoose.connection.readyState}`);
    })
    .catch((err) => {
      log.error(`Database connection failed: ${err.message}`);
    });
}

startServer();
