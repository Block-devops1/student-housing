import { getMongoClient } from "./mongodb";
import { Session } from "./types";
import crypto from "crypto";
import { encryptData, decryptData } from "./encryption";

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export async function createSession(
  userId: string,
  email: string,
  userType: "student" | "landlord",
  ipAddress: string,
  userAgent: string,
): Promise<string> {
  try {
    const client = await getMongoClient();
    const db = client.db(process.env.MONGODB_DB);

    const token = crypto.randomBytes(32).toString("hex");
    const encryptedToken = encryptData(token);

    const session: Session = {
      userId,
      email,
      userType,
      token: encryptedToken,
      ipAddress,
      userAgent,
      expiresAt: new Date(Date.now() + SESSION_DURATION),
      createdAt: new Date(),
    };

    await db.collection<Session>("sessions").insertOne(session);

    return token;
  } catch (error) {
    console.error("Error creating session:", error);
    throw error;
  }
}

export async function verifySession(token: string): Promise<Session | null> {
  try {
    const client = await getMongoClient();
    const db = client.db(process.env.MONGODB_DB);

    // Get all sessions and check token manually (since tokens are encrypted)
    const sessions = await db
      .collection<Session>("sessions")
      .find({ expiresAt: { $gt: new Date() } })
      .limit(1000) // Safety limit
      .toArray();

    for (const session of sessions) {
      try {
        const decryptedToken = decryptData(session.token);
        if (decryptedToken === token) {
          return session;
        }
      } catch {
        continue;
      }
    }

    return null;
  } catch (error) {
    console.error("Error verifying session:", error);
    return null;
  }
}

export async function deleteSession(token: string): Promise<boolean> {
  try {
    const client = await getMongoClient();
    const db = client.db(process.env.MONGODB_DB);

    // Find all sessions and delete the matching one
    const sessions = await db
      .collection<Session>("sessions")
      .find({})
      .toArray();

    for (const session of sessions) {
      try {
        const decryptedToken = decryptData(session.token);
        if (decryptedToken === token && session._id) {
          await db.collection("sessions").deleteOne({ _id: session._id });
          return true;
        }
      } catch {
        continue;
      }
    }

    return false;
  } catch (error) {
    console.error("Error deleting session:", error);
    return false;
  }
}

export async function cleanupExpiredSessions(): Promise<number> {
  try {
    const client = await getMongoClient();
    const db = client.db(process.env.MONGODB_DB);

    const result = await db
      .collection("sessions")
      .deleteMany({ expiresAt: { $lt: new Date() } });

    return result.deletedCount || 0;
  } catch (error) {
    console.error("Error cleaning up sessions:", error);
    return 0;
  }
}
