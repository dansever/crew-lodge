'use server';

import { getHotelInfoAgent } from '@/mastra/agents/hotel-info-agent';
import { z } from 'zod';

const hotelLookupSchema = z.object({
  name: z.string().optional().describe('Full hotel name'),
  brand: z.string().optional().describe('Hotel brand (e.g. Hilton, Marriott)'),
  address: z.string().optional().describe('Street address'),
  city: z.string().optional().describe('City'),
  state: z.string().optional().describe('State or region'),
  country: z.string().optional().describe('Country'),
  postalCode: z.string().optional().describe('Postal or zip code'),
  phone: z.string().optional().describe('Phone number with country code'),
  email: z.string().optional().describe('Hotel email'),
  website: z.string().optional().describe('Hotel website URL'),
});

export type HotelLookupResult = z.infer<typeof hotelLookupSchema>;

/**
 * Calls the hotel-info agent to find and extract contact/location details.
 * Uses web search, then returns structured data matching the schema.
 */
export async function lookupHotelInfo(
  prompt: string
): Promise<HotelLookupResult> {
  const response = await getHotelInfoAgent.generate(
    `Find the hotel: "${prompt}". Use web search to look up its address, phone, email, and website. Extract the structured fields. Include full hotel name and brand if found.`,
    {
      structuredOutput: {
        schema: hotelLookupSchema,
        jsonPromptInjection: true, // Required when agent has tools
      },
    }
  );

  const data = response.object;
  if (!data) {
    return {};
  }

  return hotelLookupSchema.parse(data);
}
