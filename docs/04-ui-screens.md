# UI Screens

All screen specs reference the Design System (`03-design-system.md`). All measurements in px. All colors reference CSS variables defined in the design system.

---

## Global Layout

### App Shell
```
┌──────────────────────────────────────────────────────────────────────┐
│  SIDEBAR (240px)  │  MAIN CONTENT (flex 1, max 680px)  │  RIGHT (300px) │
│  fixed, full-h    │  scrollable                        │  sticky top    │
└──────────────────────────────────────────────────────────────────────┘
```

**Sidebar** (fixed, 240px wide):
- Top: Logo mark (32px) + wordmark
- Nav items: Home, Explore, Workspaces, Notifications, Bookmarks — each 40px tall, 12px horizontal padding, icon (16px) + label, hover: bg-tertiary, active: bg-problem-dim + text-problem-500
- Middle: Workspace list (collapsible, recent 3) with org logos
- Bottom: "Post a Problem" CTA (full-width orange button, 40px), then user avatar + name + settings gear

**Right Panel** (300px, sticky top):
- Submit Problem CTA (top)
- Trending Tags widget (tag cloud with problem counts)
- Top Problem Solvers this week (avatar + name + count)
- "Being explored now" live ticker

**Mobile (< 768px):**
- Sidebar collapses to bottom tab bar (5 icons: Home, Explore, Submit, Notifications, Profile)
- Right panel hidden; content surfaced inline or via swipe-up drawer
- Submit via FAB (floating action button, 56px, bottom-right, orange, shadow-lg)

---

## Screen 1: Landing Page (Unauthenticated)

### URL: `/`

### Purpose
Convert visitors into signups. Communicate the value proposition within 5 seconds of arrival.

### Section Sequence
```
[NAV BAR]
[HERO]
[LIVE FEED PREVIEW]
[HOW IT WORKS — 3 steps]
[FOR BUILDERS]
[FOR ORGANIZATIONS]
[AI FEATURES]
[TESTIMONIALS]
[PRICING PREVIEW]
[FINAL CTA]
[FOOTER]
```

### NAV Bar
- Height: 64px, fixed top, full-width
- Background: transparent → bg-primary/80 + backdrop-blur(12px) after 20px scroll
- Border-bottom: border-subtle, appears on scroll
- Left: Logo (32×32 mark + wordmark, 16px weight 600)
- Center: Links — "How It Works" / "Explore" / "Pricing" (text-secondary, hover: text-primary, 14px)
- Right: "Sign In" (ghost button) + "Get Started →" (primary orange, 36px height)

### Hero Section
- Top padding: 160px, bottom: 80px
- Background: `radial-gradient(ellipse 80% 50% at 50% -10%, rgba(249,115,22,0.12), transparent)`
- Eyebrow badge: pill chip — "Now in Beta · Join 2,400+ builders →" — bg-problem-dim, border-problem-border, text-problem-500, 12px, animated subtle pulse
- H1 headline: 60px, weight 800, letter-spacing -0.04em, max-width 820px, centered
  - Copy: "The place where the best problems find the builders who solve them."
  - The word "problems" renders in an orange gradient: `linear-gradient(135deg, #F97316, #FBBF24)`
- Subheadline: 20px, weight 400, text-secondary, max-width 560px, centered
  - Copy: "Post real problems. Watch the community validate them. Discover what's actually worth building."
- CTA row (centered, gap-3):
  - Primary: "Start Posting Problems" — orange, 48px height, px-6
  - Secondary: "Browse Problems →" — ghost, 48px height
- Social proof: 8px below CTAs — company logos (grayscale, 20px height, opacity-40): Stripe, Vercel, Linear, Notion
- Scroll indicator: animated chevron-down, text-muted, bounces gently

### Live Feed Preview Section
- Section heading: "Problems being posted right now" — 24px, weight 600
- 3 problem cards visible in a blurred peek (desktop) / 1 card (mobile)
- Cards animate: new card slides in from top every 5 seconds (stagger), old one fades out at bottom
- Bottom mask: `linear-gradient(to bottom, transparent 60%, bg-primary)` — creates fade-out effect
- "Join to see all →" CTA centered below
- Full-width section, bg-secondary, 80px vertical padding

### How It Works
- 3 columns (desktop), vertical (mobile), 64px vertical padding
- Step 1: "Post a Problem" — icon: Edit3 (Lucide), headline, 2-line description
- Step 2: "Community Validates" — icon: TrendingUp, headline, 2-line description
- Step 3: "Builders Find It" — icon: Wrench, headline, 2-line description
- Connecting element: dashed horizontal line between steps, animated orange dot traveling L→R, 3s loop

### For Builders Section
- 2-column split: text left (50%), animated UI mockup right (50%)
- Headline: "Your next great side project is already waiting"
- Bullets: AI-powered matching / Weekly curated digests / Filter by your stack
- Mockup: mini animated problem card → builder claim animation

### For Organizations Section
- 2-column split: diagram left, text right
- Headline: "Stop guessing what to build next"
- Bullets: Private workspaces / Team voting / Roadmap integration (Linear, Jira)
- Mockup: animated workspace view

### Pricing Preview
- 3-card layout: Free / Pro ($12/mo) / Team ($49/mo/5 seats)
- Pro card: highlighted with border-problem-border and subtle orange glow
- Annual toggle (saves 20%): pill toggle above cards
- Feature comparison: 5-row table under cards

### Final CTA Section
- Dark bg with subtle radial glow
- Large heading: "The best products start with the right problems."
- Single CTA: "Start for free →" (large, 48px, orange)

### Footer
- 4-column links: Product / Community / Developers / Company
- Bottom row: copyright + legal links + social icons (GitHub, Twitter/X, LinkedIn)

---

## Screen 2: Main Feed (Authenticated)

### URL: `/`

### Header (sticky within main column)
- Height: 56px, bg-primary/90 + backdrop-blur(8px)
- Left: "Problems" — 20px, weight 600
- Right: Segmented sort control (Hot / New / Top / Rising) + Filter icon button

### Segmented Sort Control
- Pill-group style
- Active: bg-problem-dim, text-problem-500, border border-problem-border
- Inactive: text-tertiary, hover: text-secondary
- Height: 32px, px-12, radius-full

### Filter Sheet (slide-over from right, 320px)
- Overlay: bg-primary/60 backdrop-blur
- Sections: Categories (multi-checkbox) / Status (multi-checkbox) / Impact (range slider) / Author (anyone / following)
- Footer: "Apply Filters" (primary) + "Clear" (ghost)
- Closes on overlay click or Escape

### Feed List
- Virtualized via `@tanstack/virtual`
- Divider between cards: 1px border-subtle (no margin/gap)
- Skeleton: 5 cards on initial load — shimmer animation
- Infinite load: intersection observer at 80% scroll depth

### Problem Card (Feed)
```
+------------------------------------------------------------------+
|  +--------+                                                      |
|  |   ▲    |  Title of the problem statement here, clear and     |
|  |  247   |  specific enough to understand at a glance          |
|  +--------+                                                      |
|            Description preview, first two lines visible then    |
|            truncated with ellipsis at end of second line...     |
|                                                                  |
|            [Dev Tools]  [OAuth]  [Mobile]                       |
|                                                                  |
|  @username · 3h ago    ⚡ 127 me too  💬 4 sol  [● Exploring]  |
+------------------------------------------------------------------+
```
- Padding: 20px all sides
- Vote column: 64px wide, vertically centered
- Title: 17px, weight 500, text-primary, line-clamp-2
- Description: 14px, text-secondary, line-clamp-2, mt-2
- Tags: flex-wrap, gap-6, mt-10
- Footer: flex, items-center, justify-between, mt-10, text-13px text-tertiary
- Status badge: right-aligned, dot + text pill
- Hover: bg-tertiary transition 150ms — no scale transform (avoid layout jitter at list scale)
- Cursor: pointer on full card

### Vote Button (in feed card)
- Size: 48px wide × 64px tall
- Border: border-subtle, radius-md
- Default: bg-secondary, text-tertiary (triangle icon + count below)
- Hover: bg-tertiary, text-secondary, border-default
- Voted: bg-problem-dim, text-problem-500, border-problem-border
- Animation: scale 1→0.85→1.2→1 (spring, 300ms) on vote; count flips via translateY

### Empty Feed State
- Centered, 200px from top
- Geometric abstract SVG (not cartoon)
- Heading: "No problems match" — 20px, weight 600
- Sub: "Try adjusting your filters or browse all categories"
- CTA: "Clear Filters" (secondary button)

---

## Screen 3: Problem Detail Page

### URL: `/p/[slug]`

### Layout
- Left: Main content (680px max)
- Right: AI Insights sidebar (300px, sticky)
- Back link above both columns: "← Back to Feed" — text-tertiary, 13px

### Problem Header
- Title: 30px, weight 700, text-primary, full display (no truncation)
- Meta: @poster · [Category] · Posted 3h ago · [Audience badge]
- Status badge: large pill (24px height) with icon
- Action bar: [▲ Upvote 247] [❤ Me Too 127] [Share] [···]
  - All 40px height, border-default, radius-sm, gap-8
  - Voted states same as feed

### Tabs (under action bar)
- Tab bar: "Overview" / "Solutions (4)" / "Discussion (12)"
- Active tab: text-primary + bottom border 2px problem-500
- Inactive: text-tertiary, hover: text-secondary
- Tab content switches with fade-in (150ms)

### Overview Tab Content
1. **Full Description** — rich text/markdown rendered, 15px, text-secondary, line-height 26px
2. **Workarounds** (if present) — highlighted box:
   - bg-bg-tertiary, border-border-default, border-l-4 border-l-problem-500, px-16 py-12, radius-md
   - Label: "Current workarounds" — 12px, text-tertiary, uppercase, letter-spacing +0.05em
3. **Attachments** — image grid (2-col) or file list
4. **Who Has This Problem** — "127 people also experience this"
   - Avatar stack (overlap, first 8 shown), "+119 more" text after

### Solutions Tab Content
- "Add Solution" button top-right (secondary)
- Solution cards sorted by upvotes:
  - Type badge: "Existing Product" / "Proposal" / "Builder Claim"
  - Description / link
  - Author + timestamp
  - Upvote count (separate from problem upvotes)
  - "✅ Poster verified this solved it" badge (special gold treatment)
- Builder Claim card (special style):
  - Left accent: 4px border-l-blue-500
  - Progress update feed (mini timeline)

### Discussion Tab Content
- Comment composer pinned at top (40px height textarea, expands on focus)
- Threaded (2-level max)
- Each comment: Avatar + name + timestamp + body + reactions (👍 💡 ❤️) + Reply link
- Reaction count shown inline
- Unread indicator: blue dot on commenter avatar

### AI Insights Sidebar (Right, 300px)
Sticky, scrollable independently. Card-style (bg-secondary, border-default, radius-md, p-16).

**Panel 1: Problem Health**
- Circular progress ring: 0–100 clarity score
  - 0–40: red, 40–70: amber, 70–100: green
- Below ring: 4-item checklist (✅/⚠️/❌)
- Trend: "📈 Votes increasing" in small text

**Panel 2: Audience Estimate**
- Heading: "Estimated audience"
- Large number: "~2M developers" — 24px, weight 700
- Sub: "Based on category, tags, and description"

**Panel 3: Is This Solved?**
- Heading: "Similar existing solutions"
- 2–3 product matches:
  - Product name + logo + confidence % + link
  - "View 4 more →"
- If no matches: "No known solutions found" — green badge

**Panel 4: Related Problems**
- Heading: "Similar problems"
- 3 compact problem cards (title + vote count only)

---

## Screen 4: Submit Problem

### URL: `/submit`

### Layout: 2-column — Form left (58%), AI Panel right (42%)

### Progress Indicator
- 4 dots at top of form, active dot: problem-500, inactive: border-default
- Step labels: "Problem" / "Context" / "Impact" / "Publish"

### Step 1: The Problem
- Section label: "What's the problem?" — 20px, weight 600
- Title input: Large (20px, 56px height), placeholder: "Authentication silently fails on iOS Safari..."
- Character counter: right-aligned under input, text-tertiary, 0/120
- Framing alert (inline, below title): appears if title starts with "I want", "Add", "Create", "Build"
  - Amber warning box: "Try describing the pain, not the solution"
- Description textarea: 6 rows, placeholder: "Give context: who faces this, how often, what you've tried to fix it..."
- Min chars indicator: "50 characters minimum" fades out once reached

### Step 2: Context
- Workarounds textarea: 3 rows, optional, "What do you currently do instead?"
- Category: Grid of 15 category cards (icon + label), single select, selected: problem-dim bg + border
- Audience: Multi-select chip row
- Frequency: 4-button group (Daily / Weekly / Monthly / Rarely), toggle style

### Step 3: Impact
- Impact label: "How severely does this affect you?"
- 5-step slider with labeled markers:
  - 1: Minor inconvenience
  - 3: Costs me hours/week
  - 5: Critical blocker
- Attachments: Dashed-border drop zone (200px height)
  - Icon: Upload cloud + "Drop files or click to upload"
  - Supports: PNG, JPG, PDF, MP4 (Loom links)

### Step 4: Publish
- Visibility selector:
  - 3 radio cards (larger, 80px height): Public / Workspace-only / Anonymous
  - Each has icon + label + description
- Final preview of the card (full render)
- Submit button: "Post Problem →" — full-width, 48px, orange
- Fine print: "You agree to the community guidelines"

### Right Panel: AI Feedback (live)
- Heading: "Problem Health" — sticky at top
- Score ring: live updates as user types (debounced 500ms)
- Checklist: updates in real time
  - ✅ Clear problem statement
  - ✅ Context provided
  - ⚠️ Audience not specified
  - ❌ Solution-framing detected
- Duplicate check (after title, 800ms debounce):
  - Loading: "Checking for similar problems..."
  - Match found: amber panel with 2–3 similar problem cards + "Different enough, keep mine" button
  - No match: "✅ No duplicates found" (green, brief, then hides)
- Suggested tags (auto-populated): appears below checklist
- Reframe suggestion: if solution-framing detected — shows rewritten version "Try this instead: ..."

---

## Screen 5: Explore

### URL: `/explore`

### Layout: Full-width (no sidebar panels), max-width 1200px centered

### Search Bar
- Full-width, 56px height, prominent placement below page heading
- Placeholder: "Search problems by keyword, pain point, or category..."
- Left icon: Search (Lucide), right: keyboard shortcut hint "⌘K"
- On focus: subtle glow (box-shadow: 0 0 0 3px border-focus)
- Typing triggers live results dropdown (Typesense)

### Category Grid
- 4-column grid (desktop) / 2-column (tablet) / 1-column (mobile)
- Each category card (100px height):
  - Icon (24px, Lucide), category name (15px, weight 500), problem count (text-tertiary)
  - Optional: "Trending ↑" badge if volume up > 20% this week
  - Hover: bg-tertiary, border-default, icon color transitions to problem-500

### Trending Section
- Horizontal scrollable row of compact problem cards
- "Trending this week →" heading with "See all" link
- Scroll arrows visible on desktop

### Collections Section (P2)
- Grid of collection cards (2-col)
- Each: cover image/gradient + title + description + problem count + curator

### Search Results Page
- URL: `/explore/search?q=[query]`
- Same feed card format
- Sort: Relevance / Most Voted / Recent
- "Semantic match" vs "Keyword match" badge on each result
- Empty: "No problems found for '[query]'" + suggestions

---

## Screen 6: Workspace

### URL: `/w/[org-slug]`

### Workspace Header (replaces global header in this context)
- Org logo (32px) + org name + plan badge (Team/Org/Enterprise)
- Stats row: N problems · N members · N solved this month
- Action buttons: "+ Post Problem" / "Invite Members" / "⚙ Settings"

### Workspace Sidebar (left, replaces global sidebar)
- "← Public Feed" link at top
- Workspace nav sections:
  - All Problems (count)
  - My Problems
  - Assigned to Me
  - By Status (expandable)
  - By Category (expandable)
  - ─── Admin ───
  - Members
  - Integrations
  - Settings

### Workspace Feed
- Same card format + workspace-specific additions:
  - Assignee avatar (top-right of card)
  - Internal priority (P1/P2/P3) badge
  - Sprint/milestone tag

### Workspace Analytics (`/w/[org]/analytics`) — P2
```
[METRICS ROW: Total Problems · Open · Solved · Avg Time to Solve]
[PROBLEM VOLUME — Line chart, 90-day view]
[STATUS FUNNEL — Horizontal bar chart]
[TOP CATEGORIES — Treemap]
[TOP CONTRIBUTORS — Ranked table]
```

---

## Screen 7: User Profile

### URL: `/u/[username]`

### Layout: Single column, max-width 720px, centered

### Profile Header
- Avatar: 64px, radius-full
- Name: 24px, weight 700
- Username: @handle, text-tertiary, 14px
- Bio: 15px, text-secondary
- Role/org badge
- Stats: [N problems] · [N solutions] · [N me-too's given] · [Member since]
- Actions: "Follow" button (if not own profile) / "Edit Profile" (if own)
- Reputation: badge showing level (Newcomer / Contributor / Expert / Legend)

### Profile Tabs
- Posted Problems (default)
- Solutions Given
- Activity
- Saved (private, own profile only)

---

## Screen 8: Notifications

### URL: `/notifications`

### Layout: Single column, max-width 680px

### Notification Groups
- Grouped by day: "Today" / "Yesterday" / "This Week"
- "Mark all read" at top-right

### Notification Item
- Height: 64px min
- Left: 40px icon circle (type color: orange/blue/purple/green)
- Middle: description with linked entities
- Right: relative time + unread dot
- Unread: left border 2px problem-500, bg-secondary
- Read: no border, bg-primary
- Hover: bg-tertiary

---

## Shared Components Reference

| Component | Variants | Used In |
|-----------|---------|---------|
| `ProblemCard` | full, compact | Feed, Explore, Search, Sidebar |
| `UpvoteButton` | vertical, horizontal, icon | Feed card, Detail page, Compact |
| `StatusBadge` | dot, pill, large | All problem views |
| `UserAvatar` | sm(24), md(32), lg(48), xl(64) | All |
| `TagChip` | clickable, static | Problem cards, Detail, Explore |
| `AiInsightPanel` | submit-mode, detail-mode | Submit, Detail |
| `CommentThread` | — | Detail page |
| `Modal` | — | All overlays |
| `Toast` | success, error, info, warning | All |
| `CommandPalette` | — | Global (⌘K) — P2 |
| `SkeletonCard` | — | Loading states |
| `EmptyState` | — | Empty feed, empty workspace |

---

## Responsive Breakpoints

| Breakpoint | px | Layout change |
|-----------|-----|--------------|
| `sm` | 640px | Mobile-first baseline |
| `md` | 768px | Show sidebar, hide FAB |
| `lg` | 1024px | Show right panel |
| `xl` | 1280px | Max content width reached |
| `2xl` | 1536px | Extra padding, no layout change |
