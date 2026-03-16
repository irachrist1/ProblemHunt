'use client';

import { useEffect, useMemo, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import type { Id } from '../../../../convex/_generated/dataModel';
import { ProblemCard, EmptyFeed } from '@/components/problems/ProblemCard';
import { SkeletonFeed } from '@/components/ui/SkeletonCard';
import { feedItemVariants, springSmooth } from '@/lib/motion';
import { useVisitorId } from '@/lib/visitor';
import type { ProblemWithMeta } from '@/types/domain';

const FEED_RESULT_LIMIT = 20;
const FEED_CANDIDATE_LIMIT = 120;

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function tokenize(value: string): string[] {
  return normalizeText(value)
    .split(/[^a-z0-9]+/i)
    .filter(Boolean);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function computeTagOverlap(problem: ProblemWithMeta, userTags: string[]): number {
  if (userTags.length === 0) return 0;

  const problemTags = new Set(
    problem.tags
      .map((tag) => tag?.name ?? '')
      .map(normalizeText)
      .filter(Boolean),
  );
  const userTagSet = new Set(userTags.map(normalizeText).filter(Boolean));
  if (problemTags.size === 0 || userTagSet.size === 0) return 0;

  let intersection = 0;
  for (const tag of problemTags) {
    if (userTagSet.has(tag)) intersection += 1;
  }

  const union = new Set([...problemTags, ...userTagSet]).size;
  return union === 0 ? 0 : intersection / union;
}

function computeDomainMatch(category: string, interestDomains: string[]): number {
  if (interestDomains.length === 0) return 0;

  const normalizedCategory = normalizeText(category);
  if (!normalizedCategory) return 0;

  if (interestDomains.some((domain) => normalizeText(domain) === normalizedCategory)) {
    return 1;
  }

  const categoryTokens = new Set(tokenize(normalizedCategory));
  if (categoryTokens.size === 0) return 0;

  for (const domain of interestDomains) {
    const domainTokens = tokenize(domain);
    if (domainTokens.some((token) => categoryTokens.has(token))) {
      return 0.5;
    }
  }

  return 0;
}

function computeNormalizedTimeDecay(problems: ProblemWithMeta[]): Map<string, number> {
  const now = Date.now();
  const rawScores = problems.map((problem) => {
    const hoursOld = Math.max(0, (now - problem.createdAt) / (1000 * 60 * 60));
    const raw = 1 / Math.pow(hoursOld + 2, 1.5);
    return { id: String(problem._id), raw };
  });

  const values = rawScores.map(({ raw }) => raw);
  const min = Math.min(...values);
  const max = Math.max(...values);

  return new Map(
    rawScores.map(({ id, raw }) => [
      id,
      max === min ? 1 : clamp((raw - min) / (max - min), 0, 1),
    ]),
  );
}

export default function FeedPage() {
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = prefersReducedMotion ?? false;
  const { visitorId } = useVisitorId();
  const trackFeedImpressions = useMutation(api.analytics.mutations.trackFeedImpressions);
  const lastTrackedKeyRef = useRef<string>('');

  const candidateProblems = useQuery(api.problems.queries.listFeedCandidates, {
    limit: FEED_CANDIDATE_LIMIT,
    visitorId: visitorId ?? undefined,
  });
  const feedPreferences = useQuery(api.users.queries.getFeedPreferences, {});

  const preferenceKey =
    feedPreferences === undefined
      ? 'loading'
      : feedPreferences === null
      ? 'anonymous'
      : `${feedPreferences.techStackTags.join('|')}::${feedPreferences.interestDomains.join('|')}`;

  const problems = useMemo(() => {
    if (!candidateProblems || feedPreferences === undefined) return undefined;

    const timeDecayScores = computeNormalizedTimeDecay(candidateProblems as ProblemWithMeta[]);

    return (candidateProblems as ProblemWithMeta[])
      .map((problem) => {
        const severityScore = clamp((problem.impactRating - 1) / 4, 0, 1);
        const timeDecay = timeDecayScores.get(String(problem._id)) ?? 0;

        if (feedPreferences) {
          const tagOverlap = computeTagOverlap(problem, feedPreferences.techStackTags);
          const domainMatch = computeDomainMatch(problem.category, feedPreferences.interestDomains);
          const recommendationScore =
            tagOverlap * 0.4 +
            domainMatch * 0.3 +
            severityScore * 0.2 +
            timeDecay * 0.1;
          const matchPercentage = Math.round(((tagOverlap + domainMatch) / 2) * 100);

          return {
            ...problem,
            recommendationScore,
            matchPercentage: matchPercentage > 50 ? matchPercentage : null,
          };
        }

        return {
          ...problem,
          recommendationScore: problem.voteCount * 0.6 + severityScore * 0.3 + timeDecay * 0.1,
          matchPercentage: null,
        };
      })
      .sort((a, b) => (b.recommendationScore ?? 0) - (a.recommendationScore ?? 0))
      .slice(0, FEED_RESULT_LIMIT);
  }, [candidateProblems, feedPreferences, preferenceKey]);

  useEffect(() => {
    if (!problems || problems.length === 0) return;
    const ids = problems.slice(0, FEED_RESULT_LIMIT).map((problem) => problem._id);
    const key = ids.join(',');
    if (lastTrackedKeyRef.current === key) return;
    lastTrackedKeyRef.current = key;

    void trackFeedImpressions({
      problemIds: ids as Id<'problems'>[],
      visitorId: visitorId ?? undefined,
      source: 'feed',
    });
  }, [problems, trackFeedImpressions, visitorId]);

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 z-10 border-b border-border-subtle bg-bg-primary px-5 py-3">
        <p className="text-sm font-medium text-text-primary">
          {feedPreferences ? 'Recommended for you' : 'Popular problems'}
        </p>
        <p className="mt-1 text-xs text-text-muted">
          {feedPreferences
            ? 'Ranked from your saved tags, domain affinity, severity, and freshness.'
            : 'Ranked from votes, severity, and freshness.'}
        </p>
      </div>

      <div className="divide-y-0">
        {problems === undefined ? (
          <SkeletonFeed count={8} />
        ) : problems.length === 0 ? (
          <EmptyFeed />
        ) : (
          <div>
            {problems.map((problem, i) => (
              <motion.div
                key={problem._id}
                layout
                custom={i}
                initial={reducedMotion ? false : 'hidden'}
                whileInView={reducedMotion ? undefined : 'visible'}
                viewport={{ once: true, amount: 0.18, margin: '0px 0px -8% 0px' }}
                variants={feedItemVariants}
                transition={springSmooth}
                style={{ willChange: reducedMotion ? 'auto' : 'transform, opacity, filter' }}
              >
                <ProblemCard problem={problem} index={i} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
