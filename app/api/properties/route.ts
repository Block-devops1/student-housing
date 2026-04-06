import { getActiveProperties, searchProperties } from '@/lib/properties';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const city = searchParams.get('city')?.trim() || undefined;
    const query = searchParams.get('query')?.trim() || undefined;
    const maxPrice = searchParams.has('maxPrice')
      ? Number(searchParams.get('maxPrice'))
      : undefined;
    const minBedrooms = searchParams.has('minBedrooms')
      ? Number(searchParams.get('minBedrooms'))
      : undefined;
    const amenitiesParam = searchParams.get('amenities');
    const amenities = amenitiesParam
      ? amenitiesParam.split(',').map((item) => item.trim()).filter(Boolean)
      : [];

    const hasFilters = Boolean(
      city || query || maxPrice !== undefined || minBedrooms !== undefined || amenities.length > 0
    );

    const properties = hasFilters
      ? await searchProperties({
          city,
          query,
          maxPrice: !Number.isNaN(maxPrice) ? maxPrice : undefined,
          minBedrooms: !Number.isNaN(minBedrooms) ? minBedrooms : undefined,
          amenities,
          limit,
        })
      : await getActiveProperties(limit);

    return new Response(JSON.stringify({
      success: true,
      data: properties,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to fetch properties',
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}