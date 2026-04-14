import { NextRequest, NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";
import { encryptData, hashData } from "@/lib/encryption";
import { AgreementRecord } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, userType, agreedToTerms, agreedToPrivacy } = body;

    // Validate input
    if (
      !email ||
      !name ||
      !userType ||
      agreedToTerms === undefined ||
      agreedToPrivacy === undefined
    ) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 },
      );
    }

    if (!["student", "landlord"].includes(userType)) {
      return NextResponse.json(
        { success: false, message: "Invalid user type" },
        { status: 400 },
      );
    }

    // Get IP and user agent from request
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Encrypt sensitive data
    const encryptedEmail = encryptData(email);
    const encryptedName = encryptData(name);
    const encryptedIp = encryptData(ipAddress);
    const encryptedUserAgent = encryptData(userAgent);

    // Create hash of agreement for verification
    const documentHash = hashData(
      `${email}:${name}:${userType}:${agreedToTerms}:${agreedToPrivacy}`,
    );

    const client = await getMongoClient();
    const db = client.db(process.env.MONGODB_DB);

    const agreementRecord: AgreementRecord = {
      email: encryptedEmail,
      name: encryptedName,
      userType,
      agreedToTerms,
      agreedToPrivacy,
      termsVersion: "1.0",
      privacyVersion: "1.0",
      ipAddress: encryptedIp,
      userAgent: encryptedUserAgent,
      timestamp: new Date(),
      documentHash,
    };

    const result = await db
      .collection<AgreementRecord>("agreement_records")
      .insertOne(agreementRecord);

    return NextResponse.json({
      success: true,
      message: "Agreement recorded successfully",
      recordId: result.insertedId,
    });
  } catch (error) {
    console.error("Error recording agreement:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to record agreement",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email query parameter required" },
        { status: 400 },
      );
    }

    const encryptedEmail = encryptData(email);
    const client = await getMongoClient();
    const db = client.db(process.env.MONGODB_DB);

    const agreements = await db
      .collection<AgreementRecord>("agreement_records")
      .find({ email: encryptedEmail })
      .sort({ timestamp: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: agreements,
    });
  } catch (error) {
    console.error("Error fetching agreements:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch agreements",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
