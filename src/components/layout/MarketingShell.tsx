import Link from 'next/link';

function MarketingNav() {
  return (
    <nav className="sticky top-0 z-50 flex h-14 items-center border-b border-border-subtle bg-bg-primary px-6">
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-problem-500 flex items-center justify-center">
            <span className="text-xs font-bold text-white">P</span>
          </div>
          <span className="text-sm font-semibold text-text-primary">ProblemHunt</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/explore"
            className="text-xs text-text-tertiary hover:text-text-primary transition-colors"
          >
            Explore
          </Link>
          <Link
            href="/feed"
            className="text-xs text-text-tertiary hover:text-text-primary transition-colors"
          >
            Feed
          </Link>
          <Link
            href="/auth/sign-in"
            className="text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </nav>
  );
}

function MarketingFooter() {
  return (
    <footer className="border-t border-border-subtle bg-bg-primary px-6 py-8">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-text-muted">
          © {new Date().getFullYear()} ProblemHunt. All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-xs text-text-muted">
          <Link href="/about" className="hover:text-text-secondary transition-colors">
            About
          </Link>
          <Link href="/privacy" className="hover:text-text-secondary transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-text-secondary transition-colors">
            Terms
          </Link>
          <Link href="/contact" className="hover:text-text-secondary transition-colors">
            Contact
          </Link>
          <Link href="/status" className="hover:text-text-secondary transition-colors">
            Status
          </Link>
        </div>
      </div>
    </footer>
  );
}

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
      <MarketingNav />
      <div className="flex-1">{children}</div>
      <MarketingFooter />
    </div>
  );
}
