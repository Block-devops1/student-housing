import { NextRequest, NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";

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
    const properties = await db
      .collection("properties")
      .find({ landlordId })
      .toArray();

    return NextResponse.json({ success: true, data: properties });
  } catch (error) {
    console.error("Error fetching landlord properties:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          "Error fetching properties: " +
          (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      address,
      price,
      bedrooms,
      bathrooms,
      amenities,
      landlordId,
      availabilityDate,
      isActive,
    } = body;

    // Validate required fields - allow 0 for bedrooms/bathrooms (studio apartments)
    if (
      !title ||
      !description ||
      !address ||
      price === undefined ||
      bedrooms === undefined ||
      bathrooms === undefined ||
      !landlordId
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing required fields. Title, description, address, price, bedrooms, bathrooms, and landlordId are required.",
        },
        { status: 400 },
      );
    }

    // Validate address structure
    if (!address.street || !address.city || !address.state) {
      return NextResponse.json(
        {
          success: false,
          message: "Address must include street, city, and state.",
        },
        { status: 400 },
      );
    }

    // Validate numeric fields
    const numPrice = Number(price);
    const numBedrooms = Number(bedrooms);
    const numBathrooms = Number(bathrooms);

    if (isNaN(numPrice) || numPrice <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Price must be a positive number.",
        },
        { status: 400 },
      );
    }

    if (isNaN(numBedrooms) || numBedrooms < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Bedrooms must be a non-negative number.",
        },
        { status: 400 },
      );
    }

    if (isNaN(numBathrooms) || numBathrooms < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Bathrooms must be a non-negative number.",
        },
        { status: 400 },
      );
    }

    const client = await getMongoClient();
    const db = client.db(process.env.MONGODB_DB);

    const newProperty = {
      title,
      description,
      address,
      price: numPrice,
      bedrooms: numBedrooms,
      bathrooms: numBathrooms,
      amenities: amenities || [],
      landlordId,
      images: [],
      availabilityDate: availabilityDate
        ? new Date(availabilityDate)
        : new Date(),
      isActive: isActive !== false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("properties").insertOne(newProperty);

    return NextResponse.json({
      success: true,
      data: { ...newProperty, _id: result.insertedId },
    });
  } catch (error) {
    console.error("Error creating property:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create property: " + errorMessage,
      },
      { status: 500 },
    );
  }
}
