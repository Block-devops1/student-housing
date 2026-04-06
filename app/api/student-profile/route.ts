import { NextRequest } from 'next/server';
import { getStudentProfileByEmail, upsertStudentProfile } from '@/lib/users';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Email query parameter is required.',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const profile = await getStudentProfileByEmail(email);

    if (!profile) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Student profile not found.',
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: profile,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching student profile:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Unable to load student profile.',
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, email, phone, university, preferences } = body;

    if (!name || !email) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Name and email are required.',
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
