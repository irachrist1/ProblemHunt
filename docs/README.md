# ProblemHunt — Project Documentation

> **Working Title**: ProblemHunt (final name TBD — candidates: Signal, Friction, Unmet, Forge)

This folder is the **single source of truth** for every engineering, design, and product decision. Every coding agent, designer, and contributor must read the relevant docs before making changes.

---

## Document Index

| # | File | Purpose |
|---|------|---------|
| 01 | [Product Vision](./01-product-vision.md) | Why this exists, who it's for, what success looks like |
| 02 | [Features Spec](./02-features-spec.md) | Every feature, MVP vs future, acceptance criteria |
| 03 | [Design System](./03-design-system.md) | Colors, typography, spacing, motion, component rules |
| 04 | [UI Screens](./04-ui-screens.md) | Every screen: layout, interactions, states |
| 05 | [Architecture](./05-architecture.md) | System design, tech stack, data flow, scaling |
| 06 | [Database Schema](./06-database-schema.md) | Full Convex schema with TypeScript types |
| 07 | [AI Integration](./07-ai-integration.md) | All AI features, models, prompts, caching |
| 08 | [Implementation Phases](./08-implementation-phases.md) | Build order, MVP scope, milestones |
| 09 | [Agent Workflow](./09-agent-workflow.md) | Rules every coding agent must follow |

---

## Non-Negotiable Principles

### 1. Design Is the Product
The UI/UX is not a feature — it is the product. Every pixel, spacing choice, animation timing, and color value must be intentional. The standard is: **Linear × Vercel, designed by Jony Ive, shipped by a team obsessed with craft**. If a component doesn't feel right, rebuild it. Never ship mediocre UI.

### 2. Agents Follow the Workflow
Every coding agent must read `09-agent-workflow.md` first. Plan before coding. Verify before marking complete. Capture lessons in `../tasks/lessons.md`.

### 3. The Docs Are Law
If code contradicts the docs, fix the code. If the docs need updating, update them first, then update the code. Never let the docs drift from reality.

### 4. Quality Over Speed
This will serve millions of users. Every architectural decision, every DB query, every animation frame matters. Take the time to get it right.

---

## Quick Start for Agents

1. Read this README
2. Read `09-agent-workflow.md` (rules you must follow)
3. Read the relevant feature doc from `02-features-spec.md`
4. Read `03-design-system.md` if touching UI
5. Check `../tasks/lessons.md` for known pitfalls
6. Check `../tasks/todo.md` for current task context
7. Plan your work before coding
8. Verify your work before marking complete
