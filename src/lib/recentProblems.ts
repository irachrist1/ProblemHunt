'use client';

import type { RecentProblemItem } from '@/types/domain';

const STORAGE_KEY = 'ph_recent_problems';
const MAX_ITEMS = 20;
let memoryFallback: RecentProblemItem[] = [];

function safeRead(): RecentProblemItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentProblemItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) =>
        item &&
        typeof item.slug === 'string' &&
        typeof item.title === 'string' &&
        typeof item.category === 'string' &&
        typeof item.viewedAt === 'number',
      )
      .sort((a, b) => b.viewedAt - a.viewedAt)
      .slice(0, MAX_ITEMS);
  } catch {
    return memoryFallback;
  }
}

function safeWrite(items: RecentProblemItem[]) {
  if (typeof window === 'undefined') return;
  const normalized = items
    .sort((a, b) => b.viewedAt - a.viewedAt)
    .slice(0, MAX_ITEMS);
  memoryFallback = normalized;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  } catch {
    // localStorage may be unavailable (private mode/security settings)
  }
}

export function listRecentProblems(): RecentProblemItem[] {
  return safeRead();
}

export function pushRecentProblem(
  item: Omit<RecentProblemItem, 'viewedAt'> & { viewedAt?: number },
): RecentProblemItem[] {
  const current = safeRead().filter((entry) => entry.slug !== item.slug);
  const next: RecentProblemItem[] = [
    {
      slug: item.slug,
      title: item.title,
      category: item.category,
      viewedAt: item.viewedAt ?? Date.now(),
    },
    ...current,
  ];
  safeWrite(next);
  return next.slice(0, MAX_ITEMS);
}

export function clearRecentProblems(): void {
  memoryFallback = [];
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore storage failures
  }
}
