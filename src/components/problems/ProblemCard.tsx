'use client';

import Link from 'next/link';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { MessageCircle, Users, Bookmark } from 'lucide-react';
import { cn, formatCount, formatRelativeTime } from '@/lib/utils';
import { useVisitorId } from '@/lib/visitor';
import { useToast } from '@/components/ui/Toast';
import { StatusBadge } from '@/components/ui/Badge';
import { TagChip } from '@/components/ui/TagChip';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { UpvoteButton } from './UpvoteButton';
import type { ProblemWithMeta } from '@/types/domain';
import { ConvexError } from 'convex/values';

export interface ProblemCardProps {
  problem: ProblemWithMeta;
  variant?: 'full' | 'compact';
  index?: number;
}

export function ProblemCard({ problem, variant = 'full', index = 0 }: ProblemCardProps) {
  const toast = useToast();
  const { visitorId } = useVisitorId();
  const toggleVote = useMutation(api.votes.mutations.toggleVote);
  const toggleBookmark = useMutation(api.bookmarks.mutations.toggleBookmark);

  const handleVote = async (type: 'upvote' | 'downvote') => {
    const problemId = problem._id as Id<'problems'>;
    try {
      await toggleVote({
        problemId,
        type,
        visitorId: visitorId ?? undefined,
      });
    } catch (err) {
      if (err instanceof ConvexError) {
        toast.error(err.data as string);
      } else {
        toast.error("Couldn't register your vote. Please try again.");
      }
    }
  };

  const handleToggleSave = async () => {
    const problemId = problem._id as Id<'problems'>;
    try {
      await toggleBookmark({
        problemId,
        visitorId: visitorId ?? undefined,
      });
    } catch (err) {
      if (err instanceof ConvexError) {
        toast.error(err.data as string);
      } else {
        toast.error("Couldn't update save state. Please try again.");
      }
    }
  };

  if (variant === 'compact') {
    return (
      <Link
        href={`/p/${problem.slug}`}
        className={cn(
          'group flex items-start gap-3 px-4 py-3',
          'border-b border-border-subtle last:border-b-0',
          'hover:bg-bg-secondary transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-border-focus',
        )}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary group-hover:text-text-primary line-clamp-2">
            {problem.title}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xs text-text-muted">{problem.category}</span>
            <span className="text-2xs text-problem-500 tabular-nums">
              ↑ {formatCount(problem.voteCount)}
            </span>
            <span className="text-2xs text-text-tertiary tabular-nums">
              ↓ {formatCount(problem.downvoteCount ?? 0)}
            </span>
          </div>
        </div>
        <StatusBadge status={problem.status} showDot={false} className="flex-shrink-0" />
      </Link>
    );
  }

  // Full variant
  return (
    <article
      className={cn(
        'group relative flex gap-4 border-b border-border-subtle',
        'bg-bg-secondary hover:bg-bg-tertiary transition-colors duration-150',
        'px-5 py-5',
      )}
    >
      {/* Vote button */}
      <div className="flex-shrink-0">
        <UpvoteButton
          voteCount={problem.voteCount}
          downvoteCount={problem.downvoteCount ?? 0}
          userVoteType={problem.userVote?.type}
          onVote={handleVote}
          disabled={problem.canVote === false}
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2.5 min-w-0">
        {/* Title */}
        <Link href={`/p/${problem.slug}`} className="group/title">
          <h2
            className={cn(
              'text-base font-semibold text-text-primary leading-snug',
              'group-hover/title:text-problem-400 transition-colors duration-150',
            )}
          >
            {problem.title}
          </h2>
        </Link>

        {/* Description */}
        {problem.description && (
          <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed">
            {problem.description}
          </p>
        )}

        {/* Tags */}
        {problem.tags && problem.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {problem.tags.slice(0, 4).map((tag) =>
              tag ? (
                <Link key={tag._id} href={`/explore?tag=${tag.slug}`}>
                  <TagChip label={tag.name} />
                </Link>
              ) : null,
            )}
          </div>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-1 flex-wrap text-xs text-text-tertiary">
          {/* Author */}
          {problem.author && !problem.isAnonymous ? (
            <Link
              href={`/u/${problem.author.username}`}
              className="flex items-center gap-1.5 hover:text-text-secondary transition-colors"
            >
              <UserAvatar
                name={problem.author.name}
                avatarUrl={problem.author.avatarUrl}
                size="xs"
              />
              <span>@{problem.author.username}</span>
            </Link>
          ) : (
            <span>{problem.anonymousHandle ?? 'Anonymous'}</span>
          )}

          <span className="text-text-muted">·</span>
          <span>{formatRelativeTime(problem.createdAt)}</span>

          {problem.meTooCount > 0 && (
            <>
              <span className="text-text-muted">·</span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" strokeWidth={1.5} />
                {formatCount(problem.meTooCount)} also have this
              </span>
            </>
          )}

          {problem.commentCount > 0 && (
            <>
              <span className="text-text-muted">·</span>
              <Link
                href={`/p/${problem.slug}#comments`}
                className="flex items-center gap-1 hover:text-text-secondary transition-colors"
              >
                <MessageCircle className="h-3 w-3" strokeWidth={1.5} />
                {formatCount(problem.commentCount)}
              </Link>
            </>
          )}

          {problem.solutionCount > 0 && (
            <>
              <span className="text-text-muted">·</span>
              <span className="text-solution-500">
                {problem.solutionCount} solution{problem.solutionCount !== 1 ? 's' : ''}
              </span>
            </>
          )}

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleSave}
              className={cn(
                'inline-flex items-center gap-1 rounded-sm border px-2 py-1 transition-colors',
                problem.isBookmarked
                  ? 'border-problem-border bg-problem-dim text-problem-500'
                  : 'border-border-subtle text-text-muted hover:border-border-default hover:text-text-secondary',
              )}
              aria-label={problem.isBookmarked ? 'Unsave problem' : 'Save problem'}
            >
              <Bookmark className="h-3 w-3" strokeWidth={1.75} />
              <span>{problem.isBookmarked ? 'Saved' : 'Save'}</span>
            </button>
            <StatusBadge status={problem.status} />
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────

export function EmptyFeed() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 text-4xl">🔍</div>
      <h3 className="text-base font-semibold text-text-primary mb-2">
        No problems found
      </h3>
      <p className="text-sm text-text-secondary max-w-sm">
        Be the first to share a problem worth solving. The community is waiting.
      </p>
    </div>
  );
}
