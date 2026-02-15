import { z } from 'zod';

export const parseDisruptionSchema = z.object({
  location: z
    .string()
    .describe(
      'Airport code IATA/ICAO or city name for matching, e.g. DEN, Denver'
    ),
  eventType: z.enum(['delay', 'cancellation', 'diversion']),
  crewSize: z.number(),
  nights: z.number(),
  eventReason: z.string().optional(),
  eventSummary: z
    .string()
    .describe(
      'Concise 1-2 sentence summary of the disruption for display, e.g. "Aircraft delay in Rome; 4 crew need 2 nights."'
    ),
  notes: z.string().optional(),
});

export type ParseDisruptionResult = z.infer<typeof parseDisruptionSchema>;
