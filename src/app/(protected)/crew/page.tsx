import { api } from '@/convex/_generated/api';
import { auth } from '@clerk/nextjs/server';
import { preloadQuery } from 'convex/nextjs';
import { redirect } from 'next/navigation';
import CrewMembersClientPage from './ClientPage';
import { CrewMembersContextProvider } from './ContextProvider';

export default async function CrewMembersPage() {
  const { isAuthenticated, getToken } = await auth();
  if (!isAuthenticated) {
    redirect('/sign-in');
  }

  const token = (await getToken({ template: 'convex' })) ?? '';
  const preloadedCrewOverview = await preloadQuery(
    api.functions.aggregates.crewMembersPage.getCrewMembersPageData,
    {},
    { token }
  );

  return (
    <CrewMembersContextProvider preloadedCrewOverview={preloadedCrewOverview}>
      <CrewMembersClientPage />
    </CrewMembersContextProvider>
  );
}
