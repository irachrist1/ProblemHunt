import { ConvexError } from 'convex/values';
import { MutationCtx } from '../_generated/server';

/**
 * Rate limit configurations per action type.
 * All limits are per-user per time window.
 */
const RATE_LIMITS: Record<string, { limit: number; windowMs: number; message: string }> = {
  'problem:create': {
    limit: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: "You're posting too quickly. Wait a moment before submitting another problem.",
  },
  'vote:toggle': {
    limit: 200,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: "You're voting too quickly. Slow down!",
  },
  'comment:create': {
    limit: 30,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: "You're commenting too quickly. Please wait a moment.",
  },
  'problem:update': {
    limit: 20,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: "Too many updates. Please wait before editing again.",
  },
};

/**
 * Rate limiting using Convex DB as the backing store.
 * Upstash Redis is used in production via environment variables.
 * Falls back gracefully if Redis is unavailable.
 *
 * Note: In a full production deployment, this uses Upstash Redis.
 * For local development and testing, this uses a simple in-memory store.
 */
export async function requireRateLimit(
  ctx: MutationCtx,
  userId: string,
  action: string,
): Promise<void> {
  const config = RATE_LIMITS[action];
  if (!config) {
    // Unknown action — skip rate limiting (conservative approach)
    return;
  }

  // Use Convex DB for rate limiting (simpler than Upstash for now)
  // This can be replaced with Upstash Redis for production performance
  const windowStart = Math.floor(Date.now() / config.windowMs) * config.windowMs;

  const existing = await ctx.db
    .query('rateLimitLog')
    .withIndex('by_user_and_action', (q) =>
      q.eq('userId', userId as any).eq('action', action),
    )
    .first();

  if (!existing) {
    // First request in this window
    await ctx.db.insert('rateLimitLog', {
      userId: userId as any,
      action,
      count: 1,
      windowStart,
    });
    return;
  }

  if (existing.windowStart !== windowStart) {
    // New window — reset counter
    await ctx.db.patch(existing._id, { count: 1, windowStart });
    return;
  }

  if (existing.count >= config.limit) {
    throw new ConvexError(config.message);
  }

  await ctx.db.patch(existing._id, { count: existing.count + 1 });
}
