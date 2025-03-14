import mongoose from "mongoose";
import User from "@/models/User";

const connectMongo = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error(
      "Add the MONGODB_URI environment variable inside .env.local to use mongoose"
    );
  }

  const opts = {
    serverSelectionTimeoutMS: 5000, // Reduce the timeout from 30 seconds to 5 seconds
    socketTimeoutMS: 10000,
    maxPoolSize: 10,
    maxIdleTimeMS: 10000,
    // Use the new topology layer
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  return mongoose
    .connect(process.env.MONGODB_URI, opts)
    .catch((e) => console.error("Mongoose Client Error: " + e.message));
};

export default connectMongo;
