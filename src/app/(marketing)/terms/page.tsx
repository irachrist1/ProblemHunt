import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingShell } from '@/components/layout/MarketingShell';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Basic terms governing the use of ProblemHunt.',
};

export default function TermsPage() {
  return (
    <MarketingShell>
      <main className="px-6 py-16">
        <div className="mx-auto w-full max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-problem-500">
            Terms of Service
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">Using ProblemHunt</h1>
          <p className="mt-4 text-sm leading-relaxed text-text-secondary">
            These terms describe basic rules for accessing and using ProblemHunt during the current MVP
            phase.
          </p>

          <section className="mt-10 space-y-5 rounded-xl border border-border-subtle bg-bg-secondary p-6 text-sm leading-relaxed text-text-secondary">
            <div>
              <h2 className="text-base font-semibold text-text-primary">Acceptable use</h2>
              <p className="mt-1">
                Do not post illegal content, spam, or harmful material. Respect other users.
              </p>
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary">User content</h2>
              <p className="mt-1">
                You retain ownership of your submissions and grant ProblemHunt permission to display them.
              </p>
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary">Service changes</h2>
              <p className="mt-1">Features may evolve over time as the product is improved.</p>
            </div>
          </section>

          <div className="mt-8">
            <Link
              href="/privacy"
              className="text-sm text-problem-500 hover:text-problem-400 transition-colors"
            >
              Review the Privacy Policy
            </Link>
          </div>
        </div>
      </main>
    </MarketingShell>
  );
}
