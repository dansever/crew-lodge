import { api } from '@/convex/_generated/api';
import { auth } from '@clerk/nextjs/server';
import { preloadQuery } from 'convex/nextjs';
import { redirect } from 'next/navigation';
import BookingsClientPage from './ClientPage';
import { BookingsContextProvider } from './ContextProvider';

export default async function BookingsPage() {
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
    <BookingsContextProvider preloadedHotels={preloadedHotels}>
      <BookingsClientPage />
    </BookingsContextProvider>
  );
}
