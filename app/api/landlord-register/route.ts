import { NextRequest, NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";
import { hashPassword, validatePasswordStrength } from "@/lib/password";
import { createSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, companyName, password, userType } = body;

    if (!name || !email || !password || userType !== "landlord") {
      return NextResponse.json(
        { success: false, message: "Missing required landlord fields" },
        { status: 400 },
      );
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Password too weak",
          errors: passwordValidation.errors,
        },
        { status: 400 },
      );
    }

    const client = await getMongoClient();
    const db = client.db(process.env.MONGODB_DB);

    // Check if email already exists
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 400 },
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user with password hash
    const result = await db.collection("users").insertOne({
      name,
      email,
      phone: phone || "",
      companyName: companyName || "",
      userType: "landlord",
      authMethod: "email",
      passwordHash,
      properties: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Get IP and user agent
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Create session immediately after registration
    const token = await createSession(
      String(result.insertedId),
      email,
      "landlord",
      ipAddress,
      userAgent,
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          _id: result.insertedId,
          name,
          email,
          phone,
          companyName,
          userType: "landlord",
        },
        token,
        message: "Landlord registered successfully",
      },
      {
        headers: {
          "Set-Cookie": `session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`,
        },
      },
    );
  } catch (error) {
    console.error("Error registering landlord:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          "Error: " +
          (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 },
    );
  }
}
