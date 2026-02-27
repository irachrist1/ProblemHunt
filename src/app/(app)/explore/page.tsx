'use client';

import { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVisitorId } from '@/lib/visitor';
import { PROBLEM_CATEGORIES } from '@/lib/constants';
import { ProblemCard, EmptyFeed } from '@/components/problems/ProblemCard';
import { SkeletonFeed } from '@/components/ui/SkeletonCard';
import type { ProblemWithMeta } from '@/types/domain';

export default function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const { visitorId } = useVisitorId();

  const problems = useQuery(
    searchQuery.length > 2
      ? api.problems.queries.search
      : api.problems.queries.list,
    searchQuery.length > 2
      ? { query: searchQuery, category: selectedCategory, visitorId: visitorId ?? undefined }
      : { sort: 'hot' as const, category: selectedCategory, visitorId: visitorId ?? undefined },
  );

  return (
    <div className="min-h-screen py-6">
      <div className="mx-auto w-full max-w-5xl">
        {/* Search + filters panel */}
        <div className="rounded-lg border border-border-subtle bg-bg-secondary/40 p-4 md:p-5">
          <h1 className="mb-4 text-xl font-semibold text-text-primary">Explore</h1>

          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted"
              strokeWidth={1.5}
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problems by keyword, pain point, or category..."
              className={cn(
                'h-11 w-full rounded-md pl-9 pr-3 text-sm',
                'bg-bg-input border border-border-default text-text-primary',
                'placeholder:text-text-muted',
                'focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-border-focus',
                'transition-colors duration-150',
              )}
            />
          </div>

          <div className="my-4 h-px w-full bg-border-subtle" />

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(undefined)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
                !selectedCategory
                  ? 'bg-problem-dim border border-problem-border text-problem-500'
                  : 'bg-bg-tertiary text-text-tertiary hover:bg-bg-overlay hover:text-text-secondary',
              )}
            >
              All
            </button>
            {PROBLEM_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === cat.label ? undefined : cat.label,
                  )
                }
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
                  selectedCategory === cat.label
                    ? 'bg-problem-dim border border-problem-border text-problem-500'
                    : 'bg-bg-tertiary text-text-tertiary hover:bg-bg-overlay hover:text-text-secondary',
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

      {/* Results */}
      <div className="mt-6 overflow-hidden rounded-lg border border-border-subtle">
        {problems === undefined ? (
          <SkeletonFeed count={6} />
        ) : problems.length === 0 ? (
          <EmptyFeed />
        ) : (
          (problems as ProblemWithMeta[]).map((problem, i) => (
            <ProblemCard key={problem._id} problem={problem} index={i} />
          ))
        )}
      </div>
      </div>
    </div>
  );
}
