'use server';

/** Serializable place suggestion for client display */
export type PlaceSuggestion = {
  placeId: string;
  mainText: string;
  secondaryText: string | null;
};

/**
 * Server action: fetches place autocomplete suggestions from Google Places API.
 * Requires GOOGLE_APPLICATION_CREDENTIALS or GCP Application Default Credentials.
 */
export async function autocompletePlaces(
  input: string
): Promise<PlaceSuggestion[]> {
  if (!input || input.trim().length < 2) {
    return [];
  }

  try {
    const { PlacesClient } = (await import('@googlemaps/places')).v1;
    const placesClient = new PlacesClient();

    const [response] = await placesClient.autocompletePlaces({
      input: input.trim(),
    });

    const suggestions: PlaceSuggestion[] = [];

    for (const suggestion of response.suggestions ?? []) {
      const pred = suggestion.placePrediction;
      if (!pred?.placeId) continue;

      const mainText =
        pred.structuredFormat?.mainText?.text ?? pred.text?.text ?? '';
      const secondaryText =
        pred.structuredFormat?.secondaryText?.text ?? null;

      suggestions.push({
        placeId: pred.placeId,
        mainText,
        secondaryText,
      });
    }

    return suggestions;
  } catch (err) {
    console.error('[place-autocomplete]', (err as Error).message);
    return [];
  }
}
