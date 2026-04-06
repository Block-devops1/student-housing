import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri) {
  throw new Error("Missing MONGODB_URI environment variable.");
}

if (!dbName) {
  throw new Error("Missing MONGODB_DB environment variable.");
}

let cachedClient: MongoClient | null = null;

export function getMongoClient() {
  if (!cachedClient) {
    cachedClient = new MongoClient(uri);
  }
  return cachedClient;
}

export function getMongoDatabase() {
  return getMongoClient().db(dbName);
}
