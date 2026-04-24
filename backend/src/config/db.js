import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models.js";

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error("CRITICAL: MongoDB URI is missing from environment variables.");
    return;
  }
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, 
      connectTimeoutMS: 10000,
    });
    console.log("MongoDB connected successfully");
    
    // Seed admin user
    const adminEmail = "admin@katianistyles.com";
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await User.create({
        email: adminEmail,
        password: hashedPassword,
        role: "admin"
      });
      console.log("Admin user seeded: admin@katianistyles.com / admin123");
    }
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    // Disable buffering if connection fails to avoid hanging queries
    mongoose.set('bufferCommands', false);
  }
};
