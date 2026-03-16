import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { authTables } from '@convex-dev/auth/server';

export default defineSchema(
  {
    ...authTables,

    // ─────────────────────────────────────────────────────────────
    // USERS
    // ─────────────────────────────────────────────────────────────
    users: defineTable({
      // Identity
      name: v.string(),
      username: v.string(),          // unique, slug-safe
      email: v.string(),
      image: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      phone: v.optional(v.string()),
      phoneVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      avatarUrl: v.optional(v.string()),
      bio: v.optional(v.string()),
      role: v.optional(v.string()),  // e.g. "Developer", "Designer", "PM"

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
      createdAt: v.number(),
      lastActiveAt: v.number(),
    })
      .index('email', ['email'])
      .index('phone', ['phone'])
      .index('by_username', ['username'])
      .index('by_reputation', ['reputationScore']),

    // ─────────────────────────────────────────────────────────────
    // GUEST VISITORS (browser-scoped identity for guest mode)
    // ─────────────────────────────────────────────────────────────
    guestVisitors: defineTable({
      visitorId: v.string(),
      userId: v.id('users'),
      alias: v.string(),
      createdAt: v.number(),
      lastActiveAt: v.number(),
    })
      .index('by_visitor_id', ['visitorId'])
      .index('by_user', ['userId']),

    // ─────────────────────────────────────────────────────────────
    // ORGANIZATIONS
    // ─────────────────────────────────────────────────────────────
    organizations: defineTable({
      name: v.string(),
      slug: v.string(),
      description: v.optional(v.string()),
      logoUrl: v.optional(v.string()),
      website: v.optional(v.string()),

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

      workspaceVisibility: v.union(
        v.literal('private'),
        v.literal('public'),
        v.literal('mixed'),
      ),

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
      title: v.string(),
      description: v.string(),
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
      impactRating: v.number(),      // 1–5

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
      orgId: v.optional(v.id('organizations')),

      // Author
      authorId: v.id('users'),
      isAnonymous: v.boolean(),
      anonymousHandle: v.optional(v.string()),
      anonymousIdentityEncrypted: v.optional(v.string()),

      // Cached signals (updated by scheduled function + mutations)
      painScore: v.number(),
      voteCount: v.number(),
      downvoteCount: v.optional(v.number()),
      meTooCount: v.number(),
      commentCount: v.number(),
      solutionCount: v.number(),
      boostUntil: v.optional(v.number()),

      // AI analysis cache
      clarityScore: v.optional(v.number()),
      aiTags: v.optional(v.array(v.string())),
      aiAudienceEstimate: v.optional(v.string()),
      embeddingId: v.optional(v.id('embeddings')),

      // URL slug
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
      .index('by_pain_score', ['painScore'])
      .index('by_created_at', ['createdAt'])
      .index('by_last_activity', ['lastActivityAt'])
      .searchIndex('search_title_desc', {
        searchField: 'title',
        filterFields: ['category', 'status', 'visibility'],
      })
      .searchIndex('search_description', {
        searchField: 'description',
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
        v.literal('downvote'),
        v.literal('me_too'),
      ),
      impactRating: v.optional(v.number()),  // 1–5, for me_too
      createdAt: v.number(),
    })
      .index('by_problem', ['problemId'])
      .index('by_user', ['userId'])
      .index('by_user_and_created', ['userId', 'createdAt'])
      .index('by_problem_and_user', ['problemId', 'userId']),

    // ─────────────────────────────────────────────────────────────
    // SOLUTIONS
    // ─────────────────────────────────────────────────────────────
    solutions: defineTable({
      problemId: v.id('problems'),
      authorId: v.id('users'),
      type: v.union(
        v.literal('existing_product'),
        v.literal('proposal'),
        v.literal('builder_claim'),
      ),
      title: v.optional(v.string()),
      description: v.string(),
      url: v.optional(v.string()),
      isOpenSource: v.optional(v.boolean()),
      repoUrl: v.optional(v.string()),
      estimatedTimeline: v.optional(v.string()),
      upvoteCount: v.number(),
      isVerifiedByPoster: v.boolean(),
      verifiedAt: v.optional(v.number()),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index('by_problem', ['problemId'])
      .index('by_author', ['authorId'])
      .index('by_problem_and_upvotes', ['problemId', 'upvoteCount']),

    // ─────────────────────────────────────────────────────────────
    // SOLUTION VOTES
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
      parentId: v.optional(v.id('comments')),
      body: v.string(),
      reactions: v.optional(v.object({
        thumbsUp: v.number(),
        bulb: v.number(),
        heart: v.number(),
      })),
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
    // COMMENT REACTIONS
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
      problemCount: v.number(),
      color: v.optional(v.string()),
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
      targetId: v.string(),
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
    // AI ANALYSES
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
      result: v.any(),
      model: v.string(),
      inputHash: v.string(),
      createdAt: v.number(),
      expiresAt: v.number(),
    })
      .index('by_problem_and_type', ['problemId', 'type'])
      .index('by_expires', ['expiresAt']),

    // ─────────────────────────────────────────────────────────────
    // EMBEDDINGS
    // ─────────────────────────────────────────────────────────────
    embeddings: defineTable({
      problemId: v.id('problems'),
      vector: v.array(v.float64()),
      model: v.string(),
      inputHash: v.string(),
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
      .index('by_user_and_created', ['userId', 'createdAt'])
      .index('by_user_and_problem', ['userId', 'problemId']),

    // ─────────────────────────────────────────────────────────────
    // RATE LIMIT LOG
    // ─────────────────────────────────────────────────────────────
    rateLimitLog: defineTable({
      userId: v.id('users'),
      action: v.string(),
      count: v.number(),
      windowStart: v.number(),
    })
      .index('by_user_and_action', ['userId', 'action']),

    // ─────────────────────────────────────────────────────────────
    // AUDIT LOG
    // ─────────────────────────────────────────────────────────────
    auditLog: defineTable({
      orgId: v.id('organizations'),
      actorId: v.id('users'),
      action: v.string(),
      targetId: v.optional(v.string()),
      metadata: v.optional(v.any()),
      createdAt: v.number(),
    })
      .index('by_org', ['orgId'])
      .index('by_org_and_created', ['orgId', 'createdAt']),

    // ─────────────────────────────────────────────────────────────
    // ANALYTICS EVENTS
    // ─────────────────────────────────────────────────────────────
    analyticsEvents: defineTable({
      event: v.string(),
      actorId: v.optional(v.id('users')),
      problemId: v.optional(v.id('problems')),
      metadata: v.optional(v.any()),
      createdAt: v.number(),
    })
      .index('by_event', ['event'])
      .index('by_created', ['createdAt'])
      .index('by_actor_and_created', ['actorId', 'createdAt']),
  },
  { schemaValidation: true },
);
