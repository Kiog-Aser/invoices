import mongoose from "mongoose";
import User from "@/models/User";

const connectMongo = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error(
      "Add the MONGODB_URI environment variable inside .env.local to use mongoose"
    );
  }

  const opts = {
    maxPoolSize: 10,
    connectTimeoutMS: 5000,
    socketTimeoutMS: 10000,
    serverSelectionTimeoutMS: 5000
  };

  try {
    await mongoose
      .connect(process.env.MONGODB_URI, opts);
    console.log("🔌 MongoDB connected successfully");
  } catch (e) {
    console.error("❌ MongoDB connection error:", e.message);
    throw e;
  }
};

export default connectMongo;
