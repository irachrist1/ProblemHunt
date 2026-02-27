# Database Schema

All tables defined using Convex's `defineTable` and `defineSchema`. This is the canonical schema — all Convex functions must reference these types.

---

## Full Schema

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({

  // ─────────────────────────────────────────────────────────────
  // USERS
  // ─────────────────────────────────────────────────────────────
  users: defineTable({
    // Identity
    name: v.string(),
    username: v.string(),          // unique, slug-safe
    email: v.string(),
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    role: v.optional(v.string()),  // e.g. "Developer", "Designer", "PM"

    // Auth (managed by @convex-dev/auth — do not write directly)
    // authProvider is tracked externally

    // Reputation
    reputationScore: v.number(),
    reputationLevel: v.union(
      v.literal('newcomer'),
      v.literal('contributor'),
      v.literal('finder'),
      v.literal('expert'),
      v.literal('legend'),
    ),

    // Settings
    emailNotifications: v.optional(v.object({
      onVote: v.boolean(),
      onMeToo: v.boolean(),
      onComment: v.boolean(),
      onBuilderClaim: v.boolean(),
      onStatusChange: v.boolean(),
      digestFrequency: v.union(
        v.literal('realtime'),
        v.literal('daily'),
        v.literal('weekly'),
        v.literal('never'),
      ),
    })),

    // Timestamps
    createdAt: v.number(),         // Unix ms
    lastActiveAt: v.number(),
  })
    .index('by_username', ['username'])
    .index('by_email', ['email'])
    .index('by_reputation', ['reputationScore']),

  // ─────────────────────────────────────────────────────────────
  // ORGANIZATIONS
  // ─────────────────────────────────────────────────────────────
  organizations: defineTable({
    name: v.string(),
    slug: v.string(),              // unique, URL-safe
    description: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    website: v.optional(v.string()),

    // Billing
    plan: v.union(
      v.literal('free'),
      v.literal('team'),
      v.literal('org'),
      v.literal('enterprise'),
    ),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    subscriptionStatus: v.optional(v.union(
      v.literal('active'),
      v.literal('past_due'),
      v.literal('canceled'),
      v.literal('trialing'),
    )),

    // Settings
    workspaceVisibility: v.union(
      v.literal('private'),
      v.literal('public'),
      v.literal('mixed'),          // some problems public, some private
    ),

    // Timestamps
    createdAt: v.number(),
    createdBy: v.id('users'),
  })
    .index('by_slug', ['slug'])
    .index('by_stripe_customer', ['stripeCustomerId']),

  // ─────────────────────────────────────────────────────────────
  // MEMBERSHIPS (User ↔ Organization)
  // ─────────────────────────────────────────────────────────────
  memberships: defineTable({
    userId: v.id('users'),
    orgId: v.id('organizations'),
    role: v.union(
      v.literal('admin'),
      v.literal('member'),
      v.literal('viewer'),
    ),
    invitedBy: v.optional(v.id('users')),
    joinedAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_org', ['orgId'])
    .index('by_user_and_org', ['userId', 'orgId']),

  // ─────────────────────────────────────────────────────────────
  // PROBLEMS (Core entity)
  // ─────────────────────────────────────────────────────────────
  problems: defineTable({
    // Core content
    title: v.string(),             // max 120 chars
    description: v.string(),      // rich text / markdown
    workarounds: v.optional(v.string()),

    // Classification
    category: v.string(),
    audience: v.array(v.string()),
    frequency: v.union(
      v.literal('daily'),
      v.literal('weekly'),
      v.literal('monthly'),
      v.literal('rarely'),
    ),
    impactRating: v.number(),      // 1–5 (self-reported)

    // Status
    status: v.union(
      v.literal('open'),
      v.literal('exploring'),
      v.literal('proposed'),
      v.literal('exists'),
      v.literal('solved'),
    ),

    // Visibility
    visibility: v.union(
      v.literal('public'),
      v.literal('workspace'),
      v.literal('anonymous'),
    ),
    orgId: v.optional(v.id('organizations')),    // set if workspace-only

    // Author
    authorId: v.id('users'),
    isAnonymous: v.boolean(),
    anonymousHandle: v.optional(v.string()),      // e.g. "Anonymous Pangolin"
    anonymousIdentityEncrypted: v.optional(v.string()), // encrypted real identity

    // Computed/cached signals (updated by scheduled function)
    painScore: v.number(),         // composite ranking score
    voteCount: v.number(),         // cached count
    meTooCount: v.number(),        // cached count
    commentCount: v.number(),      // cached count
    solutionCount: v.number(),     // cached count

    // AI analysis cache
    clarityScore: v.optional(v.number()),    // 0–100
    aiTags: v.optional(v.array(v.string())),
    aiAudienceEstimate: v.optional(v.string()),
    embeddingId: v.optional(v.id('embeddings')),

    // Slug for URLs (generated from title)
    slug: v.string(),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
    lastActivityAt: v.number(),
  })
    .index('by_slug', ['slug'])
    .index('by_author', ['authorId'])
    .index('by_org', ['orgId'])
    .index('by_status', ['status'])
    .index('by_category', ['category'])
    .index('by_pain_score', ['painScore'])       // primary feed sort
    .index('by_created_at', ['createdAt'])        // new sort
    .index('by_last_activity', ['lastActivityAt'])
    .searchIndex('search_title_desc', {
      searchField: 'title',
      filterFields: ['category', 'status', 'visibility'],
    }),

  // ─────────────────────────────────────────────────────────────
  // VOTES
  // ─────────────────────────────────────────────────────────────
  votes: defineTable({
    problemId: v.id('problems'),
    userId: v.id('users'),
    type: v.union(
      v.literal('upvote'),
      v.literal('me_too'),
    ),
    impactRating: v.optional(v.number()),  // 1–5, required for me_too
    createdAt: v.number(),
  })
    .index('by_problem', ['problemId'])
    .index('by_user', ['userId'])
    .index('by_problem_and_user', ['problemId', 'userId']),  // enforce uniqueness + fast lookup

  // ─────────────────────────────────────────────────────────────
  // SOLUTIONS
  // ─────────────────────────────────────────────────────────────
  solutions: defineTable({
    problemId: v.id('problems'),
    authorId: v.id('users'),

    type: v.union(
      v.literal('existing_product'),  // link to an existing tool
      v.literal('proposal'),          // text description of approach
      v.literal('builder_claim'),     // "I'm building this"
    ),

    // Content
    title: v.optional(v.string()),
    description: v.string(),
    url: v.optional(v.string()),       // for existing_product

    // Builder claim specifics
    isOpenSource: v.optional(v.boolean()),
    repoUrl: v.optional(v.string()),
    estimatedTimeline: v.optional(v.string()),

    // Signals
    upvoteCount: v.number(),
    isVerifiedByPoster: v.boolean(),   // poster confirmed this solved it
    verifiedAt: v.optional(v.number()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_problem', ['problemId'])
    .index('by_author', ['authorId'])
    .index('by_problem_and_upvotes', ['problemId', 'upvoteCount']),

  // ─────────────────────────────────────────────────────────────
  // SOLUTION VOTES (separate from problem votes)
  // ─────────────────────────────────────────────────────────────
  solutionVotes: defineTable({
    solutionId: v.id('solutions'),
    userId: v.id('users'),
    createdAt: v.number(),
  })
    .index('by_solution', ['solutionId'])
    .index('by_user', ['userId'])
    .index('by_solution_and_user', ['solutionId', 'userId']),

  // ─────────────────────────────────────────────────────────────
  // COMMENTS
  // ─────────────────────────────────────────────────────────────
  comments: defineTable({
    problemId: v.id('problems'),
    authorId: v.id('users'),
    parentId: v.optional(v.id('comments')),   // null = top-level, set = reply
    body: v.string(),                          // markdown

    // Reactions
    reactions: v.optional(v.object({
      thumbsUp: v.number(),
      bulb: v.number(),
      heart: v.number(),
    })),

    // Moderation
    isDeleted: v.boolean(),
    deletedAt: v.optional(v.number()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_problem', ['problemId'])
    .index('by_parent', ['parentId'])
    .index('by_author', ['authorId'])
    .index('by_problem_and_created', ['problemId', 'createdAt']),

  // ─────────────────────────────────────────────────────────────
  // COMMENT REACTIONS (separate table for per-user tracking)
  // ─────────────────────────────────────────────────────────────
  commentReactions: defineTable({
    commentId: v.id('comments'),
    userId: v.id('users'),
    emoji: v.union(v.literal('thumbsUp'), v.literal('bulb'), v.literal('heart')),
    createdAt: v.number(),
  })
    .index('by_comment', ['commentId'])
    .index('by_comment_and_user', ['commentId', 'userId']),

  // ─────────────────────────────────────────────────────────────
  // TAGS
  // ─────────────────────────────────────────────────────────────
  tags: defineTable({
    name: v.string(),
    slug: v.string(),
    category: v.optional(v.string()),
    problemCount: v.number(),          // cached
    color: v.optional(v.string()),     // hex color for display
    createdAt: v.number(),
  })
    .index('by_slug', ['slug'])
    .index('by_problem_count', ['problemCount']),

  // ─────────────────────────────────────────────────────────────
  // PROBLEM TAGS (many-to-many)
  // ─────────────────────────────────────────────────────────────
  problemTags: defineTable({
    problemId: v.id('problems'),
    tagId: v.id('tags'),
    isAiSuggested: v.boolean(),
    createdAt: v.number(),
  })
    .index('by_problem', ['problemId'])
    .index('by_tag', ['tagId']),

  // ─────────────────────────────────────────────────────────────
  // FOLLOWS
  // ─────────────────────────────────────────────────────────────
  follows: defineTable({
    followerId: v.id('users'),
    targetType: v.union(
      v.literal('problem'),
      v.literal('user'),
      v.literal('tag'),
    ),
    targetId: v.string(),    // problemId, userId, or tagId as string
    createdAt: v.number(),
  })
    .index('by_follower', ['followerId'])
    .index('by_target', ['targetType', 'targetId'])
    .index('by_follower_and_target', ['followerId', 'targetType', 'targetId']),

  // ─────────────────────────────────────────────────────────────
  // NOTIFICATIONS
  // ─────────────────────────────────────────────────────────────
  notifications: defineTable({
    userId: v.id('users'),
    type: v.union(
      v.literal('upvote'),
      v.literal('me_too'),
      v.literal('comment'),
      v.literal('reply'),
      v.literal('builder_claim'),
      v.literal('status_change'),
      v.literal('solution_verified'),
      v.literal('follow'),
    ),
    // Polymorphic payload — type-safe via discriminated union
    payload: v.object({
      actorId: v.optional(v.id('users')),
      problemId: v.optional(v.id('problems')),
      commentId: v.optional(v.id('comments')),
      solutionId: v.optional(v.id('solutions')),
      message: v.optional(v.string()),
    }),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_user_and_read', ['userId', 'isRead'])
    .index('by_user_and_created', ['userId', 'createdAt']),

  // ─────────────────────────────────────────────────────────────
  // AI ANALYSES (cache layer)
  // ─────────────────────────────────────────────────────────────
  aiAnalyses: defineTable({
    problemId: v.id('problems'),
    type: v.union(
      v.literal('clarity_score'),
      v.literal('duplicate_check'),
      v.literal('is_solved_check'),
      v.literal('auto_tags'),
      v.literal('audience_estimate'),
      v.literal('market_size'),
    ),
    result: v.any(),               // JSON result, structure varies by type
    model: v.string(),             // e.g. "gemini-1.5-flash-001"
    inputHash: v.string(),         // hash of inputs — used for cache invalidation
    createdAt: v.number(),
    expiresAt: v.number(),         // TTL-based expiry
  })
    .index('by_problem_and_type', ['problemId', 'type'])
    .index('by_expires', ['expiresAt']),

  // ─────────────────────────────────────────────────────────────
  // EMBEDDINGS (for semantic search + duplicate detection)
  // ─────────────────────────────────────────────────────────────
  embeddings: defineTable({
    problemId: v.id('problems'),
    vector: v.array(v.float64()),  // 768-dim Gemini text-embedding-004
    model: v.string(),
    inputHash: v.string(),         // hash of title+description; triggers re-embed on change
    createdAt: v.number(),
  })
    .index('by_problem', ['problemId'])
    .vectorIndex('by_vector', {
      vectorField: 'vector',
      dimensions: 768,
      filterFields: ['model'],
    }),

  // ─────────────────────────────────────────────────────────────
  // BOOKMARKS
  // ─────────────────────────────────────────────────────────────
  bookmarks: defineTable({
    userId: v.id('users'),
    problemId: v.id('problems'),
    createdAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_user_and_problem', ['userId', 'problemId']),

  // ─────────────────────────────────────────────────────────────
  // RATE LIMIT RECORDS (backup to Upstash for audit)
  // ─────────────────────────────────────────────────────────────
  rateLimitLog: defineTable({
    userId: v.id('users'),
    action: v.string(),
    count: v.number(),
    windowStart: v.number(),
  })
    .index('by_user_and_action', ['userId', 'action']),

  // ─────────────────────────────────────────────────────────────
  // AUDIT LOG (workspace admin actions)
  // ─────────────────────────────────────────────────────────────
  auditLog: defineTable({
    orgId: v.id('organizations'),
    actorId: v.id('users'),
    action: v.string(),            // e.g. "member.invite", "problem.delete"
    targetId: v.optional(v.string()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index('by_org', ['orgId'])
    .index('by_org_and_created', ['orgId', 'createdAt']),

});
```

---

## TypeScript Types Reference

Generated from schema — use these in functions and client code:

```typescript
// types/domain.ts — derived from schema, DO NOT duplicate

import { Doc, Id } from './_generated/dataModel';

export type User = Doc<'users'>;
export type Organization = Doc<'organizations'>;
export type Problem = Doc<'problems'>;
export type Vote = Doc<'votes'>;
export type Solution = Doc<'solutions'>;
export type Comment = Doc<'comments'>;
export type Notification = Doc<'notifications'>;
export type Tag = Doc<'tags'>;

// Enriched types for UI (joined data)
export type ProblemWithMeta = Problem & {
  author: Pick<User, '_id' | 'name' | 'username' | 'avatarUrl'>;
  tags: Tag[];
  userVote: Vote | null;  // current user's vote, if any
};

export type CommentWithAuthor = Comment & {
  author: Pick<User, '_id' | 'name' | 'username' | 'avatarUrl'>;
  replies?: CommentWithAuthor[];
};

export type SolutionWithAuthor = Solution & {
  author: Pick<User, '_id' | 'name' | 'username' | 'avatarUrl'>;
  userVoted: boolean;
};
```

---

## Key Design Decisions

### Cached Counts on Problems Table
`voteCount`, `meTooCount`, `commentCount`, `solutionCount` are **denormalized** onto the `problems` table.

**Why:** Feed rendering reads these counts for every card. Computing them via joins on every feed query at scale is expensive. Cached counts make feed queries O(1) per problem.

**How they stay consistent:** Every mutation that affects these counts (createVote, createComment, createSolution, etc.) also updates the cached count via a single additional DB write. Convex transactions guarantee atomicity.

### Pain Score Calculation
The `painScore` field is recalculated and written after every vote. It's the primary sort key for the hot feed.

```typescript
// convex/_lib/painScore.ts
export function calculatePainScore(params: {
  voteCount: number;
  meTooCount: number;
  avgImpactRating: number;
  commentCount: number;
  solutionCount: number;
  createdAt: number;
  authorReputationLevel: string;
}): number {
  const {
    voteCount, meTooCount, avgImpactRating,
    commentCount, solutionCount, createdAt, authorReputationLevel
  } = params;

  const ageHours = (Date.now() - createdAt) / (1000 * 60 * 60);
  const decayFactor = Math.pow(ageHours + 2, 1.5);

  const reputationMultiplier = {
    newcomer: 1.0,
    contributor: 1.1,
    finder: 1.2,
    expert: 1.35,
    legend: 1.5,
  }[authorReputationLevel] ?? 1.0;

  const rawScore =
    (voteCount * 1.0) +
    (meTooCount * 2.5) +
    (avgImpactRating * meTooCount * 0.8) +
    (commentCount * 0.3) +
    (solutionCount * 0.5);

  return (rawScore * reputationMultiplier) / decayFactor;
}
```

### Slug Generation
Slugs are generated from the title and must be unique:
```typescript
// convex/_lib/slugs.ts
export function generateSlug(title: string, suffix?: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 60);

  const uniqueSuffix = suffix ?? nanoid(6);
  return `${base}-${uniqueSuffix}`;
}
```

### Anonymous Identity Encryption
```typescript
// Stored as: encrypt(userId, process.env.ANON_ENCRYPTION_KEY)
// Only decryptable with the key, which admins have access to
// Allows moderation without public exposure
```

### Embedding Re-computation Strategy
Embeddings are expensive (API cost + latency). Re-compute only when content changes significantly:
```typescript
// In createProblem / updateProblem mutations:
const inputHash = sha256(`${title}::${description}`);
const existing = await ctx.db.query('embeddings')
  .withIndex('by_problem', q => q.eq('problemId', id))
  .first();

if (!existing || existing.inputHash !== inputHash) {
  // Schedule re-embedding
  await ctx.scheduler.runAfter(0, api.ai.scheduled.generateEmbedding, { problemId: id, inputHash });
}
```

---

## Index Strategy

### Most Critical Indexes (read patterns)

| Query | Index Used |
|-------|-----------|
| Feed sorted by pain score | `problems.by_pain_score` |
| Feed filtered by category | `problems.by_category` + sort by painScore in-app |
| User's problems | `problems.by_author` |
| Workspace problems | `problems.by_org` |
| User's vote on a problem | `votes.by_problem_and_user` |
| Unread notifications | `notifications.by_user_and_read` |
| Tags on a problem | `problemTags.by_problem` |
| Problems with a tag | `problemTags.by_tag` |
| AI analysis cache | `aiAnalyses.by_problem_and_type` |
| Semantic search | `embeddings.by_vector` (vector index) |

### Performance Notes
- `problems.by_pain_score` — this is the hottest index. Monitor its cardinality as problem count grows.
- `votes.by_problem_and_user` — unique constraint enforced at application level (check before insert)
- `notifications.by_user_and_read` — paginate; never load all notifications in one query
- `embeddings.by_vector` — Convex vector search; limit to top 10 results for performance

---

## Migration Notes

Convex handles schema migrations automatically for additive changes. For breaking changes:

1. Add the new field as `v.optional()`
2. Write a migration script that backfills data
3. Once all documents have the field, remove `v.optional()`
4. Never remove a field without a backfill period

Track all schema changes in `convex/MIGRATIONS.md` with date and reasoning.
