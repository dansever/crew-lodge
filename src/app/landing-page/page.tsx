import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import LandingPageClient from './ClientPage';

export default async function LandingPage() {
  const { isAuthenticated } = await auth();
  if (!isAuthenticated) {
    redirect('/sign-in');
  }

  return <LandingPageClient />;
}
