'use client';

import { use } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../../../convex/_generated/api';
import { notFound } from 'next/navigation';
import { Calendar, Star } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { SkeletonProfile } from '@/components/ui/SkeletonCard';
import { ProblemCard } from '@/components/problems/ProblemCard';
import type { ProblemWithMeta } from '@/types/domain';

interface Props {
  params: Promise<{ username: string }>;
}

export default function UserProfilePage({ params }: Props) {
  const { username } = use(params);
  const user = useQuery(api.users.queries.getByUsername, { username });

  const REPUTATION_LABEL: Record<string, string> = {
    newcomer: 'Newcomer',
    contributor: 'Contributor',
    finder: 'Finder',
    expert: 'Expert',
    legend: 'Legend',
  };

  if (user === undefined) {
    return (
      <div>
        <SkeletonProfile />
      </div>
    );
  }

  if (user === null) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {/* Profile header */}
      <div className="border-b border-border-subtle px-5 py-8">
        <div className="flex items-start gap-5">
          <UserAvatar name={user.name} avatarUrl={user.avatarUrl} size="xl" />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-text-primary">{user.name}</h1>
            <p className="text-sm text-text-tertiary">@{user.username}</p>
            {user.bio && (
              <p className="mt-2 text-sm text-text-secondary leading-relaxed max-w-md">
                {user.bio}
              </p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-text-tertiary">
              {user.role && (
                <span className="font-medium text-text-secondary">{user.role}</span>
              )}
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3" strokeWidth={1.5} />
                {REPUTATION_LABEL[user.reputationLevel] ?? user.reputationLevel}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" strokeWidth={1.5} />
                Joined {formatDate(user.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Problems tab */}
      <div className="border-b border-border-subtle px-5 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
          Problems posted
        </h2>
      </div>

      {/* Problem list placeholder — needs problems by user query with full meta */}
      <div className="px-5 py-8 text-center">
        <p className="text-sm text-text-tertiary">Problems will appear here</p>
      </div>
    </div>
  );
}
