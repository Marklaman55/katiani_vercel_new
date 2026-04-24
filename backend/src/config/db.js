import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models.js";

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  console.log("🛠️ DB SETUP: Checking for MONGODB_URI...");
  if (!uri) {
    console.error("CRITICAL: MongoDB URI is missing from environment variables.");
    console.log("Current ENV keys:", Object.keys(process.env).filter(k => k.includes('MON') || k.includes('URI')));
    return;
  }
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, 
      connectTimeoutMS: 10000,
    });
    console.log("MongoDB connected successfully");
    
    // Seed admin user
    const adminEmail = "admin@katiani.com";
    const adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await User.create({
        username: "admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin"
      });
      console.log("Admin user seeded: admin / admin123 (admin@katiani.com)");
    } else if (!adminUser.username) {
      adminUser.username = "admin";
      await adminUser.save();
      console.log("Admin user updated with username: admin");
    }
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    // Disable buffering if connection fails to avoid hanging queries
    mongoose.set('bufferCommands', false);
  }
};
