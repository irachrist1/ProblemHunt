import { v } from 'convex/values';
import { ConvexError } from 'convex/values';
import { mutation } from '../_generated/server';
import { Id } from '../_generated/dataModel';
import { requireAuth } from '../_lib/auth';
import { updateProfileSchema } from '../_lib/validation';
import { generateUsernameSlug } from '../_lib/slugs';

/**
 * Update the current user's profile.
 */
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    bio: v.optional(v.string()),
    role: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const validated = updateProfileSchema.parse(args);

    // If updating username, check uniqueness
    if (validated.username) {
      const normalizedUsername = generateUsernameSlug(validated.username);
      const existing = await ctx.db
        .query('users')
        .withIndex('by_username', (q) => q.eq('username', normalizedUsername))
        .first();

      if (existing && existing._id !== (userId as Id<'users'>)) {
        throw new ConvexError('This username is already taken.');
      }

      validated.username = normalizedUsername;
    }

    await ctx.db.patch(userId as Id<'users'>, {
      ...validated,
      lastActiveAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Create a user record after OAuth sign-in.
 * Called by @convex-dev/auth after successful OAuth.
 */
export const createUserFromAuth = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    // Check if user already exists
    const existing = await ctx.db.get(userId as Id<'users'>);
    if (existing) return { userId };

    // Generate unique username from name/email
    const baseUsername = generateUsernameSlug(args.name || args.email.split('@')[0]);
    let username = baseUsername;
    let counter = 1;

    while (true) {
      const taken = await ctx.db
        .query('users')
        .withIndex('by_username', (q) => q.eq('username', username))
        .first();

      if (!taken) break;
      username = `${baseUsername}${counter}`;
      counter++;
    }

    const now = Date.now();
    await ctx.db.insert('users', {
      name: args.name,
      username,
      email: args.email,
      avatarUrl: args.avatarUrl,
      reputationScore: 0,
      reputationLevel: 'newcomer',
      createdAt: now,
      lastActiveAt: now,
    } as any);

    return { userId };
  },
});
