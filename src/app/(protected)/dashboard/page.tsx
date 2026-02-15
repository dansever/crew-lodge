import { api } from '@/convex/_generated/api';
import { auth } from '@clerk/nextjs/server';
import { preloadQuery } from 'convex/nextjs';
import { redirect } from 'next/navigation';
import DashboardClientPage from './ClientPage';
import { DashboardContextProvider } from './ContextProvider';

export default async function DashboardPage() {
  const { isAuthenticated, getToken } = await auth();
  if (!isAuthenticated) {
    redirect('/sign-in');
  }

  const token = (await getToken({ template: 'convex' })) ?? '';
  const preloadedDashboard = await preloadQuery(
    api.functions.aggregates.dashboard.getDashboard,
    {},
    { token }
  );

  return (
    <DashboardContextProvider preloadedDashboard={preloadedDashboard}>
      <DashboardClientPage />
    </DashboardContextProvider>
  );
}
