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
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 5000,
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 5000,
  connectTimeoutMS: 5000,
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as const;

async function connectMongo(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    console.error("Mongoose Client Error:", e);
    throw e;
  }
}

export default connectMongo;
