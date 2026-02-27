'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { TrendingUp, ArrowUpRight, Clock, Bookmark, ThumbsUp } from 'lucide-react';
import { api } from '../../../convex/_generated/api';
import { cn, formatCount } from '@/lib/utils';
import { useVisitorId } from '@/lib/visitor';
import { listRecentProblems } from '@/lib/recentProblems';
import type { LikedProblemItem, RecentProblemItem, SavedProblemItem } from '@/types/domain';

interface TrendingProblem {
  _id: string;
  title: string;
  slug: string;
  voteCount: number;
  meTooCount: number;
  category: string;
}

interface RightPanelProps {
  trendingProblems?: TrendingProblem[];
}

type MyWindowTab = 'liked' | 'saved' | 'recent';

function MyWindowListItem({
  href,
  title,
  category,
  rightText,
}: {
  href: string;
  title: string;
  category: string;
  rightText: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className={cn(
          'group flex items-start gap-2 rounded-md px-3 py-2',
          'hover:bg-bg-secondary transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
        )}
      >
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-xs font-medium text-text-secondary group-hover:text-text-primary transition-colors">
            {title}
          </p>
          <p className="mt-1 text-2xs text-text-muted">{category}</p>
        </div>
        <span className="shrink-0 text-2xs text-text-tertiary tabular-nums">{rightText}</span>
      </Link>
    </li>
  );
}

export function RightPanel({ trendingProblems = [] }: RightPanelProps) {
  const currentYear = new Date().getFullYear();
  const { visitorId } = useVisitorId();
  const [activeTab, setActiveTab] = useState<MyWindowTab>('liked');
  const [recentProblems, setRecentProblems] = useState<RecentProblemItem[]>([]);

  const liked = useQuery(
    api.votes.queries.listLiked,
    activeTab === 'liked'
      ? { visitorId: visitorId ?? undefined, limit: 20 }
      : 'skip',
  );

  const saved = useQuery(
    api.bookmarks.queries.listSaved,
    activeTab === 'saved'
      ? { visitorId: visitorId ?? undefined, limit: 20 }
      : 'skip',
  );

  useEffect(() => {
    setRecentProblems(listRecentProblems());
  }, [visitorId]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'ph_recent_problems') {
        setRecentProblems(listRecentProblems());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const likedItems = useMemo(
    () => (liked ?? []) as LikedProblemItem[],
    [liked],
  );
  const savedItems = useMemo(
    () => (saved ?? []) as SavedProblemItem[],
    [saved],
  );

  return (
    <aside className="flex h-full flex-col gap-6 px-4 py-6">
      <div className="rounded-lg border border-border-default bg-bg-secondary p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">My Window</h3>
        </div>

        <div className="mb-3 grid grid-cols-3 gap-1 rounded-md bg-bg-primary p-1">
          <button
            type="button"
            onClick={() => setActiveTab('liked')}
            className={cn(
              'inline-flex items-center justify-center gap-1 rounded-sm px-2 py-1.5 text-2xs font-medium transition-colors',
              activeTab === 'liked'
                ? 'bg-bg-tertiary text-text-primary'
                : 'text-text-tertiary hover:text-text-secondary',
            )}
          >
            <ThumbsUp className="h-3 w-3" strokeWidth={1.75} />
            Liked
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={cn(
              'inline-flex items-center justify-center gap-1 rounded-sm px-2 py-1.5 text-2xs font-medium transition-colors',
              activeTab === 'saved'
                ? 'bg-bg-tertiary text-text-primary'
                : 'text-text-tertiary hover:text-text-secondary',
            )}
          >
            <Bookmark className="h-3 w-3" strokeWidth={1.75} />
            Saved
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('recent')}
            className={cn(
              'inline-flex items-center justify-center gap-1 rounded-sm px-2 py-1.5 text-2xs font-medium transition-colors',
              activeTab === 'recent'
                ? 'bg-bg-tertiary text-text-primary'
                : 'text-text-tertiary hover:text-text-secondary',
            )}
          >
            <Clock className="h-3 w-3" strokeWidth={1.75} />
            Recent
          </button>
        </div>

        {activeTab === 'liked' && liked === undefined ? (
          <p className="px-1 py-4 text-center text-xs text-text-muted">Loading liked problems...</p>
        ) : activeTab === 'saved' && saved === undefined ? (
          <p className="px-1 py-4 text-center text-xs text-text-muted">Loading saved problems...</p>
        ) : activeTab === 'liked' ? (
          likedItems.length > 0 ? (
            <ul className="flex flex-col gap-1">
              {likedItems.map((item) => (
                <MyWindowListItem
                  key={item._id}
                  href={`/p/${item.slug}`}
                  title={item.title}
                  category={item.category}
                  rightText={`↑ ${formatCount(item.voteCount)}`}
                />
              ))}
            </ul>
          ) : (
            <p className="px-1 py-4 text-center text-xs text-text-muted">
              No liked problems yet. Upvote to track ideas.
            </p>
          )
        ) : activeTab === 'saved' ? (
          savedItems.length > 0 ? (
            <ul className="flex flex-col gap-1">
              {savedItems.map((item) => (
                <MyWindowListItem
                  key={item._id}
                  href={`/p/${item.slug}`}
                  title={item.title}
                  category={item.category}
                  rightText="Saved"
                />
              ))}
            </ul>
          ) : (
            <p className="px-1 py-4 text-center text-xs text-text-muted">
              No saved problems yet. Use Save on cards/details.
            </p>
          )
        ) : recentProblems.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {recentProblems.map((item) => (
              <MyWindowListItem
                key={item.slug}
                href={`/p/${item.slug}`}
                title={item.title}
                category={item.category}
                rightText="Recent"
              />
            ))}
          </ul>
        ) : (
          <p className="px-1 py-4 text-center text-xs text-text-muted">
            No recent views yet. Open a problem to populate this list.
          </p>
        )}
      </div>

      {/* Trending section */}
      {trendingProblems.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2 px-1">
            <TrendingUp className="h-3.5 w-3.5 text-problem-500" strokeWidth={1.5} />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              Trending
            </h3>
          </div>
          <ul className="flex flex-col gap-px">
            {trendingProblems.map((problem, index) => (
              <li key={problem._id}>
                <Link
                  href={`/p/${problem.slug}`}
                  className={cn(
                    'group flex items-start gap-3 rounded-md px-3 py-2.5',
                    'hover:bg-bg-secondary transition-colors duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
                  )}
                >
                  <span className="mt-0.5 w-4 flex-shrink-0 text-xs font-medium tabular-nums text-text-muted">
                    {index + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-xs font-medium text-text-secondary transition-colors group-hover:text-text-primary">
                      {problem.title}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-2xs text-text-muted">{problem.category}</span>
                      <span className="text-2xs text-text-muted">·</span>
                      <span className="tabular-nums text-2xs text-problem-500">
                        {formatCount(problem.voteCount + problem.meTooCount)} votes
                      </span>
                    </div>
                  </div>

                  <ArrowUpRight
                    className="mt-0.5 h-3 w-3 flex-shrink-0 text-text-muted opacity-0 transition-opacity group-hover:opacity-100"
                    strokeWidth={1.5}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-auto">
        <div className="flex flex-wrap gap-x-3 gap-y-1 px-1">
          {[
            { label: 'About', href: '/about' },
            { label: 'Privacy', href: '/privacy' },
            { label: 'Terms', href: '/terms' },
          ].map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-2xs text-text-muted transition-colors hover:text-text-tertiary"
            >
              {label}
            </Link>
          ))}
        </div>
        <p className="mt-2 px-1 text-2xs text-text-muted">
          © {currentYear} ProblemHunt
        </p>
      </div>
    </aside>
  );
}
