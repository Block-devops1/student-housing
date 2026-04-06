import { NextRequest } from 'next/server';
import { upsertStudentProfile } from '@/lib/users';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, email, phone, university, preferences } = body;

    if (!name || !email) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Name and email are required.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await upsertStudentProfile({
      name,
      email,
      phone,
      userType: 'student',
      university,
      preferences,
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Student profile saved successfully.',
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error saving student profile:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Unable to save student profile.',
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
