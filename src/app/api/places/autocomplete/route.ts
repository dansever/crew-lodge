/**
 * Places Autocomplete API route.
 * GET /api/places/autocomplete?input=...&region=us&language=en-US
 *
 * Proxies requests to the Google Places API (New) so the API key stays server-side.
 */

import { NextRequest, NextResponse } from 'next/server';

import { fetchPlaceAutocomplete } from '@/services/google-maps/place-autocomplete';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const input = searchParams.get('input')?.trim();

    if (!input) {
      return NextResponse.json(
        { error: 'Missing required query parameter: input' },
        { status: 400 },
      );
    }

    const regionCode = searchParams.get('region') ?? 'us';
    const languageCode = searchParams.get('language') ?? 'en-US';
    const sessionToken = searchParams.get('sessionToken') ?? undefined;

    const includedRegionCodesParam = searchParams.get('includedRegionCodes');
    const includedRegionCodes = includedRegionCodesParam
      ? includedRegionCodesParam.split(',').map(s => s.trim()).filter(Boolean)
      : undefined;

    const suggestions = await fetchPlaceAutocomplete(input, {
      languageCode,
      regionCode,
      sessionToken,
      includedRegionCodes,
    });

    return NextResponse.json({ suggestions });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Autocomplete request failed';
    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
