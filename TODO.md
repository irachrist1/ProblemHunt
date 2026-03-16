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

## Step 4: Revamp Feed Page ✅
- [x] Clear visual hierarchy on cards (title primary, tags secondary, vote/poster tertiary)
- [x] Subtle hover state (border brightening or bg shift)
- [x] Vote button: spring scale { scale: 1.15 } on whileTap
- [x] Match percentage as top-right badge (only if > 50%)
- [x] Commit Step 4

## Step 5: Check Every Other Page ✅
- [x] Wrap all marketing sub-pages in MarketingShell (about, changelog, contact, privacy, terms, status)
- [x] Verify all routes load without errors
- [x] Ensure visual consistency across all pages (same tokens, same font, same spacing)
- [x] Fix orphaned or broken pages (none found)
- [x] Confirm no 404s from any nav/footer/sidebar link
- [x] Commit Step 5

## Step 6: Commit Strategy ✅
- [x] Step 2 commit: `237789f` — "Step 2: Create /status page + fix footer link"
- [x] Step 3 commit: `34a3875` — "Step 3: Revamp landing page from scratch"
- [x] Step 4 commit: `30b04c8` — "Step 4: Revamp feed page and problem cards"
- [x] Step 5 commit: `ffa0e4e` — "Step 5: Wrap marketing pages in MarketingShell, verify all routes"
