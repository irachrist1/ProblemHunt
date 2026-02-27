import { Id } from '../_generated/dataModel';
import { MutationCtx } from '../_generated/server';

export async function trackEvent(
  ctx: MutationCtx,
  event: string,
  payload?: {
    actorId?: Id<'users'>;
    problemId?: Id<'problems'>;
    metadata?: unknown;
  },
): Promise<void> {
  try {
    await ctx.db.insert('analyticsEvents', {
      event,
      actorId: payload?.actorId,
      problemId: payload?.problemId,
      metadata: payload?.metadata,
      createdAt: Date.now(),
    });
  } catch {
    // Analytics must never break user actions.
  }
}
