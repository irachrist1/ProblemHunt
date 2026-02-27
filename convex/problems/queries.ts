import { v } from 'convex/values';
import { query } from '../_generated/server';
import { Doc, Id } from '../_generated/dataModel';
import { QueryCtx } from '../_generated/server';
import { resolveViewerUserId } from '../_lib/auth';

async function enrichProblem(
  ctx: QueryCtx,
  problem: Doc<'problems'>,
  viewerUserId: Id<'users'> | null,
) {
  const author = await ctx.db.get(problem.authorId);
  const problemTags = await ctx.db
    .query('problemTags')
    .withIndex('by_problem', (q) => q.eq('problemId', problem._id))
    .collect();
  const tags = (await Promise.all(problemTags.map((pt) => ctx.db.get(pt.tagId)))).filter(Boolean);

  let userVote = null;
  let isBookmarked = false;
  if (viewerUserId) {
    userVote = await ctx.db
      .query('votes')
      .withIndex('by_problem_and_user', (q) =>
        q.eq('problemId', problem._id).eq('userId', viewerUserId),
      )
      .first();

    const bookmark = await ctx.db
      .query('bookmarks')
      .withIndex('by_user_and_problem', (q) =>
        q.eq('userId', viewerUserId).eq('problemId', problem._id),
      )
      .first();
    isBookmarked = !!bookmark;
  }

  return {
    ...problem,
    downvoteCount: problem.downvoteCount ?? 0,
    author: author
      ? {
          _id: author._id,
          name: author.name,
          username: author.username,
          avatarUrl: author.avatarUrl,
          reputationLevel: author.reputationLevel,
        }
      : null,
    tags,
    userVote,
    isBookmarked,
  };
}

/**
 * Get a single problem by slug.
 * Public problems visible to all; workspace problems require membership.
 */
export const getBySlug = query({
  args: { slug: v.string(), visitorId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const problem = await ctx.db
      .query('problems')
      .withIndex('by_slug', (q) => q.eq('slug', args.slug))
      .first();

    if (!problem) return null;

    const viewerUserId = await resolveViewerUserId(ctx, args.visitorId);
    return enrichProblem(ctx, problem, viewerUserId);
  },
});

/**
 * Get a single problem by ID.
 */
export const getById = query({
  args: { id: v.id('problems'), visitorId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const problem = await ctx.db.get(args.id);
    if (!problem) return null;

    const viewerUserId = await resolveViewerUserId(ctx, args.visitorId);
    return enrichProblem(ctx, problem, viewerUserId);
  },
});

/**
 * List problems for the main feed.
 * Supports sorting (hot, new, top) and filtering by category/status.
 */
export const list = query({
  args: {
    sort: v.optional(v.union(v.literal('hot'), v.literal('new'), v.literal('top'))),
    category: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal('open'),
        v.literal('exploring'),
        v.literal('proposed'),
        v.literal('exists'),
        v.literal('solved'),
      ),
    ),
    visitorId: v.optional(v.string()),
    paginationOpts: v.optional(
      v.object({
        cursor: v.union(v.string(), v.null()),
        numItems: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const sort = args.sort ?? 'hot';
    const numItems = args.paginationOpts?.numItems ?? 30;
    let problems: Doc<'problems'>[];

    if (sort === 'hot') {
      problems = await ctx.db
        .query('problems')
        .withIndex('by_pain_score')
        .order('desc')
        .filter((q) => q.eq(q.field('visibility'), 'public'))
        .take(numItems * 2);
    } else if (sort === 'new') {
      problems = await ctx.db
        .query('problems')
        .withIndex('by_created_at')
        .order('desc')
        .filter((q) => q.eq(q.field('visibility'), 'public'))
        .take(numItems * 2);
    } else {
      problems = await ctx.db
        .query('problems')
        .withIndex('by_pain_score')
        .order('desc')
        .filter((q) => q.eq(q.field('visibility'), 'public'))
        .take(numItems * 2);
    }

    if (args.category) {
      problems = problems.filter((p) => p.category === args.category);
    }
    if (args.status) {
      problems = problems.filter((p) => p.status === args.status);
    }

    problems = problems.slice(0, numItems);
    const viewerUserId = await resolveViewerUserId(ctx, args.visitorId);

    return Promise.all(
      problems.map((problem) => enrichProblem(ctx, problem, viewerUserId)),
    );
  },
});

/**
 * Get trending problems (top 5 by pain score, last 7 days).
 */
export const trending = query({
  args: {},
  handler: async (ctx) => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const problems = await ctx.db
      .query('problems')
      .withIndex('by_pain_score')
      .order('desc')
      .filter((q) =>
        q.and(
          q.eq(q.field('visibility'), 'public'),
          q.gte(q.field('createdAt'), sevenDaysAgo),
        ),
      )
      .take(5);

    return problems.map((problem) => ({
      ...problem,
      downvoteCount: problem.downvoteCount ?? 0,
    }));
  },
});

/**
 * Search problems by title.
 */
export const search = query({
  args: {
    query: v.string(),
    category: v.optional(v.string()),
    status: v.optional(v.string()),
    visitorId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.query.trim()) return [];

    const results = await ctx.db
      .query('problems')
      .withSearchIndex('search_title_desc', (q) => {
        let search = q.search('title', args.query);
        if (args.category) search = search.eq('category', args.category);
        if (args.status) search = search.eq('status', args.status as any);
        return search.eq('visibility', 'public');
      })
      .take(20);

    const viewerUserId = await resolveViewerUserId(ctx, args.visitorId);
    return Promise.all(
      results.map((problem) => enrichProblem(ctx, problem, viewerUserId)),
    );
  },
});

/**
 * Get problems authored by a specific user.
 */
export const listByUser = query({
  args: { userId: v.id('users'), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const problems = await ctx.db
      .query('problems')
      .withIndex('by_author', (q) => q.eq('authorId', args.userId))
      .order('desc')
      .take(args.limit ?? 20);

    return problems.map((problem) => ({
      ...problem,
      downvoteCount: problem.downvoteCount ?? 0,
    }));
  },
});
