import { getMongoDatabase } from './mongodb';
import { User } from './types';

const db = getMongoDatabase();
const usersCollection = db.collection<User>('users');

export async function upsertStudentProfile(profile: Omit<User, '_id' | 'createdAt'>) {
  const now = new Date();

  const updateDoc = {
    $set: {
      ...profile,
      userType: 'student' as const,
      updatedAt: now,
    },
    $setOnInsert: {
      createdAt: now,
    },
  };

  const result = await usersCollection.updateOne(
    { email: profile.email },
    updateDoc,
    { upsert: true }
  );

  return result;
}

export async function upsertLandlordProfile(profile: {
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
}) {
  const now = new Date();

  const updateDoc = {
    $set: {
      name: profile.name,
      email: profile.email,
      phone: profile.phone || '',
      companyName: profile.companyName || '',
      userType: 'landlord' as const,
      updatedAt: now,
    },
    $setOnInsert: {
      properties: [],
      createdAt: now,
    },
  };

  const result = await usersCollection.updateOne(
    { email: profile.email },
    updateDoc,
    { upsert: true }
  );

  return result;
}

export async function getStudentProfileByEmail(email: string): Promise<User | null> {
  return await usersCollection.findOne({ email });
}
