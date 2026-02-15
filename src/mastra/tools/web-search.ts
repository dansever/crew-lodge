import { serverEnv } from '@/lib/env/server';
import { createTool } from '@mastra/core/tools';
import { tavily } from '@tavily/core';
import { z } from 'zod';

const webSearchInputSchema = z.object({
  query: z.string().min(1).describe('Search query'),
});

const webSearchOutputSchema = z.object({
  query: z.string().describe('The search query executed'),
  answer: z.string().describe('AI-synthesized answer from search results'),
  results: z
    .array(
      z.object({
        title: z.string().describe('Result title'),
        url: z.string().describe('Result URL'),
        content: z.string().describe('Result snippet'),
      })
    )
    .describe('Ranked search results'),
});

export const webSearchTool = createTool({
  id: 'web-search',
  description:
    'Search the web using Tavily. Returns an answer and source results.',
  inputSchema: webSearchInputSchema,
  outputSchema: webSearchOutputSchema,
  execute: async ({ query }) => {
    const tvly = tavily({ apiKey: serverEnv.TAVILY_API_KEY });
    const response = await tvly.search(query);

    return {
      query: response.query ?? query,
      answer: response.answer ?? '',
      results: (response.results ?? []).map(r => ({
        title: r.title,
        url: r.url,
        content: r.content,
      })),
    };
  },
});
