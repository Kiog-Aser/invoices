import { MongoClient } from "mongodb";

// This lib is use just to connect to the database in next-auth.
// We don't use it anywhere else in the API routes—we use mongoose.js instead (to be able to use models)
// See /libs/nextauth.js file.

declare global {
  // eslint-disable-next-line no-unused-vars
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env");
}

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10,
  connectTimeoutMS: 5000,
  socketTimeoutMS: 10000,
  serverSelectionTimeoutMS: 5000
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

async function connect() {
  try {
    client = new MongoClient(uri, options);
    console.log("🔄 Attempting MongoDB connection...");
    const connection = await client.connect();
    console.log("✅ MongoDB connection established");
    return connection;
  } catch (e) {
    console.error("❌ MongoDB connection error:", e instanceof Error ? e.message : e);
    throw e;
  }
}

// Use cached connection in both development and production
if (!global._mongoClientPromise) {
  global._mongoClientPromise = connect();
}

clientPromise = global._mongoClientPromise;

export async function connectToDatabase() {
  try {
    const client = await clientPromise;
    const db = client.db();
    return { db, client };
  } catch (error) {
    console.error('❌ Failed to connect to database:', error instanceof Error ? error.message : error);
    throw error;
  }
}

export default clientPromise;