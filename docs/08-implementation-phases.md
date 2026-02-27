# Implementation Phases

The build is organized into phases. Each phase must be **fully functional and shippable** before the next begins. No half-built phases.

---

## Phase 1: Foundation (MVP — Target: 6 weeks)

**Goal:** A working community feed where people can post problems and vote. Enough to onboard the first 500 users and collect feedback.

### Deliverables

#### Week 1–2: Infrastructure + Auth
- [ ] Initialize Next.js 15 project with TypeScript strict, Tailwind, Inter font
- [ ] Set up Convex project, connect to Next.js
- [ ] Configure @convex-dev/auth (email + password)
- [ ] Add Google OAuth provider
- [ ] Add GitHub OAuth provider
- [ ] Deploy initial schema (users, problems, votes, comments, tags, problemTags)
- [ ] Configure Cloudflare R2 for file storage
- [ ] Set up PostHog analytics
- [ ] Set up Vercel project with environment variables
- [ ] Implement `requireAuth` and rate limit helpers in Convex

#### Week 3: Core Problem Flow
- [ ] Problem submission form (all 4 steps)
- [ ] `createProblem` mutation with full validation
- [ ] Auto-slug generation
- [ ] Tag creation + `problemTags` many-to-many
- [ ] Problem detail page (SSR)
- [ ] Problem status lifecycle mutations

#### Week 4: Feed + Voting
- [ ] Main feed query (hot sort, pain score calculation)
- [ ] New / Top sort algorithms
- [ ] Problem card component (full variant)
- [ ] Upvote mutation + optimistic update
- [ ] Me Too mutation + optimistic update
- [ ] Real-time vote count updates via Convex subscription
- [ ] Feed filtering by category + status
- [ ] Virtualized list rendering

#### Week 5: Comments + Discovery
- [ ] Comment creation + threaded display (2-level)
- [ ] Comment reactions (thumbsUp, bulb, heart)
- [ ] Explore page with category grid
- [ ] Basic search (Convex text search — Typesense comes in Phase 2)
- [ ] Tag pages + follow tags
- [ ] User profile page
- [ ] Follow problems

#### Week 6: Polish + Launch Prep
- [ ] Notification system (in-app)
- [ ] Email verification flow
- [ ] Password reset flow
- [ ] Landing page (full design implementation)
- [ ] Skeleton loading states for all async content
- [ ] Empty states for all screens
- [ ] Mobile responsive layout
- [ ] Error boundaries + toast notifications
- [ ] Rate limiting on all mutations (Upstash Redis)
- [ ] Basic moderation: flagging system

### Phase 1 AI (Minimal)
- [ ] Clarity scoring (streaming, on submit page)
- [ ] Framing validation (rule-based, instant)
- [ ] Auto-tagging (background, async)

### Phase 1 Success Criteria
- 500 problems posted with no data loss
- Feed loads < 1s on desktop
- Zero auth-related security issues
- Mobile experience is functional (not perfect)
- Lighthouse score ≥ 85 on all pages

---

## Phase 2: Community (Target: 8 weeks after Phase 1 launch)

**Goal:** Deepen community engagement. Add organization workspaces. Improve discoverability.

### Deliverables

#### Search & Discovery
- [ ] Typesense integration (replace Convex search)
- [ ] Embedding generation for all problems (batch backfill)
- [ ] Semantic search (vector + keyword hybrid)
- [ ] Typesense sync (Convex scheduled action)
- [ ] Advanced search filters (category, status, date, impact)
- [ ] Search results page with relevance scoring

#### Organization Workspaces
- [ ] Organization creation flow
- [ ] Membership invitation (email-based)
- [ ] Role-based access control
- [ ] Private workspace feed (isolated from public)
- [ ] Problem visibility settings (public / workspace / anonymous)
- [ ] Workspace sidebar navigation
- [ ] Problem assignment within workspaces

#### Solutions Layer
- [ ] Solution submission (all 3 types)
- [ ] Solution upvoting
- [ ] Builder claim flow with status updates
- [ ] "Verified by poster" marking
- [ ] Solutions tab on problem detail

#### Enhanced AI
- [ ] Duplicate detection (embedding-based, replaces text-only)
- [ ] "Is this solved?" check (background, post-submission)
- [ ] AI insights sidebar on problem detail
- [ ] Audience estimate display

#### Billing
- [ ] Stripe integration
- [ ] Pro plan (individual)
- [ ] Team plan (org)
- [ ] Stripe Customer Portal for self-serve billing
- [ ] Plan-gating for workspace features

#### Notifications & Email
- [ ] Email notifications (Resend)
- [ ] Notification preferences UI
- [ ] Weekly digest email (basic, non-personalized)
- [ ] React Email templates for all notification types

#### Reputation System
- [ ] Reputation score calculation
- [ ] Reputation levels (Newcomer → Legend)
- [ ] Profile activity tabs (Posted, Solutions, Comments)

### Phase 2 Success Criteria
- 50 paying organizations using workspaces
- Search returns relevant results (< 200ms P99)
- Solution layer actively used (20%+ of problems have ≥1 solution)
- Email open rate ≥ 25%

---

## Phase 3: Intelligence (Target: 10 weeks after Phase 2)

**Goal:** AI-powered features that make ProblemHunt genuinely smarter than competitors.

### Deliverables

#### Full AI Suite
- [ ] PRD generation (streaming, on-demand)
- [ ] Problem decomposition
- [ ] Builder matching algorithm
- [ ] Personalized weekly digest (AI-personalized per user)
- [ ] Trend detection ("Problems in X are up 40%")
- [ ] Workspace analytics AI summaries

#### Advanced Workspace Features
- [ ] Linear integration (export problem → Linear issue, sync status)
- [ ] Jira integration
- [ ] Notion database export
- [ ] Slack notifications for workspace problems
- [ ] Problem assignment + sprint tagging
- [ ] Workspace analytics dashboard (charts)

#### Community Features
- [ ] Collections (curated problem sets)
- [ ] Problem series (link related problems)
- [ ] User reputation leaderboard
- [ ] Builder profile page
- [ ] "Anonymous Pangolin" system for anonymous posts

#### Performance & Scale
- [ ] CDN caching for problem detail pages (ISR)
- [ ] Upstash Redis caching for feed queries
- [ ] Image optimization via Cloudflare
- [ ] Core Web Vitals audit + remediation

### Phase 3 Success Criteria
- 2,000+ paying organizations
- AI PRD generation used by 30%+ of Pro users monthly
- Workspace integrations adopted by 40%+ of org users
- LCP < 0.8s on feed page

---

## Phase 4: Scale (Target: Ongoing after Phase 3)

**Goal:** Prepare for 1M+ users. Enterprise features.

### Deliverables
- [ ] SAML SSO via WorkOS
- [ ] SCIM provisioning
- [ ] Audit logs for enterprise orgs
- [ ] Bounty marketplace (orgs put $ on problems)
- [ ] API access for enterprise (read problems, embed feed)
- [ ] Convex Enterprise evaluation
- [ ] Separate archival storage for old problems
- [ ] Advanced moderation tools + AI moderation
- [ ] Usage-based billing for AI (metered)
- [ ] Mobile app evaluation (React Native or PWA)

---

## Development Standards (All Phases)

### Before Starting Any Feature
1. Read the relevant spec in `/docs`
2. Write a brief plan in `/tasks/todo.md` (3–5 bullet points)
3. Check `/tasks/lessons.md` for known pitfalls
4. If the feature touches UI: verify against `03-design-system.md`
5. If the feature touches DB: verify against `06-database-schema.md`

### Definition of Done
A feature is done when:
- [ ] Functionality works as specced
- [ ] UI matches design system (no raw hex colors, correct spacing, all states implemented)
- [ ] Loading state exists
- [ ] Empty state exists
- [ ] Error state exists
- [ ] Mobile layout is verified at 375px
- [ ] Optimistic updates work (where applicable)
- [ ] TypeScript has zero errors (`tsc --noEmit`)
- [ ] No `any` types introduced without justification
- [ ] Convex functions have input validation (Zod schemas)
- [ ] Rate limiting applied to all mutations

### Code Organization
```
src/
  app/                   // Next.js App Router
  components/
    ui/                  // Primitive components (Button, Input, Badge, etc.)
    problems/            // Problem-specific components (ProblemCard, UpvoteButton, etc.)
    submit/              // Submit form + AI panel components
    workspace/           // Workspace-specific components
    layout/              // Shell, Sidebar, Header, etc.)
  hooks/                 // Custom React hooks
  lib/
    utils.ts             // General utilities (cn, formatDate, etc.)
    constants.ts         // App-wide constants
  types/                 // TypeScript types (extending Convex-generated)
convex/
  schema.ts
  auth.config.ts
  _lib/                  // Shared helpers (auth, rateLimit, painScore, slugs)
  problems/
  votes/
  solutions/
  comments/
  users/
  orgs/
  ai/
  search/
  notifications/
```

### Component Rules
- One component per file
- Props interface defined at top of file
- No inline styles (Tailwind only)
- No raw color values (design token classes only)
- All async data shown with loading skeleton
- All forms validated with react-hook-form + Zod
- All Convex mutations use optimistic updates where UX demands it

### Commit Convention
```
feat(scope): description
fix(scope): description
refactor(scope): description
docs(scope): description
chore(scope): description

Examples:
feat(problems): add optimistic upvote with spring animation
fix(feed): correct pain score calculation for new problems
feat(auth): add GitHub OAuth provider
```
