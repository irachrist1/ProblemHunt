'use client';

import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';

/* ─────────────────────────────────────────────────────────────────────────────
 * Constants
 * ───────────────────────────────────────────────────────────────────────────── */

const HERO_HEADLINE = 'The place where the best problems find the builders who solve them.';

/* ─────────────────────────────────────────────────────────────────────────────
 * Nav Bar
 * ───────────────────────────────────────────────────────────────────────────── */

function NavBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex h-16 items-center px-6 transition-colors duration-200 ${
        scrolled
          ? 'border-b border-border-subtle bg-bg-primary/95 backdrop-blur-sm'
          : 'border-b border-transparent bg-bg-primary'
      }`}
    >
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-problem-500 flex items-center justify-center">
            <span className="text-sm font-bold text-white">P</span>
          </div>
          <span className="text-sm font-semibold text-text-primary">ProblemHunt</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/feed">Browse</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/sign-in">Sign In</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Hero Section
 *
 * The headline is the largest element on the entire page.
 * Word-by-word stagger animation re-triggers every time the section
 * enters the viewport (whileInView, once: false).
 * ───────────────────────────────────────────────────────────────────────────── */

function HeroSection() {
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = prefersReducedMotion ?? false;
  const words = useMemo(() => HERO_HEADLINE.split(' '), []);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: reducedMotion
        ? { duration: 0 }
        : { staggerChildren: 0.06 },
    },
  };

  const wordVariants = {
    hidden: reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: reducedMotion
        ? { duration: 0 }
        : { type: 'spring' as const, stiffness: 260, damping: 20 },
    },
  };

  return (
    <section className="relative flex min-h-[100dvh] flex-col items-center justify-center px-6 pb-24 pt-40 text-center">
      <motion.h1
        className="text-[52px] sm:text-[64px] md:text-[76px] font-extrabold leading-[1.02] tracking-[-0.04em] max-w-4xl"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.3 }}
        variants={containerVariants}
      >
        {words.map((word, index) => {
          const isHighlighted = word === 'problems';
          return (
            <motion.span
              key={`${word}-${index}`}
              className="inline-block"
              style={{ marginRight: index === words.length - 1 ? 0 : '0.25em' }}
              variants={wordVariants}
            >
              {isHighlighted ? (
                <span className="text-problem-500">{word}</span>
              ) : (
                word
              )}
            </motion.span>
          );
        })}
      </motion.h1>

      <motion.p
        className="mt-6 text-base text-text-tertiary max-w-lg leading-relaxed"
        initial={reducedMotion ? false : { opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={reducedMotion ? { duration: 0 } : { delay: 0.5, duration: 0.5 }}
      >
        A community-driven feed of real problems posted by real people — waiting for builders to solve them.
      </motion.p>

      <motion.div
        className="mt-8 flex items-center gap-3 flex-wrap justify-center"
        initial={reducedMotion ? false : { opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={reducedMotion ? { duration: 0 } : { delay: 0.7, duration: 0.4 }}
      >
        <Button size="lg" asChild>
          <Link href="/explore">Browse Problems</Link>
        </Button>
        <Button variant="secondary" size="lg" asChild>
          <Link href="/submit">Submit a Problem</Link>
        </Button>
      </motion.div>

      <motion.p
        className="mt-3 text-xs text-text-muted"
        initial={reducedMotion ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={reducedMotion ? { duration: 0 } : { delay: 0.9, duration: 0.4 }}
      >
        No account required to browse
      </motion.p>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-text-muted animate-bounce">
        <ChevronDown className="h-5 w-5" />
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Live Feed Preview
 *
 * Cards appear one by one as if arriving in real time.
 * staggerChildren: 0.12, spring { stiffness: 260, damping: 20 }
 * Each card starts at { opacity: 0, y: 20 }.
 * Re-triggers every time the section enters viewport.
 * ───────────────────────────────────────────────────────────────────────────── */

const DEMO_PROBLEMS = [
  {
    id: 1,
    title: 'No good way to track decisions made in async Slack threads',
    category: 'Productivity',
    votes: 847,
    tag: 'Remote Work',
  },
  {
    id: 2,
    title: 'Onboarding new developers to a codebase still takes weeks despite AI tools',
    category: 'Developer Tools',
    votes: 612,
    tag: 'Dev Productivity',
  },
  {
    id: 3,
    title: 'Expense reports are still manual, painful, and two weeks late',
    category: 'Finance',
    votes: 541,
    tag: 'SMB',
  },
  {
    id: 4,
    title: 'No unified view of customer health across support, sales, and product data',
    category: 'Customer Success',
    votes: 389,
    tag: 'B2B SaaS',
  },
  {
    id: 5,
    title: 'Finding the right open-source library for a task still means reading 20 READMEs',
    category: 'Developer Tools',
    votes: 304,
    tag: 'Discovery',
  },
];

function DemoProblemCard({
  title,
  category,
  votes,
  tag,
}: {
  title: string;
  category: string;
  votes: number;
  tag: string;
}) {
  return (
    <div className="flex gap-4 rounded-lg border border-border-subtle p-4 transition-colors duration-150 hover:border-border-default">
      {/* Vote column */}
      <div className="flex flex-col items-center justify-center w-10 flex-shrink-0 gap-0.5">
        <span className="text-xs text-text-muted">▲</span>
        <span className="text-sm font-semibold tabular-nums text-text-secondary">{votes}</span>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text-primary leading-snug">{title}</p>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <span className="text-2xs text-text-tertiary bg-bg-tertiary px-2 py-0.5 rounded-full">
            {category}
          </span>
          <span className="text-2xs text-text-muted">#{tag}</span>
        </div>
      </div>
    </div>
  );
}

function LiveFeedSection() {
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = prefersReducedMotion ?? false;

  const containerVariants = {
    hidden: {},
    visible: {
      transition: reducedMotion
        ? { duration: 0 }
        : { staggerChildren: 0.12 },
    },
  };

  const cardVariants = {
    hidden: reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: reducedMotion
        ? { duration: 0 }
        : { type: 'spring' as const, stiffness: 260, damping: 20 },
    },
  };

  return (
    <section className="px-6 py-24">
      {/* 1px separator at top */}
      <div className="max-w-2xl mx-auto mb-16 h-px bg-border-subtle" />

      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold text-text-primary mb-2 text-center">
          Problems being posted right now
        </h2>
        <p className="text-sm text-text-muted text-center mb-10">
          Real pain points from real people. Updated continuously.
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            className="flex flex-col gap-3"
            key="feed-cards"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.15 }}
            variants={containerVariants}
          >
            {DEMO_PROBLEMS.map((p) => (
              <motion.div key={p.id} variants={cardVariants}>
                <DemoProblemCard {...p} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 text-center">
          <Button variant="secondary" asChild>
            <Link href="/explore">Browse all problems →</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Final CTA
 *
 * Typography is intentionally smaller than the hero to maintain hierarchy.
 * ───────────────────────────────────────────────────────────────────────────── */

function FinalCTA() {
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = prefersReducedMotion ?? false;

  return (
    <section className="px-6 py-28 text-center">
      {/* 1px separator at top */}
      <div className="max-w-2xl mx-auto mb-16 h-px bg-border-subtle" />

      <motion.h2
        className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight mb-4 max-w-xl mx-auto"
        initial={reducedMotion ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 20 }}
      >
        The best products start with the right problems.
      </motion.h2>
      <motion.p
        className="text-sm text-text-tertiary mb-8 max-w-md mx-auto"
        initial={reducedMotion ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={reducedMotion ? { duration: 0 } : { delay: 0.15, duration: 0.4 }}
      >
        Join builders and researchers sharing real problems. Free forever to browse.
      </motion.p>
      <motion.div
        className="flex items-center justify-center gap-3 flex-wrap"
        initial={reducedMotion ? false : { opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={reducedMotion ? { duration: 0 } : { delay: 0.25, duration: 0.4 }}
      >
        <Button size="lg" asChild>
          <Link href="/explore">Browse the feed</Link>
        </Button>
        <Button variant="secondary" size="lg" asChild>
          <Link href="/submit">Submit a Problem</Link>
        </Button>
      </motion.div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Footer
 * ───────────────────────────────────────────────────────────────────────────── */

const FOOTER_LINKS: Record<string, Array<{ label: string; href: string }>> = {
  Product: [
    { label: 'Feed', href: '/feed' },
    { label: 'Explore', href: '/explore' },
    { label: 'Submit Problem', href: '/submit' },
  ],
  Developers: [
    { label: 'Changelog', href: '/changelog' },
    { label: 'Status', href: '/status' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Contact', href: '/contact' },
  ],
};

function Footer() {
  return (
    <footer className="px-6 py-12">
      {/* 1px separator at top */}
      <div className="max-w-5xl mx-auto mb-10 h-px bg-border-subtle" />

      <div className="max-w-5xl mx-auto">
        <div className="grid gap-8 mb-10 sm:grid-cols-2 md:grid-cols-3">
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                {section}
              </h4>
              <ul className="space-y-2">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-text-tertiary hover:text-text-primary transition-colors duration-150"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="h-px bg-border-subtle mb-6" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} ProblemHunt. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <Link href="/privacy" className="hover:text-text-secondary transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-text-secondary transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Page
 *
 * Single background color for the entire page: bg-bg-primary (#0A0A0B).
 * No section background shifts. No gradients between sections.
 * Sections separated by spacing and 1px lines only.
 * ───────────────────────────────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-bg-primary text-text-primary">
      <NavBar />
      <HeroSection />
      <LiveFeedSection />
      <FinalCTA />
      <Footer />
    </main>
  );
}
