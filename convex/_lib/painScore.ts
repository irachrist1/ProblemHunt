/**
 * Pain score calculation — the primary ranking signal for the hot feed.
 * Higher is better. Decays over time.
 */
export function calculatePainScore(params: {
  voteCount: number;
  downvoteCount?: number;
  meTooCount: number;
  avgImpactRating: number;
  commentCount: number;
  solutionCount: number;
  createdAt: number;
  authorReputationLevel: string;
}): number {
  const {
    voteCount,
    downvoteCount = 0,
    meTooCount,
    avgImpactRating,
    commentCount,
    solutionCount,
    createdAt,
    authorReputationLevel,
  } = params;

  const ageHours = (Date.now() - createdAt) / (1000 * 60 * 60);
  const decayFactor = Math.pow(ageHours + 2, 1.5);

  const reputationMultiplier: Record<string, number> = {
    newcomer:    1.0,
    contributor: 1.1,
    finder:      1.2,
    expert:      1.35,
    legend:      1.5,
  };
  const multiplier = reputationMultiplier[authorReputationLevel] ?? 1.0;

  const effectiveVoteSignal = Math.max(0, voteCount - downvoteCount);
  const rawScore =
    effectiveVoteSignal * 1.0 +
    meTooCount * 2.5 +
    avgImpactRating * meTooCount * 0.8 +
    commentCount * 0.3 +
    solutionCount * 0.5;

  return (rawScore * multiplier) / decayFactor;
}

/**
 * Computes a new pain score given the current problem state after a vote change.
 * avgImpactRating is calculated from me_too votes' impact ratings.
 */
export function computeUpdatedPainScore(params: {
  voteCount: number;
  downvoteCount?: number;
  meTooCount: number;
  meTooImpactSum: number;
  commentCount: number;
  solutionCount: number;
  createdAt: number;
  authorReputationLevel: string;
}): number {
  const { meTooCount, meTooImpactSum } = params;
  const avgImpactRating = meTooCount > 0 ? meTooImpactSum / meTooCount : 3; // default to mid-range

  return calculatePainScore({
    ...params,
    avgImpactRating,
  });
}

/**
 * Computes a hot-feed score used for feed composition.
 * This score keeps long-term quality signals (painScore) while adding
 * a bounded freshness lift and recent activity signal.
 */
export function computeHotFeedScore(params: {
  painScore: number;
  voteCount: number;
  downvoteCount?: number;
  meTooCount: number;
  commentCount: number;
  solutionCount: number;
  createdAt: number;
  lastActivityAt: number;
  boostUntil?: number;
  now?: number;
}): number {
  const now = params.now ?? Date.now();
  const downvotes = params.downvoteCount ?? 0;
  const ageHours = (now - params.createdAt) / (1000 * 60 * 60);
  const hoursSinceActivity = (now - params.lastActivityAt) / (1000 * 60 * 60);

  const netVotes = Math.max(0, params.voteCount - downvotes);
  const engagement =
    params.meTooCount * 1.8 +
    params.commentCount * 0.35 +
    params.solutionCount * 0.5;
  const activityBoost = Math.max(0, 24 - Math.max(0, hoursSinceActivity)) * 0.06;

  const effectiveBoostUntil = params.boostUntil ?? params.createdAt + 24 * 60 * 60 * 1000;
  const freshnessBoost = now <= effectiveBoostUntil ? 2.0 : 0;
  const decay = Math.pow(ageHours + 2, 1.2);

  const raw =
    params.painScore * 0.75 +
    netVotes * 0.9 +
    engagement +
    activityBoost +
    freshnessBoost;

  return Math.max(0, raw / decay);
}
