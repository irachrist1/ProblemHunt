import { v } from 'convex/values';
import { query } from '../_generated/server';
import { getAuthUserId } from '@convex-dev/auth/server';
import { Id } from '../_generated/dataModel';
import { Doc } from '../_generated/dataModel';

type CommentAuthor = {
  _id: Id<'users'>;
  name: Doc<'users'>['name'];
  username: Doc<'users'>['username'];
  avatarUrl: Doc<'users'>['avatarUrl'];
  reputationLevel: Doc<'users'>['reputationLevel'];
};

type ThreadedComment = Doc<'comments'> & {
  author: CommentAuthor | null;
  userReaction: string | null;
  replies: ThreadedComment[];
};

/**
 * List comments for a problem in a threaded structure (2 levels max).
 * Returns top-level comments with their replies nested.
 */
export const listThreaded = query({
  args: { problemId: v.id('problems') },
  handler: async (ctx, args) => {
    // Fetch all comments for this problem
    const allComments = await ctx.db
      .query('comments')
      .withIndex('by_problem_and_created', (q) => q.eq('problemId', args.problemId))
      .order('asc')
      .collect();

    // Enrich with author info
    const userId = await getAuthUserId(ctx);

    const enrichedComments: ThreadedComment[] = await Promise.all(
      allComments.map(async (comment) => {
        const author = await ctx.db.get(comment.authorId);

        // Check if current user has reacted
        let userReaction: string | null = null;
        if (userId) {
          const reaction = await ctx.db
            .query('commentReactions')
            .withIndex('by_comment_and_user', (q) =>
              q.eq('commentId', comment._id).eq('userId', userId as Id<'users'>),
            )
            .first();
          userReaction = reaction?.emoji ?? null;
        }

        return {
          ...comment,
          author: author
            ? {
                _id: author._id,
                name: author.name,
                username: author.username,
                avatarUrl: author.avatarUrl,
                reputationLevel: author.reputationLevel,
              }
            : null,
          userReaction,
          replies: [],
        };
      }),
    );

    // Build tree structure
    const topLevel = enrichedComments.filter((c) => !c.parentId);
    const replies = enrichedComments.filter((c) => c.parentId);

    // Attach replies to parents
    for (const reply of replies) {
      const parent = topLevel.find((c) => c._id === reply.parentId);
      if (parent) {
        parent.replies.push(reply);
      }
    }

    return topLevel;
  },
});
