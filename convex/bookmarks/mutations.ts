import { v, ConvexError } from 'convex/values';
import { mutation } from '../_generated/server';
import { resolveActorUserId } from '../_lib/auth';

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

    const problem = await ctx.db.get(args.problemId);
    if (!problem) {
      throw new ConvexError('Problem not found.');
    }

    const existing = await ctx.db
      .query('bookmarks')
      .withIndex('by_user_and_problem', (q) =>
        q.eq('userId', userId).eq('problemId', args.problemId),
      )
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { isBookmarked: false };
    }

    await ctx.db.insert('bookmarks', {
      userId,
      problemId: args.problemId,
      createdAt: Date.now(),
    });

    return { isBookmarked: true };
  },
});
