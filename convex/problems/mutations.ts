import { v } from 'convex/values';
import { ConvexError } from 'convex/values';
import { mutation } from '../_generated/server';
import { Id } from '../_generated/dataModel';
import { requireAuth, requireWorkspaceMembership, resolveActorUserId } from '../_lib/auth';
import { requireRateLimit } from '../_lib/rateLimit';
import { generateSlug } from '../_lib/slugs';
import { calculatePainScore } from '../_lib/painScore';
import { createProblemSchema, updateProblemSchema } from '../_lib/validation';
import { assertEntitled } from '../_lib/entitlements';
import { trackEvent } from '../_lib/analytics';

/**
 * Create a new problem. Follows the standard mutation pattern:
 * 1. Auth check
 * 2. Rate limit
 * 3. Authorization (workspace membership if needed)
 * 4. Validation
 * 5. Execute
 */
export const createProblem = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    workarounds: v.optional(v.string()),
    category: v.string(),
    audience: v.array(v.string()),
    frequency: v.union(
      v.literal('daily'),
      v.literal('weekly'),
      v.literal('monthly'),
      v.literal('rarely'),
    ),
    impactRating: v.number(),
    visibility: v.union(
      v.literal('public'),
      v.literal('workspace'),
      v.literal('anonymous'),
    ),
    isAnonymous: v.boolean(),
    visitorId: v.optional(v.string()),
    orgId: v.optional(v.id('organizations')),
    tagIds: v.optional(v.array(v.id('tags'))),
  },
  handler: async (ctx, args) => {
    // 1. Resolve actor (authenticated user or guest visitor)
    const actor = await resolveActorUserId(ctx, args.visitorId);
    const userId = actor.userId;

    // 2. Rate limit
    await requireRateLimit(ctx, userId, 'problem:create');
    await assertEntitled(ctx, userId, 'problem:create');

    // 3. Authorization — workspace check
    if (args.orgId) {
      if (!actor.isAuthenticated) {
        throw new ConvexError('Workspace posting requires sign-in.');
      }
      await requireWorkspaceMembership(ctx, userId, args.orgId as unknown as string);
    }

    // 4. Normalize + validate
    const normalizedAudience = normalizeAudience(args.audience);
    const validatedResult = createProblemSchema.safeParse({
      ...args,
      audience: normalizedAudience,
      orgId: args.orgId as string | undefined,
      tagIds: args.tagIds as string[] | undefined,
    });
    if (!validatedResult.success) {
      throw new ConvexError(validatedResult.error.issues[0]?.message ?? 'Invalid problem input.');
    }
    const validated = validatedResult.data;

    // Fetch author for reputation level
    const author = await ctx.db.get(userId as Id<'users'>);
    if (!author) throw new ConvexError('User not found');

    const now = Date.now();
    const slug = generateSlug(validated.title);
    const boostUntil = now + 24 * 60 * 60 * 1000;
    const effectiveAnonymous = validated.visibility === 'anonymous' ? true : validated.isAnonymous;

    // Initial pain score (no votes yet)
    const painScore = calculatePainScore({
      voteCount: 0,
      downvoteCount: 0,
      meTooCount: 0,
      avgImpactRating: validated.impactRating,
      commentCount: 0,
      solutionCount: 0,
      createdAt: now,
      authorReputationLevel: author.reputationLevel,
    });

    // 5. Execute
    const problemId = await ctx.db.insert('problems', {
      title: validated.title,
      description: validated.description,
      workarounds: validated.workarounds,
      category: validated.category,
      audience: validated.audience,
      frequency: validated.frequency,
      impactRating: validated.impactRating,
      status: 'open',
      visibility: validated.visibility,
      orgId: args.orgId,
      authorId: userId as Id<'users'>,
      isAnonymous: effectiveAnonymous,
      anonymousHandle: effectiveAnonymous ? generateAnonymousHandle() : undefined,
      painScore,
      voteCount: 0,
      downvoteCount: 0,
      meTooCount: 0,
      commentCount: 0,
      solutionCount: 0,
      boostUntil,
      slug,
      createdAt: now,
      updatedAt: now,
      lastActivityAt: now,
    });

    // Associate tags
    if (validated.tagIds && validated.tagIds.length > 0) {
      await Promise.all(
        validated.tagIds.map((tagId) =>
          ctx.db.insert('problemTags', {
            problemId,
            tagId: tagId as Id<'tags'>,
            isAiSuggested: false,
            createdAt: now,
          }),
        ),
      );
    }

    // Update user's last active timestamp
    await ctx.db.patch(userId as Id<'users'>, { lastActiveAt: now });
    await trackEvent(ctx, 'problem_created', {
      actorId: userId as Id<'users'>,
      problemId,
      metadata: { visibility: validated.visibility },
    });

    return { problemId, slug };
  },
});

/**
 * Update problem content (title, description, etc.).
 * Only the author can update their own problem.
 */
export const updateProblem = mutation({
  args: {
    problemId: v.id('problems'),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    workarounds: v.optional(v.string()),
    category: v.optional(v.string()),
    audience: v.optional(v.array(v.string())),
    frequency: v.optional(
      v.union(
        v.literal('daily'),
        v.literal('weekly'),
        v.literal('monthly'),
        v.literal('rarely'),
      ),
    ),
    impactRating: v.optional(v.number()),
    tagIds: v.optional(v.array(v.id('tags'))),
  },
  handler: async (ctx, args) => {
    // 1. Auth
    const userId = await requireAuth(ctx);

    // 2. Rate limit
    await requireRateLimit(ctx, userId, 'problem:update');

    // 4. Get problem + verify ownership
    const problem = await ctx.db.get(args.problemId);
    if (!problem) throw new ConvexError('Problem not found.');
    if (problem.authorId !== (userId as Id<'users'>)) {
      throw new ConvexError('You can only edit your own problems.');
    }

    // 5. Validate
    const { problemId: _, tagIds, ...updateFields } = args;
    const validatedResult = updateProblemSchema.safeParse(updateFields);
    if (!validatedResult.success) {
      throw new ConvexError(validatedResult.error.issues[0]?.message ?? 'Invalid problem update.');
    }
    const validated = validatedResult.data;

    const now = Date.now();
    await ctx.db.patch(args.problemId, {
      ...validated,
      updatedAt: now,
    });

    // Update tags if provided
    if (tagIds !== undefined) {
      // Remove existing tags
      const existingTags = await ctx.db
        .query('problemTags')
        .withIndex('by_problem', (q) => q.eq('problemId', args.problemId))
        .collect();
      await Promise.all(existingTags.map((t) => ctx.db.delete(t._id)));

      // Add new tags
      await Promise.all(
        tagIds.map((tagId) =>
          ctx.db.insert('problemTags', {
            problemId: args.problemId,
            tagId,
            isAiSuggested: false,
            createdAt: now,
          }),
        ),
      );
    }

    return { success: true };
  },
});

/**
 * Update the status of a problem.
 * Author can always change status; workspace admins can too.
 */
export const updateStatus = mutation({
  args: {
    problemId: v.id('problems'),
    status: v.union(
      v.literal('open'),
      v.literal('exploring'),
      v.literal('proposed'),
      v.literal('exists'),
      v.literal('solved'),
    ),
  },
  handler: async (ctx, args) => {
    // 1. Auth
    const userId = await requireAuth(ctx);

    // Get problem
    const problem = await ctx.db.get(args.problemId);
    if (!problem) throw new ConvexError('Problem not found.');

    // Only author can update status
    if (problem.authorId !== (userId as Id<'users'>)) {
      throw new ConvexError('Only the problem author can change its status.');
    }

    const now = Date.now();
    await ctx.db.patch(args.problemId, {
      status: args.status,
      updatedAt: now,
      lastActivityAt: now,
    });

    return { success: true };
  },
});

/**
 * Delete a problem (soft delete by marking as hidden — not in schema yet, so hard delete for now).
 */
export const deleteProblem = mutation({
  args: { problemId: v.id('problems') },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const problem = await ctx.db.get(args.problemId);
    if (!problem) throw new ConvexError('Problem not found.');
    if (problem.authorId !== (userId as Id<'users'>)) {
      throw new ConvexError('Only the author can delete their problem.');
    }

    await ctx.db.delete(args.problemId);
    return { success: true };
  },
});

// ─── Helpers ────────────────────────────────────────────────────────────────

const ANONYMOUS_ANIMALS = [
  'Pangolin', 'Axolotl', 'Quokka', 'Capybara', 'Narwhal', 'Platypus',
  'Fossa', 'Okapi', 'Tapir', 'Shoebill', 'Dugong', 'Blobfish',
  'Saiga', 'Aye-aye', 'Babirusa', 'Kinkajou', 'Maned Wolf', 'Sun Bear',
];

function generateAnonymousHandle(): string {
  const animal = ANONYMOUS_ANIMALS[Math.floor(Math.random() * ANONYMOUS_ANIMALS.length)];
  return `Anonymous ${animal}`;
}

function normalizeAudience(audience: string[]): string[] {
  const unique = new Set<string>();
  for (const raw of audience) {
    const normalized = raw.trim().replace(/\s+/g, ' ');
    if (!normalized) continue;
    unique.add(normalized);
  }
  return Array.from(unique);
}
