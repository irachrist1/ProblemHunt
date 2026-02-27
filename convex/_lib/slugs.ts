import { customAlphabet } from 'nanoid';

// URL-safe alphabet for slug suffixes
const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 6);

/**
 * Generates a URL-safe slug from a title + unique suffix.
 * Format: "my-problem-title-abc123"
 */
export function generateSlug(title: string, suffix?: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);

  const uniqueSuffix = suffix ?? nanoid();
  return `${base}-${uniqueSuffix}`;
}

/**
 * Generates a URL-safe slug for usernames/org slugs.
 * No random suffix — must be unique, caller enforces uniqueness.
 */
export function generateUsernameSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 30);
}
