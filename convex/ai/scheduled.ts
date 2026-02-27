import { internalMutation } from '../_generated/server';
import { v } from 'convex/values';
import { internal } from '../_generated/api';

/**
 * Called after a new problem is submitted.
 * Schedules background AI tasks (auto-tagging, etc.).
 *
 * Usage from problems/mutations.ts:
 *   await ctx.scheduler.runAfter(0, internal.ai.scheduled.analyzeNewProblem, { problemId });
 */
export const analyzeNewProblem = internalMutation({
  args: { problemId: v.id('problems') },
  handler: async (ctx, { problemId }) => {
    const problem = await ctx.db.get(problemId);
    if (!problem) return;

    // Schedule auto-tagging action directly
    await ctx.scheduler.runAfter(0, internal.ai.actions.autoTagProblem, {
      problemId,
      title: problem.title,
      description: problem.description,
    });
  },
});
