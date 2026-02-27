import { Id } from '../_generated/dataModel';
import { MutationCtx } from '../_generated/server';

export type EntitlementAction =
  | 'problem:create'
  | 'vote:toggle'
  | 'bookmark:toggle'
  | 'comment:create';

/**
 * Centralized entitlement hook for future SaaS limits.
 * Current MVP default is permissive for all actors.
 */
export async function assertEntitled(
  _ctx: MutationCtx,
  _userId: Id<'users'>,
  _action: EntitlementAction,
): Promise<void> {
  return;
}
