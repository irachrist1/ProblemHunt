import { mutation } from '../_generated/server';
import { v } from 'convex/values';

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Stores AI-suggested tags for a problem.
 * These are surfaced to the author in the post-submit UI.
 */
export const storeSuggestedTags = mutation({
  args: {
    problemId: v.id('problems'),
    suggestedTags: v.array(v.string()),
  },
  handler: async (ctx, { problemId, suggestedTags }) => {
    const now = Date.now();
    const existing = await ctx.db
      .query('aiAnalyses')
      .withIndex('by_problem_and_type', (q) =>
        q.eq('problemId', problemId).eq('type', 'auto_tags')
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        result: { suggestedTags },
        createdAt: now,
        expiresAt: now + ONE_WEEK_MS,
      });
    } else {
      await ctx.db.insert('aiAnalyses', {
        problemId,
        type: 'auto_tags',
        result: { suggestedTags },
        model: 'gemini-1.5-flash-latest',
        inputHash: problemId,
        createdAt: now,
        expiresAt: now + ONE_WEEK_MS,
      });
    }
  },
});

/**
 * Stores the clarity score returned by the AI for a problem.
 */
export const storeClarityScore = mutation({
  args: {
    problemId: v.id('problems'),
    clarityScore: v.number(),
  },
  handler: async (ctx, { problemId, clarityScore }) => {
    const now = Date.now();
    const existing = await ctx.db
      .query('aiAnalyses')
      .withIndex('by_problem_and_type', (q) =>
        q.eq('problemId', problemId).eq('type', 'clarity_score')
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        result: { clarityScore },
        createdAt: now,
        expiresAt: now + ONE_WEEK_MS,
      });
    } else {
      await ctx.db.insert('aiAnalyses', {
        problemId,
        type: 'clarity_score',
        result: { clarityScore },
        model: 'gemini-1.5-flash-latest',
        inputHash: problemId,
        createdAt: now,
        expiresAt: now + ONE_WEEK_MS,
      });
    }
  },
});
