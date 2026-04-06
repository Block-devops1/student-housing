import { seedDatabase } from '@/lib/seed';

export async function GET() {
  try {
    await seedDatabase();
    return new Response(JSON.stringify({
      success: true,
      message: 'Database seeded successfully'
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to seed database',
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}