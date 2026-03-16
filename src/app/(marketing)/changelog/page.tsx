import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ProblemHunt Changelog',
  description: 'Recent product updates shipped to ProblemHunt.',
};

export default function ChangelogPage() {
  return (
    <main className="min-h-screen bg-bg-primary px-6 py-16 text-text-primary">
      <div className="mx-auto w-full max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-problem-500">Changelog</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Recent updates</h1>

        <section className="mt-10 rounded-xl border border-border-subtle p-6">
          <p className="text-sm text-text-muted">March 16, 2026</p>
          <h2 className="mt-2 text-xl font-semibold text-text-primary">Landing, auth, and feed improvements</h2>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
            Shipped email/password auth fixes, added live-feed animations to the landing page, and implemented the
            recommendation algorithm for the personalized feed.
          </p>
        </section>
      </div>
    </main>
  );
}
