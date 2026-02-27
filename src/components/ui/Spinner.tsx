import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const SIZE_CONFIG = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export function Spinner({ size = 'md', className, label = 'Loading...' }: SpinnerProps) {
  return (
    <span role="status" aria-label={label} className="inline-flex">
      <Loader2
        className={cn('animate-spin text-text-tertiary', SIZE_CONFIG[size], className)}
        strokeWidth={1.5}
        aria-hidden="true"
      />
    </span>
  );
}

/** Full-page centered spinner */
export function PageSpinner() {
  return (
    <div className="flex h-full min-h-64 items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
