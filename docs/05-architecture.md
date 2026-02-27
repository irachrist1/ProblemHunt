# Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENTS                                │
│   Next.js App (Vercel Edge + SSR)    ·   Future: Mobile         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                      CONVEX BACKEND                             │
│   Real-time DB · Mutations · Queries · Actions                  │
│   Scheduled Functions · File Storage · Vector Search            │
└────────┬────────────────────────────────────┬───────────────────┘
         │                                    │
┌────────▼────────┐                 ┌─────────▼──────────────────┐
│  AI SERVICES    │                 │   EXTERNAL SERVICES        │
│  Gemini 1.5 Pro │                 │   Typesense (search)       │
│  Gemini Flash   │                 │   Upstash Redis (limits)   │
│  OpenRouter     │                 │   Resend (email)           │
│  Vercel AI SDK  │                 │   Cloudflare R2 (files)    │
└─────────────────┘                 │   Stripe (billing)         │
                                    │   PostHog (analytics)      │
                                    └────────────────────────────┘
```

---

## Tech Stack Decisions

### Frontend: Next.js 15 (App Router)

**Why:**
- Server Components reduce JS bundle 40–60% on content-heavy pages
- Streaming enables progressive AI response rendering in submit form
- Edge Runtime for feed routes gives global latency < 50ms
- ISR for problem detail pages (high traffic, content changes infrequently)
- App Router layout system maps cleanly to our shell-based UI

**Version note:** Using Next.js 15 stable. Not 16 canary — canary introduces instability risk. Revisit upgrade quarterly.

**Critical config:**
```typescript
// next.config.ts
export default {
  experimental: {
    ppr: true,           // Partial Pre-rendering: serve shell instantly
    reactCompiler: true, // React Compiler: automatic memoization
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [/* Cloudflare R2, avatar providers */],
  },
};
```

**Route structure:**
```
app/
  (marketing)/                   // Unauthenticated marketing pages
    page.tsx                     // Landing page
    pricing/page.tsx
    about/page.tsx
  (app)/                         // Authenticated app shell
    layout.tsx                   // AppShell: sidebar + right panel
    page.tsx                     // Main feed
    p/[slug]/
      page.tsx                   // Problem detail (SSR + ISR)
      loading.tsx                // Skeleton
    submit/page.tsx              // Submit form (client-heavy)
    explore/
      page.tsx
      search/page.tsx
    w/[org]/
      page.tsx                   // Workspace feed
      analytics/page.tsx         // Workspace analytics (P2)
      settings/page.tsx
    u/[username]/page.tsx        // User profile
    notifications/page.tsx
  api/
    webhooks/stripe/route.ts     // Stripe webhook handler
    ai/
      stream/route.ts            // Vercel AI SDK streaming endpoint
      clarity/route.ts           // Clarity score (SSE)
```

---

### Backend: Convex

**Why Convex over alternatives (Supabase, PlanetScale, Neon):**

| Factor | Convex | Supabase | PlanetScale |
|--------|--------|----------|-------------|
| Real-time subscriptions | Native, first-class | Via Realtime (complex) | No |
| TypeScript end-to-end | Full schema→function→client | Partial | No |
| Optimistic updates | Built-in w/ rollback | Manual | Manual |
| Scheduled functions | Native | pg_cron (limited) | No |
| Vector search | Native | pgvector | No |
| Operational overhead | Near-zero | Low | Low |

Real-time subscriptions are non-negotiable for a community app where vote counts, feed positions, and status changes must be live.

**Scale assessment:**
- 0–100K users: Convex handles without thought
- 100K–1M users: Introduce CDN caching layer for public feed queries
- 1M+ users: Evaluate Convex Enterprise; potentially offload cold/archival data to separate store
- Decision point: Re-evaluate at 500K MAU

**Convex function structure:**
```
convex/
  schema.ts                      // Single source of truth for all tables
  auth.config.ts                 // @convex-dev/auth configuration

  problems/
    queries.ts                   // get, list, search, trending
    mutations.ts                 // create, update, delete, updateStatus
    actions.ts                   // AI analysis trigger, Typesense sync

  votes/
    mutations.ts                 // vote, meeToo, unvote (rate-limited)
    queries.ts                   // getVoteCounts, getUserVoteStatus

  solutions/
    queries.ts
    mutations.ts                 // propose, claimBuilder, markSolved

  comments/
    queries.ts                   // list (threaded), paginated
    mutations.ts                 // create, delete, react

  users/
    queries.ts                   // getProfile, search
    mutations.ts                 // updateProfile, updateSettings

  orgs/
    queries.ts                   // getOrg, listMembers, getWorkspace
    mutations.ts                 // createOrg, inviteMember, updateRole

  ai/
    actions.ts                   // clarityScore, detectDuplicates, tagSuggest, prdGen
    scheduled.ts                 // analyzeNewProblem, refreshSolutions, weeklyDigest

  search/
    actions.ts                   // typesenseSync, typesenseQuery

  notifications/
    queries.ts                   // list (unread, all), count
    mutations.ts                 // markRead, markAllRead
    scheduled.ts                 // digestEmail job

  _lib/
    auth.ts                      // requireAuth, requireRole helpers
    rateLimit.ts                 // Upstash Redis integration
    validation.ts                // Shared Zod schemas
    painScore.ts                 // Pain score calculation
```

---

### Auth: Convex Auth + OAuth

**MVP providers (required at launch):**
1. Email + Password — @convex-dev/auth
2. Google OAuth — expect 55–65% of signups
3. GitHub OAuth — critical for developer audience

**Post-MVP providers:**
- LinkedIn OAuth (Phase 2) — professional/org context
- Magic Link (Phase 2) — lower friction than password
- SAML/SSO via WorkOS (Phase 3) — enterprise requirement

**Session management:**
- JWT tokens managed by Convex Auth
- 30-day session lifetime, sliding expiry
- Refresh token rotation on each use
- Logout invalidates all sessions for the user

**Anonymous posting:**
- Requires authenticated account
- Poster identity stored encrypted in Convex
- Publicly shown as "Anonymous" with unique identifier (e.g., "Anonymous Pangolin")
- Admins can decrypt for moderation purposes only

---

### Search: Typesense

**Why not Convex built-in search:**
- Convex search: keyword-only, no semantic/vector queries, no faceting, 1M document limits
- Typesense: full-text + vector hybrid, faceting, typo-tolerance, advanced ranking

**Why Typesense over Algolia:**
- Self-hostable → cost control at scale (Algolia gets expensive fast)
- No per-search pricing
- Comparable performance
- Full TypeScript SDK
- Can run on Railway ($20/month starter, scales)

**Collection schema:**
```typescript
{
  name: 'problems',
  fields: [
    { name: 'convexId', type: 'string' },
    { name: 'title', type: 'string' },
    { name: 'description', type: 'string' },
    { name: 'category', type: 'string', facet: true },
    { name: 'tags', type: 'string[]', facet: true },
    { name: 'status', type: 'string', facet: true },
    { name: 'audience', type: 'string', facet: true },
    { name: 'painScore', type: 'float', sort: true },
    { name: 'voteCount', type: 'int32', sort: true },
    { name: 'createdAt', type: 'int64', sort: true },
    { name: 'embedding', type: 'float[]', num_dim: 768 },  // Gemini text-embedding-004
  ],
  default_sorting_field: 'painScore',
}
```

**Sync strategy:**
- On problem create/update: immediate Convex action → Typesense upsert
- Embedding: generated async (Gemini text-embedding-004), stored in Convex + Typesense
- Vote count sync: every 60 seconds via scheduled function (not per-vote — too high frequency)
- Deletion: soft delete in Typesense (mark hidden field true)

---

### AI Services

**Model selection by task:**

| Task | Model | Reason |
|------|-------|--------|
| Clarity scoring | Gemini 1.5 Flash | Fast, cheap, structured JSON output |
| Framing validation | Gemini 1.5 Flash | Simple classification, low latency |
| Auto-tagging | Gemini 1.5 Flash | Fast classification |
| Duplicate detection | Gemini text-embedding-004 + cosine similarity | Embedding-based, no LLM needed |
| "Is this solved?" | Gemini 1.5 Pro | Needs web context + reasoning |
| PRD generation | Gemini 1.5 Pro | Quality-critical, user sees output |
| Builder matching | Claude Haiku via OpenRouter | A/B test vs Flash for quality |
| Weekly digest copy | Gemini 1.5 Flash | High-volume, cost-sensitive |
| Problem decomposition | Gemini 1.5 Pro | Complex reasoning required |

**Vercel AI SDK usage:**
- All streaming responses (clarity score live panel, PRD generation)
- `streamText()` for text streams
- `streamObject()` for structured streaming (clarity checklist updates)
- Edge-compatible — runs in Vercel Edge Functions

**AI caching policy (stored in `ai_analyses` table):**
```
clarity_score:      TTL 24h; invalidated when description changes > 15%
duplicate_check:    TTL 48h; re-runs on title change
is_solved_check:    TTL 48h; re-runs when new solutions added globally
auto_tags:          TTL 7d; invalidated on category/description change
embeddings:         No TTL; recomputed only on substantial description edit (>30% change)
prd_generation:     No cache (user-triggered, real-time)
```

**Circuit breaker for AI failures:**
- All AI features wrapped in try/catch
- On failure: feature hides gracefully, submission proceeds without AI panel
- Error logged to PostHog for monitoring
- Never block core user actions on AI availability

---

### External Services

**File Storage: Cloudflare R2**
- Problem attachments, screenshots, user avatars, org logos
- Why R2: $0.015/GB/month (10x cheaper than S3); Cloudflare CDN included free
- Upload flow: client → Convex action generates R2 presigned URL → client uploads directly to R2 (bypasses Convex bandwidth limits)
- File size limits: 10MB per file, 5 files per problem
- Virus scanning: Cloudflare's R2 object scan (or ClamAV on edge worker)

**Email: Resend**
- Transactional: verification, password reset, notification emails
- Digest: weekly personalized emails (batched in Convex scheduled function)
- Templates: React Email (same component system as the app — single design language)
- Why Resend: developer-first, React Email native support, generous free tier, excellent deliverability

**Rate Limiting: Upstash Redis**
- Vote rate limit: 200 votes/hour per user
- Submission rate limit: 5 problems/hour per free user, 20/hour for Pro
- AI request rate limit: per user tier
- DDoS protection: per-IP limits on all public endpoints
- Why Upstash: serverless-native (no connection pooling issues with edge functions), pay-per-request

**Analytics: PostHog**
- Product analytics: funnels (landing → signup → first post), retention curves
- Session recordings: for UX debugging (opt-in)
- Feature flags: safe rollouts of new features
- A/B testing: pricing page, onboarding flow experiments
- Self-hostable at scale: if PostHog Cloud costs become significant at 1M+ users

**Billing: Stripe**
- Subscription management: Free / Pro / Team / Org tiers
- Stripe Customer Portal: self-serve plan changes, invoice history
- Webhook handler: `api/webhooks/stripe/route.ts` — updates org subscription status in Convex
- Usage-based billing for AI features (P3): Stripe metered billing

---

## Data Flow Diagrams

### Problem Submission Flow
```
User fills form (optimistic preview)
  → Title entered (800ms debounce)
      → [Convex action: detectDuplicates]
          → Generate title embedding (Gemini)
          → Cosine search in Convex vectors
          → Return top 3 matches → AI panel updates

  → Description reaches 50 chars (500ms debounce)
      → [Edge function: streamClarityScore]
          → Gemini Flash → stream JSON checklist
          → AI panel updates live

  → User clicks "Post Problem"
      → [Convex mutation: createProblem]
          → Rate limit check (Upstash)
          → Zod validation
          → Write to DB (optimistic: card appears)
          → Return problemId

      → Background [Convex scheduled action: analyzeNewProblem]
          → Generate full embedding (Gemini text-embedding-004)
          → Store embedding in Convex vector field
          → Sync to Typesense (upsert)
          → Run "is solved?" check → store in ai_analyses
          → Send notification to followers of matching tags
```

### Vote Flow (Optimistic)
```
User clicks Upvote
  → Optimistic update: increment count in UI immediately
  → [Convex mutation: toggleVote]
      → Rate limit check (Upstash Redis)
      → If rate limited: throw error → UI rolls back + toast "Slow down!"
      → Else: upsert votes table
      → Recalculate painScore (on votes table write trigger)
      → Convex subscriptions fire to all connected clients
      → All feed instances update vote count in real-time
```

### Real-time Feed Updates
```
Client subscribes to: useQuery(api.problems.list, { sort, filters })
  → Any problem's painScore changes
      → Convex reactivity: query result updates
      → React re-renders only the affected card
      → No full-page refresh, no polling
```

### AI Panel Streaming (Submit Page)
```
User typing description
  → Debounced 500ms → POST to /api/ai/stream
      → Vercel Edge Function
      → Vercel AI SDK: streamObject({ model: geminiFlash, schema: claritySchema })
      → Server-Sent Events stream to client
      → useObject() hook in React updates AI panel incrementally
      → Each checklist item appears as it's evaluated
```

---

## Security Architecture

### Convex Function Security Model
Every public-facing mutation/query enforces this pattern:
```typescript
export const createProblem = mutation({
  args: problemSchema,  // Zod schema — invalid args throw before handler runs
  handler: async (ctx, args) => {
    // 1. Authentication
    const userId = await requireAuth(ctx);  // throws ConvexError if unauthenticated

    // 2. Rate limiting
    await requireRateLimit(ctx, userId, 'problem:create');  // throws if exceeded

    // 3. Authorization (workspace access check if workspaceId provided)
    if (args.workspaceId) {
      await requireWorkspaceMembership(ctx, userId, args.workspaceId);
    }

    // 4. Content validation (beyond Zod — semantic checks)
    await validateProblemContent(args);

    // 5. Execute
    return await ctx.db.insert('problems', { ...args, authorId: userId });
  },
});
```

### Data Isolation
- Workspace queries: always filter `AND workspaceId = X AND isMember(userId, workspaceId)`
- User data: users can only read their own sensitive data (votes, settings, anonymous identity)
- Anonymous posts: `anonymousIdentity` field stored encrypted (AES-256); only accessible via admin mutation with audit log

### Content Security
- All user content HTML-escaped before storage
- Markdown rendered with DOMPurify (client) + remark-sanitize (server)
- File uploads: MIME type validation server-side; no executable file types
- AI outputs: treated as untrusted input; sanitized before rendering

### API Boundary Security
- All Convex functions require valid JWT (enforced by Convex runtime)
- Stripe webhooks: `stripe.webhooks.constructEvent()` signature verification
- AI endpoints: rate-limited per user tier via Upstash
- Public feed queries: cached at edge; no auth required; read-only

---

## Performance Budget

| Metric | Target | Notes |
|--------|--------|-------|
| LCP (Landing) | < 1.2s | Static/Edge rendered, minimal JS |
| LCP (Feed) | < 0.8s | Streamed shell + skeleton |
| INP | < 100ms | Optimistic updates mask latency |
| CLS | < 0.05 | Reserved heights for all async content |
| Feed TTI | < 2.0s | First 10 cards visible |
| Vote response | < 100ms perceived | Optimistic UI |
| AI first token | < 800ms | Edge function + Flash model |
| Search results | < 200ms | Typesense P99 |
| Time to submit | < 500ms perceived | Optimistic card creation |

---

## Scaling Playbook

### Phase 1: 0–50K MAU
Current architecture, no changes. Convex free/starter plan. Typesense on Railway single node. Vercel Pro.

### Phase 2: 50K–500K MAU
- Add Upstash Redis caching for hot feed queries (reduce Convex read costs)
- CDN cache problem detail pages (ISR: 60s TTL for top 10K problems)
- Typesense: 2-node cluster on Railway for HA
- Vercel Enterprise (edge config, faster builds)
- Review Convex usage report — optimize high-frequency queries

### Phase 3: 500K–5M MAU
- Convex Enterprise: higher limits, dedicated support
- Consider cold data archival for problems > 2 years old
- Typesense Analytics node for search insights
- Cloudflare Workers for AI job queue (replace Convex scheduled actions at extreme volume)
- Dedicated email infrastructure if Resend volume costs exceed $500/month

### Single Points of Failure and Mitigations

| Service | Failure Mode | Mitigation |
|---------|-------------|-----------|
| Convex | DB unavailable | Optimistic UI masks brief outages; 99.99% SLA; status monitoring |
| Typesense | Search down | Fall back to Convex basic text search (degraded mode, banner shown) |
| AI services | API rate limit / outage | Circuit breaker; AI features fail silently; core app unaffected |
| Stripe | Payment processing | Stripe's own redundancy; grace period on failed renewals |
| Resend | Email delivery | Queue emails in Convex; retry with exponential backoff |
| Cloudflare R2 | File unavailable | CDN cache serves stale; show broken image placeholder |

---

## Error Handling Philosophy

1. **Optimistic UI with graceful rollback**: Users see instant feedback. Server failure → rollback with descriptive toast. Never leave UI in broken state.

2. **User-facing error messages**: Never expose technical errors. Map all errors to human language:
   - Rate limit hit → "You're moving fast! Try again in a moment."
   - Auth required → "Sign in to vote on problems."
   - Server error → "Something went wrong. We're looking into it."

3. **AI failures are invisible**: If clarity scoring fails, the AI panel hides. Submission continues. Log to PostHog.

4. **Offline handling**: Convex queues mutations during offline periods and retries when connection restores. Show "You're offline" banner.

5. **Never block critical paths**: Vote, submit, and comment flows must work even if non-critical services (analytics, email, AI) are down.
