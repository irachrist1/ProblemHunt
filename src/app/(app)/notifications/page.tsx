'use client';

import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import Link from 'next/link';
import { Bell, CheckCheck } from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Spinner } from '@/components/ui/Spinner';
import type { Notification } from '@/types/domain';

const NOTIFICATION_MESSAGES: Record<string, string> = {
  upvote:           'upvoted your problem',
  me_too:           'also has this problem',
  comment:          'commented on your problem',
  reply:            'replied to your comment',
  builder_claim:    'is building a solution to your problem',
  status_change:    'updated the status of your problem',
  solution_verified:'verified your solution',
  follow:           'started following you',
};

function NotificationItem({ notification }: { notification: Notification }) {
  const markRead = useMutation(api.notifications.mutations.markRead);
  const actor = notification.actor;

  const handleClick = () => {
    if (!notification.isRead) {
      markRead({ notificationId: notification._id as any });
    }
  };

  const href = notification.problem
    ? `/p/${notification.problem.slug}`
    : notification.actor
    ? `/u/${(notification.actor as any).username}`
    : '#';

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(
        'flex items-start gap-3 px-5 py-4',
        'border-b border-border-subtle',
        'hover:bg-bg-secondary transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-border-focus',
        !notification.isRead && 'bg-problem-dim/30',
      )}
    >
      {/* Actor avatar */}
      <div className="flex-shrink-0">
        {actor ? (
          <UserAvatar name={actor.name} avatarUrl={actor.avatarUrl} size="sm" />
        ) : (
          <div className="h-7 w-7 rounded-full bg-bg-tertiary flex items-center justify-center">
            <Bell className="h-3.5 w-3.5 text-text-muted" strokeWidth={1.5} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-secondary leading-snug">
          {actor && (
            <span className="font-medium text-text-primary">{actor.name} </span>
          )}
          {NOTIFICATION_MESSAGES[notification.type] ?? 'interacted with your content'}
          {notification.problem && (
            <>
              {': '}
              <span className="text-text-primary">
                &ldquo;{notification.problem.title}&rdquo;
              </span>
            </>
          )}
        </p>
        <p className="mt-0.5 text-xs text-text-tertiary">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>

      {/* Unread indicator */}
      {!notification.isRead && (
        <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-problem-500" />
      )}
    </Link>
  );
}

export default function NotificationsPage() {
  const notifications = useQuery(api.notifications.queries.list, { limit: 50 });
  const markAllRead = useMutation(api.notifications.mutations.markAllRead);

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
        <div>
          <h1 className="text-base font-semibold text-text-primary">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-xs text-text-tertiary">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllRead()}
            className="gap-1.5"
          >
            <CheckCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
            Mark all read
          </Button>
        )}
      </div>

      {/* List */}
      {notifications === undefined ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Bell className="mb-4 h-10 w-10 text-text-muted" strokeWidth={1} />
          <h3 className="text-sm font-semibold text-text-primary">No notifications yet</h3>
          <p className="mt-1 text-xs text-text-tertiary">
            When someone votes or comments on your problems, you&apos;ll see it here.
          </p>
        </div>
      ) : (
        <div>
          {notifications.map((n) => (
            <NotificationItem key={n._id} notification={n as unknown as Notification} />
          ))}
        </div>
      )}
    </div>
  );
}
