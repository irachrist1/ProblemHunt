import { convexAuth } from '@convex-dev/auth/server';
import { Password } from '@convex-dev/auth/providers/Password';
import type { GenericMutationCtx } from 'convex/server';
import type { Value } from 'convex/values';
import { generateUsernameSlug } from './_lib/slugs';

function asOptionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

async function findUserByEmail(ctx: GenericMutationCtx<any>, email: string) {
  const matches = await ctx.db
    .query('users')
    .withIndex('email', (q) => q.eq('email', email))
    .take(2);

  if (matches.length > 1) {
    throw new Error(`Multiple accounts already use ${email}. Resolve the duplicate users before signing in.`);
  }

  return matches[0] ?? null;
}

async function createUniqueUsername(ctx: GenericMutationCtx<any>, seed: string) {
  const base = generateUsernameSlug(seed) || 'user';
  let username = base;
  let counter = 1;

  while (true) {
    const existing = await ctx.db
      .query('users')
      .withIndex('by_username', (q) => q.eq('username', username))
      .first();

    if (!existing) {
      return username;
    }

    username = `${base}${counter}`;
    counter += 1;
  }
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params: Record<string, Value | undefined>) {
        const email = asOptionalString(params.email)?.toLowerCase();
        if (!email) {
          throw new Error('Email is required.');
        }

        const name = asOptionalString(params.name);
        return {
          email,
          ...(name ? { name } : {}),
        };
      },
    }),
  ],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      const email = asOptionalString(args.profile.email)?.toLowerCase();
      if (!email) {
        throw new Error('This provider did not return an email address.');
      }

      const now = Date.now();
      const profileName = asOptionalString(args.profile.name);

      let user =
        (args.existingUserId ? await ctx.db.get(args.existingUserId) : null) ??
        (await findUserByEmail(ctx, email));

      if (user) {
        await ctx.db.patch(user._id, {
          name: profileName ?? user.name,
          email,
          lastActiveAt: now,
        });

        return user._id;
      }

      const fallbackName = profileName ?? email.split('@')[0] ?? 'User';
      const username = await createUniqueUsername(ctx, fallbackName);

      return await ctx.db.insert('users', {
        name: fallbackName,
        username,
        email,
        reputationScore: 0,
        reputationLevel: 'newcomer',
        createdAt: now,
        lastActiveAt: now,
      });
    },
  },
});
