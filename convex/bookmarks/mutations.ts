import { v, ConvexError } from 'convex/values';
import { mutation } from '../_generated/server';
import { Id } from '../_generated/dataModel';
import { resolveActorUserId } from '../_lib/auth';
import { assertEntitled } from '../_lib/entitlements';
import { trackEvent } from '../_lib/analytics';

/**
 * Toggle bookmark on a problem for the current actor (auth or guest).
 */
export const toggleBookmark = mutation({
  args: {
    problemId: v.id('problems'),
    visitorId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId } = await resolveActorUserId(ctx, args.visitorId);
    await assertEntitled(ctx, userId, 'bookmark:toggle');

    const problem = await ctx.db.get(args.problemId);
    if (!problem) {
      throw new ConvexError('Problem not found.');
    }

    const existing = await ctx.db
      .query('bookmarks')
      .withIndex('by_user_and_problem', (q) =>
        q.eq('userId', userId).eq('problemId', args.problemId),
      )
      .collect();

    if (existing.length > 0) {
      await Promise.all(existing.map((row) => ctx.db.delete(row._id)));
      await trackEvent(ctx, 'bookmark_toggled', {
        actorId: userId as Id<'users'>,
        problemId: args.problemId,
        metadata: { state: 'removed' },
      });
      return { isBookmarked: false };
    }

    await ctx.db.insert('bookmarks', {
      userId,
      problemId: args.problemId,
      createdAt: Date.now(),
    });
    await trackEvent(ctx, 'bookmark_toggled', {
      actorId: userId as Id<'users'>,
      problemId: args.problemId,
      metadata: { state: 'saved' },
    });

    return { isBookmarked: true };
  },
});
