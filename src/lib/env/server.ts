// src/lib/env/server.ts
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

// Detect if we're running in Mastra dev server context
// Mastra runs from .mastra directory or sets MASTRA_DEV env var
const isMastraContext =
  typeof process !== 'undefined' &&
  (process.env.MASTRA_DEV === 'true' ||
    process.env.SKIP_ENV_VALIDATION === 'true' ||
    process.cwd().includes('.mastra') ||
    process.argv.some(arg => arg.includes('mastra')));

export const serverEnv = createEnv({
  emptyStringAsUndefined: true,
  skipValidation: isMastraContext, // Skip validation in Mastra context
  server: {
    // Environments
    NODE_ENV: z.enum(['development', 'production']).default('development'),

    // Clerk server
    CLERK_SECRET_KEY: z.string().min(1).startsWith('sk_'),

    // Mastra
    MASTRA_API_KEY: z.string().min(1),

    // OpenAI
    OPENAI_API_KEY: z.string().min(1).startsWith('sk-'),
    OPENAI_MODEL: z.string().min(1),

    // Convex
    CONVEX_DEPLOYMENT: z.string().optional(),

    // Google
    GEMINI_API_KEY: z.string().min(1),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    GOOGLE_MAPS_PLATFORM_API_KEY: z.string().min(1),

    // Tavily
    TAVILY_API_KEY: z.string().min(1),
  },
  experimental__runtimeEnv: process.env,
});
