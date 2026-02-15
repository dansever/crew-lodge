'use client';

import DestinationSelector from '@/app/(protected)/_components/MarketSelector';
import { ThemeModeToggle } from '@/components/ThemeModeToggle';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Input } from '@/stories';
import Link from 'next/link';

interface AppHeaderProps {
  content?: React.ReactNode;
  breadcrumbs?: { label: string; href: string }[];
  actions?: React.ReactNode;
}

export function AppHeader({
  content,
  breadcrumbs = [],
  actions,
}: AppHeaderProps) {
  return (
    <header className="h-12 flex items-center justify-between gap-4">
      {/* Left section: DestinationSelector, Content and breadcrumbs */}
      <div className="flex items-center min-w-0">
        <div className="flex flex-row gap-4 min-w-0">
          <div className="shrink-0">
            <DestinationSelector />
          </div>
          {content && content}
          {breadcrumbs.length > 0 && (
            <BreadcrumbComponent items={breadcrumbs} />
          )}
        </div>
      </div>

      {/* Right section: Actions and theme toggle */}
      <div className="flex items-center justify-end gap-2 shrink-0 flex-1 max-w-1/2">
        <Input
          className="max-w-full"
          placeholder="Search..."
          onSubmit={value => console.log(value)}
        />

        {actions && <div className="flex items-center gap-2">{actions}</div>}
        <div className="w-16 items-center justify-center flex">
          <ThemeModeToggle />
        </div>
      </div>
    </header>
  );
}

export function BreadcrumbComponent({
  items,
}: {
  items: { label: string; href: string }[];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <Breadcrumb className="flex justify-center">
      <BreadcrumbList className="text-sm text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <div key={item.href} className="flex justify-center">
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="text-foreground font-medium">
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    asChild
                    className="hover:text-foreground transition-colors"
                  >
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && (
                <BreadcrumbSeparator className="mx-2 text-muted-foreground/50" />
              )}
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
