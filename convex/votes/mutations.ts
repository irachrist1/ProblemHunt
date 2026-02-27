import { v } from 'convex/values';
import { ConvexError } from 'convex/values';
import { mutation } from '../_generated/server';
import { Id } from '../_generated/dataModel';
import { resolveActorUserId } from '../_lib/auth';
import { requireRateLimit } from '../_lib/rateLimit';
import { computeUpdatedPainScore } from '../_lib/painScore';
import { assertEntitled } from '../_lib/entitlements';
import { trackEvent } from '../_lib/analytics';

/**
 * Toggle an upvote or me_too on a problem.
 * If the user already voted with the same type: removes the vote.
 * If the user voted with a different type: switches the vote.
 */
export const toggleVote = mutation({
  args: {
    problemId: v.id('problems'),
    type: v.union(v.literal('upvote'), v.literal('downvote'), v.literal('me_too')),
    visitorId: v.optional(v.string()),
    impactRating: v.optional(v.number()),  // required for me_too
  },
  handler: async (ctx, args) => {
    // 1. Resolve actor (authenticated user or guest visitor)
    const actor = await resolveActorUserId(ctx, args.visitorId);
    const userId = actor.userId;

    // 2. Rate limit
    await requireRateLimit(ctx, userId, 'vote:toggle');
    await assertEntitled(ctx, userId, 'vote:toggle');

    // Get problem
    const problem = await ctx.db.get(args.problemId);
    if (!problem) throw new ConvexError('Problem not found.');

    // Can't vote on your own problem
    if (problem.authorId === userId) {
      return {
        voteCount: problem.voteCount,
        downvoteCount: problem.downvoteCount ?? 0,
        meTooCount: problem.meTooCount,
        userVoteType: null,
        blockedReason: 'self_vote',
      };
    }

    // Validate impact rating for me_too
    if (args.type === 'me_too' && (args.impactRating === undefined || args.impactRating < 1 || args.impactRating > 5)) {
      throw new ConvexError('Me Too votes require an impact rating (1–5).');
    }

    const now = Date.now();

    // Check existing vote from this user on this problem
    const existingVote = await ctx.db
      .query('votes')
      .withIndex('by_problem_and_user', (q) =>
        q.eq('problemId', args.problemId).eq('userId', userId),
      )
      .first();

    let voteCountDelta = 0;
    let downvoteCountDelta = 0;
    let meTooCountDelta = 0;

    const applyDelta = (type: 'upvote' | 'downvote' | 'me_too', direction: 1 | -1) => {
      if (type === 'upvote') voteCountDelta += direction;
      else if (type === 'downvote') downvoteCountDelta += direction;
      else meTooCountDelta += direction;
    };

    if (existingVote) {
      if (existingVote.type === args.type) {
        // Same type — remove vote (toggle off)
        await ctx.db.delete(existingVote._id);
        applyDelta(args.type, -1);
      } else {
        // Different type — switch vote
        await ctx.db.patch(existingVote._id, {
          type: args.type,
          impactRating: args.impactRating,
        });
        applyDelta(existingVote.type, -1);
        applyDelta(args.type, 1);
      }
    } else {
      // New vote
      await ctx.db.insert('votes', {
        problemId: args.problemId,
        userId,
        type: args.type,
        impactRating: args.impactRating,
        createdAt: now,
      });
      applyDelta(args.type, 1);
    }

    // Update cached counts on the problem
    const newVoteCount = Math.max(0, problem.voteCount + voteCountDelta);
    const currentDownvotes = problem.downvoteCount ?? 0;
    const newDownvoteCount = Math.max(0, currentDownvotes + downvoteCountDelta);
    const newMeTooCount = Math.max(0, problem.meTooCount + meTooCountDelta);

    // Compute impact sum for pain score (approximation — use impactRating * count)
    // For accuracy, this should query all me_too votes — but for performance we approximate
    const estimatedImpactSum = newMeTooCount * (args.impactRating ?? problem.impactRating);

    // Fetch author for reputation level
    const author = await ctx.db.get(problem.authorId);
    const newPainScore = computeUpdatedPainScore({
      voteCount: newVoteCount,
      downvoteCount: newDownvoteCount,
      meTooCount: newMeTooCount,
      meTooImpactSum: estimatedImpactSum,
      commentCount: problem.commentCount,
      solutionCount: problem.solutionCount,
      createdAt: problem.createdAt,
      authorReputationLevel: author?.reputationLevel ?? 'newcomer',
    });

    await ctx.db.patch(args.problemId, {
      voteCount: newVoteCount,
      downvoteCount: newDownvoteCount,
      meTooCount: newMeTooCount,
      painScore: newPainScore,
      lastActivityAt: now,
    });

    await trackEvent(ctx, 'vote_cast', {
      actorId: userId as Id<'users'>,
      problemId: args.problemId,
      metadata: { type: args.type },
    });

    // Send notifications only for positive vote events.
    if (args.type !== 'downvote' && (voteCountDelta === 1 || meTooCountDelta === 1)) {
      await ctx.db.insert('notifications', {
        userId: problem.authorId,
        type: args.type === 'upvote' ? 'upvote' : 'me_too',
        payload: {
          actorId: userId,
          problemId: args.problemId,
        },
        isRead: false,
        createdAt: now,
      });
    }

    return {
      voteCount: newVoteCount,
      downvoteCount: newDownvoteCount,
      meTooCount: newMeTooCount,
      userVoteType:
        voteCountDelta === -1 || downvoteCountDelta === -1 || meTooCountDelta === -1
          ? (existingVote?.type === args.type ? null : args.type)
          : args.type,
    };
  },
});
