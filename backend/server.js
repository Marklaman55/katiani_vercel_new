import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite'; // ✅ KEEP
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
process.on('unhandledRejection', (reason) => {
  console.error("💥 CRITICAL UNHANDLED REJECTION:", reason);
});

// 🔥 LOGGER
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

  console.log(`📡 [DEBUG] NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`📡 [DEBUG] __dirname: ${__dirname}`);

  // 🔥 REQUEST LOGGER
  app.use((req, res, next) => {
    const origin = req.headers.origin || "unknown";
    console.log(`📡 ${req.method} ${req.url} (${origin})`);
    next();
  });

  // 🌐 CORS
  app.use(cors({
    origin: true,
    credentials: true
  }));

  app.use(express.json());

  // 🔥 TEST ENDPOINTS
  app.get("/api/connection", (req, res) => {
    res.json({
      success: true,
      message: "Frontend ↔ Backend connection is ACTIVE 🚀",
      time: new Date()
    });
  });

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      database: mongoose.connection.readyState
    });
  });

  // DB CHECK
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') && mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "Database connection unavailable"
      });
    }
    next();
  });

  // ROUTES
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/services', serviceRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/reviews', reviewRoutes);

  // API 404
  app.all('/api/*', (req, res) => {
    res.status(404).json({
      success: false,
      message: `API Route not found: ${req.method} ${req.url}`
    });
  });

  // 🔥 FIXED VITE BLOCK (SAFE)
  if (process.env.NODE_ENV !== "production") {
    try {
      log.server("Starting Vite middleware...");

      const vite = await createViteServer({
        root: path.resolve(__dirname, '../frontend'),
        server: { middlewareMode: true },
        appType: 'spa'
      });

      app.use(vite.middlewares);

    } catch (err) {
      log.error("Vite failed to start: " + err.message);
    }
  } else {
    const distPath = path.join(__dirname, '../frontend/dist');
    app.use(express.static(distPath));

    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // ERROR HANDLER
  app.use((err, req, res, next) => {
    log.error(`${req.method} ${req.url} → ${err.message}`);
    res.status(500).json({
      success: false,
      message: err.message
    });
  });

  // START SERVER
  app.listen(PORT, "0.0.0.0", () => {
    log.server(`Running on port ${PORT}`);
  });

  // CONNECT DB
  connectDB()
    .then(() => log.db("MongoDB connected"))
    .catch(err => log.error(err.message));
}

startServer();