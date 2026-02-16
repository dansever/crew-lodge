'use client';

import { BrandLogo } from '@/components/BrandLogo';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { UserButton, useUser } from '@clerk/nextjs';
import {
  AlertTriangle,
  Calendar,
  Home,
  Hotel,
  Settings,
  Users,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';
import { useRef } from 'react';

/**
 * AppSidebar component
 * @param variant - The variant of the sidebar
 * @param props - The props of the sidebar
 * @returns The AppSidebar component
 */
export function AppSidebar() {
  const [isClient, setIsClient] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const { user, isLoaded } = useUser();
  const { state } = useSidebar();
  const { theme } = useTheme();
  const pathname = usePathname();
  const isCollapsed = state === 'collapsed';
  const isDark = theme === 'dark';

  const router = useRouter();

  React.useEffect(() => {
    setIsClient(true);
    setMounted(true);
  }, []);

  const userData = {
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    position: (user?.publicMetadata?.position as string | undefined) || '',
  };

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      className="border-r border-r-slate-200"
    >
      <SidebarHeader
        className={cn(
          'flex flex-row items-center w-full h-16 min-h-16 px-2',
          'transition-all duration-100 ease-in-out'
        )}
      >
        <div
          id="brand-logo"
          className={cn(
            'w-full  flex items-center h-full transition-all duration-100 ease-in-out',
            isCollapsed
              ? 'opacity-0 scale-95 max-w-0'
              : 'opacity-100 scale-100 max-w-[140px]'
          )}
          style={{ transitionProperty: 'opacity, transform, max-width' }}
        >
          {!mounted ? (
            <BrandLogo theme="light" /> // Default fallback
          ) : (
            <BrandLogo
              theme={isDark ? 'dark' : 'light'}
              onClick={() => router.push('/dashboard')}
            />
          )}
        </div>
        <SidebarTrigger
          className={cn(
            'shadow-none transition-all duration-100 ease-in-out',
            'hover:bg-transparent cursor-pointer',
            'hover:bg-slate-200 rounded-sm p-4',
            isCollapsed ? 'absolute left-1/2 -translate-x-1/2' : 'ml-auto'
          )}
        />
      </SidebarHeader>
      <SidebarContent className="overflow-hidden flex flex-col gap-2 justify-between">
        <SidebarMenu>
          {sidebarTabs.map(item => (
            <SidebarMenuItem key={item.value} className="px-2">
              <SidebarMenuButton asChild tooltip={item.value}>
                <Link
                  href={item.url}
                  className={cn(
                    'py-4.5 hover:bg-slate-200 dark:hover:bg-slate-800',
                    pathname === item.url && 'bg-slate-100 dark:bg-slate-800/50'
                  )}
                >
                  {item.icon && <item.icon />}
                  <span>{item.value}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <AppSidebarUser
          user={userData}
          isLoaded={isLoaded}
          isClient={isClient}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

// ============== AppSidebarUser component ==============

interface AppSidebarUserProps {
  user: {
    firstName?: string;
    lastName?: string;
    position?: string;
  };
  isLoaded: boolean;
  isClient: boolean;
}

function AppSidebarUser({ user, isLoaded, isClient }: AppSidebarUserProps) {
  const userButtonRef = useRef<HTMLDivElement | null>(null);
  const { state } = useSidebar();
  const isCollapsed = isClient ? state === 'collapsed' : false;

  // Derive user display data
  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : '';
  const position = user?.position || '';

  const handleRowClick = (e: React.MouseEvent) => {
    // Check if the click is directly on the UserButton or its children
    if (userButtonRef.current?.contains(e.target as Node)) {
      // Let the UserButton handle its own click naturally
      return;
    }

    // Otherwise, we clicked on the surrounding area (name/badge)
    // So programmatically trigger the UserButton
    e.preventDefault();
    e.stopPropagation();

    const button = userButtonRef.current?.querySelector('button');
    if (button) {
      button.click();
    }
  };

  // Show skeleton during initial hydration or while loading
  if (!isClient || !isLoaded) {
    return (
      <div className="z-50">
        <div className="flex items-center gap-2 p-2 pl-0">
          <Avatar>
            <AvatarFallback>
              <div className="w-full h-full bg-muted animate-pulse" />
            </AvatarFallback>
          </Avatar>
          <div
            suppressHydrationWarning
            className={cn(
              'grid flex-1 text-left text-sm leading-tight gap-1 transition-all duration-300 ease-in-out',
              isCollapsed
                ? 'opacity-0 scale-90 max-w-0 overflow-hidden'
                : 'opacity-100 scale-100 max-w-[140px]'
            )}
          >
            <Skeleton className="w-20 h-4" />
            <Skeleton className="w-14 h-4" />
          </div>
        </div>
      </div>
    );
  }

  // Show signed-in user
  if (user) {
    return (
      <div className="z-50">
        <div
          className="flex items-center gap-2 cursor-pointer p-2 pl-0 hover:bg-sidebar-accent rounded-md transition-colors"
          onClick={handleRowClick}
        >
          <div ref={userButtonRef}>
            <UserButton showName={false} />
          </div>
          <div
            suppressHydrationWarning
            className={cn(
              'grid flex-1 text-left text-sm leading-tight transition-all duration-300 ease-in-out',
              isCollapsed
                ? 'opacity-0 scale-90 max-w-0 overflow-hidden'
                : 'opacity-100 scale-100 max-w-[140px]'
            )}
          >
            <span className="truncate font-medium">{fullName}</span>
            {position && (
              <Badge variant="secondary">{position as string}</Badge>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show signed-out state
  return (
    <div className="z-50">
      <div className="flex items-center gap-2 p-2 pl-0">
        <Avatar>
          <AvatarFallback />
        </Avatar>
        <div className="grid flex-1 text-left text-sm leading-tight gap-1">
          <span className="text-xs text-muted-foreground">Not signed in</span>
        </div>
      </div>
    </div>
  );
}

export interface SidebarTabItem {
  value: string;
  url: string;
  icon?: React.ElementType;
}

export const sidebarTabs: SidebarTabItem[] = [
  {
    value: 'Dashboard',
    url: '/dashboard',
    icon: Home,
  },
  {
    value: 'Bookings',
    url: '/bookings',
    icon: Calendar,
  },
  {
    value: 'Hotels',
    url: '/hotels',
    icon: Hotel,
  },
  {
    value: 'Crew',
    url: '/crew',
    icon: Users,
  },
  {
    value: 'Disruptions',
    url: '/disruptions',
    icon: AlertTriangle,
  },
  {
    value: 'Settings',
    url: '/settings',
    icon: Settings,
  },
];
