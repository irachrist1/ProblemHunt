'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Bell, Plus, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_NAME } from '@/lib/constants';
import type { User as UserType } from '@/types/domain';
import { UserAvatar } from '@/components/ui/UserAvatar';

const NAV_ITEMS = [
  { href: '/feed',          label: 'Home',          Icon: Home },
  { href: '/explore',       label: 'Explore',       Icon: Compass },
  { href: '/notifications', label: 'Notifications', Icon: Bell },
] as const;

interface SidebarProps {
  user?: UserType | null;
  unreadCount?: number;
  onSignOut?: () => void;
}

export function Sidebar({ user, unreadCount = 0, onSignOut }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full flex-col border-r border-border-subtle bg-bg-primary">
      {/* Logo */}
      <div className="flex h-14 items-center px-5">
        <Link
          href="/feed"
          className="flex items-center gap-2 text-text-primary hover:text-text-primary"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-problem-500">
            <span className="text-sm font-bold text-white">P</span>
          </div>
          <span className="text-sm font-semibold tracking-tight">{APP_NAME}</span>
        </Link>
      </div>

      {/* Submit CTA */}
      <div className="px-3 pb-3">
        <Link
          href="/submit"
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-sm py-2',
            'bg-problem-500 text-sm font-medium text-white',
            'hover:bg-problem-600 transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
          )}
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          Add Problem
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-2" aria-label="Main navigation">
        <ul className="flex flex-col gap-0.5">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const isActive = pathname.startsWith(href);
            const showBadge = label === 'Notifications' && unreadCount > 0;

            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    'flex items-center gap-3 rounded-sm px-3 py-2',
                    'text-sm font-medium transition-colors duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',

                    isActive
                      ? 'bg-bg-tertiary text-text-primary'
                      : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary',
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="relative">
                    <Icon className="h-4 w-4" strokeWidth={1.5} />
                    {showBadge && (
                      <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-problem-500 text-2xs text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </span>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="border-t border-border-subtle p-3">
        {user ? (
          <div className="flex items-center gap-3">
            <Link
              href={`/u/${user.username}`}
              className="flex flex-1 items-center gap-2.5 rounded-sm px-2 py-1.5 hover:bg-bg-secondary transition-colors"
            >
              <UserAvatar name={user.name} avatarUrl={user.avatarUrl} size="sm" />
              <div className="flex flex-col overflow-hidden">
                <span className="truncate text-xs font-medium text-text-primary">
                  {user.name}
                </span>
                <span className="truncate text-2xs text-text-tertiary">
                  @{user.username}
                </span>
              </div>
            </Link>
            {onSignOut && (
              <button
                onClick={onSignOut}
                className="rounded-sm p-1.5 text-text-muted hover:text-text-secondary hover:bg-bg-tertiary transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            )}
          </div>
        ) : (
          <Link
            href="/auth/sign-in"
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-sm py-2 text-xs',
              'text-text-muted hover:bg-bg-secondary hover:text-text-secondary transition-colors',
            )}
          >
            Sign in (optional)
          </Link>
        )}
      </div>
    </aside>
  );
}
