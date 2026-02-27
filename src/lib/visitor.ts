'use client';

import { useEffect, useState } from 'react';

const VISITOR_STORAGE_KEY = 'ph_visitor_id';
const VISITOR_COOKIE_KEY = 'ph_visitor_id';
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;
const VISITOR_ID_RE = /^[a-zA-Z0-9_-]{8,128}$/;

function createVisitorId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 14)}`;
}

function readVisitorCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${VISITOR_COOKIE_KEY}=`));
  if (!match) return null;
  const value = decodeURIComponent(match.split('=')[1] ?? '');
  return VISITOR_ID_RE.test(value) ? value : null;
}

function persistVisitorId(visitorId: string): void {
  localStorage.setItem(VISITOR_STORAGE_KEY, visitorId);
  document.cookie = `${VISITOR_COOKIE_KEY}=${encodeURIComponent(visitorId)}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
}

export function useVisitorId() {
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const localValue = localStorage.getItem(VISITOR_STORAGE_KEY);
      const existingLocal = localValue && VISITOR_ID_RE.test(localValue) ? localValue : null;
      const existingCookie = readVisitorCookie();
      const resolved = existingLocal ?? existingCookie ?? createVisitorId();

      persistVisitorId(resolved);
      setVisitorId(resolved);
      setError(null);
    } catch {
      setVisitorId(null);
      setError('Failed to initialize guest session.');
    } finally {
      setIsReady(true);
    }
  }, []);

  return { visitorId, isReady, error };
}
