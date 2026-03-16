import { v, ConvexError } from 'convex/values';
import { query } from '../_generated/server';
import { Doc, Id } from '../_generated/dataModel';
import { QueryCtx } from '../_generated/server';
import { resolveViewerUserId } from '../_lib/auth';
import { computeHotFeedScore } from '../_lib/painScore';

const FRESH_WINDOW_MS = 24 * 60 * 60 * 1000;
const HOT_FRESH_RATIO = 0.35;

const PROBLEM_STATUS = v.union(
  v.literal('open'),
  v.literal('exploring'),
  v.literal('proposed'),
  v.literal('exists'),
  v.literal('solved'),
);

type ProblemStatus = 'open' | 'exploring' | 'proposed' | 'exists' | 'solved';

function isDiscoverableVisibility(visibility: Doc<'problems'>['visibility']): boolean {
  return visibility === 'public' || visibility === 'anonymous';
}

function filterProblems(
  problems: Doc<'problems'>[],
  filters: { category?: string; status?: ProblemStatus },
): Doc<'problems'>[] {
  return problems.filter((problem) => {
    if (!isDiscoverableVisibility(problem.visibility)) return false;
    if (filters.category && problem.category !== filters.category) return false;
    if (filters.status && problem.status !== filters.status) return false;
    return true;
  });
}

function dedupeProblems(problems: Doc<'problems'>[]): Doc<'problems'>[] {
  const uniqueProblems: Doc<'problems'>[] = [];
  const seen = new Set<string>();

  for (const problem of problems) {
    const key = String(problem._id);
    if (seen.has(key)) continue;
    seen.add(key);
    uniqueProblems.push(problem);
  }

  return uniqueProblems;
}

function composeHotFeed(
  freshLane: Doc<'problems'>[],
  rankedLane: Doc<'problems'>[],
  numItems: number,
): Doc<'problems'>[] {
  const uniqueFresh: Doc<'problems'>[] = [];
  const seenInFresh = new Set<string>();
  for (const item of freshLane) {
    const key = String(item._id);
    if (seenInFresh.has(key)) continue;
    seenInFresh.add(key);
    uniqueFresh.push(item);
  }

  const uniqueRanked: Doc<'problems'>[] = [];
  const seenInRanked = new Set<string>();
  for (const item of rankedLane) {
    const key = String(item._id);
    if (seenInRanked.has(key)) continue;
    seenInRanked.add(key);
    uniqueRanked.push(item);
  }

  const targetFresh = Math.min(uniqueFresh.length, Math.floor(numItems * HOT_FRESH_RATIO));
  const selectedFresh = uniqueFresh.slice(0, targetFresh);

  const freshIdSet = new Set(selectedFresh.map((p) => String(p._id)));
  const selectedRanked = uniqueRanked.filter((p) => !freshIdSet.has(String(p._id)));

  const results: Doc<'problems'>[] = [];
  const resultSeen = new Set<string>();
  let freshIdx = 0;
  let rankedIdx = 0;

  while (results.length < numItems && (freshIdx < selectedFresh.length || rankedIdx < selectedRanked.length)) {
    const nextIndex = results.length;
    const shouldTakeFresh =
      freshIdx < selectedFresh.length &&
      (rankedIdx >= selectedRanked.length ||
        Math.floor(((nextIndex + 1) * targetFresh) / Math.max(1, numItems)) >
          Math.floor((nextIndex * targetFresh) / Math.max(1, numItems)));

    const candidate = shouldTakeFresh ? selectedFresh[freshIdx++] : selectedRanked[rankedIdx++];
    if (!candidate) continue;
    const key = String(candidate._id);
    if (resultSeen.has(key)) continue;
    resultSeen.add(key);
    results.push(candidate);
  }

  const overflow = [...selectedRanked.slice(rankedIdx), ...selectedFresh.slice(freshIdx)];
  for (const candidate of overflow) {
    if (results.length >= numItems) break;
    const key = String(candidate._id);
    if (resultSeen.has(key)) continue;
    resultSeen.add(key);
    results.push(candidate);
  }

  return results;
}

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
    canVote: viewerUserId ? problem.authorId !== viewerUserId : true,
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
    status: v.optional(PROBLEM_STATUS),
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
    const now = Date.now();
    const numItems = args.paginationOpts?.numItems ?? 30;
    const filters = { category: args.category, status: args.status };

    let selected: Doc<'problems'>[] = [];

    if (sort === 'new') {
      const candidates = await ctx.db
        .query('problems')
        .withIndex('by_created_at')
        .order('desc')
        .take(Math.max(numItems * 4, 80));

      selected = filterProblems(candidates, filters).slice(0, numItems);
    } else if (sort === 'top') {
      const candidates = await ctx.db
        .query('problems')
        .withIndex('by_pain_score')
        .order('desc')
        .take(Math.max(numItems * 4, 80));

      selected = filterProblems(candidates, filters).slice(0, numItems);
    } else {
      const candidateCount = Math.max(numItems * 6, 120);

      const recentCandidates = await ctx.db
        .query('problems')
        .withIndex('by_created_at')
        .order('desc')
        .take(candidateCount);

      const rankedCandidates = await ctx.db
        .query('problems')
        .withIndex('by_pain_score')
        .order('desc')
        .take(candidateCount);

      const filteredRecent = filterProblems(recentCandidates, filters);
      const filteredRanked = filterProblems(rankedCandidates, filters).sort((a, b) => {
        const scoreA = computeHotFeedScore({
          painScore: a.painScore,
          voteCount: a.voteCount,
          downvoteCount: a.downvoteCount ?? 0,
          meTooCount: a.meTooCount,
          commentCount: a.commentCount,
          solutionCount: a.solutionCount,
          createdAt: a.createdAt,
          lastActivityAt: a.lastActivityAt,
          boostUntil: a.boostUntil,
          now,
        });
        const scoreB = computeHotFeedScore({
          painScore: b.painScore,
          voteCount: b.voteCount,
          downvoteCount: b.downvoteCount ?? 0,
          meTooCount: b.meTooCount,
          commentCount: b.commentCount,
          solutionCount: b.solutionCount,
          createdAt: b.createdAt,
          lastActivityAt: b.lastActivityAt,
          boostUntil: b.boostUntil,
          now,
        });
        return scoreB - scoreA;
      });

      const freshLane = filteredRecent.filter((problem) => now - problem.createdAt <= FRESH_WINDOW_MS);
      selected = composeHotFeed(freshLane, filteredRanked, numItems);
    }

    const viewerUserId = await resolveViewerUserId(ctx, args.visitorId);
    return Promise.all(selected.map((problem) => enrichProblem(ctx, problem, viewerUserId)));
  },
});

/**
 * List a broad candidate set for client-side personalized feed ranking.
 */
export const listFeedCandidates = query({
  args: {
    visitorId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit ?? 120, 20), 200);
    const candidateCount = Math.max(limit, 120);

    const [recentCandidates, rankedCandidates] = await Promise.all([
      ctx.db
        .query('problems')
        .withIndex('by_created_at')
        .order('desc')
        .take(candidateCount),
      ctx.db
        .query('problems')
        .withIndex('by_pain_score')
        .order('desc')
        .take(candidateCount),
    ]);

    const selected = dedupeProblems([
      ...filterProblems(recentCandidates, {}),
      ...filterProblems(rankedCandidates, {}),
    ]).slice(0, limit);

    const viewerUserId = await resolveViewerUserId(ctx, args.visitorId);
    return Promise.all(selected.map((problem) => enrichProblem(ctx, problem, viewerUserId)));
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
          q.or(
            q.eq(q.field('visibility'), 'public'),
            q.eq(q.field('visibility'), 'anonymous'),
          ),
          q.gte(q.field('createdAt'), sevenDaysAgo),
        ),
      )
      .take(10);

    return problems.slice(0, 5).map((problem) => ({
      ...problem,
      downvoteCount: problem.downvoteCount ?? 0,
    }));
  },
});

/**
 * Search problems by title + description.
 */
export const search = query({
  args: {
    query: v.string(),
    category: v.optional(v.string()),
    status: v.optional(PROBLEM_STATUS),
    visitorId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const text = args.query.trim();
    if (!text) return [];

    const titleResults = await ctx.db
      .query('problems')
      .withSearchIndex('search_title_desc', (q) => {
        let search = q.search('title', text);
        if (args.category) search = search.eq('category', args.category);
        if (args.status) search = search.eq('status', args.status);
        return search;
      })
      .take(40);

    const descriptionResults = await ctx.db
      .query('problems')
      .withSearchIndex('search_description', (q) => {
        let search = q.search('description', text);
        if (args.category) search = search.eq('category', args.category);
        if (args.status) search = search.eq('status', args.status);
        return search;
      })
      .take(40);

    const merged = new Map<string, Doc<'problems'>>();
    for (const problem of [...titleResults, ...descriptionResults]) {
      if (!isDiscoverableVisibility(problem.visibility)) continue;
      const key = String(problem._id);
      if (!merged.has(key)) {
        merged.set(key, problem);
      }
    }

    const now = Date.now();
    const sorted = Array.from(merged.values())
      .sort((a, b) => {
        const scoreA = computeHotFeedScore({
          painScore: a.painScore,
          voteCount: a.voteCount,
          downvoteCount: a.downvoteCount ?? 0,
          meTooCount: a.meTooCount,
          commentCount: a.commentCount,
          solutionCount: a.solutionCount,
          createdAt: a.createdAt,
          lastActivityAt: a.lastActivityAt,
          boostUntil: a.boostUntil,
          now,
        });
        const scoreB = computeHotFeedScore({
          painScore: b.painScore,
          voteCount: b.voteCount,
          downvoteCount: b.downvoteCount ?? 0,
          meTooCount: b.meTooCount,
          commentCount: b.commentCount,
          solutionCount: b.solutionCount,
          createdAt: b.createdAt,
          lastActivityAt: b.lastActivityAt,
          boostUntil: b.boostUntil,
          now,
        });
        return scoreB - scoreA;
      })
      .slice(0, 20);

    const viewerUserId = await resolveViewerUserId(ctx, args.visitorId);
    return Promise.all(sorted.map((problem) => enrichProblem(ctx, problem, viewerUserId)));
  },
});

/**
 * Debug helper for ranking explainability (dev only).
 */
export const debugRanking = query({
  args: {
    limit: v.optional(v.number()),
    category: v.optional(v.string()),
    status: v.optional(PROBLEM_STATUS),
  },
  handler: async (ctx, args) => {
    if (process.env.NODE_ENV === 'production') {
      throw new ConvexError('debugRanking is disabled in production.');
    }

    const limit = Math.min(100, Math.max(5, args.limit ?? 20));
    const now = Date.now();

    const candidates = await ctx.db
      .query('problems')
      .withIndex('by_pain_score')
      .order('desc')
      .take(limit * 5);

    const filtered = filterProblems(candidates, {
      category: args.category,
      status: args.status,
    });

    return filtered
      .map((problem) => {
        const hotScore = computeHotFeedScore({
          painScore: problem.painScore,
          voteCount: problem.voteCount,
          downvoteCount: problem.downvoteCount ?? 0,
          meTooCount: problem.meTooCount,
          commentCount: problem.commentCount,
          solutionCount: problem.solutionCount,
          createdAt: problem.createdAt,
          lastActivityAt: problem.lastActivityAt,
          boostUntil: problem.boostUntil,
          now,
        });

        return {
          _id: problem._id,
          slug: problem.slug,
          title: problem.title,
          visibility: problem.visibility,
          createdAt: problem.createdAt,
          lastActivityAt: problem.lastActivityAt,
          painScore: problem.painScore,
          hotScore,
          voteCount: problem.voteCount,
          downvoteCount: problem.downvoteCount ?? 0,
          meTooCount: problem.meTooCount,
          commentCount: problem.commentCount,
          solutionCount: problem.solutionCount,
          boostUntil: problem.boostUntil ?? problem.createdAt + FRESH_WINDOW_MS,
        };
      })
      .sort((a, b) => b.hotScore - a.hotScore)
      .slice(0, limit);
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
