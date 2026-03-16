# ProblemHunt UI/UX Revamp — TODO

## Step 1: Full Audit ✅
- [x] Crawl every page and component
- [x] Build complete inventory
- [x] Flag broken/missing pages
- [x] Report inventory

## Step 2: Create Missing Pages ✅
- [x] Create `/status` page with uptime indicator
- [x] Fix footer "Status" link (add href)
- [x] Commit Step 2

## Step 3: Revamp Landing Page ✅
- [x] Single background color (#0A0A0B), no section shifts
- [x] Clear typography hierarchy (hero largest)
- [x] Feed preview cards: AnimatePresence, staggerChildren: 0.12, spring { stiffness: 260, damping: 20 }, whileInView with viewport={{ once: false, amount: 0.15 }}
- [x] Hero word animation: whileInView re-trigger (not animate on mount)
- [x] Respect prefers-reduced-motion on all animations
- [x] Remove "FOR BUILDERS" section entirely
- [x] Clean 1px separators, hard boundaries
- [x] Commit Step 3

## Step 4: Revamp Feed Page
- [ ] Clear visual hierarchy on cards (title primary, tags secondary, vote/poster tertiary)
- [ ] Subtle hover state (border brightening or bg shift)
- [ ] Vote button: spring scale { scale: 1.15 } on whileTap
- [ ] Match percentage as top-right badge (only if > 50%)
- [ ] Commit Step 4

## Step 5: Check Every Other Page
- [ ] Verify all routes load without errors
- [ ] Ensure visual consistency across all pages
- [ ] Fix orphaned or broken pages
- [ ] Commit Step 5

## Step 6: Commit Strategy
- [ ] One commit per step with clear messages
