import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { currentUser } from '@clerk/nextjs/server';
import '@copilotkit/react-ui/styles.css';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AppSidebar } from './_components/AppSidebar';
import { Providers } from './providers';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side authentication check - gates unauthenticated users
  const user = await currentUser();
  if (!user) {
    redirect('/sign-in');
  }

  const cookieStore = await cookies();
  const sidebarState = cookieStore.get('sidebar_state')?.value;
  // Parse the cookie value - it will be "true" or "false" as a string
  // Default to true if the cookie doesn't exist yet
  const defaultOpen = sidebarState === 'false' ? false : true;

  return (
    <Providers>
      <SidebarProvider
        defaultOpen={defaultOpen}
        style={
          {
            '--sidebar-width': '12rem',
            '--sidebar-width-icon': '3rem',
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset>
          <main className="flex flex-col h-full w-full">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </Providers>
  );
}
