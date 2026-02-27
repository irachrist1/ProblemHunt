import { mutation } from '../_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from '@convex-dev/auth/server';
import { Id } from '../_generated/dataModel';
import { trackEvent } from '../_lib/analytics';

const VISITOR_ID_RE = /^[a-zA-Z0-9_-]{8,128}$/;

export const trackFeedImpressions = mutation({
  args: {
    problemIds: v.array(v.id('problems')),
    visitorId: v.optional(v.string()),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.problemIds.length === 0) return { recorded: 0 };

    let actorId: Id<'users'> | undefined;
    const authUserId = await getAuthUserId(ctx);
    if (authUserId) {
      actorId = authUserId as Id<'users'>;
    } else if (args.visitorId && VISITOR_ID_RE.test(args.visitorId)) {
      const guest = await ctx.db
        .query('guestVisitors')
        .withIndex('by_visitor_id', (q) => q.eq('visitorId', args.visitorId!))
        .first();
      actorId = guest?.userId;
    }

    const capped = args.problemIds.slice(0, 30);

    await trackEvent(ctx, 'problem_seen_in_feed', {
      actorId,
      metadata: {
        source: args.source ?? 'feed',
        problemIds: capped,
        count: capped.length,
      },
    });

    return { recorded: capped.length };
  },
});
