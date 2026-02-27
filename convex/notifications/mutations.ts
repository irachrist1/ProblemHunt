import { v } from 'convex/values';
import { mutation } from '../_generated/server';
import { Id } from '../_generated/dataModel';
import { requireAuth } from '../_lib/auth';

/**
 * Mark a single notification as read.
 */
export const markRead = mutation({
  args: { notificationId: v.id('notifications') },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const notification = await ctx.db.get(args.notificationId);
    if (!notification) return;
    if (notification.userId !== (userId as Id<'users'>)) return; // silently ignore

    await ctx.db.patch(args.notificationId, { isRead: true });
  },
});

/**
 * Mark all notifications as read for the current user.
 */
export const markAllRead = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireAuth(ctx);

    const unread = await ctx.db
      .query('notifications')
      .withIndex('by_user_and_read', (q) =>
        q.eq('userId', userId as Id<'users'>).eq('isRead', false),
      )
      .collect();

    await Promise.all(
      unread.map((n) => ctx.db.patch(n._id, { isRead: true })),
    );

    return { count: unread.length };
  },
});
