import { NextRequest, NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";
import { verifyPassword, validatePasswordStrength } from "@/lib/password";
import { createSession } from "@/lib/session";
import { User } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password required" },
        { status: 400 },
      );
    }

    const client = await getMongoClient();
    const db = client.db(process.env.MONGODB_DB);

    // Find user by email
    const user = await db
      .collection<User>("users")
      .findOne({ email, userType: "landlord" });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Email or password incorrect" },
        { status: 401 },
      );
    }

    // Verify password
    if (
      !user.passwordHash ||
      !(await verifyPassword(password, user.passwordHash))
    ) {
      return NextResponse.json(
        { success: false, message: "Email or password incorrect" },
        { status: 401 },
      );
    }

    // Get IP and user agent
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Create session
    const token = await createSession(
      String(user._id),
      user.email,
      "landlord",
      ipAddress,
      userAgent,
    );

    // Update last login
    await db
      .collection("users")
      .updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } });

    // Return user data (without password hash)
    const { passwordHash, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        data: userWithoutPassword,
        token,
      },
      {
        headers: {
          "Set-Cookie": `session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`,
        },
      },
    );
  } catch (error) {
    console.error("Error logging in:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to login",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
