import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingShell } from '@/components/layout/MarketingShell';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How ProblemHunt handles account data, usage information, and communications.',
};

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <main className="px-6 py-16">
        <div className="mx-auto w-full max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-problem-500">
            Privacy Policy
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">Your data on ProblemHunt</h1>
          <p className="mt-4 text-sm leading-relaxed text-text-secondary">
            This is a lightweight policy page for the MVP. We collect account information and activity
            needed to run the product, improve reliability, and prevent abuse.
          </p>

          <section className="mt-10 space-y-5 rounded-xl border border-border-subtle bg-bg-secondary p-6 text-sm leading-relaxed text-text-secondary">
            <div>
              <h2 className="text-base font-semibold text-text-primary">Information we store</h2>
              <p className="mt-1">
                Profile details, submitted problems, comments, votes, and notification preferences.
              </p>
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary">How we use it</h2>
              <p className="mt-1">
                To operate core features, personalize feeds, and maintain platform safety.
              </p>
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary">Contact</h2>
              <p className="mt-1">
                For privacy questions, contact the ProblemHunt team through the support channel.
              </p>
            </div>
          </section>

          <div className="mt-8">
            <Link
              href="/terms"
              className="text-sm text-problem-500 hover:text-problem-400 transition-colors"
            >
              Read the Terms of Service
            </Link>
          </div>
        </div>
      </main>
    </MarketingShell>
  );
}
