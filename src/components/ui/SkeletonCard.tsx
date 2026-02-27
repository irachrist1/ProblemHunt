import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

/** Base skeleton block with shimmer animation */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-sm bg-bg-tertiary shimmer',
        className,
      )}
      aria-hidden="true"
    />
  );
}

/** Skeleton for a problem card in the feed */
export function SkeletonCard() {
  return (
    <div
      className="flex gap-4 rounded-md border border-border-subtle bg-bg-secondary p-5"
      aria-hidden="true"
    >
      {/* Vote button skeleton */}
      <div className="flex-shrink-0">
        <Skeleton className="h-16 w-12 rounded-md" />
      </div>

      {/* Content skeleton */}
      <div className="flex flex-1 flex-col gap-3">
        {/* Title */}
        <Skeleton className="h-5 w-3/4" />
        {/* Description lines */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-5/6" />
        </div>
        {/* Tags */}
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
        {/* Meta */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

/** Skeleton for the feed — multiple cards */
export function SkeletonFeed({ count = 5 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-px" aria-label="Loading problems..." role="status">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/** Skeleton for a user profile header */
export function SkeletonProfile() {
  return (
    <div className="flex items-center gap-4 p-6" aria-hidden="true">
      <Skeleton className="h-16 w-16 rounded-full" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-48" />
      </div>
    </div>
  );
}
