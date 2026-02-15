'use client';

import { MarketProvider } from '@/app/(protected)/_contexts/MarketContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAuth } from '@clerk/nextjs';
import { CopilotKit } from '@copilotkit/react-core';
import { CopilotSidebar } from '@copilotkit/react-ui';
import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';

// Check if the NEXT_PUBLIC_CONVEX_URL is set
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error('Missing NEXT_PUBLIC_CONVEX_URL in your .env file');
}

// Create a new ConvexReactClient instance
const convex = new ConvexReactClient(convexUrl);

// Providers wrapper component
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <TooltipProvider delayDuration={0}>
          <MarketProvider>
            <CopilotKit runtimeUrl="/api/copilotkit" agent="getHotelInfoAgent">
              {children}
              <CopilotSidebar />
              <Toaster />
            </CopilotKit>
          </MarketProvider>
        </TooltipProvider>
      </ConvexProviderWithClerk>
    </ThemeProvider>
  );
}
