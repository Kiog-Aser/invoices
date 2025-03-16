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
  maxPoolSize: 20,
  minPoolSize: 5,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 10000,
  heartbeatFrequencyMS: 1000,
  retryWrites: true,
  retryReads: true,
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

async function connect() {
  try {
    if (!client) {
      client = new MongoClient(uri, options);
    }

    // Check if client is connected using proper method
    if (!client.db().command) {
      console.log("🔄 Attempting MongoDB connection...");
      await client.connect();
      console.log("✅ MongoDB connection established");
    }

    return client;
  } catch (e) {
    console.error("❌ MongoDB connection error:", e instanceof Error ? e.message : e);
    throw e;
  }
}

// Use cached connection for better performance and connection management
if (!global._mongoClientPromise) {
  global._mongoClientPromise = connect();
}

clientPromise = global._mongoClientPromise;

export async function connectToDatabase() {
  try {
    const connectedClient = await clientPromise;
    
    // Check connection status using proper method
    try {
      await connectedClient.db().command({ ping: 1 });
    } catch (e) {
      // Reset the promise to force a new connection attempt
      global._mongoClientPromise = connect();
      clientPromise = global._mongoClientPromise;
      return connectToDatabase();
    }
    
    const db = connectedClient.db();
    return { db, client: connectedClient };
  } catch (error) {
    console.error('❌ Failed to connect to database:', error instanceof Error ? error.message : error);
    
    // Reset connection promise on error to force a fresh connection attempt
    global._mongoClientPromise = connect();
    clientPromise = global._mongoClientPromise;
    
    throw error;
  }
}

export default clientPromise;