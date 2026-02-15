import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { FC, ReactNode } from "react";

export interface PageLayoutProps {
  /** Content for the sidebar panel - if null/undefined, sidebar won't be rendered */
  sidebar?: ReactNode;
  /** Header content for the main panel */
  header?: ReactNode;
  /** Main content */
  children?: ReactNode;
  /** Custom className for the root container */
  className?: string;
  /** Whether the layout should take the full height of the screen (default: true) */
  fullHeight?: boolean;
  /** Width of the sidebar (default: 16rem) */
  sidebarWidth?: string;
  /** Position of the sidebar (default: left) */
  sidebarPosition?: "left" | "right";
  /** Custom className for the main content container */
  contentClassName?: string;
  /** Whether the main content area should scroll with the page (true) or be fixed height with internal scrolling (false) (default: true)
   * Use contentScrollable={true} when you want the content to scroll with the page.
   * Use contentScrollable={false} when you want the content to be fixed height and scroll internally only.
   */
  contentScrollable?: boolean;
}

/**
 * Sidebar component - extracted for better modularity
 */
const Sidebar: FC<{
  children: ReactNode;
  position: "left" | "right";
  width: string;
}> = ({ children, position, width }) => {
  return (
    <aside
      id={`page-layout-sidebar-${position}`}
      className={cn(
        "flex flex-col h-full overflow-hidden shrink-0",
        position === "left"
          ? "dark:border-r dark:border-white/10 border-r border-r-slate-200"
          : "dark:border-l dark:border-white/10 border-l border-l-slate-200",
        "bg-sidebar dark:bg-sidebar/80 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
      )}
      style={{
        width,
        transition: "width 240ms ease",
      }}
    >
      <div className="flex-1 overflow-y-auto">{children}</div>
    </aside>
  );
};

/**
 * Header component - extracted for better modularity
 */
const Header: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <header
      id="page-layout-header"
      className={cn(
        "shrink-0 border-b border-slate-100 dark:border-slate-800",
        "bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/80",
        "dark:bg-background",
        "py-2 px-4",
      )}
    >
      {children}
    </header>
  );
};

/**
 * A flexible page layout with sidebar, header, and main content area.
 * Supports both scrollable and fixed-height content modes.
 *
 * Features:
 * - Modular structure with separated components
 * - Reliable height calculations using flexbox
 * - Proper overflow handling
 * - Responsive and accessible
 * - Children receive full height and can control their own layout
 * - Sidebar is positioned beneath the header
 */
export const PageLayout: FC<PageLayoutProps> = ({
  sidebar,
  header,
  children,
  className,
  fullHeight = true,
  sidebarWidth = "16rem",
  sidebarPosition = "left",
  contentClassName,
  contentScrollable = true,
}) => {
  const hasSidebar = Boolean(sidebar);

  return (
    <div
      id="page-layout"
      className={cn(
        "flex flex-col min-h-0 w-full overflow-hidden",
        fullHeight && "h-dvh",
        className,
      )}
    >
      {/* Header */}
      {header && <Header>{header}</Header>}

      {/* Sidebar and Content Row - takes remaining height after header */}
      <div
        id="page-layout-content"
        className={cn(
          "flex flex-row flex-1 min-h-0 overflow-hidden",
          hasSidebar && "gap-2",
        )}
      >
        {/* Sidebar - Left */}
        {hasSidebar && sidebarPosition === "left" && (
          <Sidebar position={sidebarPosition} width={sidebarWidth}>
            {sidebar}
          </Sidebar>
        )}

        {/* Main Content - gives children full height control */}
        <main
          id="page-layout-main-content"
          className="flex-1 min-h-0 h-full flex flex-col overflow-hidden"
        >
          {contentScrollable ? (
            // Scrollable content - uses ScrollArea component
            <ScrollArea className="p-4 pb-0 flex-1 min-h-0 h-full">
              <div className={cn("h-full pb-4", contentClassName)}>
                {children}
              </div>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          ) : (
            // Fixed height content - uses internal scrolling
            <div
              className={cn(
                "h-full overflow-y-auto overflow-x-hidden",
                contentClassName,
              )}
            >
              {children}
            </div>
          )}
        </main>

        {/* Sidebar - Right */}
        {hasSidebar && sidebarPosition === "right" && (
          <Sidebar position={sidebarPosition} width={sidebarWidth}>
            {sidebar}
          </Sidebar>
        )}
      </div>
    </div>
  );
};

PageLayout.displayName = "PageLayout";
