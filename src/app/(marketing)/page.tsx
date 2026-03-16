'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, TrendingUp, Zap, Users, BarChart3, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const HERO_HEADLINE = 'The place where the best problems find the builders who solve them.';

function getInstantAwareTransition(
  reducedMotion: boolean,
  transition: Record<string, number | string>
) {
  return reducedMotion ? { duration: 0 } : transition;
}

// ---------- Nav Bar ----------

function NavBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex h-16 items-center border-b px-6 ${
        scrolled ? 'border-border-subtle bg-bg-primary' : 'border-transparent bg-bg-primary'
      }`}
    >
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-problem-500 flex items-center justify-center">
            <span className="text-sm font-bold text-white">P</span>
          </div>
          <span className="text-sm font-semibold text-text-primary">ProblemHunt</span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/sign-in">Sign In</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}

// ---------- Hero ----------

function HeroSection() {
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = prefersReducedMotion ?? false;
  const words = useMemo(() => HERO_HEADLINE.split(' '), []);

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center border-b border-border-subtle px-6 pb-20 pt-40 text-center">
      <motion.h1
        className="text-[56px] md:text-[72px] font-extrabold leading-none tracking-[-0.04em] max-w-4xl"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: reducedMotion ? { duration: 0 } : { staggerChildren: 0.06 },
          },
        }}
      >
        {words.map((word, index) => {
          const isProblems = word === 'problems';
          const suffix = index === words.length - 1 ? '' : ' ';

          return (
            <motion.span
              key={`${word}-${index}`}
              className="inline-block"
              variants={{
                hidden: reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: getInstantAwareTransition(reducedMotion, {
                    type: 'spring',
                    stiffness: 280,
                    damping: 22,
                  }),
                },
              }}
            >
              {isProblems ? (
                <span
                  style={{
                    backgroundImage: 'linear-gradient(135deg, #F97316, #FBBF24)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {word}
                </span>
              ) : (
                word
              )}
              {suffix}
            </motion.span>
          );
        })}
      </motion.h1>

      <p className="mt-6 text-xl text-text-secondary max-w-xl">
        Browse a subreddit-style feed of real problems posted by real humans waiting to be solved.
      </p>

      <div className="mt-8 flex items-center gap-3 flex-wrap justify-center">
        <Button size="lg" asChild>
          <Link href="/explore">Browse Problems →</Link>
        </Button>
        <Button variant="ghost" size="lg" asChild>
          <Link href="/submit">Add Problem</Link>
        </Button>
      </div>
      <p className="mt-3 text-xs text-text-muted">No account required to browse</p>

      {/* Social proof logos */}
      <div className="mt-10 flex items-center gap-8 opacity-40 flex-wrap justify-center">
        {['Stripe', 'Vercel', 'Linear', 'Notion'].map((name) => (
          <span key={name} className="text-sm font-semibold text-text-muted tracking-wider uppercase">
            {name}
          </span>
        ))}
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-text-muted">
        <ChevronDown className="h-5 w-5" />
      </div>
    </section>
  );
}

// ---------- Live Feed Preview ----------

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
];

function DemoProblemCard({ title, category, votes, tag }: (typeof DEMO_PROBLEMS)[0]) {
  return (
    <div className="flex gap-3 rounded-xl border border-border-subtle bg-bg-primary p-4 shadow-[0_1px_0_rgba(255,255,255,0.04)]">
      <div className="flex-shrink-0 flex flex-col items-center justify-center w-10 gap-0.5">
        <div className="h-5 w-5 text-text-muted">▲</div>
        <span className="text-sm font-semibold text-text-secondary">{votes}</span>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-text-primary leading-snug">{title}</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-text-muted bg-bg-tertiary px-2 py-0.5 rounded-full">
            {category}
          </span>
          <span className="text-xs text-text-muted">#{tag}</span>
        </div>
      </div>
    </div>
  );
}

function LiveFeedSection() {
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = prefersReducedMotion ?? false;

  return (
    <section id="explore" className="border-y border-border-subtle bg-bg-secondary px-6 py-20">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-semibold text-text-primary mb-8">
          Problems being posted right now
        </h2>
        <motion.div
          className="flex flex-col gap-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={{
            hidden: {},
            visible: {
              transition: reducedMotion ? { duration: 0 } : { staggerChildren: 0.1 },
            },
          }}
        >
          {DEMO_PROBLEMS.map((p) => (
            <motion.div
              key={p.id}
              variants={{
                hidden: reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: getInstantAwareTransition(reducedMotion, {
                    type: 'spring',
                    stiffness: 280,
                    damping: 22,
                  }),
                },
              }}
            >
              <DemoProblemCard {...p} />
            </motion.div>
          ))}
        </motion.div>
        <div className="mt-6">
          <Button variant="secondary" asChild>
            <Link href="/explore">Browse all problems →</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// ---------- For Builders ----------

function ForBuildersSection() {
  return (
    <section className="border-b border-border-subtle px-6 py-20">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-problem-500 mb-3 block">
            For Builders
          </span>
          <h2 className="text-3xl font-bold text-text-primary mb-6">
            Your next great side project is already waiting
          </h2>
          <ul className="space-y-4">
            {[
              { icon: Zap, label: 'AI-powered matching based on your skills and stack' },
              { icon: BarChart3, label: 'Weekly curated digests of top-voted problems' },
              { icon: Check, label: 'Filter by domain, tech stack, and severity' },
            ].map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-start gap-3">
                <div className="mt-0.5 h-5 w-5 rounded-full bg-problem-dim border border-problem-border flex items-center justify-center flex-shrink-0">
                  <Icon className="h-3 w-3 text-problem-500" strokeWidth={2} />
                </div>
                <span className="text-sm text-text-secondary">{label}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Button asChild>
              <Link href="/explore">Start building →</Link>
            </Button>
          </div>
        </div>

        {/* Mockup */}
        <div className="rounded-2xl border border-border-subtle bg-bg-primary p-4 space-y-2">
          <div className="text-xs text-text-muted mb-3 font-medium">Matched for you</div>
          {[
            { title: 'Async decision tracking for remote teams', match: '94% match', votes: 847 },
            { title: 'Dev onboarding still takes weeks', match: '88% match', votes: 612 },
          ].map((p) => (
            <div
              key={p.title}
              className="flex items-start gap-3 p-3 rounded-lg border border-border-subtle bg-bg-secondary hover:border-problem-border transition-colors cursor-pointer"
            >
              <div className="text-center min-w-[36px]">
                <div className="text-xs text-text-muted">▲</div>
                <div className="text-sm font-semibold text-text-primary">{p.votes}</div>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-primary leading-snug">{p.title}</p>
                <span className="text-xs text-problem-500 mt-1 block">{p.match}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- For Organizations ----------

function ForOrgsSection() {
  return (
    <section className="border-b border-border-subtle px-6 py-20">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        {/* Mockup left */}
        <div className="rounded-2xl border border-border-subtle bg-bg-primary p-4 order-last md:order-first">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border-subtle">
            <div className="h-6 w-6 rounded-md bg-problem-500 flex items-center justify-center text-xs font-bold text-white">
              A
            </div>
            <span className="text-sm font-medium text-text-primary">Acme Corp Workspace</span>
            <span className="ml-auto text-xs text-text-muted">12 members</span>
          </div>
          <div className="space-y-2">
            {[
              { title: 'Onboarding too slow for new AEs', votes: 23, status: 'open' },
              { title: 'No visibility into deal blockers before pipeline review', votes: 18, status: 'exploring' },
              { title: 'Contract redlines take 3 weeks', votes: 15, status: 'proposed' },
            ].map((p) => (
              <div
                key={p.title}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-bg-secondary border border-border-subtle"
              >
                <span className="text-xs font-semibold text-text-secondary min-w-[20px] text-center">
                  {p.votes}
                </span>
                <span className="text-xs text-text-primary flex-1">{p.title}</span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded ${
                    p.status === 'open'
                      ? 'bg-status-open/10 text-status-open'
                      : p.status === 'exploring'
                      ? 'bg-status-exploring/10 text-status-exploring'
                      : 'bg-status-proposed/10 text-status-proposed'
                  }`}
                >
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3 block">
            For Organizations
          </span>
          <h2 className="text-3xl font-bold text-text-primary mb-6">
            Stop guessing what to build next
          </h2>
          <ul className="space-y-4">
            {[
              { icon: Users, label: 'Private workspaces for your team with role-based access' },
              { icon: TrendingUp, label: 'Team voting surfaces the highest-pain problems first' },
              { icon: BarChart3, label: 'Roadmap integration with Linear and Jira (coming soon)' },
            ].map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-start gap-3">
                <div className="mt-0.5 h-5 w-5 rounded-full bg-bg-tertiary border border-border-default flex items-center justify-center flex-shrink-0">
                  <Icon className="h-3 w-3 text-text-secondary" strokeWidth={2} />
                </div>
                <span className="text-sm text-text-secondary">{label}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Button variant="secondary" asChild>
              <Link href="/explore">Explore problems →</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- Final CTA ----------

function FinalCTA() {
  return (
    <section className="relative overflow-hidden border-b border-border-subtle px-6 py-32 text-center">
      <h2 className="text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight mb-4">
        The best products start with the right problems.
      </h2>
      <p className="text-text-secondary text-base mb-8 max-w-md mx-auto">
        Join thousands of builders and researchers sharing real problems. Free forever to browse.
      </p>
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <Button size="lg" asChild>
          <Link href="/explore">Browse the feed →</Link>
        </Button>
        <Button variant="ghost" size="lg" asChild>
          <Link href="/submit">Add Problem</Link>
        </Button>
      </div>
    </section>
  );
}

// ---------- Footer ----------

const FOOTER_LINKS: Record<string, Array<{ label: string; href?: string }>> = {
  Product: [
    { label: 'Feed', href: '/feed' },
    { label: 'Explore', href: '/explore' },
    { label: 'Submit Problem', href: '/submit' },
  ],
  Community: [
    { label: 'Discord' },
    { label: 'Newsletter' },
    { label: 'Blog' },
  ],
  Developers: [
    { label: 'API (coming soon)' },
    { label: 'Changelog' },
    { label: 'Status' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Contact' },
  ],
};

function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-bg-primary px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                {section}
              </h4>
              <ul className="space-y-2">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    {href ? (
                      <Link
                        href={href}
                        className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                      >
                        {label}
                      </Link>
                    ) : (
                      <a
                        href="#"
                        className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                      >
                        {label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-6 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} ProblemHunt. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <Link href="/privacy" className="hover:text-text-secondary transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-text-secondary transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ---------- Page ----------

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-bg-primary text-text-primary">
      <NavBar />
      <HeroSection />
      <LiveFeedSection />
      <ForBuildersSection />
      <ForOrgsSection />
      <FinalCTA />
      <Footer />
    </main>
  );
}
