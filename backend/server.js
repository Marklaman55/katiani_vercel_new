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

// ✅ FIXED CORS (IMPORTANT)
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://katiani-vercel-new-zbwp.vercel.app",
  "https://invitingly-cozeys-dung.ngrok-free.dev"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (
      allowedOrigins.includes(origin) ||
      origin.includes("ngrok-free.dev") ||
      origin.includes("ngrok.io")
    ) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json());

// ✅ ROOT ROUTE (for testing)
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// ✅ HEALTH CHECK
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date(),
  });
});

// ✅ ROUTES
app.use("/api/bookings", bookingRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);

// ✅ ERROR HANDLER
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ✅ START SERVER AFTER DB CONNECTS
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB connection failed:", err);
    process.exit(1);
  });