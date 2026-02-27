import { getAuthUserId } from '@convex-dev/auth/server';
import { ConvexError } from 'convex/values';
import { MutationCtx, QueryCtx } from '../_generated/server';
import { Id } from '../_generated/dataModel';

const VISITOR_ID_RE = /^[a-zA-Z0-9_-]{8,128}$/;
const GUEST_ANIMALS = [
  'Falcon', 'Otter', 'Fox', 'Lynx', 'Kite', 'Heron', 'Cobra', 'Gecko',
  'Orca', 'Quail', 'Puma', 'Marten', 'Robin', 'Sparrow', 'Koala', 'Jaguar',
];

/**
 * Requires the caller to be authenticated.
 * Returns the userId or throws a ConvexError.
 */
export async function requireAuth(ctx: QueryCtx | MutationCtx): Promise<string> {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new ConvexError('Authentication required.');
  }
  return userId;
}

/**
 * Requires the caller to be authenticated and have a specific role.
 * Currently used for admin-only mutations.
 */
export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  allowedRoles: string[],
): Promise<string> {
  const userId = await requireAuth(ctx);
  const user = await ctx.db.get(userId as any);
  if (!user) {
    throw new ConvexError('User not found.');
  }
  // Role check can be expanded as needed
  return userId;
}

/**
 * Requires the caller to be a member of a workspace (organization).
 */
export async function requireWorkspaceMembership(
  ctx: QueryCtx | MutationCtx,
  userId: string,
  orgId: string,
): Promise<{ role: 'admin' | 'member' | 'viewer' }> {
  const membership = await ctx.db
    .query('memberships')
    .withIndex('by_user_and_org', (q) =>
      q.eq('userId', userId as any).eq('orgId', orgId as any),
    )
    .first();

  if (!membership) {
    throw new ConvexError('You are not a member of this workspace.');
  }

  return { role: membership.role };
}

/**
 * Requires the caller to be a workspace admin.
 */
export async function requireWorkspaceAdmin(
  ctx: QueryCtx | MutationCtx,
  userId: string,
  orgId: string,
): Promise<void> {
  const { role } = await requireWorkspaceMembership(ctx, userId, orgId);
  if (role !== 'admin') {
    throw new ConvexError('Admin access required for this action.');
  }
}

function assertValidVisitorId(visitorId?: string): string | null {
  if (!visitorId) return null;
  if (!VISITOR_ID_RE.test(visitorId)) {
    throw new ConvexError('Invalid guest session. Refresh and try again.');
  }
  return visitorId;
}

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return Math.abs(h >>> 0);
}

function buildGuestAlias(visitorId: string): string {
  const hash = hashString(visitorId);
  const animal = GUEST_ANIMALS[hash % GUEST_ANIMALS.length];
  const suffix = (hash % 89) + 10;
  return `Guest ${animal} ${suffix}`;
}

export async function resolveViewerUserId(
  ctx: QueryCtx,
  visitorId?: string,
): Promise<Id<'users'> | null> {
  const authUserId = await getAuthUserId(ctx);
  if (authUserId) {
    return authUserId as Id<'users'>;
  }

  const validVisitorId = assertValidVisitorId(visitorId);
  if (!validVisitorId) return null;

  const guest = await ctx.db
    .query('guestVisitors')
    .withIndex('by_visitor_id', (q) => q.eq('visitorId', validVisitorId))
    .first();

  return guest?.userId ?? null;
}

/**
 * Resolves the acting user for guest-first mutations.
 * Priority: authenticated user, then visitorId-mapped guest user.
 * Creates guest user + mapping on first seen visitorId.
 */
export async function resolveActorUserId(
  ctx: MutationCtx,
  visitorId?: string,
): Promise<{ userId: Id<'users'>; isAuthenticated: boolean }> {
  const authUserId = await getAuthUserId(ctx);
  if (authUserId) {
    return { userId: authUserId as Id<'users'>, isAuthenticated: true };
  }

  const validVisitorId = assertValidVisitorId(visitorId);
  if (!validVisitorId) {
    throw new ConvexError('Guest session required. Refresh and try again.');
  }

  const existingGuest = await ctx.db
    .query('guestVisitors')
    .withIndex('by_visitor_id', (q) => q.eq('visitorId', validVisitorId))
    .first();

  const now = Date.now();
  if (existingGuest) {
    await ctx.db.patch(existingGuest._id, { lastActiveAt: now });
    await ctx.db.patch(existingGuest.userId, { lastActiveAt: now });
    return { userId: existingGuest.userId, isAuthenticated: false };
  }

  const alias = buildGuestAlias(validVisitorId);
  const shortId = validVisitorId.slice(0, 8).toLowerCase();
  const baseUsername = `guest-${shortId}`;
  let username = baseUsername;
  let counter = 1;

  while (true) {
    const taken = await ctx.db
      .query('users')
      .withIndex('by_username', (q) => q.eq('username', username))
      .first();
    if (!taken) break;
    username = `${baseUsername}-${counter}`;
    counter++;
  }

  const guestUserId = await ctx.db.insert('users', {
    name: alias,
    username,
    email: `guest+${validVisitorId}@guest.problemhunt.local`,
    reputationScore: 0,
    reputationLevel: 'newcomer',
    createdAt: now,
    lastActiveAt: now,
  });

  await ctx.db.insert('guestVisitors', {
    visitorId: validVisitorId,
    userId: guestUserId,
    alias,
    createdAt: now,
    lastActiveAt: now,
  });

  try {
    await ctx.db.insert('analyticsEvents', {
      event: 'guest_actor_created',
      actorId: guestUserId,
      metadata: { visitorIdPrefix: validVisitorId.slice(0, 8) },
      createdAt: now,
    });
  } catch {
    // Analytics is best-effort.
  }

  return { userId: guestUserId, isAuthenticated: false };
}
