import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingShell } from '@/components/layout/MarketingShell';

export const metadata: Metadata = {
  title: 'About ProblemHunt',
  description: 'Learn what ProblemHunt is and how the community shares real-world problems worth solving.',
};

export default function AboutPage() {
  return (
    <MarketingShell>
      <main className="px-6 py-16">
        <div className="mx-auto w-full max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-problem-500">About</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">ProblemHunt</h1>
          <p className="mt-4 text-base leading-relaxed text-text-secondary">
            ProblemHunt is a community where people share real problems and builders discover what is worth solving.
            We focus on practical pain points, clear context, and actionable feedback.
          </p>

          <section className="mt-10 space-y-4 rounded-xl border border-border-subtle bg-bg-secondary p-6">
            <h2 className="text-xl font-semibold">What we value</h2>
            <ul className="space-y-2 text-sm leading-relaxed text-text-secondary">
              <li>Clear problem statements instead of vague ideas.</li>
              <li>Constructive discussion around impact, urgency, and existing workarounds.</li>
              <li>Open discovery so builders can validate demand before building.</li>
            </ul>
          </section>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/feed"
              className="rounded-md bg-problem-500 px-4 py-2 text-sm font-medium text-white hover:bg-problem-600 transition-colors"
            >
              Browse Feed
            </Link>
            <Link
              href="/submit"
              className="rounded-md border border-border-default px-4 py-2 text-sm font-medium text-text-secondary hover:bg-bg-secondary hover:text-text-primary transition-colors"
            >
              Submit a Problem
            </Link>
          </div>
        </div>
      </main>
    </MarketingShell>
  );
}
