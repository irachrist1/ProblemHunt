import { cn } from '@/lib/utils';
import type { ProblemStatus } from '@/types/domain';

// ─── Generic Badge ────────────────────────────────────────────────────────

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'problem' | 'solution' | 'error' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-xs px-2 py-0.5',
        'text-2xs font-medium',

        variant === 'default' && 'bg-bg-overlay text-text-tertiary',
        variant === 'problem' && 'bg-problem-dim text-problem-400 border border-problem-border',
        variant === 'solution' && 'bg-solution-dim text-solution-500 border border-solution-border',
        variant === 'error' && 'bg-error-dim text-error',
        variant === 'info' && 'bg-sky-500/10 text-sky-400',

        className,
      )}
    >
      {children}
    </span>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  ProblemStatus,
  { label: string; dotColor: string; bgColor: string; textColor: string }
> = {
  open:      { label: 'Open',      dotColor: 'bg-status-open',      bgColor: 'bg-status-open/10',      textColor: 'text-status-open' },
  exploring: { label: 'Exploring', dotColor: 'bg-status-exploring', bgColor: 'bg-status-exploring/10', textColor: 'text-status-exploring' },
  proposed:  { label: 'Proposed',  dotColor: 'bg-status-proposed',  bgColor: 'bg-status-proposed/10',  textColor: 'text-status-proposed' },
  exists:    { label: 'Exists',    dotColor: 'bg-status-exists',    bgColor: 'bg-status-exists/10',    textColor: 'text-status-exists' },
  solved:    { label: 'Solved',    dotColor: 'bg-status-solved',    bgColor: 'bg-status-solved/10',    textColor: 'text-status-solved' },
};

export interface StatusBadgeProps {
  status: ProblemStatus;
  showDot?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  showDot = true,
  className,
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1',
        'text-2xs font-medium',
        config.bgColor,
        config.textColor,
        className,
      )}
    >
      {showDot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full', config.dotColor)}
          aria-hidden="true"
        />
      )}
      {config.label}
    </span>
  );
}
