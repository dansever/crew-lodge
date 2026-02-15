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
  const preloadedBookings = await preloadQuery(
    api.functions.bookings.listMyBookings,
    {},
    { token }
  );

  return (
    <BookingsContextProvider preloadedBookings={preloadedBookings}>
      <BookingsClientPage />
    </BookingsContextProvider>
  );
}
