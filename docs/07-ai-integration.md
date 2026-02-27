# AI Integration

## Philosophy

AI in ProblemHunt is a **quality amplifier**, not a gimmick. Every AI feature must:
1. Make the human output better (not replace human judgment)
2. Fail gracefully (never block core user flows)
3. Be fast enough to feel real-time (< 800ms for streaming, < 2s for batch)
4. Be cost-aware (use the cheapest model that meets quality bar)

---

## Feature Map

| Feature | When | Model | Sync/Async | User-Visible |
|---------|------|-------|-----------|-------------|
| Clarity scoring | During submission | Gemini 1.5 Flash | Streaming | ✅ Live panel |
| Framing validation | During submission | Gemini 1.5 Flash | Streaming | ✅ Inline warning |
| Auto-tagging | During submission | Gemini 1.5 Flash | Async (background) | ✅ Suggested tags |
| Duplicate detection | Title entered | text-embedding-004 | Async (< 1s) | ✅ Alert panel |
| "Is this solved?" | After submission | Gemini 1.5 Pro | Async (background) | ✅ Sidebar panel |
| Problem embeddings | After submission | text-embedding-004 | Background | ❌ Infrastructure |
| Typesense sync | After submission | — | Background | ❌ Infrastructure |
| PRD generation | On-demand (user) | Gemini 1.5 Pro | Streaming | ✅ Modal |
| Builder matching | Background | Claude Haiku | Background | ✅ Email / notif |
| Weekly digest | Scheduled | Gemini 1.5 Flash | Scheduled | ✅ Email |
| Workspace analytics | On-demand | Gemini 1.5 Flash | Async | ✅ Analytics page |
| Problem decomposition | On-demand | Gemini 1.5 Pro | Streaming | ✅ Sidebar |

---

## Feature Specifications

### 1. Clarity Scoring (Real-time, Streaming)

**Trigger:** User types in the description field (debounced 500ms, min 50 chars)

**Output:**
```typescript
interface ClarityResult {
  score: number;  // 0–100
  checks: {
    hasClearProblemStatement: boolean;
    hasContext: boolean;
    hasAudienceInfo: boolean;
    hasFrequencyInfo: boolean;
    isNotSolutionFraming: boolean;
    isSpecificEnough: boolean;
  };
  suggestions: string[];  // actionable improvement tips, max 3
}
```

**Prompt:**
```
You are evaluating a problem statement for a community platform where builders discover what to build next.

Score this submission from 0–100 for problem clarity. Evaluate each criterion:

1. hasClearProblemStatement: Is the core problem stated clearly and specifically?
2. hasContext: Does it explain who faces this problem and under what circumstances?
3. hasAudienceInfo: Is the affected audience identifiable?
4. hasFrequencyInfo: Is there any indication of how often this occurs?
5. isNotSolutionFraming: Is it framed as a problem, NOT as a feature request or solution?
6. isSpecificEnough: Is it specific enough that a builder could understand what to build?

Also provide up to 3 specific, actionable suggestions to improve the submission.

Problem title: {title}
Problem description: {description}

Respond with valid JSON matching the ClarityResult schema.
```

**Implementation:**
```typescript
// app/api/ai/clarity/route.ts
import { streamObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

const claritySchema = z.object({
  score: z.number().min(0).max(100),
  checks: z.object({
    hasClearProblemStatement: z.boolean(),
    hasContext: z.boolean(),
    hasAudienceInfo: z.boolean(),
    hasFrequencyInfo: z.boolean(),
    isNotSolutionFraming: z.boolean(),
    isSpecificEnough: z.boolean(),
  }),
  suggestions: z.array(z.string()).max(3),
});

export async function POST(req: Request) {
  const { title, description } = await req.json();

  const result = streamObject({
    model: google('gemini-1.5-flash-latest'),
    schema: claritySchema,
    prompt: buildClarityPrompt(title, description),
    temperature: 0.1,  // Low temperature: consistent evaluations
  });

  return result.toTextStreamResponse();
}
```

**Client usage:**
```typescript
// components/submit/AiPanel.tsx
import { experimental_useObject as useObject } from 'ai/react';

const { object: clarity, isLoading } = useObject({
  api: '/api/ai/clarity',
  schema: claritySchema,
});

// clarity.score updates incrementally as tokens stream in
// clarity.checks.hasClearProblemStatement becomes true/false as each check resolves
```

---

### 2. Framing Validation (Inline Warning)

**Trigger:** Title field (debounced 400ms)

**Logic:** Rule-based first (fast, no API call), AI second for ambiguous cases.

**Rule-based check (no API):**
```typescript
const SOLUTION_FRAMING_PREFIXES = [
  /^i want/i, /^add /i, /^build /i, /^create /i, /^make /i,
  /^implement /i, /^develop /i, /^we need/i,
];

export function checkSolutionFraming(title: string): boolean {
  return SOLUTION_FRAMING_PREFIXES.some(r => r.test(title.trim()));
}
```

**AI check (for ambiguous cases):**
If rule-based returns false but description is present, run a lightweight binary classifier:
```
Is this a problem statement or a solution/feature request?
Title: {title}
Description: {description}
Answer with JSON: { "isSolutionFraming": boolean, "explanation": string }
```

Model: Gemini 1.5 Flash. Max 200ms. Cached by input hash.

---

### 3. Duplicate Detection (Embedding-based)

**Trigger:** Title field (debounced 800ms, min 10 chars)

**Flow:**
```
1. Generate embedding for current title (Gemini text-embedding-004)
2. Vector search in Convex embeddings table (cosine similarity)
3. Filter: similarity > 0.82 threshold
4. Return top 3 matches with similarity scores
5. Show in AI panel: "Similar problems already exist"
```

**Implementation:**
```typescript
// convex/ai/actions.ts
export const detectDuplicates = action({
  args: { title: v.string(), description: v.optional(v.string()) },
  handler: async (ctx, { title, description }) => {
    const input = description ? `${title}\n\n${description}` : title;

    // Generate embedding via Gemini
    const embedding = await generateEmbedding(input);

    // Vector search in Convex
    const results = await ctx.vectorSearch('embeddings', 'by_vector', {
      vector: embedding,
      limit: 5,
    });

    // Filter by similarity threshold
    const duplicates = results
      .filter(r => r._score > 0.82)
      .slice(0, 3);

    // Fetch problem details for matches
    const problems = await Promise.all(
      duplicates.map(d => ctx.db.get(d.problemId))
    );

    return problems.filter(Boolean).map((p, i) => ({
      ...p,
      similarity: duplicates[i]._score,
    }));
  },
});
```

**Similarity thresholds:**
- > 0.92: Very likely duplicate → "This problem may already exist"
- 0.82–0.92: Related → "Similar problems exist — review before posting"
- < 0.82: Different enough → no alert shown

---

### 4. Auto-Tagging

**Trigger:** Background, after submission (async)

**Output:** Array of 3–5 relevant tags from existing taxonomy + new tag suggestions

**Prompt:**
```
Given this problem submission, suggest 3–5 relevant tags from the provided taxonomy.
Also suggest up to 2 new tags if none of the taxonomy tags fit well.

Problem: {title}\n{description}

Taxonomy: {comma-separated list of existing tags}

Respond with JSON: {
  "existingTags": string[],
  "newTagSuggestions": string[]
}
```

**Post-processing:** Suggested tags shown in AI panel. User can accept (one-click) or ignore.

---

### 5. "Is This Solved?" Check

**Trigger:** Background, 5–30 seconds after problem submission

**Goal:** Find existing products/tools that may already address this problem

**Flow:**
```
1. Convex scheduled action fires 10 seconds after createProblem
2. Build a search query from title + description (Gemini Flash, quick extraction)
3. Use Gemini 1.5 Pro with Google Search grounding to find matching products
4. Score each match (0–100 relevance)
5. Store results in aiAnalyses table
6. Update problem detail sidebar in real-time (Convex subscription)
```

**Prompt:**
```
A user has posted this problem to a developer community platform:

Title: {title}
Description: {description}

Search for existing products, services, tools, or open-source projects that
may already solve this problem. For each solution found, provide:
- Product name
- Brief description (1 sentence)
- URL
- Relevance score (0–100)
- Confidence: "strong" | "partial" | "weak"

Focus on direct solutions. Do not suggest generic tools. Maximum 5 results.

Respond with JSON: { "solutions": SolutionMatch[] }
```

**Model:** Gemini 1.5 Pro with `tools: [{ googleSearch: {} }]` grounding enabled.

---

### 6. PRD Generation (On-Demand, Streaming)

**Trigger:** User clicks "Generate PRD" on a well-defined problem (clarity score ≥ 70)

**Output:** Streamed markdown document

**PRD Template:**
```
## Problem Statement
## Target Audience
## Problem Depth
  - Frequency
  - Severity
  - Current Workarounds
## Proposed Solution Scope
## Success Metrics
## Out of Scope
## Open Questions
## References
```

**Prompt:**
```
You are a senior product manager at a top-tier technology company.
Generate a concise, actionable Product Requirements Document for this problem.

Problem: {title}
Description: {description}
Workarounds: {workarounds}
Audience: {audience}
Frequency: {frequency}
Impact: {impactRating}/5
Community validation: {voteCount} upvotes, {meTooCount} people experience this

Write a focused, realistic PRD. Do not invent features. Stay grounded in the problem.
Use clear, precise language. Target audience: engineers and PMs who will build this.
Format in markdown.
```

**Implementation:** `streamText()` via Vercel AI SDK → renders incrementally in modal with typewriter effect.

---

### 7. Builder Matching (Background)

**Trigger:** Scheduled weekly + on new high-traction problems (> 50 votes in 24h)

**Flow:**
```
1. Pull top 20 unsolved problems (by pain score)
2. For each active builder (users who follow builder-relevant tags):
   a. Get their activity profile (voted categories, posted problems, followed tags)
   b. Embed their profile
   c. Cosine similarity vs. each problem
   d. Generate personalized "Your match" list (top 3)
3. Send digest email with personalized problem recommendations
```

---

### 8. Weekly Digest Generation

**Trigger:** Scheduled every Monday 8am UTC

**Per-user digest:**
```
1. Get user's followed tags + voting history
2. Query top new problems from last 7 days in those tags
3. Gemini Flash: write a personalized 3-sentence intro
4. Include top 5 problems + status updates on followed problems
5. Send via Resend with React Email template
```

**Cost optimization:** Run in batches of 100 users; use Gemini Flash (not Pro); cache category summaries for 24h.

---

## Cost Management

### Estimated costs per feature (per 1K events):

| Feature | Model | Tokens/call | Cost/1K calls |
|---------|-------|------------|--------------|
| Clarity score | Flash | ~800 | ~$0.02 |
| Framing check | Flash | ~200 | ~$0.005 |
| Duplicate detect | Embedding | ~300 | ~$0.001 |
| Is solved? | Pro | ~2000 | ~$0.30 |
| Auto-tagging | Flash | ~500 | ~$0.012 |
| PRD generation | Pro | ~3000 | ~$0.45 |
| Weekly digest (per user) | Flash | ~600 | ~$0.015 |

### Cost controls:
1. Rate limit AI features per user tier (Free: limited PRD generations)
2. Cache aggressively (see TTL policy in architecture doc)
3. Batch background jobs (don't run per-event when possible)
4. Use Flash for all classification tasks; only use Pro for generative tasks
5. Monitor spend in PostHog → alert if AI cost > $X/day

---

## Error Handling

```typescript
// convex/_lib/aiSafe.ts
export async function runAiSafe<T>(
  fn: () => Promise<T>,
  fallback: T,
  context: string,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    // Log to PostHog for monitoring
    console.error(`AI feature failed [${context}]:`, error);
    // Return fallback — never throw to caller
    return fallback;
  }
}

// Usage:
const clarityResult = await runAiSafe(
  () => computeClarityScore(title, description),
  null,  // fallback: hide panel
  'clarity_score',
);
```

**Fallback behaviors:**
- Clarity score unavailable → hide AI panel, show "Analysis unavailable" in muted text
- Duplicate detection fails → no duplicate warning shown (safe failure)
- "Is solved?" fails → sidebar section shows empty state, not error
- PRD generation fails → modal shows error with retry button (user-triggered, user-visible)
- Auto-tagging fails → no tags suggested, user chooses manually
- Builder matching fails → no email sent that run, retried next scheduled run

---

## Prompt Engineering Standards

All prompts must:
1. State the model's persona explicitly ("You are a senior PM...")
2. Define the output format exactly (JSON schema or markdown structure)
3. Include example output for complex schemas
4. Use low temperature (0.1–0.2) for structured/evaluative tasks
5. Use higher temperature (0.7) only for creative/generative tasks (PRD, digest)
6. Be stored as named constants (never inline prompt strings in component code)
7. Be versioned — include prompt version in aiAnalyses cache key

All prompts live in: `convex/ai/prompts.ts`
