# Tasks

## Current Status
**Phase:** Phase 1 — Foundation MVP
**Session:** Implementation complete — awaiting Convex project init + env setup

---

## Phase 1 Checklist

### Infrastructure Setup
- [x] Initialize Next.js 15.3.3 project (manually scaffolded — npm naming restrictions)
- [x] Install all dependencies (convex, @convex-dev/auth, framer-motion, lucide-react, zod, etc.)
- [x] Configure Tailwind 3 with full design token system from doc 03
- [x] Configure next.config.ts (ppr, reactCompiler, image domains)
- [x] Inter variable font + global CSS
- [ ] Connect Convex project (`npx convex dev` — user must run this)
- [ ] Configure OAuth providers (Google + GitHub) — user must set up
- [ ] Set up environment variables (see `.env.local.example`)
- [ ] Cloudflare R2, Resend, Upstash Redis — Phase 1 deferred (not blocking MVP)

### Core Convex Functions ✅
- [x] `convex/schema.ts` — Full 13-table schema
- [x] `convex/auth.config.ts`
- [x] `convex/_lib/auth.ts` — requireAuth, requireWorkspaceMembership
- [x] `convex/_lib/rateLimit.ts` — DB-backed sliding window
- [x] `convex/_lib/painScore.ts` — Pain score algorithm
- [x] `convex/_lib/slugs.ts` — Slug + username generation
- [x] `convex/_lib/validation.ts` — Zod schemas for all mutations
- [x] `convex/problems/mutations.ts` — createProblem, updateProblem, updateStatus, deleteProblem
- [x] `convex/problems/queries.ts` — get, list (hot/new/top), trending, search, listByUser
- [x] `convex/votes/mutations.ts` — toggleVote
- [x] `convex/votes/queries.ts` — getUserVoteStatus, getVoteCounts
- [x] `convex/comments/mutations.ts` — createComment, deleteComment, reactToComment
- [x] `convex/comments/queries.ts` — listThreaded (2-level)
- [x] `convex/users/mutations.ts` — updateProfile, createUserFromAuth
- [x] `convex/users/queries.ts` — getCurrentUser, getByUsername, getById
- [x] `convex/notifications/queries.ts` — list, getUnreadCount
- [x] `convex/notifications/mutations.ts` — markRead, markAllRead
- [x] `convex/ai/actions.ts` — autoTagProblem (internal)
- [x] `convex/ai/mutations.ts` — storeSuggestedTags, storeClarityScore
- [x] `convex/ai/scheduled.ts` — analyzeNewProblem (internal)

### UI Components ✅
- [x] Button (primary/secondary/ghost/destructive + asChild)
- [x] Input, Textarea (with error + char count)
- [x] Badge, StatusBadge (5 statuses)
- [x] TagChip, TagInput (multi-tag with autocomplete)
- [x] UserAvatar (xs/sm/md/lg/xl + fallback initials)
- [x] Toast / Toaster (4 variants + auto-dismiss)
- [x] Modal (spring animation + overlay)
- [x] SkeletonCard, Spinner
- [x] AppShell, Sidebar, RightPanel

### Feature Components ✅
- [x] UpvoteButton (vertical + horizontal, spring animation)
- [x] ProblemCard (full + compact), EmptyFeed
- [x] CommentThread (threaded 2-level, reactions, reply)
- [x] ConvexClientProvider

### Pages ✅
- [x] Root layout (ConvexAuth providers + Inter font + Toaster)
- [x] App layout (AppShell wrapper)
- [x] Main feed `/` (sort tabs, skeleton, ProblemCard list)
- [x] Problem detail `/p/[slug]` (SSR + skeleton)
- [x] Submit wizard `/submit` (4-step)
- [x] Explore `/explore` (search + category filter)
- [x] User profile `/u/[username]`
- [x] Notifications `/notifications`
- [x] Auth: sign-in, sign-up
- [x] Landing page `/` (marketing, all sections)

### Phase 1 AI ✅
- [x] `/api/ai/clarity` — Edge function, streamObject (Gemini 1.5 Flash)
- [x] `/api/ai/framing` — Rule-based + AI fallback
- [x] `AiInsightPanel` — Real-time streaming clarity display
- [x] `FramingWarning` — Inline warning component
- [x] Background auto-tagging Convex action

---

## Next Steps (to make it run)
1. Copy `.env.local.example` to `.env.local` and fill in values
2. Run `npx convex dev` — creates project + generates `convex/_generated/`
3. Configure OAuth apps (Google + GitHub), set redirect URLs
4. Run `npm run dev` and test

---

## Known Gaps (Phase 2+)
- Comment reactions emoji picker (placeholder button in CommentThread)
- User profile problems tab (pagination)
- Solution submission UI
- Virtualized feed (@tanstack/react-virtual) — currently simple map
- Mobile bottom tab bar (currently sidebar only)
- Resend email templates
- Cloudflare R2 avatar uploads
- Stripe billing integration
- Typesense search sync

---

## Completed Sessions
- Session 1: Full Phase 1 implementation (Stages 1–10). 0 frontend TS errors. All 10 stages complete.
