import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { connectDB } from "./src/config/db.js";

import bookingRoutes from "./src/routes/bookingRoutes.js";
import serviceRoutes from "./src/routes/serviceRoutes.js";
import categoryRoutes from "./src/routes/categoryRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";
import reviewRoutes from "./src/routes/reviewRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 🔥 CORS (FINAL WORKING VERSION)
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const isAllowed =
      origin.startsWith("http://localhost") ||
      origin.startsWith("http://127.0.0.1") ||
      origin.includes(".vercel.app") ||
      origin.includes("ngrok-free.dev") ||
      origin.includes("ngrok.io");

    if (isAllowed) {
      console.log(`✅ CORS ALLOWED: ${origin}`);
      callback(null, true);
    } else {
      console.log(`❌ CORS BLOCKED: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// 🔥 REQUEST LOGGER (VERY IMPORTANT)
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url} from ${req.headers.origin}`);
  next();
});

// 🔥 MIDDLEWARE
app.use(express.json());

// ✅ ROOT ROUTE
app.get("/", (req, res) => {
  res.send("🚀 API is running...");
});

// ✅ HEALTH CHECK
app.get("/api/health", (req, res) => {
  console.log("💚 Health check hit");
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

// 🔥 TEST ROUTE (FOR FRONTEND CHECK)
app.get("/api/test", (req, res) => {
  console.log("🔥 Test endpoint hit");
  res.json({
    success: true,
    message: "Backend is connected successfully 🎉"
  });
});

// ✅ ROUTES
app.use("/api/bookings", bookingRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);

// ✅ 404 HANDLER
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// ✅ ERROR HANDLER
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

// ✅ START SERVER AFTER DB CONNECT
connectDB()
  .then(() => {
    console.log("✅ MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log("====================================");
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Local: http://localhost:${PORT}`);
      console.log(`🌍 Ngrok: https://invitingly-cozeys-dung.ngrok-free.dev`);
      console.log("====================================");
    });
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err.message);
    process.exit(1);
  });