import { NextRequest, NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const landlordId = searchParams.get("landlordId");

    if (!landlordId) {
      return NextResponse.json(
        { success: false, message: "Landlord ID required" },
        { status: 400 },
      );
    }

    const client = await getMongoClient();
    const db = client.db(process.env.MONGODB_DB);

    // First get landlord's properties
    const properties = await db
      .collection("properties")
      .find({ landlordId }, { projection: { _id: 1 } })
      .toArray();
    const propertyIds = properties.map((p) => p._id);

    // Then get applications for those properties
    const applications = await db
      .collection("applications")
      .find({ propertyId: { $in: propertyIds } })
      .toArray();

    return NextResponse.json({ success: true, data: applications });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          "Error fetching applications: " +
          (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid request" },
        { status: 400 },
      );
    }

    const client = await getMongoClient();
    const db = client.db(process.env.MONGODB_DB);

    const result = await db
      .collection("applications")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { status, updatedAt: new Date() } },
      );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
