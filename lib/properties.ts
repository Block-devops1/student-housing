import { getMongoClient } from "./mongodb";
import { Property } from "./types";

// Helper to get properties collection
async function getPropertiesCollection() {
  const client = await getMongoClient();
  const db = client.db(process.env.MONGODB_DB);
  return db.collection<Property>("properties");
}

// Get all active properties
export async function getActiveProperties(
  limit: number = 10,
): Promise<Property[]> {
  const collection = await getPropertiesCollection();
  return await collection
    .find({ isActive: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}

export async function searchProperties(filters: {
  city?: string;
  maxPrice?: number;
  minBedrooms?: number;
  amenities?: string[];
  query?: string;
  limit?: number;
}): Promise<Property[]> {
  const collection = await getPropertiesCollection();
  const query: Record<string, unknown> = { isActive: true };

  if (filters.city) {
    query["address.city"] = { $regex: filters.city, $options: "i" };
  }

  if (filters.query) {
    const textRegex = { $regex: filters.query, $options: "i" };
    query.$or = [
      { title: textRegex },
      { description: textRegex },
      { "address.city": textRegex },
      { "address.state": textRegex },
      { "address.street": textRegex },
    ];
  }

  if (typeof filters.maxPrice === "number") {
    query.price = { ...(query.price as object), $lte: filters.maxPrice };
  }

  if (typeof filters.minBedrooms === "number") {
    query.bedrooms = {
      ...(query.bedrooms as object),
      $gte: filters.minBedrooms,
    };
  }

  if (filters.amenities && filters.amenities.length > 0) {
    query.amenities = { $all: filters.amenities };
  }

  return await collection
    .find(query)
    .sort({ createdAt: -1 })
    .limit(filters.limit ?? 20)
    .toArray();
}

// Get property by ID
export async function getPropertyById(id: string): Promise<Property | null> {
  const collection = await getPropertiesCollection();
  return await collection.findOne({ _id: id, isActive: true });
}

// Search properties by location
export async function searchPropertiesByLocation(
  city: string,
  limit: number = 20,
): Promise<Property[]> {
  const collection = await getPropertiesCollection();
  return await collection
    .find({
      isActive: true,
      "address.city": { $regex: city, $options: "i" },
    })
    .limit(limit)
    .toArray();
}

// Get properties by price range
export async function getPropertiesByPriceRange(
  minPrice: number,
  maxPrice: number,
): Promise<Property[]> {
  const collection = await getPropertiesCollection();
  return await collection
    .find({
      isActive: true,
      price: { $gte: minPrice, $lte: maxPrice },
    })
    .sort({ price: 1 })
    .toArray();
}

// Create a new property
export async function createProperty(
  property: Omit<Property, "_id" | "createdAt" | "updatedAt">,
): Promise<Property> {
  const collection = await getPropertiesCollection();
  const now = new Date();
  const newProperty: Property = {
    ...property,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(newProperty);
  return { ...newProperty, _id: result.insertedId.toString() };
}

// Update property
export async function updateProperty(
  id: string,
  updates: Partial<Property>,
): Promise<boolean> {
  const collection = await getPropertiesCollection();
  const result = await collection.updateOne(
    { _id: id },
    {
      $set: { ...updates, updatedAt: new Date() },
    },
  );
  return result.modifiedCount > 0;
}

// Delete property (soft delete)
export async function deleteProperty(id: string): Promise<boolean> {
  const collection = await getPropertiesCollection();
  const result = await collection.updateOne(
    { _id: id },
    { $set: { isActive: false, updatedAt: new Date() } },
  );
  return result.modifiedCount > 0;
}
