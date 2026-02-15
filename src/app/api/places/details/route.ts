/**
 * Place Details API route.
 * GET /api/places/details?placeId=...
 *
 * Proxies requests to the Google Places API (New) so the API key stays server-side.
 */

import { NextRequest, NextResponse } from 'next/server';

import { getPlaceDetails } from '@/services/google-maps/get-place-details';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get('placeId')?.trim();

    if (!placeId) {
      return NextResponse.json(
        { error: 'Missing required query parameter: placeId' },
        { status: 400 }
      );
    }

    const languageCode = searchParams.get('language') ?? 'en';
    const regionCode = searchParams.get('region') ?? undefined;
    const sessionToken = searchParams.get('sessionToken') ?? undefined;
    const fields = searchParams.get('fields') ?? undefined;

    const place = await getPlaceDetails(placeId, {
      languageCode,
      regionCode,
      sessionToken,
      fields,
    });

    return NextResponse.json(place);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Place details request failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
