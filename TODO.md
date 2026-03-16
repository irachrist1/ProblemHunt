# ProblemHunt UI/UX Revamp — TODO

## Step 1: Full Audit ✅
- [x] Crawl every page and component
- [x] Build complete inventory
- [x] Flag broken/missing pages
- [x] Report inventory

## Step 2: Create Missing Pages
- [ ] Create `/status` page with uptime indicator
- [ ] Fix footer "Status" link (add href)
- [ ] Add shared nav/footer to marketing pages
- [ ] Commit Step 2

## Step 3: Revamp Landing Page
- [ ] Single background color (#0A0A0B), no section shifts
- [ ] Clear typography hierarchy (hero largest)
- [ ] Feed preview cards: AnimatePresence, staggerChildren: 0.12, spring { stiffness: 260, damping: 20 }, whileInView with viewport={{ once: false, amount: 0.15 }}
- [ ] Hero word animation: whileInView re-trigger (not animate on mount)
- [ ] Respect prefers-reduced-motion on all animations
- [ ] Remove "FOR BUILDERS" section entirely
- [ ] Clean 1px separators, hard boundaries
- [ ] Commit Step 3

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
