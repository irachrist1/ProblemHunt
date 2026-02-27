/**
 * Domain types — enriched types for UI, extending Convex-generated base types.
 * Import base types from convex/_generated/dataModel.
 *
 * NOTE: Convex-generated types (Doc, Id) come from convex/_generated/dataModel.
 * These enriched types extend the base types with joined/computed data for UI.
 */

// Re-export Convex ID type for use in components
export type { Id } from '../../convex/_generated/dataModel';

// ─── Base types (aliased from Convex-generated) ───────────────────────────

export type ProblemStatus = 'open' | 'exploring' | 'proposed' | 'exists' | 'solved';
export type ProblemVisibility = 'public' | 'workspace' | 'anonymous';
export type ProblemFrequency = 'daily' | 'weekly' | 'monthly' | 'rarely';
export type VoteType = 'upvote' | 'downvote' | 'me_too';
export type ReputationLevel = 'newcomer' | 'contributor' | 'finder' | 'expert' | 'legend';
export type CommentReactionEmoji = 'thumbsUp' | 'bulb' | 'heart';

// ─── Author stub (used in enriched types) ────────────────────────────────

export interface AuthorStub {
  _id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  reputationLevel?: ReputationLevel;
}

// ─── Tag ─────────────────────────────────────────────────────────────────

export interface Tag {
  _id: string;
  name: string;
  slug: string;
  category?: string;
  problemCount: number;
  color?: string;
  createdAt: number;
}

// ─── Vote ────────────────────────────────────────────────────────────────

export interface Vote {
  _id: string;
  problemId: string;
  userId: string;
  type: VoteType;
  impactRating?: number;
  createdAt: number;
}

// ─── Problem (base) ──────────────────────────────────────────────────────

export interface Problem {
  _id: string;
  title: string;
  description: string;
  workarounds?: string;
  category: string;
  audience: string[];
  frequency: ProblemFrequency;
  impactRating: number;
  status: ProblemStatus;
  visibility: ProblemVisibility;
  orgId?: string;
  authorId: string;
  isAnonymous: boolean;
  anonymousHandle?: string;
  painScore: number;
  voteCount: number;
  downvoteCount: number;
  meTooCount: number;
  commentCount: number;
  solutionCount: number;
  clarityScore?: number;
  aiTags?: string[];
  aiAudienceEstimate?: string;
  slug: string;
  createdAt: number;
  updatedAt: number;
  lastActivityAt: number;
}

// ─── Enriched problem (with joined data for UI) ──────────────────────────

export interface ProblemWithMeta extends Problem {
  author: AuthorStub | null;
  tags: (Tag | null)[];
  userVote: Vote | null;
  isBookmarked: boolean;
  canVote?: boolean;
}

export interface SavedProblemItem {
  _id: string;
  title: string;
  slug: string;
  category: string;
  voteCount: number;
  downvoteCount: number;
  savedAt: number;
}

export interface LikedProblemItem {
  _id: string;
  title: string;
  slug: string;
  category: string;
  voteCount: number;
  downvoteCount: number;
  likedAt: number;
}

export interface RecentProblemItem {
  slug: string;
  title: string;
  category: string;
  viewedAt: number;
}

// ─── Comment ─────────────────────────────────────────────────────────────

export interface Comment {
  _id: string;
  problemId: string;
  authorId: string;
  parentId?: string;
  body: string;
  reactions?: {
    thumbsUp: number;
    bulb: number;
    heart: number;
  };
  isDeleted: boolean;
  deletedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface CommentWithAuthor extends Comment {
  author: AuthorStub | null;
  userReaction: CommentReactionEmoji | null;
  replies: CommentWithAuthor[];
}

// ─── Solution ────────────────────────────────────────────────────────────

export type SolutionType = 'existing_product' | 'proposal' | 'builder_claim';

export interface Solution {
  _id: string;
  problemId: string;
  authorId: string;
  type: SolutionType;
  title?: string;
  description: string;
  url?: string;
  isOpenSource?: boolean;
  repoUrl?: string;
  estimatedTimeline?: string;
  upvoteCount: number;
  isVerifiedByPoster: boolean;
  verifiedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface SolutionWithAuthor extends Solution {
  author: AuthorStub | null;
  userVoted: boolean;
}

// ─── User ────────────────────────────────────────────────────────────────

export interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  role?: string;
  reputationScore: number;
  reputationLevel: ReputationLevel;
  createdAt: number;
  lastActiveAt: number;
}

// ─── Notification ────────────────────────────────────────────────────────

export type NotificationType =
  | 'upvote'
  | 'me_too'
  | 'comment'
  | 'reply'
  | 'builder_claim'
  | 'status_change'
  | 'solution_verified'
  | 'follow';

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  payload: {
    actorId?: string;
    problemId?: string;
    commentId?: string;
    solutionId?: string;
    message?: string;
  };
  isRead: boolean;
  createdAt: number;
  // Enriched
  actor?: AuthorStub | null;
  problem?: { _id: string; title: string; slug: string } | null;
}

// ─── Feed state ──────────────────────────────────────────────────────────

export type FeedSort = 'hot' | 'new' | 'top';

export interface FeedFilters {
  sort: FeedSort;
  category?: string;
  status?: ProblemStatus;
}
