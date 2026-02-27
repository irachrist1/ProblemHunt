import { v } from 'convex/values';
import { query } from '../_generated/server';
import { getAuthUserId } from '@convex-dev/auth/server';
import { Id } from '../_generated/dataModel';

/**
 * Get the currently authenticated user's profile.
 */
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return ctx.db.get(userId as Id<'users'>);
  },
});

/**
 * Get a user's public profile by username.
 */
export const getByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_username', (q) => q.eq('username', args.username))
      .first();

    if (!user) return null;

    // Return only public fields
    return {
      _id: user._id,
      name: user.name,
      username: user.username,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      role: user.role,
      reputationScore: user.reputationScore,
      reputationLevel: user.reputationLevel,
      createdAt: user.createdAt,
    };
  },
});

/**
 * Get a user by ID.
 */
export const getById = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    return {
      _id: user._id,
      name: user.name,
      username: user.username,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      role: user.role,
      reputationScore: user.reputationScore,
      reputationLevel: user.reputationLevel,
      createdAt: user.createdAt,
    };
  },
});
