import mongoose from "mongoose";

let isConnected = false;

const connectMongo = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error(
      "Add the MONGODB_URI environment variable inside .env.local to use mongoose"
    );
  }

  if (isConnected) {
    return;
  }

  const opts = {
    maxPoolSize: 20,
    minPoolSize: 5,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 10000,
    heartbeatFrequencyMS: 1000,
    retryWrites: true,
    retryReads: true,
    autoIndex: true
  };

  try {
    // Handle initial connection
    mongoose.connection.on('connected', () => {
      isConnected = true;
      console.log('🔌 Mongoose connected successfully');
    });

    // Handle disconnection
    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.log('❗ Mongoose disconnected, will auto-reconnect');
    });

    // Handle errors
    mongoose.connection.on('error', (err) => {
      isConnected = false;
      console.error('❌ Mongoose connection error:', err);
    });

    if (!isConnected) {
      await mongoose.connect(process.env.MONGODB_URI, opts);
    }
  } catch (e) {
    console.error("❌ MongoDB connection error:", e.message);
    // Add delay before retrying
    await new Promise(resolve => setTimeout(resolve, 2000));
    throw e;
  }
};

export default connectMongo;
