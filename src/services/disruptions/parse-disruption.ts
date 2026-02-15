'use server';

import { parseDisruptionAgent } from '@/mastra/agents/parse-disruption-agent';
import {
  parseDisruptionSchema,
  type ParseDisruptionResult,
} from './parse-disruption-schema';

/**
 * Calls the parse-disruption agent to extract structured fields from free-text.
 * Use in disruption forms to auto-fill from a description.
 */
export async function parseDisruptionText(
  prompt: string
): Promise<ParseDisruptionResult> {
  const response = await parseDisruptionAgent.generate(
    `Parse this disruption description and extract the structured fields:\n\n"${prompt}"`,
    {
      structuredOutput: {
        schema: parseDisruptionSchema,
      },
    }
  );

  const data = response.object;
  if (!data) {
    throw new Error('Failed to parse disruption description');
  }

  return parseDisruptionSchema.parse(data);
}
