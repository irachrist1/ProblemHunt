import { v } from 'convex/values';
import { query } from '../_generated/server';
import { resolveViewerUserId } from '../_lib/auth';

/**
 * Get the current user's vote status on a problem.
 */
export const getUserVoteStatus = query({
  args: { problemId: v.id('problems'), visitorId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await resolveViewerUserId(ctx, args.visitorId);
    if (!userId) return null;

    const vote = await ctx.db
      .query('votes')
      .withIndex('by_problem_and_user', (q) =>
        q.eq('problemId', args.problemId).eq('userId', userId),
      )
      .first();

    return vote ?? null;
  },
});

/**
 * Get vote counts for a problem (cached on the problem doc, but also queryable directly).
 */
export const getVoteCounts = query({
  args: { problemId: v.id('problems') },
  handler: async (ctx, args) => {
    const problem = await ctx.db.get(args.problemId);
    if (!problem) return null;

    return {
      voteCount: problem.voteCount,
      downvoteCount: problem.downvoteCount ?? 0,
      meTooCount: problem.meTooCount,
    };
  },
});

/**
 * List upvoted problems for the current actor (auth or guest).
 */
export const listLiked = query({
  args: {
    visitorId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await resolveViewerUserId(ctx, args.visitorId);
    if (!userId) return [];

    const limit = args.limit ?? 20;
    const votes = await ctx.db
      .query('votes')
      .withIndex('by_user_and_created', (q) => q.eq('userId', userId))
      .order('desc')
      .take(limit * 4);

    const likedVotes = votes.filter((vote) => vote.type === 'upvote').slice(0, limit);

    const items = await Promise.all(
      likedVotes.map(async (vote) => {
        const problem = await ctx.db.get(vote.problemId);
        if (!problem) return null;

        return {
          _id: problem._id,
          title: problem.title,
          slug: problem.slug,
          category: problem.category,
          voteCount: problem.voteCount,
          downvoteCount: problem.downvoteCount ?? 0,
          likedAt: vote.createdAt,
        };
      }),
    );

    return items.filter(Boolean);
  },
});
