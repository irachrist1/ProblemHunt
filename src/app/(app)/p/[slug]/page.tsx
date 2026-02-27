'use client';

import { use, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MessageCircle, Users, Calendar, ArrowLeft, Bookmark } from 'lucide-react';
import { formatRelativeTime, formatCount } from '@/lib/utils';
import { useVisitorId } from '@/lib/visitor';
import { pushRecentProblem } from '@/lib/recentProblems';
import { UpvoteButton } from '@/components/problems/UpvoteButton';
import { StatusBadge } from '@/components/ui/Badge';
import { TagChip } from '@/components/ui/TagChip';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { useToast } from '@/components/ui/Toast';
import type { ProblemWithMeta } from '@/types/domain';
import { ConvexError } from 'convex/values';

interface Props {
  params: Promise<{ slug: string }>;
}

export default function ProblemDetailPage({ params }: Props) {
  const { slug } = use(params);
  const { visitorId } = useVisitorId();
  const problem = useQuery(api.problems.queries.getBySlug, { slug, visitorId: visitorId ?? undefined });
  const toggleVote = useMutation(api.votes.mutations.toggleVote);
  const toggleBookmark = useMutation(api.bookmarks.mutations.toggleBookmark);
  const toast = useToast();

  useEffect(() => {
    if (!problem || problem === null) return;
    pushRecentProblem({
      slug: problem.slug,
      title: problem.title,
      category: problem.category,
    });
  }, [problem, problem?._id, problem?.slug, problem?.title, problem?.category]);

  if (problem === undefined) {
    return (
      <div className="px-5 py-6">
        <SkeletonCard />
      </div>
    );
  }

  if (problem === null) {
    notFound();
  }

  const p = problem as ProblemWithMeta;

  const handleVote = async (type: 'upvote' | 'downvote') => {
    const problemId = p._id as Id<'problems'>;
    try {
      await toggleVote({ problemId, type, visitorId: visitorId ?? undefined });
    } catch (err) {
      if (err instanceof ConvexError) {
        toast.error(err.data as string);
      } else {
        toast.error("Couldn't register your vote.");
      }
    }
  };

  const handleToggleSave = async () => {
    const problemId = p._id as Id<'problems'>;
    try {
      await toggleBookmark({
        problemId,
        visitorId: visitorId ?? undefined,
      });
    } catch (err) {
      if (err instanceof ConvexError) {
        toast.error(err.data as string);
      } else {
        toast.error("Couldn't update save state.");
      }
    }
  };

  return (
    <div className="min-h-screen">
      {/* Back button */}
      <div className="border-b border-border-subtle px-5 py-3">
        <Link
          href="/feed"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          Back to feed
        </Link>
      </div>

      {/* Problem header */}
      <div className="px-5 py-6">
        <div className="flex gap-4">
          {/* Vote */}
          <div className="flex-shrink-0">
            <UpvoteButton
              voteCount={p.voteCount}
              downvoteCount={p.downvoteCount ?? 0}
              userVoteType={p.userVote?.type}
              onVote={handleVote}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Status + category */}
            <div className="mb-3 flex items-center gap-2">
              <StatusBadge status={p.status} />
              <span className="text-xs text-text-tertiary">{p.category}</span>
              <button
                type="button"
                onClick={handleToggleSave}
                className="ml-auto inline-flex items-center gap-1 rounded-sm border border-border-subtle px-2 py-1 text-xs text-text-muted transition-colors hover:border-border-default hover:text-text-secondary"
                aria-label={p.isBookmarked ? 'Unsave problem' : 'Save problem'}
              >
                <Bookmark
                  className="h-3 w-3"
                  strokeWidth={1.75}
                  fill={p.isBookmarked ? 'currentColor' : 'none'}
                />
                {p.isBookmarked ? 'Saved' : 'Save'}
              </button>
            </div>

            {/* Title */}
            <h1 className="text-xl font-semibold text-text-primary leading-snug mb-3">
              {p.title}
            </h1>

            {/* Description */}
            <div className="prose prose-sm prose-invert max-w-none mb-4">
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                {p.description}
              </p>
            </div>

            {/* Workarounds */}
            {p.workarounds && (
              <div className="rounded-md border border-border-subtle bg-bg-tertiary px-4 py-3 mb-4">
                <p className="text-xs font-medium text-text-tertiary mb-1">Current workarounds</p>
                <p className="text-sm text-text-secondary leading-relaxed">{p.workarounds}</p>
              </div>
            )}

            {/* Tags */}
            {p.tags && p.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {p.tags.map((tag) =>
                  tag ? (
                    <Link key={tag._id} href={`/explore?tag=${tag.slug}`}>
                      <TagChip label={tag.name} />
                    </Link>
                  ) : null,
                )}
              </div>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-text-tertiary">
              {/* Author */}
              {p.author && !p.isAnonymous ? (
                <Link
                  href={`/u/${p.author.username}`}
                  className="flex items-center gap-1.5 hover:text-text-secondary transition-colors"
                >
                  <UserAvatar name={p.author.name} avatarUrl={p.author.avatarUrl} size="xs" />
                  @{p.author.username}
                </Link>
              ) : (
                <span>{p.anonymousHandle ?? 'Anonymous'}</span>
              )}

              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" strokeWidth={1.5} />
                {formatRelativeTime(p.createdAt)}
              </span>

              {p.meTooCount > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" strokeWidth={1.5} />
                  {formatCount(p.meTooCount)} also have this
                </span>
              )}

              <span className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" strokeWidth={1.5} />
                {formatCount(p.commentCount)} comments
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Comments section placeholder */}
      <div id="comments" className="border-t border-border-subtle px-5 py-6">
        <h2 className="text-sm font-semibold text-text-primary mb-4">
          Discussion ({p.commentCount})
        </h2>
        <p className="text-sm text-text-tertiary">
          Comments coming soon...
        </p>
      </div>
    </div>
  );
}
