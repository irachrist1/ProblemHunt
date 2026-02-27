# Design System

## Design Philosophy

> "Design is not just what it looks like and feels like. Design is how it works." — Steve Jobs

> "Simplicity is not the absence of clutter; that's a consequence of simplicity. Simplicity is somehow essentially describing the purpose and place of an object and product." — Jony Ive

This product must feel like it was designed by the world's best team, then refined until every excess was removed. The standard is **Linear × Vercel** — dark, minimal, surgical precision in every spacing choice, animation, and typographic decision.

**Three words that define every design decision:**
1. **Intentional** — nothing is placed without reason
2. **Alive** — interactions have weight and feedback
3. **Calm** — complexity is hidden; clarity is surfaced

**Anti-patterns to never do:**
- Gradient overload (use gradients surgically, not everywhere)
- Too many font sizes in one view
- Animations that delay user action
- Color for decoration instead of meaning
- Shadow soup (multiple overlapping shadows)
- Busyness masquerading as information density

---

## Color System

### Foundation

```css
/* Base surfaces — NOT pure black. Slight warmth prevents harshness */
--bg-primary:   #0A0A0B;   /* Page background */
--bg-secondary: #111114;   /* Card / panel backgrounds */
--bg-tertiary:  #18181C;   /* Hover states, elevated cards */
--bg-overlay:   #222228;   /* Modals, dropdowns, tooltips */
--bg-input:     #16161A;   /* Form inputs */
```

### Text Hierarchy
```css
--text-primary:   #FAFAFA;  /* Headlines, primary content */
--text-secondary: #A1A1AA;  /* Body copy, descriptions */
--text-tertiary:  #71717A;  /* Metadata, timestamps, labels */
--text-muted:     #3F3F46;  /* Placeholders, disabled states */
--text-inverted:  #09090B;  /* Text on light backgrounds (CTAs) */
```

### Borders
```css
--border-subtle:  rgba(255,255,255,0.05);  /* Lowest-contrast dividers */
--border-default: rgba(255,255,255,0.09);  /* Card edges, input borders */
--border-strong:  rgba(255,255,255,0.15);  /* Focused inputs, hover borders */
--border-focus:   rgba(249,115,22,0.50);   /* Focus rings */
```

### Problem (Pain) — Orange Scale
The accent color carries meaning: **orange = pain = urgency**. Use with purpose.

```css
--problem-500:        #F97316;  /* Primary: upvote buttons, active states, CTAs */
--problem-400:        #FB923C;  /* Lighter variant */
--problem-600:        #EA6A0A;  /* Pressed/darker variant */
--problem-dim:        rgba(249,115,22,0.10);  /* Background tints */
--problem-border:     rgba(249,115,22,0.22);  /* Bordered states */
--problem-glow:       rgba(249,115,22,0.18);  /* Glow shadows */
```

### Solution — Green Scale
```css
--solution-500:       #10B981;  /* Solution indicators */
--solution-dim:       rgba(16,185,129,0.10);
--solution-border:    rgba(16,185,129,0.22);
--solution-glow:      rgba(16,185,129,0.15);
```

### Status Colors
```css
--status-open:        #F97316;  /* Open problems */
--status-exploring:   #3B82F6;  /* Being explored */
--status-proposed:    #8B5CF6;  /* Solution proposed */
--status-exists:      #06B6D4;  /* Solution exists */
--status-solved:      #10B981;  /* Validated solved */
```

### Semantic Colors
```css
--color-error:        #EF4444;
--color-error-dim:    rgba(239,68,68,0.12);
--color-warning:      #F59E0B;
--color-success:      #10B981;
--color-info:         #3B82F6;
```

### Gradients
Use sparingly. Only for hero sections, empty states, and key moments.

```css
/* Hero gradient — paint the sky, don't fill the canvas */
--gradient-hero: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(249,115,22,0.12), transparent);

/* Card ambient glow on hover */
--gradient-card-hover: radial-gradient(ellipse at top, rgba(249,115,22,0.06), transparent 70%);

/* Problem vote area */
--gradient-vote: linear-gradient(180deg, rgba(249,115,22,0.08) 0%, transparent 100%);
```

---

## Typography

### Font Stack
```css
font-family: 'Inter var', 'Inter', system-ui, -apple-system, sans-serif;
font-feature-settings: 'cv01', 'cv02', 'cv03', 'cv04'; /* Inter optical adjustments */
```

Monospace (IDs, code, counts):
```css
font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
```

### Scale
| Token | Size | Line Height | Weight | Letter Spacing | Use |
|-------|------|------------|--------|---------------|-----|
| `text-2xs` | 10px | 14px | 500 | +0.02em | Badges, micro labels |
| `text-xs` | 11px | 16px | 500 | +0.01em | Timestamps, meta |
| `text-sm` | 13px | 20px | 400 | 0 | Body small, secondary |
| `text-base` | 15px | 24px | 400 | 0 | Primary body |
| `text-lg` | 17px | 26px | 500 | -0.01em | Card titles |
| `text-xl` | 20px | 28px | 600 | -0.02em | Section headings |
| `text-2xl` | 24px | 32px | 600 | -0.02em | Page headings |
| `text-3xl` | 30px | 36px | 700 | -0.03em | Hero subheads |
| `text-4xl` | 36px | 44px | 700 | -0.03em | Hero headline |
| `text-5xl` | 48px | 52px | 800 | -0.04em | Landing hero |
| `text-6xl` | 60px | 64px | 800 | -0.04em | Max hero |

### Typography Rules
- **Never** use font-weight 400 for anything < 13px — it'll be illegible
- **Always** use tabular numbers (`font-variant-numeric: tabular-nums`) for vote counts, stats
- **Headings** get letter-spacing tightened (`-0.02em` to `-0.04em` depending on size)
- **Body text** never exceeds 72ch line length — eyestrain protection
- **Avoid** ALL CAPS except for 2-letter labels/abbreviations

---

## Spacing System

Base unit: **4px**. All spacing is a multiple of 4.

```
4px   → space-1   (micro gaps between icon and label)
8px   → space-2   (tight element spacing)
12px  → space-3   (between related elements)
16px  → space-4   (standard component padding)
20px  → space-5   (generous component padding)
24px  → space-6   (section spacing tight)
32px  → space-8   (section spacing)
40px  → space-10  (large section gaps)
48px  → space-12  (content section separation)
64px  → space-16  (major section breaks)
80px  → space-20  (hero padding)
96px  → space-24  (page-level sections)
128px → space-32  (landing page sections)
```

### Layout Grid
```
Mobile:  4-column, 16px gutters, 16px margins
Tablet:  8-column, 24px gutters, 32px margins
Desktop: 12-column, 24px gutters, 48px margins
Max content width: 1280px
Feed column max width: 680px
Sidebar width: 240px (left), 300px (right)
```

---

## Border Radius

```css
--radius-xs:   4px;    /* Badges, tags, small chips */
--radius-sm:   6px;    /* Buttons, form inputs */
--radius-md:   10px;   /* Cards, panels */
--radius-lg:   14px;   /* Modal dialogs */
--radius-xl:   20px;   /* Large cards, feature callouts */
--radius-2xl:  28px;   /* Hero cards */
--radius-full: 9999px; /* Pills, avatars, toggle buttons */
```

---

## Shadow & Elevation System

In dark UIs, shadows work differently. We use a combination of:
1. **Border** for edge definition (instead of shadow spread)
2. **Inset glow** for depth
3. **Ambient shadow** for floating elements

```css
/* Level 0 — flat, no elevation */
box-shadow: none;

/* Level 1 — cards, subtle panels */
box-shadow: 0 1px 2px rgba(0,0,0,0.40), 0 0 0 1px var(--border-default);

/* Level 2 — dropdowns, hover cards */
box-shadow: 0 4px 12px rgba(0,0,0,0.50), 0 0 0 1px var(--border-strong);

/* Level 3 — modals, command palette */
box-shadow: 0 8px 32px rgba(0,0,0,0.60), 0 0 0 1px var(--border-strong);

/* Focused interactive element */
box-shadow: 0 0 0 2px var(--border-focus);

/* Voted state — orange ambient glow */
box-shadow: 0 0 20px rgba(249,115,22,0.20), 0 0 0 1px var(--problem-border);

/* Solution solved — green ambient glow */
box-shadow: 0 0 20px rgba(16,185,129,0.15), 0 0 0 1px var(--solution-border);
```

---

## Motion & Animation

### Core Principles
1. **Animations serve communication**, not decoration
2. **Faster is not always better** — the sweet spot is *responsive but perceivable*
3. **Spring physics** over cubic-bezier wherever possible — feels physical, alive
4. **Never animate layout shifts** that delay user action
5. **Respect `prefers-reduced-motion`** — always provide a fallback

### Timing Tokens
```css
--duration-instant:  80ms;   /* State toggles (active/inactive) */
--duration-fast:    150ms;   /* Hover states, focus rings */
--duration-base:    200ms;   /* Most transitions */
--duration-slow:    300ms;   /* Page transitions, modals */
--duration-enter:   250ms;   /* Elements entering the DOM */
--duration-exit:    150ms;   /* Elements leaving (always faster than enter) */
```

### Easing Functions
```css
--ease-out:      cubic-bezier(0.0, 0.0, 0.2, 1.0);   /* Standard: most UI transitions */
--ease-in:       cubic-bezier(0.4, 0.0, 1.0, 1.0);   /* Elements leaving screen */
--ease-bounce:   cubic-bezier(0.34, 1.56, 0.64, 1.0); /* Playful: upvotes, success states */
--ease-spring:   Use Framer Motion spring config below;
```

### Framer Motion Spring Configs
```typescript
// Snappy — buttons, toggles
export const springSnappy = { type: 'spring', stiffness: 500, damping: 35 };

// Smooth — cards, panels
export const springSmooth = { type: 'spring', stiffness: 300, damping: 30 };

// Gentle — modals, overlays  
export const springGentle = { type: 'spring', stiffness: 200, damping: 28 };

// Bouncy — vote animations, success states
export const springBouncy = { type: 'spring', stiffness: 400, damping: 20, restDelta: 0.001 };
```

### Signature Animations

**Upvote Animation** (the most frequent interaction — must feel GREAT):
```
1. Button scale: 1.0 → 0.85 → 1.2 → 1.0 (spring, 300ms total)
2. Number: old value fades up and out, new value fades in from below
3. Orange color fills in with a radial wipe from center
4. Tiny particle burst (3–4 particles, optional, disabled on reduced-motion)
```

**Problem Card Hover:**
```
1. Background: subtle lift (bg-secondary → bg-tertiary, 150ms)
2. Border: subtle → default opacity (150ms)
3. Left vote strip: faint orange gradient appears
4. NO transform/scale on cards — causes layout jitter at list scale
```

**Modal Enter:**
```
1. Overlay: opacity 0 → 0.6 (200ms ease-out)
2. Modal: scale 0.96 + opacity 0 → scale 1.0 + opacity 1 (250ms spring)
```

**Toast/Notification:**
```
1. Slide in from bottom-right (translateY: 20px → 0, 200ms ease-out)
2. Auto-dismiss: fade out (150ms)
```

**Feed Item Stagger:**
```
Initial load: items stagger in with 30ms delay each
translateY: 8px → 0, opacity: 0 → 1, 200ms ease-out
Max 8 items animated (items beyond are instant)
```

**Skeleton Loading:**
```
Shimmer sweep animation (not pulse)
Direction: left-to-right
Duration: 1.5s
Color: bg-tertiary → slightly lighter → bg-tertiary
```

---

## Component Patterns

### Upvote Button
```
┌─────────┐
│    ▲    │  ← triangle icon, 14px
│   247   │  ← tabular-nums, text-sm, medium weight
└─────────┘
```
- Default: bg-secondary, border-subtle, text-secondary
- Hover: bg-tertiary, border-default, text-primary
- Active/voted: bg problem-dim, border-problem-border, text-problem-500
- Size: 48px wide × 64px tall (generous touch target)
- Border radius: radius-md (10px)

### Problem Card
```
┌──────────────────────────────────────────────────────────────────┐
│  ┌──────┐  Title of the problem statement that is clear         │
│  │  ▲   │  and specific enough to understand quickly            │
│  │ 247  │  ─────────────────────────────────────────────────    │
│  └──────┘  Short description, first 2 lines visible with        │
│            "..." truncation...                                   │
│                                                                  │
│  [Developer Tools]  [Auth]  [Mobile]                            │
│  @username · 3 hours ago · 127 also have this · 4 solutions     │
│                                  [● Being Explored]  [Me Too]  │
└──────────────────────────────────────────────────────────────────┘
```
- Background: bg-secondary
- Border: border-subtle
- Hover: bg-tertiary, border-default
- Padding: 20px
- Gap between vote + content: 16px
- Tags: bg-bg-tertiary, text-tertiary, radius-full, px-10 py-4

### Status Badge
- Small pill, 6px horizontal padding, 3px vertical
- Dot indicator (6px circle) + text
- Uses status color at full opacity for dot, at 12% opacity for bg

### Input Fields
```
Default:  bg-input, border-default, radius-sm, text-base
Focus:    border-focus, box-shadow focus ring
Error:    border-error, error-dim bg tint
```
- Height: 40px standard, 36px compact
- Padding: 12px horizontal

### Buttons

**Primary (CTA):**
- bg: problem-500, text: white, hover: problem-600
- Height: 40px, px-16, radius-sm
- Font: 14px, weight 500

**Secondary:**
- bg: bg-tertiary, border: border-default, text: text-primary
- Hover: bg-overlay

**Ghost:**
- bg: transparent, text: text-secondary
- Hover: bg: bg-secondary, text: text-primary

**Destructive:**
- bg: error-dim, border: error border, text: error
- Hover: bg: rgba(239,68,68,0.20)

### Tags / Chips
- Pill shape (radius-full)
- bg: bg-tertiary
- text: text-tertiary (12px, medium weight)
- px-10 py-3
- Hover (clickable): bg: bg-overlay, text: text-secondary

---

## Iconography

Use **Lucide React** exclusively. Never mix icon libraries.

- Default size: 16px (UI) / 20px (nav) / 24px (feature icons)
- Stroke width: 1.5 (never 2, too heavy in dark UIs)
- Always paired with labels except in compact contexts (add aria-label)
- Never use icon-only buttons smaller than 32×32px

---

## Tailwind Configuration

```typescript
// tailwind.config.ts
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary:   '#0A0A0B',
          secondary: '#111114',
          tertiary:  '#18181C',
          overlay:   '#222228',
          input:     '#16161A',
        },
        border: {
          subtle:  'rgba(255,255,255,0.05)',
          default: 'rgba(255,255,255,0.09)',
          strong:  'rgba(255,255,255,0.15)',
          focus:   'rgba(249,115,22,0.50)',
        },
        problem: {
          400: '#FB923C',
          500: '#F97316',
          600: '#EA6A0A',
          dim: 'rgba(249,115,22,0.10)',
          border: 'rgba(249,115,22,0.22)',
          glow: 'rgba(249,115,22,0.18)',
        },
        solution: {
          500: '#10B981',
          dim: 'rgba(16,185,129,0.10)',
          border: 'rgba(16,185,129,0.22)',
        },
        status: {
          open:      '#F97316',
          exploring: '#3B82F6',
          proposed:  '#8B5CF6',
          exists:    '#06B6D4',
          solved:    '#10B981',
        },
      },
      fontFamily: {
        sans: ['Inter var', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px', fontWeight: '500' }],
      },
      borderRadius: {
        DEFAULT: '6px',
        xs: '4px',
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '20px',
        '2xl': '28px',
      },
      keyframes: {
        'upvote-bounce': {
          '0%':   { transform: 'scale(1)' },
          '30%':  { transform: 'scale(0.85)' },
          '60%':  { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%':   { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'upvote-bounce': 'upvote-bounce 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        'shimmer': 'shimmer 1.5s infinite linear',
        'fade-up': 'fade-up 0.2s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.2s ease-out forwards',
      },
    },
  },
};
```

---

## Accessibility Requirements

- **WCAG AA minimum** (AAA where possible)
- All interactive elements: visible focus ring (2px, problem-500 at 50% opacity)
- Color is never the ONLY indicator of state — always pair with icon or text
- All animations respect `prefers-reduced-motion`
- Minimum touch target: 44×44px
- All images have meaningful alt text
- Form errors announced via aria-live

---

## Dark Mode Only

This product is **dark mode first and only** for v1. Reasons:
1. The audience (developers, PMs) strongly prefers dark UIs
2. Design complexity doubles with light mode — build quality dark first
3. The aesthetic direction depends on dark's ability to use glow/ambient effects

Light mode can be added in v3 with a design sprint dedicated to it.

---

## Design Checklist (Run Before Any PR)

- [ ] All colors use design tokens, not raw hex values
- [ ] Spacing uses 4px grid (no arbitrary values)
- [ ] Interactive elements have hover, focus, active, disabled states
- [ ] Loading states exist for all async operations
- [ ] Empty states are designed (not default browser blank)
- [ ] Mobile layout is verified at 375px
- [ ] `prefers-reduced-motion` fallback exists for all animations
- [ ] Text contrast ratio passes WCAG AA (4.5:1 for body, 3:1 for large)
- [ ] Icons have aria-labels if standalone
- [ ] No hardcoded colors in component files
