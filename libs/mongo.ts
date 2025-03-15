import { MongoClient } from "mongodb";

// This lib is use just to connect to the database in next-auth.
// We don't use it anywhere else in the API routes—we use mongoose.js instead (to be able to use models)
// See /libs/nextauth.js file.

declare global {
  // eslint-disable-next-line no-unused-vars
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.MONGODB_URI;
const options = {
  maxPoolSize: 10,
  connectTimeoutMS: 5000,
  socketTimeoutMS: 10000,
  serverSelectionTimeoutMS: 5000
};

if (!uri) {
  throw new Error("Please add your MongoDB URI to .env");
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Use cached connection in both development and production
if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

export async function connectToDatabase() {
  try {
    const client = await clientPromise;
    const db = client.db();
    return { db, client };
  } catch (error) {
    console.error('Failed to connect to database:', error);
    throw error;
  }
}

export default clientPromise;
