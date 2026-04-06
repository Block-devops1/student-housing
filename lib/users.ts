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
