# Agent Workflow Rules

**Every coding agent working on this project must read this document before writing a single line of code.**

This is not optional. These rules exist because they prevent the most common failure modes. Follow them precisely.

---

## The Prime Directives

1. **Plan before you code** — for any task with 3+ steps or an architectural decision, write a plan first
2. **Verify before you mark done** — never mark a task complete without proving it works
3. **Capture lessons** — after any correction, update `tasks/lessons.md` with a rule that prevents it from happening again
4. **Design is non-negotiable** — every UI component must match `docs/03-design-system.md` exactly
5. **Read the docs** — the files in `/docs` are the source of truth. Read them. Don't guess.

---

## Workflow: Step by Step

### Step 1: Orient
Before touching code:
1. Read `tasks/lessons.md` — know the known pitfalls
2. Read `tasks/todo.md` — know the current task context
3. Read the relevant feature spec from `docs/02-features-spec.md`
4. If touching UI: read `docs/03-design-system.md`
5. If touching DB: read `docs/06-database-schema.md`
6. If touching AI: read `docs/07-ai-integration.md`

### Step 2: Plan
For any non-trivial task (3+ steps OR architectural decision):
1. Write your plan to `tasks/todo.md` with checkable items
2. State the approach explicitly — don't just list what files you'll change
3. Identify risks and edge cases upfront
4. If something is unclear, ask before proceeding

For simple tasks (1–2 obvious steps): skip the formal plan, but still check lessons.

### Step 3: Execute
As you work:
- Mark tasks `in_progress` before starting each item
- Commit to the plan — if something goes sideways, STOP and re-plan. Don't keep pushing.
- Make minimal changes — touch only what the task requires
- Use the design token classes from Tailwind config — never raw hex or arbitrary values
- Run TypeScript check frequently: `tsc --noEmit`

### Step 4: Verify
Before marking anything complete:
- Does it actually work? (not just "the code looks right")
- Does the UI match the design system at mobile (375px) AND desktop?
- Are all three states present: loading / empty / error?
- Do optimistic updates roll back correctly on failure?
- Is TypeScript clean? `tsc --noEmit` passes?
- Run relevant tests if they exist

Ask yourself: **"Would a staff engineer at Linear approve this?"**

### Step 5: Document
After completing any significant feature:
1. Mark `tasks/todo.md` items complete
2. Add a brief "what was done" note
3. If you made any mistakes along the way: update `tasks/lessons.md`

---

## Plan Mode Rules

**Enter plan mode for ANY of these conditions:**
- Task has 3+ distinct steps
- Task requires an architectural decision
- Task touches 3+ files
- Task changes data models or API contracts
- You're unsure of the right approach
- The current approach isn't working

**While in plan mode:**
- Use Grep, Glob, Read tools to explore the codebase
- Write your findings to `tasks/todo.md` before forming the plan
- Present approach options with tradeoffs before committing
- Get confirmation before starting implementation

**If something goes sideways mid-task:**
- STOP. Do not keep pushing.
- Re-enter plan mode. Understand what went wrong.
- Update the plan.
- Resume implementation with the corrected approach.

---

## Subagent Strategy

Use subagents liberally to keep the main context window focused:
- Research tasks → subagent (don't pollute main context with file reads)
- Parallel independent work → parallel subagents
- Complex analysis → subagent with focused prompt
- One focused goal per subagent

**When to use subagents:**
- Exploring the codebase to understand a pattern
- Running tests and collecting results
- Writing large documentation files
- Parallel implementation of independent features

**When NOT to use subagents:**
- Simple 1-file edits
- When you need results to inform the next step (sequential dependency)

---

## Self-Improvement Loop

After **any correction from the user**:
1. Identify the exact mistake made
2. Formulate a rule that would have prevented it
3. Add it to `tasks/lessons.md` under the appropriate category
4. Apply the rule immediately for the rest of the session

Format in `tasks/lessons.md`:
```
## [Category]
- RULE: [specific rule]
  MISTAKE: [what went wrong]
  FIX: [what to do instead]
```

Review `tasks/lessons.md` at the start of every session. These are your standing orders.

---

## Code Quality Standards

### TypeScript
- Strict mode always on (`"strict": true` in tsconfig)
- Zero `any` types without explicit justification and `// TODO: type this`
- All Convex function args validated with Zod schemas
- Enriched types for UI live in `src/types/domain.ts`
- Generated Convex types in `convex/_generated/` — never modify

### Component Standards
```typescript
// CORRECT — explicit, typed, documented via naming
interface ProblemCardProps {
  problem: ProblemWithMeta;
  variant?: 'full' | 'compact';
  onVote?: (problemId: Id<'problems'>) => void;
}

export function ProblemCard({ problem, variant = 'full', onVote }: ProblemCardProps) {
  // ...
}

// WRONG — implicit, untyped, default export
export default function Card({ data, cb }: any) {
  // ...
}
```

### Styling Standards
```tsx
// CORRECT — design tokens, Tailwind classes, cn() utility
<button className={cn(
  'h-10 px-4 rounded-sm text-sm font-medium transition-colors duration-150',
  'bg-problem-500 text-white hover:bg-problem-600 active:bg-problem-700',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
  disabled && 'opacity-50 cursor-not-allowed',
)}>

// WRONG — raw colors, arbitrary values, inline style
<button style={{ backgroundColor: '#F97316' }} className="h-[41px]">
```

### Convex Function Standards
```typescript
// CORRECT — validated args, authenticated, rate-limited, explicit error
export const createProblem = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    // ... all fields validated
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);
    await requireRateLimit(ctx, userId, 'problem:create');

    const validated = createProblemSchema.parse(args);
    // ... rest of handler
  },
});

// WRONG — no auth, no validation, no rate limit
export const createProblem = mutation({
  args: { data: v.any() },
  handler: async (ctx, args) => {
    await ctx.db.insert('problems', args.data);
  },
});
```

### State Management
- Convex `useQuery` for all server data — never useState + fetch
- Convex `useMutation` with `optimisticUpdate` for all mutations that change UI
- `useState` only for purely local UI state (hover, open/closed, etc.)
- No global client-side state management library needed — Convex is the store

### Error Handling
```typescript
// Mutations: use ConvexError for user-facing errors
import { ConvexError } from 'convex/values';

if (isRateLimited) {
  throw new ConvexError("You're posting too quickly. Wait a moment.");
}

// Client: catch and toast
try {
  await createProblem(args);
} catch (error) {
  if (error instanceof ConvexError) {
    toast.error(error.data);  // Show user-facing message
  } else {
    toast.error("Something went wrong. Please try again.");
    console.error(error);
  }
}
```

---

## Design Compliance Checklist

Run this before every UI PR:

- [ ] All colors use Tailwind design token classes (e.g., `text-text-secondary`, `bg-bg-tertiary`)
- [ ] No raw hex values anywhere in component files
- [ ] Spacing uses 4px grid (Tailwind standard classes — `p-4`, `gap-3`, `mt-6`, etc.)
- [ ] No arbitrary Tailwind values (no `h-[41px]`, use `h-10` or `h-11`)
- [ ] All interactive elements have hover, focus, active, disabled states
- [ ] Focus rings: `focus-visible:ring-2 focus-visible:ring-border-focus`
- [ ] Loading state: skeleton shimmer
- [ ] Empty state: designed (not browser default blank)
- [ ] Error state: toast or inline error
- [ ] Animations use Framer Motion spring config from design system
- [ ] Icons: Lucide React only, strokeWidth 1.5, consistent sizes
- [ ] Mobile: verified at 375px viewport
- [ ] Dark mode: this app is dark mode only — verify no white backgrounds appear

---

## Task File Conventions

### `tasks/todo.md`
```markdown
# Current Task: [Feature Name]

## Plan
1. [step with context]
2. [step with context]

## Progress
- [x] Completed step
- [ ] Pending step

## Notes
- Any discoveries, tradeoffs, or deviations from plan

## Review
[Add after completion: what was done, any issues found]
```

### `tasks/lessons.md`
```markdown
# Lessons

## UI / Design
- RULE: Never use arbitrary Tailwind values like h-[41px]
  MISTAKE: Used h-[41px] instead of h-10 for button height
  FIX: Always use standard Tailwind scale values; check design system for height tokens

## Convex / Backend
- [rules about Convex patterns]

## TypeScript
- [rules about TypeScript patterns]

## Performance
- [rules about performance]

## Testing
- [rules about testing]
```

---

## Security Checklist (Run on Every Backend Change)

- [ ] All mutations call `requireAuth(ctx)` first
- [ ] Workspace-scoped queries check membership before returning data
- [ ] User can only access/modify their own sensitive data
- [ ] Input validation present on all mutation args (Zod)
- [ ] Rate limiting applied to all user-triggered mutations
- [ ] No userId taken from args — always from `requireAuth(ctx)`
- [ ] No raw SQL or dangerous operations
- [ ] File uploads: MIME type validated server-side

---

## Performance Checklist (Run on Data-Heavy Changes)

- [ ] Feed queries use indexed fields for filtering and sorting
- [ ] No N+1 queries (batch lookups, not individual fetches in loops)
- [ ] Large lists are virtualized (react-virtual or @tanstack/virtual)
- [ ] Images use Next.js `<Image>` component (auto-optimization)
- [ ] Heavy components are lazy-loaded (`dynamic(() => import(...))`)
- [ ] Framer Motion imported only where needed (lazy)
- [ ] Chart.js imported only where needed (lazy)
- [ ] AI calls are background actions (never block the UI thread)

---

## The "Staff Engineer Test"

Before submitting any work, ask:
1. Is there a more elegant way to do this?
2. Am I introducing technical debt that will bite us at 10x scale?
3. Would this code embarrass me in a code review with the best engineers I know?
4. Is the UI as beautiful as Linear? Would Jony Ive approve of this spacing?
5. Did I handle every meaningful error case?

If the answer to any of these gives you pause — fix it before submitting.
