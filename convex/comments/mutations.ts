import { v } from 'convex/values';
import { ConvexError } from 'convex/values';
import { mutation } from '../_generated/server';
import { Id } from '../_generated/dataModel';
import { requireAuth } from '../_lib/auth';
import { requireRateLimit } from '../_lib/rateLimit';
import { createCommentSchema, reactToCommentSchema } from '../_lib/validation';
import { assertEntitled } from '../_lib/entitlements';
import { trackEvent } from '../_lib/analytics';

/**
 * Create a comment or reply on a problem.
 */
export const createComment = mutation({
  args: {
    problemId: v.id('problems'),
    body: v.string(),
    parentId: v.optional(v.id('comments')),
  },
  handler: async (ctx, args) => {
    // 1. Auth
    const userId = await requireAuth(ctx);

    // 2. Rate limit
    await requireRateLimit(ctx, userId, 'comment:create');
    await assertEntitled(ctx, userId as Id<'users'>, 'comment:create');

    // 3. Validate
    const validated = createCommentSchema.parse({
      ...args,
      problemId: args.problemId as string,
      parentId: args.parentId as string | undefined,
    });

    // Check problem exists
    const problem = await ctx.db.get(args.problemId);
    if (!problem) throw new ConvexError('Problem not found.');

    // If reply, check parent exists and is top-level (max 2 levels)
    if (args.parentId) {
      const parent = await ctx.db.get(args.parentId);
      if (!parent) throw new ConvexError('Parent comment not found.');
      if (parent.parentId) {
        throw new ConvexError('Replies can only be one level deep.');
      }
    }

    const now = Date.now();

    // 4. Execute
    const commentId = await ctx.db.insert('comments', {
      problemId: args.problemId,
      authorId: userId as Id<'users'>,
      parentId: args.parentId,
      body: validated.body,
      reactions: { thumbsUp: 0, bulb: 0, heart: 0 },
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    });

    // Update cached comment count
    await ctx.db.patch(args.problemId, {
      commentCount: problem.commentCount + 1,
      lastActivityAt: now,
    });

    // Notify problem author (unless they're commenting on their own)
    if (problem.authorId !== (userId as Id<'users'>)) {
      await ctx.db.insert('notifications', {
        userId: problem.authorId,
        type: args.parentId ? 'reply' : 'comment',
        payload: {
          actorId: userId as Id<'users'>,
          problemId: args.problemId,
          commentId,
        },
        isRead: false,
        createdAt: now,
      });
    }

    // If reply, notify parent comment author
    if (args.parentId) {
      const parent = await ctx.db.get(args.parentId);
      if (parent && parent.authorId !== (userId as Id<'users'>) && parent.authorId !== problem.authorId) {
        await ctx.db.insert('notifications', {
          userId: parent.authorId,
          type: 'reply',
          payload: {
            actorId: userId as Id<'users'>,
            problemId: args.problemId,
            commentId,
          },
          isRead: false,
          createdAt: now,
        });
      }
    }

    await trackEvent(ctx, 'comment_created', {
      actorId: userId as Id<'users'>,
      problemId: args.problemId,
      metadata: { isReply: !!args.parentId },
    });

    return { commentId };
  },
});

/**
 * Soft-delete a comment.
 */
export const deleteComment = mutation({
  args: { commentId: v.id('comments') },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new ConvexError('Comment not found.');
    if (comment.authorId !== (userId as Id<'users'>)) {
      throw new ConvexError('You can only delete your own comments.');
    }

    const now = Date.now();
    await ctx.db.patch(args.commentId, {
      isDeleted: true,
      deletedAt: now,
      body: '[deleted]',
    });

    // Decrement cached count
    const problem = await ctx.db.get(comment.problemId);
    if (problem) {
      await ctx.db.patch(comment.problemId, {
        commentCount: Math.max(0, problem.commentCount - 1),
      });
    }

    return { success: true };
  },
});

/**
 * React to a comment (thumbsUp, bulb, heart).
 * Toggle behavior: reacting again removes the reaction.
 */
export const reactToComment = mutation({
  args: {
    commentId: v.id('comments'),
    emoji: v.union(v.literal('thumbsUp'), v.literal('bulb'), v.literal('heart')),
  },
  handler: async (ctx, args) => {
    const userId = await requireAuth(ctx);

    const validated = reactToCommentSchema.parse({
      commentId: args.commentId as string,
      emoji: args.emoji,
    });

    const comment = await ctx.db.get(args.commentId);
    if (!comment || comment.isDeleted) throw new ConvexError('Comment not found.');

    const now = Date.now();

    // Check if already reacted
    const existingReaction = await ctx.db
      .query('commentReactions')
      .withIndex('by_comment_and_user', (q) =>
        q.eq('commentId', args.commentId).eq('userId', userId as Id<'users'>),
      )
      .first();

    const reactions = comment.reactions ?? { thumbsUp: 0, bulb: 0, heart: 0 };

    if (existingReaction && existingReaction.emoji === args.emoji) {
      // Remove reaction
      await ctx.db.delete(existingReaction._id);
      await ctx.db.patch(args.commentId, {
        reactions: {
          ...reactions,
          [args.emoji]: Math.max(0, reactions[args.emoji] - 1),
        },
      });
    } else {
      if (existingReaction) {
        // Switch reaction type
        await ctx.db.patch(existingReaction._id, { emoji: args.emoji });
        await ctx.db.patch(args.commentId, {
          reactions: {
            ...reactions,
            [existingReaction.emoji]: Math.max(0, reactions[existingReaction.emoji] - 1),
            [args.emoji]: reactions[args.emoji] + 1,
          },
        });
      } else {
        // New reaction
        await ctx.db.insert('commentReactions', {
          commentId: args.commentId,
          userId: userId as Id<'users'>,
          emoji: args.emoji,
          createdAt: now,
        });
        await ctx.db.patch(args.commentId, {
          reactions: {
            ...reactions,
            [args.emoji]: reactions[args.emoji] + 1,
          },
        });
      }
    }

    return { success: true };
  },
});
