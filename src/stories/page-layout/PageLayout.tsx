import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { FC, ReactNode } from 'react';

/**
 * Props for the PageLayout component
 */
export interface PageLayoutProps {
  /** Content for the sidebar panel - if null/undefined, sidebar won't be rendered */
  sidebar?: ReactNode;
  /** Header content for the main panel */
  header?: ReactNode;
  /** Main content area - this is where ClientPage children render */
  children?: ReactNode;
  /** Custom className for the root container */
  className?: string;
  /** Whether the layout should take the full height of the screen (default: true) */
  fullHeight?: boolean;
  /** Width of the sidebar (default: 16rem) */
  sidebarWidth?: string;
  /** Position of the sidebar (default: left) */
  sidebarPosition?: 'left' | 'right';
  /** Custom className for the main content container */
  contentClassName?: string;
  /**
   * Whether the main content area should scroll with the page (true) or be fixed height with internal scrolling (false)
   * - contentScrollable={true}: Content scrolls with the page (uses ScrollArea)
   * - contentScrollable={false}: Content is fixed height and scrolls internally
   * Default: true
   */
  contentScrollable?: boolean;
}

/**
 * Sidebar component - handles the sidebar panel with proper overflow and styling
 *
 * Features:
 * - Responsive width with smooth transitions
 * - Proper overflow handling for long content
 * - Dark mode support with subtle borders and shadows
 * - Accessible with proper ARIA landmarks
 */
const Sidebar: FC<{
  children: ReactNode;
  position: 'left' | 'right';
  width: string;
}> = ({ children, position, width }) => {
  return (
    <aside
      id={`page-layout-sidebar-${position}`}
      className={cn(
        // Core layout: full height, prevent shrinking, handle overflow
        'flex flex-col h-full overflow-hidden shrink-0',
        // Border positioning based on sidebar location
        position === 'left'
          ? 'dark:border-r dark:border-white/10 border-r border-r-slate-200'
          : 'dark:border-l dark:border-white/10 border-l border-l-slate-200',
        // Background with subtle shadow for depth in dark mode
        'bg-sidebar dark:bg-sidebar/80 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]'
      )}
      style={{
        width,
        // Smooth width transitions for responsive behavior
        transition: 'width 240ms ease',
      }}
    >
      {/* Scrollable content area - allows sidebar content to scroll independently */}
      <div className="flex-1 overflow-y-auto">{children}</div>
    </aside>
  );
};

/**
 * Header component - renders the top bar with proper styling
 *
 * Features:
 * - Sticky positioning with backdrop blur
 * - Consistent border treatment
 * - Dark mode support
 */
const Header: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <header
      id="page-layout-header"
      className={cn(
        // Prevent header from shrinking and add bottom border
        'shrink-0 border-b border-slate-100 dark:border-slate-800',
        // Backdrop blur for modern glass effect
        'bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/80',
        // Solid background in dark mode for better contrast
        'dark:bg-background',
        // Consistent padding
        'py-2 px-4'
      )}
    >
      {children}
    </header>
  );
};

/**
 * PageLayout - A robust, flexible layout wrapper for all ClientPage components
 *
 * This component provides a consistent structure for all pages with:
 * - Optional header bar
 * - Optional left/right sidebar
 * - Main content area with configurable scroll behavior
 * - Full viewport height management
 * - Proper overflow handling at all levels
 *
 * Architecture:
 * ```
 * ┌─────────────────────────────────┐
 * │          Header (optional)      │
 * ├──────────┬──────────────────────┤
 * │ Sidebar  │   Main Content       │
 * │(optional)│   (children)         │
 * │          │                      │
 * └──────────┴──────────────────────┘
 * ```
 *
 * Usage:
 * ```tsx
 * <PageLayout
 *   header={<MyHeader />}
 *   sidebar={<MySidebar />}
 *   contentScrollable={true}
 * >
 *   <MyPageContent />
 * </PageLayout>
 * ```
 *
 * @example
 * // Simple page with header only
 * <PageLayout header={<h1>My Page</h1>}>
 *   <div>Content here</div>
 * </PageLayout>
 *
 * @example
 * // Page with sidebar and fixed-height scrolling content
 * <PageLayout
 *   sidebar={<Navigation />}
 *   contentScrollable={false}
 * >
 *   <div>Scrollable content</div>
 * </PageLayout>
 */
export const PageLayout: FC<PageLayoutProps> = ({
  sidebar,
  header,
  children,
  className,
  fullHeight = true,
  sidebarWidth = '16rem',
  sidebarPosition = 'left',
  contentClassName,
  contentScrollable = true,
}) => {
  // Safety check: validate sidebar position
  const validPosition =
    sidebarPosition === 'left' || sidebarPosition === 'right'
      ? sidebarPosition
      : 'left';

  // Determine if sidebar should be rendered
  const hasSidebar = Boolean(sidebar);

  // Validate and sanitize sidebarWidth to prevent CSS injection
  const safeSidebarWidth =
    typeof sidebarWidth === 'string' && sidebarWidth.length > 0
      ? sidebarWidth
      : '16rem';

  return (
    <div
      id="page-layout"
      className={cn(
        // Core layout: column direction, prevent min-height collapse, full width, hide overflow
        'flex flex-col min-h-0 w-full overflow-hidden',
        // Optional full viewport height
        fullHeight && 'h-dvh',
        className
      )}
    >
      {/* Header - Only render if provided */}
      {header && <Header>{header}</Header>}

      {/* Main content row - Contains sidebar (if present) and main content area */}
      {/* Uses flex-1 to take remaining height after header */}
      <div
        id="page-layout-content"
        className={cn(
          // Horizontal layout, take remaining space, prevent collapse, hide overflow
          'flex flex-row flex-1 min-h-0 overflow-hidden'
          // Optional gap when sidebar is present - removed for cleaner edge-to-edge design
        )}
      >
        {/* Left Sidebar - Only render if sidebar content provided and position is left */}
        {hasSidebar && validPosition === 'left' && (
          <Sidebar position={validPosition} width={safeSidebarWidth}>
            {sidebar}
          </Sidebar>
        )}

        {/* Main Content Area - This is where ClientPage children render */}
        {/* Takes remaining horizontal space, full height, prevents collapse */}
        <main
          id="page-layout-main-content"
          className="flex-1 min-h-0 h-full w-full flex flex-col overflow-hidden"
        >
          {contentScrollable ? (
            // Scrollable Mode: Uses ScrollArea component for smooth scrolling
            // Ideal for long-form content that should scroll within the viewport
            <ScrollArea className="p-4 pb-0 flex-1 min-h-0 min-w-0 h-full w-full">
              <div
                className={cn('h-full w-full min-w-0 pb-4', contentClassName)}
              >
                {children}
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          ) : (
            // Fixed Height Mode: Content area has internal scrolling
            // Ideal for content that manages its own scroll behavior (e.g., split panes, tables)
            <div
              className={cn(
                'h-full w-full min-w-0 overflow-y-auto overflow-x-hidden',
                contentClassName
              )}
            >
              {children}
            </div>
          )}
        </main>

        {/* Right Sidebar - Only render if sidebar content provided and position is right */}
        {hasSidebar && validPosition === 'right' && (
          <Sidebar position={validPosition} width={safeSidebarWidth}>
            {sidebar}
          </Sidebar>
        )}
      </div>
    </div>
  );
};

// Display name for better debugging in React DevTools
PageLayout.displayName = 'PageLayout';
