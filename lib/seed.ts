import { getMongoDatabase } from './mongodb';
import { Property, User } from './types';

const db = getMongoDatabase();

export async function seedDatabase() {
  try {
    // Clear existing data
    await db.collection('properties').deleteMany({});
    await db.collection('users').deleteMany({});

    // Sample users
    const sampleUsers: Omit<User, '_id'>[] = [
      {
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '555-0101',
        userType: 'landlord',
        properties: [],
        createdAt: new Date(),
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '555-0102',
        userType: 'landlord',
        properties: [],
        createdAt: new Date(),
      },
      {
        name: 'Mike Davis',
        email: 'mike.davis@email.com',
        phone: '555-0103',
        userType: 'student',
        university: 'State University',
        preferences: {
          maxPrice: 1500,
          minBedrooms: 1,
          preferredAmenities: ['parking', 'laundry'],
        },
        createdAt: new Date(),
      },
    ];

    const insertedUsers = await db.collection('users').insertMany(sampleUsers);
    const userIds = Object.values(insertedUsers.insertedIds);

    // Sample properties
    const sampleProperties: Omit<Property, '_id'>[] = [
      {
        title: 'Modern Student Apartment',
        description: 'Beautiful modern apartment perfect for students. Walking distance to campus with all amenities included.',
        address: {
          street: '123 University Ave',
          city: 'College Town',
          state: 'CA',
          zipCode: '90210',
          coordinates: [-118.2437, 34.0522],
        },
        price: 1200,
        bedrooms: 2,
        bathrooms: 1,
        squareFootage: 850,
        amenities: ['parking', 'laundry', 'pet-friendly', 'wifi', 'gym'],
        images: ['/placeholder-property-1.jpg'],
        landlordId: userIds[0].toString(),
        availabilityDate: new Date('2024-09-01'),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Cozy Studio Near University',
        description: 'Charming studio apartment in the heart of the university district. Perfect for graduate students.',
        address: {
          street: '456 Campus Drive',
          city: 'College Town',
          state: 'CA',
          zipCode: '90211',
          coordinates: [-118.2537, 34.0622],
        },
        price: 950,
        bedrooms: 0,
        bathrooms: 1,
        squareFootage: 450,
        amenities: ['wifi', 'gym', 'laundry'],
        images: ['/placeholder-property-2.jpg'],
        landlordId: userIds[1].toString(),
        availabilityDate: new Date('2024-08-15'),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Shared House with Students',
        description: 'Friendly shared house with 3 other students. Great community atmosphere and utilities included.',
        address: {
          street: '789 Student Lane',
          city: 'College Town',
          state: 'CA',
          zipCode: '90212',
          coordinates: [-118.2637, 34.0722],
        },
        price: 800,
        bedrooms: 3,
        bathrooms: 2,
        squareFootage: 1800,
        amenities: ['utilities-included', 'parking', 'laundry'],
        images: ['/placeholder-property-3.jpg'],
        landlordId: userIds[0].toString(),
        availabilityDate: new Date('2024-08-01'),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Luxury Student Condo',
        description: 'High-end condo with premium amenities. Perfect for students who want comfort and convenience.',
        address: {
          street: '321 Premium Street',
          city: 'College Town',
          state: 'CA',
          zipCode: '90213',
          coordinates: [-118.2737, 34.0822],
        },
        price: 1800,
        bedrooms: 2,
        bathrooms: 2,
        squareFootage: 1100,
        amenities: ['parking', 'gym', 'pool', 'wifi', 'laundry', 'pet-friendly'],
        images: ['/placeholder-property-4.jpg'],
        landlordId: userIds[1].toString(),
        availabilityDate: new Date('2024-09-15'),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await db.collection('properties').insertMany(sampleProperties);

    // Update landlord properties arrays
    await db.collection('users').updateOne(
      { _id: userIds[0] },
      { $set: { properties: [sampleProperties[0], sampleProperties[2]].map(p => p._id?.toString()) } }
    );

    await db.collection('users').updateOne(
      { _id: userIds[1] },
      { $set: { properties: [sampleProperties[1], sampleProperties[3]].map(p => p._id?.toString()) } }
    );

    console.log('Database seeded successfully!');
    console.log(`Created ${sampleUsers.length} users and ${sampleProperties.length} properties`);

  } catch (error) {
    console.error('Error seeding database:', error);
  }
}