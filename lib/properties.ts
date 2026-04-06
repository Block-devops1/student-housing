import { getMongoDatabase } from './mongodb';
import { Property } from './types';

const db = getMongoDatabase();
const propertiesCollection = db.collection<Property>('properties');

// Get all active properties
export async function getActiveProperties(limit: number = 10): Promise<Property[]> {
  return await propertiesCollection
    .find({ isActive: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();
}

// Get property by ID
export async function getPropertyById(id: string): Promise<Property | null> {
  return await propertiesCollection.findOne({ _id: id, isActive: true });
}

// Search properties by location
export async function searchPropertiesByLocation(city: string, limit: number = 20): Promise<Property[]> {
  return await propertiesCollection
    .find({
      isActive: true,
      'address.city': { $regex: city, $options: 'i' }
    })
    .limit(limit)
    .toArray();
}

// Get properties by price range
export async function getPropertiesByPriceRange(minPrice: number, maxPrice: number): Promise<Property[]> {
  return await propertiesCollection
    .find({
      isActive: true,
      price: { $gte: minPrice, $lte: maxPrice }
    })
    .sort({ price: 1 })
    .toArray();
}

// Create a new property
export async function createProperty(property: Omit<Property, '_id' | 'createdAt' | 'updatedAt'>): Promise<Property> {
  const now = new Date();
  const newProperty: Property = {
    ...property,
    createdAt: now,
    updatedAt: now,
  };

  const result = await propertiesCollection.insertOne(newProperty);
  return { ...newProperty, _id: result.insertedId.toString() };
}

// Update property
export async function updateProperty(id: string, updates: Partial<Property>): Promise<boolean> {
  const result = await propertiesCollection.updateOne(
    { _id: id },
    {
      $set: { ...updates, updatedAt: new Date() }
    }
  );
  return result.modifiedCount > 0;
}

// Delete property (soft delete)
export async function deleteProperty(id: string): Promise<boolean> {
  const result = await propertiesCollection.updateOne(
    { _id: id },
    { $set: { isActive: false, updatedAt: new Date() } }
  );
  return result.modifiedCount > 0;
}