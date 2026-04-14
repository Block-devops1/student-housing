import crypto from "crypto";

// Get encryption key from environment - should be 32 bytes for AES-256
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY ||
  "default-unsafe-key-do-not-use-in-production-12345";

// Ensure key is 32 bytes
function getKey(): Buffer {
  const key = ENCRYPTION_KEY;
  if (key.length < 32) {
    return Buffer.concat([Buffer.from(key), Buffer.alloc(32 - key.length)]);
  }
  return Buffer.from(key.slice(0, 32));
}

export function encryptData(data: string): string {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", getKey(), iv);

    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");

    // Return IV + encrypted data
    return iv.toString("hex") + ":" + encrypted;
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt data");
  }
}

export function decryptData(encryptedData: string): string {
  try {
    const [ivHex, encrypted] = encryptedData.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", getKey(), iv);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt data");
  }
}

export function hashData(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}
