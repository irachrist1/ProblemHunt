import { v } from 'convex/values';
import { query } from '../_generated/server';
import { getAuthUserId } from '@convex-dev/auth/server';
import { Id } from '../_generated/dataModel';

/**
 * Get the currently authenticated user's profile.
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return ctx.db.get(userId as Id<'users'>);
  },
});

/**
 * Derive feed preferences from the user's existing saved and liked problems.
 * This keeps personalization query-time only and avoids storing a separate profile vector.
 */
export const getFeedPreferences = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const viewerUserId = userId as Id<'users'>;
    const [bookmarks, votes] = await Promise.all([
      ctx.db
        .query('bookmarks')
        .withIndex('by_user', (q) => q.eq('userId', viewerUserId))
        .order('desc')
        .take(30),
      ctx.db
        .query('votes')
        .withIndex('by_user_and_created', (q) => q.eq('userId', viewerUserId))
        .order('desc')
        .take(60),
    ]);

    const engagedProblemIds = new Set<Id<'problems'>>();
    for (const bookmark of bookmarks) {
      engagedProblemIds.add(bookmark.problemId);
    }
    for (const vote of votes) {
      if (vote.type === 'upvote' || vote.type === 'me_too') {
        engagedProblemIds.add(vote.problemId);
      }
    }

    const problemIds = Array.from(engagedProblemIds).slice(0, 40);
    if (problemIds.length === 0) {
      return {
        techStackTags: [] as string[],
        interestDomains: [] as string[],
      };
    }

    const problems = await Promise.all(problemIds.map((problemId) => ctx.db.get(problemId)));
    const problemTagLinks = await Promise.all(
      problemIds.map((problemId) =>
        ctx.db
          .query('problemTags')
          .withIndex('by_problem', (q) => q.eq('problemId', problemId))
          .collect(),
      ),
    );
    const tagDocs = await Promise.all(
      problemTagLinks.flat().map((problemTag) => ctx.db.get(problemTag.tagId)),
    );

    const tagCounts = new Map<string, number>();
    for (const tag of tagDocs) {
      if (!tag) continue;
      const normalized = tag.name.trim().toLowerCase();
      if (!normalized) continue;
      tagCounts.set(normalized, (tagCounts.get(normalized) ?? 0) + 1);
    }

    const domainCounts = new Map<string, number>();
    for (const problem of problems) {
      if (!problem) continue;
      const normalized = problem.category.trim().toLowerCase();
      if (!normalized) continue;
      domainCounts.set(normalized, (domainCounts.get(normalized) ?? 0) + 1);
    }

    return {
      techStackTags: Array.from(tagCounts.entries())
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, 20)
        .map(([tag]) => tag),
      interestDomains: Array.from(domainCounts.entries())
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .slice(0, 8)
        .map(([domain]) => domain),
    };
  },
});

/**
 * Get a user's public profile by username.
 */
export const getByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_username', (q) => q.eq('username', args.username))
      .first();

    if (!user) return null;

    // Return only public fields
    return {
      _id: user._id,
      name: user.name,
      username: user.username,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      role: user.role,
      reputationScore: user.reputationScore,
      reputationLevel: user.reputationLevel,
      createdAt: user.createdAt,
    };
  },
});

/**
 * Get a user by ID.
 */
export const getById = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    return {
      _id: user._id,
      name: user.name,
      username: user.username,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      role: user.role,
      reputationScore: user.reputationScore,
      reputationLevel: user.reputationLevel,
      createdAt: user.createdAt,
    };
  },
});
