import { MongoClient } from "mongodb";

let cachedClient: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;
let cachedDbName: string | undefined;

function connectToDatabase() {
  if (cachedClient) {
    return Promise.resolve(cachedClient);
  }

  if (!clientPromise) {
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB;

    if (!uri) {
      throw new Error("Missing MONGODB_URI environment variable.");
    }

    if (!dbName) {
      throw new Error("Missing MONGODB_DB environment variable.");
    }

    cachedDbName = dbName;

    clientPromise = new MongoClient(uri).connect().then((client) => {
      cachedClient = client;
      return client;
    });
  }

  return clientPromise;
}

export async function getMongoClient() {
  return connectToDatabase();
}

export function getMongoDatabase() {
  if (!cachedClient) {
    throw new Error(
      "MongoDB client not connected. Use await getMongoClient() first.",
    );
  }
  return cachedClient.db(cachedDbName);
}
