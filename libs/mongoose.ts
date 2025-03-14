import mongoose from "mongoose";

interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: GlobalMongoose | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    "Add the MONGODB_URI environment variable inside .env.local to use mongoose"
  );
}

let cached: GlobalMongoose = global.mongoose ?? {
  conn: null,
  promise: null,
};

if (!global.mongoose) {
  global.mongoose = cached;
}

const opts = {
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 20000,
  serverSelectionTimeoutMS: 10000,
  waitQueueTimeoutMS: 10000,
  keepAlive: true,
  bufferCommands: false,
} as const;

async function connectMongo(): Promise<typeof mongoose> {
  if (cached.conn) {
    console.log("Using cached Mongoose connection");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("Creating new Mongoose connection");
    const opts = {
      bufferCommands: false,
      ...opts
    };

    mongoose.set("strictQuery", false);
    cached.promise = mongoose.connect(MONGODB_URI, opts);
  } else {
    console.log("Using existing Mongoose connection promise");
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error("Mongoose connection error:", e);
    throw e;
  }

  return cached.conn;
}

export default connectMongo;
