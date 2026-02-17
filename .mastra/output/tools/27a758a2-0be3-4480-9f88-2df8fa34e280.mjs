import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';
import { createTool } from '@mastra/core/tools';
import { tavily } from '@tavily/core';

const isMastraContext =
  typeof process !== 'undefined' &&
  (process.env.MASTRA_DEV === 'true' ||
    process.env.SKIP_ENV_VALIDATION === 'true' ||
    process.cwd().includes('.mastra') ||
    process.argv.some(arg => arg.includes('mastra')));
const serverEnv = createEnv({
  emptyStringAsUndefined: true,
  skipValidation: isMastraContext,
  // Skip validation in Mastra context
  server: {
    // Environments
    NODE_ENV: z.enum(['development', 'production']).default('development'),
    // Clerk server
    CLERK_SECRET_KEY: z.string().min(1).startsWith('sk_'),
    CLERK_JWKS_URI: z.string().min(1),
    CLERK_JWT_ISSUER_DOMAIN: z.string().min(1),
    // OpenAI
    OPENAI_API_KEY: z.string().min(1).startsWith('sk_'),
    OPENAI_MODEL: z.string().min(1),
    // Convex
    CONVEX_DEPLOYMENT: z.string().optional(),
    // Google
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GEMINI_API_KEY: z.string().min(1),
    // Upstash Redis
    UPSTASH_REDIS_REST_URL: z.string().min(1),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
    // AI Gateway
    AI_GATEWAY_API_KEY: z.string().min(1),
    // Tavily
    TAVILY_API_KEY: z.string().min(1),
  },
  experimental__runtimeEnv: process.env,
});

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
const webSearchTool = createTool({
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

export { webSearchTool };
