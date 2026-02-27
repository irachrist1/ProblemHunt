'use client';

import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import type { Id } from '../../../../convex/_generated/dataModel';
import { ProblemCard, EmptyFeed } from '@/components/problems/ProblemCard';
import { SkeletonFeed } from '@/components/ui/SkeletonCard';
import { cn } from '@/lib/utils';
import { useVisitorId } from '@/lib/visitor';
import { FEED_SORT_OPTIONS } from '@/lib/constants';
import type { FeedSort, ProblemWithMeta } from '@/types/domain';

export default function FeedPage() {
  const [sort, setSort] = useState<FeedSort>('hot');
  const [category] = useState<string | undefined>();
  const { visitorId } = useVisitorId();
  const trackFeedImpressions = useMutation(api.analytics.mutations.trackFeedImpressions);
  const lastTrackedKeyRef = useRef<string>('');

  const problems = useQuery(api.problems.queries.list, {
    sort,
    category,
    visitorId: visitorId ?? undefined,
  });

  useEffect(() => {
    if (!problems || problems.length === 0) return;
    const ids = (problems as ProblemWithMeta[]).slice(0, 20).map((problem) => problem._id);
    const key = `${sort}:${category ?? 'all'}:${ids.join(',')}`;
    if (lastTrackedKeyRef.current === key) return;
    lastTrackedKeyRef.current = key;

    void trackFeedImpressions({
      problemIds: ids as Id<'problems'>[],
      visitorId: visitorId ?? undefined,
      source: 'feed',
    });
  }, [category, problems, sort, trackFeedImpressions, visitorId]);

  return (
    <div className="min-h-screen">
      {/* Feed header — sort tabs */}
      <div className="sticky top-0 z-10 flex items-center gap-1 border-b border-border-subtle bg-bg-primary/90 backdrop-blur-sm px-5 py-3">
        {FEED_SORT_OPTIONS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setSort(value as FeedSort)}
            className={cn(
              'rounded-sm px-3 py-1.5 text-sm font-medium transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
              sort === value
                ? 'bg-bg-tertiary text-text-primary'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Feed content */}
      <div className="divide-y-0">
        {problems === undefined ? (
          // Loading state
          <SkeletonFeed count={8} />
        ) : problems.length === 0 ? (
          // Empty state
          <EmptyFeed />
        ) : (
          // Problem list
          <div>
            {(problems as ProblemWithMeta[]).map((problem, i) => (
              <ProblemCard key={problem._id} problem={problem} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
