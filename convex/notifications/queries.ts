import { v } from 'convex/values';
import { query } from '../_generated/server';
import { getAuthUserId } from '@convex-dev/auth/server';
import { Id } from '../_generated/dataModel';

/**
 * List notifications for the current user.
 */
export const list = query({
  args: {
    limit: v.optional(v.number()),
    onlyUnread: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const limit = args.limit ?? 30;

    let notifications;
    if (args.onlyUnread) {
      notifications = await ctx.db
        .query('notifications')
        .withIndex('by_user_and_read', (q) =>
          q.eq('userId', userId as Id<'users'>).eq('isRead', false),
        )
        .order('desc')
        .take(limit);
    } else {
      notifications = await ctx.db
        .query('notifications')
        .withIndex('by_user_and_created', (q) =>
          q.eq('userId', userId as Id<'users'>),
        )
        .order('desc')
        .take(limit);
    }

    // Enrich with actor info
    const enriched = await Promise.all(
      notifications.map(async (notification) => {
        let actor = null;
        if (notification.payload.actorId) {
          const actorUser = await ctx.db.get(notification.payload.actorId);
          if (actorUser) {
            actor = {
              _id: actorUser._id,
              name: actorUser.name,
              username: actorUser.username,
              avatarUrl: actorUser.avatarUrl,
            };
          }
        }

        let problem = null;
        if (notification.payload.problemId) {
          const p = await ctx.db.get(notification.payload.problemId);
          if (p) {
            problem = { _id: p._id, title: p.title, slug: p.slug };
          }
        }

        return { ...notification, actor, problem };
      }),
    );

    return enriched;
  },
});

/**
 * Get unread notification count for the current user.
 */
export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const unread = await ctx.db
      .query('notifications')
      .withIndex('by_user_and_read', (q) =>
        q.eq('userId', userId as Id<'users'>).eq('isRead', false),
      )
      .collect();

    return unread.length;
  },
});
