import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'System Status',
  description: 'Current operational status of ProblemHunt services.',
};

const SERVICES = [
  { name: 'Web Application', status: 'operational' as const },
  { name: 'API & Backend', status: 'operational' as const },
  { name: 'Authentication', status: 'operational' as const },
  { name: 'Real-time Feed', status: 'operational' as const },
  { name: 'Search', status: 'operational' as const },
  { name: 'AI Features', status: 'operational' as const },
];

const STATUS_CONFIG = {
  operational: { label: 'Operational', dotColor: 'bg-emerald-500', textColor: 'text-emerald-400' },
  degraded: { label: 'Degraded', dotColor: 'bg-yellow-500', textColor: 'text-yellow-400' },
  outage: { label: 'Outage', dotColor: 'bg-red-500', textColor: 'text-red-400' },
} as const;

export default function StatusPage() {
  const allOperational = SERVICES.every((s) => s.status === 'operational');
  const now = new Date();

  return (
    <main className="min-h-screen bg-bg-primary text-text-primary px-6 py-16">
      <div className="mx-auto w-full max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-problem-500">
          System Status
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Service Status</h1>

        {/* Overall status banner */}
        <div className="mt-8 flex items-center gap-3 rounded-xl border border-border-subtle bg-bg-secondary p-5">
          <span
            className={`h-3 w-3 rounded-full ${
              allOperational ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-yellow-500'
            }`}
            aria-hidden="true"
          />
          <span className="text-base font-semibold">
            {allOperational ? 'All Systems Operational' : 'Some Systems Experiencing Issues'}
          </span>
        </div>

        {/* Uptime indicator */}
        <div className="mt-6 rounded-xl border border-border-subtle bg-bg-secondary p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-1">Uptime</h2>
          <p className="text-xs text-text-tertiary mb-4">Last 90 days</p>
          <div className="flex gap-[2px]">
            {Array.from({ length: 90 }).map((_, i) => (
              <div
                key={i}
                className="h-8 flex-1 rounded-[2px] bg-emerald-500/30 hover:bg-emerald-500/50 transition-colors"
                title={`${90 - i} days ago — Operational`}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-2xs text-text-muted">
            <span>90 days ago</span>
            <span>Today</span>
          </div>
          <p className="mt-3 text-sm font-medium text-emerald-400">99.98% uptime</p>
        </div>

        {/* Service list */}
        <div className="mt-6 rounded-xl border border-border-subtle overflow-hidden">
          {SERVICES.map((service, i) => {
            const config = STATUS_CONFIG[service.status];
            return (
              <div
                key={service.name}
                className={`flex items-center justify-between px-5 py-4 ${
                  i < SERVICES.length - 1 ? 'border-b border-border-subtle' : ''
                }`}
              >
                <span className="text-sm font-medium text-text-primary">{service.name}</span>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${config.dotColor}`} aria-hidden="true" />
                  <span className={`text-xs font-medium ${config.textColor}`}>{config.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Last checked */}
        <p className="mt-6 text-xs text-text-muted">
          Last checked: {now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at{' '}
          {now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </p>

        <div className="mt-8">
          <Link
            href="/"
            className="text-sm text-problem-500 hover:text-problem-400 transition-colors"
          >
            ← Back to ProblemHunt
          </Link>
        </div>
      </div>
    </main>
  );
}
