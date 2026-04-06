import { NextRequest, NextResponse } from 'next/server';
import { getMongoClient } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const landlordId = searchParams.get('landlordId');

    if (!landlordId) {
      return NextResponse.json({ success: false, message: 'Landlord ID required' }, { status: 400 });
    }

    const client = await getMongoClient();
    const db = client.db();
    const properties = await db.collection('properties').find({ landlordId }).toArray();

    return NextResponse.json({ success: true, data: properties });
  } catch (error) {
    console.error('Error fetching landlord properties:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, address, price, bedrooms, bathrooms, amenities, landlordId, availabilityDate, isActive } = body;

    if (!title || !description || !address || !price || !bedrooms || !bathrooms || !landlordId) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const client = await getMongoClient();
    const db = client.db();

    const newProperty = {
      title,
      description,
      address,
      price: Number(price),
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      amenities: amenities || [],
      landlordId,
      images: [],
      availabilityDate: availabilityDate ? new Date(availabilityDate) : new Date(),
      isActive: isActive !== false, // defaults to true
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('properties').insertOne(newProperty);

    return NextResponse.json({
      success: true,
      data: { ...newProperty, _id: result.insertedId }
    });
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}