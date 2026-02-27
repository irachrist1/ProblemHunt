'use client';

import { useEffect, useState } from 'react';
import { useQuery } from 'convex/react';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../../../convex/_generated/api';
import { Sidebar } from './Sidebar';
import { RightPanel } from './RightPanel';
import { cn } from '@/lib/utils';
import type { User } from '@/types/domain';

interface AppShellProps {
  children: React.ReactNode;
  showRightPanel?: boolean;
}

export function AppShell({ children, showRightPanel = true }: AppShellProps) {
  const pathname = usePathname();
  const isExploreRoute = pathname.startsWith('/explore');
  const isSubmitRoute = pathname.startsWith('/submit');
  const isFeedRoute = pathname.startsWith('/feed');
  const isProblemDetailRoute = pathname.startsWith('/p/');
  const isNotificationsRoute = pathname.startsWith('/notifications');

  const shouldRenderRightRail =
    showRightPanel &&
    !isExploreRoute &&
    !isSubmitRoute &&
    (isFeedRoute || isProblemDetailRoute || isNotificationsRoute);

  const [isRightRailOpen, setIsRightRailOpen] = useState(true);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('ph_right_rail_open');
      if (saved === 'false') setIsRightRailOpen(false);
      if (saved === 'true') setIsRightRailOpen(true);
    } catch {
      // Ignore storage failures.
    }
  }, []);

  const toggleRightRail = () => {
    const next = !isRightRailOpen;
    setIsRightRailOpen(next);
    try {
      window.localStorage.setItem('ph_right_rail_open', next ? 'true' : 'false');
    } catch {
      // Ignore storage failures.
    }
  };

  const currentUser = useQuery(api.users.queries.getCurrentUser);
  const trendingProblems = useQuery(api.problems.queries.trending);
  const unreadCount = useQuery(api.notifications.queries.getUnreadCount);

  return (
    <div className="flex min-h-screen bg-bg-primary">
      {/* Left Sidebar — fixed, 240px */}
      <div className="fixed inset-y-0 left-0 z-20 w-sidebar hidden lg:flex">
        <div className="w-full">
          <Sidebar
            user={currentUser as User | null}
            unreadCount={unreadCount ?? 0}
          />
        </div>
      </div>

      {/* Main content area */}
      <div
        className={cn(
          'flex flex-1',
          'lg:ml-[240px]',
          shouldRenderRightRail && isRightRailOpen && 'lg:mr-[300px]',
        )}
      >
        {/* Feed column */}
        <main
          className={cn(
            'flex-1 min-w-0 w-full mx-auto',
            isExploreRoute ? 'max-w-none px-4 lg:px-8 xl:px-12' : 'max-w-feed px-4 lg:px-0',
          )}
        >
          {children}
        </main>
      </div>

      {shouldRenderRightRail && (
        <button
          type="button"
          aria-label={isRightRailOpen ? 'Collapse right panel' : 'Expand right panel'}
          aria-controls="app-right-rail"
          aria-expanded={isRightRailOpen}
          onClick={toggleRightRail}
          className={cn(
            'fixed right-0 top-1/2 z-30 hidden -translate-y-1/2 rounded-l-md border border-r-0 border-border-default bg-bg-secondary/95 p-1.5 text-text-tertiary shadow-card transition-colors hover:text-text-primary lg:block',
            isRightRailOpen && 'right-[300px]',
          )}
        >
          {isRightRailOpen ? (
            <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
          ) : (
            <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
          )}
        </button>
      )}

      {/* Right Panel — fixed, 300px */}
      {shouldRenderRightRail && isRightRailOpen && (
        <div
          id="app-right-rail"
          className="fixed inset-y-0 right-0 z-20 w-sidebar-right hidden lg:flex flex-col border-l border-border-subtle overflow-y-auto"
        >
          <RightPanel
            trendingProblems={trendingProblems ?? []}
          />
        </div>
      )}
    </div>
  );
}
