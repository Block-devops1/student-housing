import { NextRequest, NextResponse } from 'next/server';
import { upsertLandlordProfile } from '@/lib/users';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, companyName, userType } = body;

    if (!name || !email || userType !== 'landlord') {
      return NextResponse.json(
        { success: false, message: 'Missing required landlord fields' },
        { status: 400 }
      );
    }

    await upsertLandlordProfile({
      name,
      email,
      phone,
      companyName,
    });

    return NextResponse.json({
      success: true,
      data: { name, email, phone, companyName, _id: email },
      message: 'Landlord registered successfully',
    });
  } catch (error) {
    console.error('Error registering landlord:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
