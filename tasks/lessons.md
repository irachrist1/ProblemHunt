# Lessons

This file captures rules learned from mistakes. Read it at the start of every session.

---

## Project Setup

- RULE: Never use `create-next-app` in a directory whose name has uppercase letters.
  MISTAKE: `npx create-next-app@15 .` failed because npm infers the package name from the directory ("ProblemHunt" has uppercase).
  FIX: Manually scaffold `package.json`, `tsconfig.json`, and config files. More control, same result.

- RULE: Never install `next@latest` — it may jump to a canary/v16 version.
  MISTAKE: `npm install next@latest` pulled in next@16 which is unstable.
  FIX: Always pin to a specific stable version: `npm install next@"15.3.3"`.

- RULE: Check for security vulnerabilities in installed packages immediately.
  MISTAKE: Initial npm install had next@15.1.7 with CVE-2025-66478.
  FIX: Run `npm audit` after install. Upgrade to patched version.

---

## Convex

- RULE: The `convex/_generated/` directory doesn't exist until `npx convex dev` runs.
  CONSEQUENCE: All `tsc --noEmit` errors in `convex/` files about missing `_generated/server`, `_generated/api`, `_generated/dataModel` are expected and will resolve automatically.
  FIX: Only fix frontend (src/) TypeScript errors pre-launch. Convex errors clear on first `npx convex dev`.

- RULE: Always match the `aiAnalyses` table schema exactly — it uses `type` (union literal) + `result` (any) + `model` + `inputHash` + `expiresAt`. Not flat fields.
  MISTAKE: First draft of `convex/ai/mutations.ts` tried to write flat fields (`suggestedTags`, `clarityScore`) that don't exist in the schema.
  FIX: Use `type: 'auto_tags'` + `result: { suggestedTags }` pattern matching the defined schema.

- RULE: Background AI actions in Convex must be `internalAction`, not public `action`.
  MISTAKE: `autoTagProblem` was initially exported as `action(...)`.
  FIX: Use `internalAction(...)` + `internal.ai.actions.autoTagProblem` for scheduling.

- RULE: Use `withIndex('by_problem_and_type', q => q.eq('problemId', ...).eq('type', ...))` for aiAnalyses lookups, not `by_problem`.

---

## TypeScript

- RULE: `as const` tuple/array cast errors — spread to make mutable.
  MISTAKE: `z.enum(PROBLEM_CATEGORIES as [string, ...string[]])` fails with "readonly array not assignable".
  FIX: `z.enum([...PROBLEM_CATEGORIES] as [string, ...string[]])`.

- RULE: `useRef<T>()` with no default fails if T doesn't include `undefined`.
  FIX: `useRef<T | undefined>(undefined)`.

- RULE: Literal type `'public' as const` prevents assigning other values to the field.
  FIX: Use explicit union type: `visibility: 'public' as 'public' | 'anonymous'`.

- RULE: When calling `.filter(n => ...)` on a `useQuery` result without Convex generated types, `n` will be implicit `any`. Cast the array: `(notifications as Notification[]).filter(...)`.

---

## AI / SDK Versions

- RULE: `@ai-sdk/google@3.x` is NOT compatible with `ai@4.x` (LanguageModelV3 vs LanguageModelV1).
  FIX: Install `@ai-sdk/google@"^1.0.0"` to get the `1.x` version compatible with `ai@4.3.x`.

---

## UI Components

- RULE: The `Button` component needs `asChild` support for rendering as `<Link>`.
  FIX: Implement `asChild` using `React.cloneElement` on `Children.only(children)`, passing className through. No need for Radix `@radix-ui/react-slot`.

- RULE: UserAvatar prop is `avatarUrl`, not `imageUrl`.

- RULE: Domain types use `createdAt` (not `_creationTime`). Convex `_creationTime` is a system field on the raw Convex doc, not on our enriched domain types.

---

*Last updated: Phase 1 implementation session — all 10 stages complete*
