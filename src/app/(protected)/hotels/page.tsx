import { api } from '@/convex/_generated/api';
import { auth } from '@clerk/nextjs/server';
import { preloadQuery } from 'convex/nextjs';
import { redirect } from 'next/navigation';
import HotelsClientPage from './ClientPage';
import { HotelsContextProvider } from './ContextProvider';

export default async function HotelsPage() {
  const { isAuthenticated, getToken } = await auth();
  if (!isAuthenticated) {
    redirect('/sign-in');
  }

  const token = (await getToken({ template: 'convex' })) ?? '';

  const preloadedHotels = await preloadQuery(
    api.functions.hotels.listMyHotels,
    {},
    { token }
  );

  return (
    <HotelsContextProvider preloadedHotels={preloadedHotels}>
      <HotelsClientPage />
    </HotelsContextProvider>
  );
}
