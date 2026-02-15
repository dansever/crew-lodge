import { api } from '@/convex/_generated/api';
import { auth } from '@clerk/nextjs/server';
import { preloadQuery } from 'convex/nextjs';
import { redirect } from 'next/navigation';
import DisruptionsClientPage from './ClientPage';
import { DisruptionsContextProvider } from './ContextProvider';

export default async function DisruptionsPage() {
  const { isAuthenticated, getToken } = await auth();
  if (!isAuthenticated) {
    redirect('/sign-in');
  }

  const token = (await getToken({ template: 'convex' })) ?? '';
  const preloadedData = await preloadQuery(
    api.functions.aggregates.disruptionsPage.getDisruptionsPageData,
    {},
    { token }
  );

  return (
    <DisruptionsContextProvider preloadedData={preloadedData}>
      <DisruptionsClientPage />
    </DisruptionsContextProvider>
  );
}
