import { NextRequest, NextResponse } from 'next/server';
import { POPULAR_PRESETS } from '@/lib/routing/cities';
import { MAJOR_AIRPORTS } from '@/lib/routing/airports';
import { LocationPoint } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q')?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const normalizedQuery = query.toLowerCase();
  const matchedPoints: LocationPoint[] = [];

  // 1. Search local preset cities & airports first for sub-5ms instant response
  for (const preset of POPULAR_PRESETS) {
    if (preset.origin.name.toLowerCase().includes(normalizedQuery) || (preset.origin.city && preset.origin.city.toLowerCase().includes(normalizedQuery))) {
      if (!matchedPoints.some((p) => p.name === preset.origin.name)) {
        matchedPoints.push(preset.origin);
      }
    }
    if (preset.destination.name.toLowerCase().includes(normalizedQuery) || (preset.destination.city && preset.destination.city.toLowerCase().includes(normalizedQuery))) {
      if (!matchedPoints.some((p) => p.name === preset.destination.name)) {
        matchedPoints.push(preset.destination);
      }
    }
  }

  for (const airport of MAJOR_AIRPORTS) {
    if (
      airport.city.toLowerCase().includes(normalizedQuery) ||
      airport.iata.toLowerCase().includes(normalizedQuery) ||
      airport.name.toLowerCase().includes(normalizedQuery)
    ) {
      if (!matchedPoints.some((p) => p.name.includes(airport.iata))) {
        matchedPoints.push({
          name: `${airport.name} (${airport.iata}), ${airport.city}, ${airport.country}`,
          lat: airport.lat,
          lng: airport.lng,
          city: airport.city,
          country: airport.country,
        });
      }
    }
  }

  // 2. Fetch from OpenStreetMap Nominatim for open global geocoding
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
    const res = await fetch(nominatimUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'RouteWise-Transit-Engine/1.0',
        'Accept-Language': 'en',
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      for (const item of data) {
        const name = item.display_name;
        if (!matchedPoints.some((p) => Math.abs(p.lat - parseFloat(item.lat)) < 0.01 && Math.abs(p.lng - parseFloat(item.lon)) < 0.01)) {
          matchedPoints.push({
            name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            city: item.address?.city || item.address?.town || item.address?.village || item.address?.state,
            country: item.address?.country,
          });
        }
      }
    }
  } catch (e) {
    // Return whatever cached/preset points matched
  }

  return NextResponse.json({ results: matchedPoints.slice(0, 8) });
}
