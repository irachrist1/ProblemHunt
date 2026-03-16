import type { Metadata } from 'next';
import { MarketingShell } from '@/components/layout/MarketingShell';

export const metadata: Metadata = {
  title: 'ProblemHunt Changelog',
  description: 'Recent product updates shipped to ProblemHunt.',
};

const CHANGELOG_ENTRIES = [
  {
    date: 'March 16, 2026',
    title: 'Landing, auth, and feed improvements',
    description:
      'Shipped email/password auth fixes, added live-feed animations to the landing page, and implemented the recommendation algorithm for the personalized feed.',
  },
  {
    date: 'March 10, 2026',
    title: 'UI/UX revamp',
    description:
      'Complete visual overhaul of the landing page, feed page, and problem cards. New animation system with spring physics, improved typography hierarchy, and consistent dark theme across all pages.',
  },
  {
    date: 'March 5, 2026',
    title: 'Status page and missing routes',
    description:
      'Added system status page with uptime indicators. Fixed all broken footer links and ensured every route has a working page.',
  },
  {
    date: 'February 28, 2026',
    title: 'AI-powered problem matching',
    description:
      'Introduced AI clarity scoring and framing suggestions for submitted problems. Feed now shows match percentages for logged-in users based on tech stack and domain interests.',
  },
];

export default function ChangelogPage() {
  return (
    <MarketingShell>
      <main className="px-6 py-16">
        <div className="mx-auto w-full max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-problem-500">
            Changelog
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">Recent updates</h1>
          <p className="mt-3 text-sm text-text-muted">
            A log of improvements and new features shipped to ProblemHunt.
          </p>

          <div className="mt-10 space-y-6">
            {CHANGELOG_ENTRIES.map((entry) => (
              <section
                key={entry.date}
                className="rounded-xl border border-border-subtle p-6"
              >
                <p className="text-xs text-text-muted font-medium">{entry.date}</p>
                <h2 className="mt-2 text-lg font-semibold text-text-primary">
                  {entry.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                  {entry.description}
                </p>
              </section>
            ))}
          </div>
        </div>
      </main>
    </MarketingShell>
  );
}
