import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingShell } from '@/components/layout/MarketingShell';

export const metadata: Metadata = {
  title: 'Contact ProblemHunt',
  description: 'Get in touch with the ProblemHunt team.',
};

export default function ContactPage() {
  return (
    <MarketingShell>
      <main className="px-6 py-16">
        <div className="mx-auto w-full max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-problem-500">Contact</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">Talk to the ProblemHunt team</h1>
          <p className="mt-4 text-sm leading-relaxed text-text-secondary">
            For product feedback, partnership questions, or support, email{' '}
            <a
              className="text-problem-500 transition-colors hover:text-problem-400"
              href="mailto:hello@problemhunt.dev"
            >
              hello@problemhunt.dev
            </a>
            .
          </p>

          <section className="mt-10 space-y-5 rounded-xl border border-border-subtle bg-bg-secondary p-6 text-sm leading-relaxed text-text-secondary">
            <div>
              <h2 className="text-base font-semibold text-text-primary">Product feedback</h2>
              <p className="mt-1">
                Share what feels broken, what feels promising, and what problems you want surfaced next.
              </p>
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary">Support</h2>
              <p className="mt-1">
                Include the page you were using and any relevant screenshots so issues can be reproduced
                quickly.
              </p>
            </div>
          </section>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/feed"
              className="rounded-md bg-problem-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-problem-600"
            >
              Browse Feed
            </Link>
            <Link
              href="/about"
              className="rounded-md border border-border-default px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-secondary hover:text-text-primary"
            >
              About ProblemHunt
            </Link>
          </div>
        </div>
      </main>
    </MarketingShell>
  );
}
