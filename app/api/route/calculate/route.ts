import { NextRequest, NextResponse } from 'next/server';
import { calculateAllRoutes } from '@/lib/routing/cost-engine';
import { RouteSearchRequest } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body: RouteSearchRequest = await req.json();

    if (!body.origin || !body.destination) {
      return NextResponse.json(
        { error: 'Origin and destination are required with lat and lng' },
        { status: 400 }
      );
    }

    if (body.origin.lat == null || body.origin.lng == null || body.destination.lat == null || body.destination.lng == null) {
      return NextResponse.json(
        { error: 'Valid numerical coordinates required for origin and destination' },
        { status: 400 }
      );
    }

    const maxBudget = Number(body.maxBudget) || 100;
    const priority = body.priority || 'balanced';
    const currency = body.currency || 'USD';

    const result = await calculateAllRoutes({
      origin: body.origin,
      destination: body.destination,
      maxBudget,
      priority,
      currency,
      customParams: body.customParams,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API calculate error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error calculating routes' },
      { status: 500 }
    );
  }
}
