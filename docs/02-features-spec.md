# Features Specification

Every feature is tagged with priority:
- `[MVP]` — Required for initial launch
- `[P2]` — Phase 2 (post-launch iteration)
- `[P3]` — Phase 3 (scale features)

---

## 1. Problem Submission

### 1.1 Problem Form `[MVP]`
**Fields:**
- `title` — Required. Max 120 chars. Must be a problem statement, not a solution. AI validates framing.
- `description` — Required. Min 50 chars. Context, who faces it, how often, what's tried.
- `workarounds` — Optional. What do you do now? Gold signal for pain depth.
- `category` — Required. Single selection from taxonomy (see below).
- `tags` — Optional. Up to 5. Auto-suggested by AI.
- `audience` — Required. Who experiences this? (Developers / Designers / PMs / Everyone / Specific role)
- `frequency` — Required. How often? (Daily / Weekly / Monthly / Occasionally)
- `impact` — Required. Slider 1–5. How severely does this affect you?
- `attachments` — Optional. Screenshots, Loom links, diagrams. Max 5 files, 10MB each.
- `visibility` — Required. Public / Workspace-only / Anonymous (hides poster identity)

**Validation Rules:**
- Title cannot start with "I want", "Add", "Build", "Create" — these indicate solution framing
- AI clarity score must be shown before submission (non-blocking but visible)
- Duplicate detection fires after title is entered (debounced 800ms)

**Acceptance Criteria:**
- Form saves draft automatically every 30 seconds
- User can preview exactly how their card will look before posting
- Submission completes in < 500ms perceived (optimistic UI)
- AI clarity score appears within 2 seconds of description being complete

---

### 1.2 AI-Assisted Submission `[MVP]`
Real-time AI feedback panel visible during submission:

1. **Clarity Score** (0–100): Rates how well-defined the problem is
2. **Framing Check**: Flags if the submission sounds like a solution request
3. **Suggested Tags**: Auto-categorizes based on description
4. **Duplicate Alert**: Shows similar existing problems
5. **"Is this solved?" Check**: Surfaces known existing solutions instantly

---

### 1.3 Problem Categories (Taxonomy) `[MVP]`
```
Developer Tools
Productivity & Workflow  
Communication & Collaboration
Data & Analytics
Design & Creative
Healthcare & Wellness
Finance & Payments
Education & Learning
Sales & Marketing
HR & People Ops
Infrastructure & DevOps
Security & Privacy
E-commerce & Retail
Transportation & Logistics
Other
```

---

## 2. Voting & Signal System

### 2.1 Upvote `[MVP]`
- Single upvote per user per problem
- Clicking again removes the vote (toggle)
- Upvote triggers micro-animation (spring bounce, orange fill)
- Count updates optimistically (Convex real-time)

### 2.2 "Me Too" Signal `[MVP]`
Explicitly different from upvote. Means: **"I personally experience this exact problem."**
- Heavier weight in ranking algorithm than a plain upvote
- Requires user to have a verified account (prevents gaming)
- Shows avatars of recent "me too" voters on problem detail page

### 2.3 Impact Rating `[MVP]`
When casting "Me Too", user rates impact 1–5:
- 1: Minor inconvenience
- 2: Slows me down
- 3: Significant time/money cost
- 4: Blocks my work regularly
- 5: Critical blocker / causing real harm

### 2.4 Pain Score Algorithm `[MVP]`
```
pain_score = (
  (upvotes × 1.0) +
  (me_too_count × 2.5) +
  (avg_impact_rating × me_too_count × 0.8) +
  (comment_count × 0.3) +
  recency_decay_factor
) × verified_poster_multiplier
```

### 2.5 Ranking Algorithms `[MVP]`
- **Hot**: Pain score with time decay (HN-style)
- **Top**: All-time pain score
- **New**: Chronological
- **Rising**: Fastest velocity in the last 6 hours

---

## 3. Problem Status Lifecycle

### 3.1 Status States `[MVP]`
```
Open → Being Explored → Solution Proposed → Solution Exists → Validated Solved
```

| Status | Color | Who Sets It | Meaning |
|--------|-------|------------|---------|
| Open | Orange | Auto | No solution in sight |
| Being Explored | Blue | Builder or Poster | Someone is actively working on this |
| Solution Proposed | Purple | Anyone | A potential solution exists |
| Solution Exists | Teal | Poster-verified | A product/service addresses this |
| Validated Solved | Green | Original poster | The poster confirmed it solved their problem |

### 3.2 Status Transitions `[MVP]`
- Only the original poster OR an admin can move to "Validated Solved"
- "Being Explored" can be claimed by any user who marks themselves as a builder
- Community can vote on whether a proposed solution actually solves the problem

---

## 4. Solution Layer

### 4.1 Solution Types `[MVP]`
- **Existing Product**: Link to an existing tool/product that addresses this
- **Proposal**: Text description of a potential solution approach
- **Builder Claim**: "I'm building this" — creates accountability and allows followers to track

### 4.2 Builder Claim `[MVP]`
When a user claims they're building a solution:
- They provide: brief description, estimated timeline, whether open-source
- They get: a "Builder" badge on the problem, follower notifications
- Optional: GitHub repo link, landing page link
- Community can: follow updates, comment, offer help

### 4.3 Solution Verification `[MVP]`
- Original poster can mark a solution as "This solved it for me"
- Community can upvote/downvote proposed solutions independently
- Solutions with 5+ upvotes surface to the top

---

## 5. Discovery & Feed

### 5.1 Main Feed `[MVP]`
- Infinite scroll (virtualized list for performance)
- Sort by: Hot / New / Top / Rising
- Filter by: Category, Status, Audience, Impact level, Date range
- "For You" personalized tab based on voting history and followed tags

### 5.2 Search `[MVP]`
- Full-text search across titles and descriptions
- Semantic search (via embeddings) — finds related problems even with different wording
- Search within specific categories
- Search results ranked by relevance + pain score

### 5.3 Tag-Based Browsing `[MVP]`
- Clickable tags on every card
- Tag pages with own feed and follow button
- Subscribe to tag feeds → email digest

### 5.4 Collections `[P2]`
- Users can curate collections of related problems
- Collections can be private or public
- "Best of" collections featured on homepage

### 5.5 Trending Topics `[MVP]`
- Sidebar widget showing fastest-rising tags
- "Problems in [tag] are up 40% this week" signals

---

## 6. Problem Detail Page

### 6.1 Core Content `[MVP]`
- Full description with rich text rendering
- Original poster info + credibility score
- Vote counts and status
- Tag list
- Timestamps (posted, last activity)
- "Who has this problem" — avatar stack of me-too voters

### 6.2 AI Insights Panel `[MVP]`
Right sidebar on problem detail:
- Clarity score with breakdown
- Similar existing problems
- "Is this already solved?" — AI-found products
- Estimated audience size
- Problem health trends (votes over time mini-chart)

### 6.3 Solutions Section `[MVP]`
- List of all proposed/existing solutions
- Builder claims (with status updates)
- Solution upvoting
- "Original poster says this solved it" badge

### 6.4 Discussion Thread `[MVP]`
- Threaded comments (2 levels max for clarity)
- Markdown support
- Reactions (👍 💡 ❤️ only — no rage reactions, keep it constructive)
- Comment voting

### 6.5 Status Timeline `[MVP]`
Visual timeline showing problem progression from Open → Solved

### 6.6 Related Problems `[MVP]`
AI-powered "problems similar to this" section (3–5 items)

---

## 7. User Profiles

### 7.1 Profile Page `[MVP]`
- Avatar, name, bio, role/org
- Problem reputation score
- Problems posted (with their current status)
- Solutions contributed
- Comments made
- Tags followed
- Joined date, activity streak

### 7.2 Reputation System `[P2]`
Points awarded for:
- Problem posted that gets ≥10 votes: +10 points
- Problem reaches "Solved": +25 points
- Solution adopted by poster: +30 points
- Consistently posting high-quality problems (high clarity scores): bonus

Reputation levels: Newcomer → Contributor → Problem Finder → Expert → Legend

### 7.3 Builder Profile Badge `[P2]`
Special badge for users who have actively built solutions to problems on the platform.

---

## 8. Organizations & Workspaces

### 8.1 Workspace Creation `[MVP]`
- Create org with name, logo, description
- Set workspace to Private / Public / Mixed
- Invite members via email
- Define roles: Admin / Member / Viewer

### 8.2 Private Problem Boards `[MVP]`
All standard problem features, but:
- Only visible to workspace members
- Problems can be "promoted" to public (one-way, requires admin)
- Public problems can be "imported" into workspace for tracking

### 8.3 Role-Based Access Control `[MVP]`
| Role | Post Problems | Vote | Comment | Manage Members | Billing |
|------|--------------|------|---------|---------------|---------|
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| Member | ✅ | ✅ | ✅ | ❌ | ❌ |
| Viewer | ❌ | ✅ | ❌ | ❌ | ❌ |

### 8.4 Workspace Analytics `[P2]`
- Problem category breakdown (where is friction concentrated?)
- Trend analysis: problem volume over time
- Status funnel: how many problems reach solved?
- Most active members
- Top pain areas by department

### 8.5 Integrations `[P2]`
- **Linear**: Export problem as issue → auto-link status
- **Jira**: Export problem as ticket → sync status updates
- **Notion**: Export problems to a Notion database
- **Slack**: Post new problems to a channel, get status update notifications

### 8.6 Problem Assignment `[P2]`
Within workspaces, problems can be:
- Assigned to a specific team member
- Tagged with a sprint/milestone
- Given an internal priority (different from community pain score)

---

## 9. Notifications

### 9.1 In-App Notifications `[MVP]`
- Someone voted on your problem
- Someone said "Me Too" to your problem
- Your problem status changed
- Someone proposed a solution to your problem
- Someone replied to your comment
- A problem you follow has new activity

### 9.2 Email Notifications `[MVP]`
- Digest frequency: real-time / daily / weekly / never
- Weekly "Problems in [followed tags]" digest
- "Your problem has 100 votes" milestone emails
- Builder claims on your problem

### 9.3 AI Weekly Digest `[P2]`
Personalized email based on:
- Your voting history
- Your tags/categories
- Problems in your followed spaces
- Top 5 unsolved problems in your stack this week
- "Someone is building a solution to a problem you upvoted"

---

## 10. AI Features (Full Spec in doc 07)

### MVP AI Features
- Clarity scoring during submission
- Framing validation (problem vs solution)
- Auto-tagging
- Duplicate detection
- "Is this solved?" check
- Semantic search

### P2 AI Features
- Problem decomposition
- Market size estimation
- PRD generation from well-defined problems
- Builder matching
- Trend detection and reporting
- Workspace analytics summaries

### P3 AI Features
- Problem graph (relationships between problems)
- Predictive problem emergence (what problems are coming?)
- AI-powered solution quality scoring

---

## 11. Auth & Access

### 11.1 Authentication `[MVP]`
- Email + password (via @convex-dev/auth)
- Google OAuth (required — community products live or die by OAuth friction)
- GitHub OAuth (critical for developer audience)
- LinkedIn OAuth (for professional/org context)

### 11.2 Anonymous Posting `[MVP]`
- Authenticated users can post anonymously
- Identity hidden from public view
- Platform retains identity internally (for moderation)
- Anonymous posts still require a verified account

### 11.3 Enterprise SSO `[P3]`
- SAML 2.0 support for enterprise orgs
- SCIM provisioning for user management

---

## 12. Moderation

### 12.1 Community Moderation `[MVP]`
- Flag problem/comment for review
- 3 flags = auto-hidden pending review
- Mod queue for admins

### 12.2 Content Rules `[MVP]`
- Problems must be stated as problems (AI + human enforcement)
- No spam, no promotional content
- No personal information in problem descriptions
- No problems designed to promote a specific product

### 12.3 Quality Scoring `[P2]`
Problems below a quality threshold (clarity score < 30 + < 3 votes in 48h) are moved to "low signal" queue, not deleted.
