import { z } from 'zod';

// ─────────────────────────────────────────────────────────────
// PROBLEM SCHEMAS
// ─────────────────────────────────────────────────────────────

export const PROBLEM_CATEGORIES = [
  'Developer Tools',
  'Productivity',
  'Communication',
  'Healthcare',
  'Finance',
  'Education',
  'E-commerce',
  'Data & Analytics',
  'Security',
  'Infrastructure',
  'Design',
  'Marketing',
  'HR & Recruiting',
  'Legal',
  'Real Estate',
  'Transportation',
  'Food & Beverage',
  'Entertainment',
  'Social & Community',
  'Other',
] as const;

export const createProblemSchema = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(120, 'Title must be at most 120 characters'),
  description: z
    .string()
    .min(50, 'Description must be at least 50 characters')
    .max(5000, 'Description must be at most 5000 characters'),
  workarounds: z
    .string()
    .max(1000, 'Workarounds must be at most 1000 characters')
    .optional(),
  category: z.enum([...PROBLEM_CATEGORIES] as [string, ...string[]]),
  audience: z
    .array(z.string().min(1).max(120))
    .min(1, 'At least one audience is required')
    .max(5, 'At most 5 audiences'),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'rarely']),
  impactRating: z.number().int().min(1).max(5),
  visibility: z.enum(['public', 'workspace', 'anonymous']),
  isAnonymous: z.boolean(),
  orgId: z.string().optional(),
  tagIds: z.array(z.string()).max(5, 'At most 5 tags').optional(),
});

export const updateProblemSchema = createProblemSchema.partial().omit({
  visibility: true,
  isAnonymous: true,
  orgId: true,
});

export const updateStatusSchema = z.object({
  problemId: z.string(),
  status: z.enum(['open', 'exploring', 'proposed', 'exists', 'solved']),
});

// ─────────────────────────────────────────────────────────────
// VOTE SCHEMAS
// ─────────────────────────────────────────────────────────────

export const toggleVoteSchema = z.object({
  problemId: z.string(),
  type: z.enum(['upvote', 'downvote', 'me_too']),
  impactRating: z.number().int().min(1).max(5).optional(),
});

// ─────────────────────────────────────────────────────────────
// COMMENT SCHEMAS
// ─────────────────────────────────────────────────────────────

export const createCommentSchema = z.object({
  problemId: z.string(),
  body: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment must be at most 2000 characters'),
  parentId: z.string().optional(),
});

export const reactToCommentSchema = z.object({
  commentId: z.string(),
  emoji: z.enum(['thumbsUp', 'bulb', 'heart']),
});

// ─────────────────────────────────────────────────────────────
// USER SCHEMAS
// ─────────────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  username: z
    .string()
    .min(2)
    .max(30)
    .regex(/^[a-z0-9-]+$/, 'Username can only contain lowercase letters, numbers, and hyphens')
    .optional(),
  bio: z.string().max(160).optional(),
  role: z.string().max(60).optional(),
  avatarUrl: z.string().url().optional(),
});

// ─────────────────────────────────────────────────────────────
// TAG SCHEMAS
// ─────────────────────────────────────────────────────────────

export const createTagSchema = z.object({
  name: z.string().min(1).max(30),
  category: z.string().max(30).optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
});

export type CreateProblemInput = z.infer<typeof createProblemSchema>;
export type UpdateProblemInput = z.infer<typeof updateProblemSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
