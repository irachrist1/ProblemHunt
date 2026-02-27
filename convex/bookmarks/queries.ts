import { v } from 'convex/values';
import { query } from '../_generated/server';
import { resolveViewerUserId } from '../_lib/auth';

/**
 * List saved problems for the current actor (auth or guest).
 */
export const listSaved = query({
  args: {
    visitorId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await resolveViewerUserId(ctx, args.visitorId);
    if (!userId) return [];

    const limit = args.limit ?? 20;
    const saved = await ctx.db
      .query('bookmarks')
      .withIndex('by_user_and_created', (q) => q.eq('userId', userId))
      .order('desc')
      .take(limit);

    const items = await Promise.all(
      saved.map(async (bookmark) => {
        const problem = await ctx.db.get(bookmark.problemId);
        if (!problem) return null;

        return {
          _id: problem._id,
          title: problem.title,
          slug: problem.slug,
          category: problem.category,
          voteCount: problem.voteCount,
          downvoteCount: problem.downvoteCount ?? 0,
          savedAt: bookmark.createdAt,
        };
      }),
    );

    return items.filter(Boolean);
  },
});
