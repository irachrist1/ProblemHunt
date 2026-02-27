/**
 * App-wide constants. Single source of truth for all magic numbers and strings.
 */

// Problem limits
export const PROBLEM_TITLE_MAX_LENGTH = 120;
export const PROBLEM_DESCRIPTION_MIN_LENGTH = 50;
export const PROBLEM_DESCRIPTION_MAX_LENGTH = 5000;
export const PROBLEM_WORKAROUNDS_MAX_LENGTH = 1000;
export const PROBLEM_MAX_TAGS = 5;
export const PROBLEM_MAX_AUDIENCE = 5;

// Comment limits
export const COMMENT_MAX_LENGTH = 2000;

// User limits
export const USERNAME_MAX_LENGTH = 30;
export const BIO_MAX_LENGTH = 160;

// Categories
export const PROBLEM_CATEGORIES = [
  { id: 'developer-tools', label: 'Developer Tools', icon: '⚙️' },
  { id: 'productivity', label: 'Productivity', icon: '⚡' },
  { id: 'communication', label: 'Communication', icon: '💬' },
  { id: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { id: 'finance', label: 'Finance', icon: '💰' },
  { id: 'education', label: 'Education', icon: '📚' },
  { id: 'e-commerce', label: 'E-commerce', icon: '🛍️' },
  { id: 'data-analytics', label: 'Data & Analytics', icon: '📊' },
  { id: 'security', label: 'Security', icon: '🔒' },
  { id: 'infrastructure', label: 'Infrastructure', icon: '🏗️' },
  { id: 'design', label: 'Design', icon: '🎨' },
  { id: 'marketing', label: 'Marketing', icon: '📢' },
  { id: 'hr-recruiting', label: 'HR & Recruiting', icon: '👥' },
  { id: 'legal', label: 'Legal', icon: '⚖️' },
  { id: 'real-estate', label: 'Real Estate', icon: '🏠' },
  { id: 'transportation', label: 'Transportation', icon: '🚗' },
  { id: 'food-beverage', label: 'Food & Beverage', icon: '🍽️' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎮' },
  { id: 'social-community', label: 'Social & Community', icon: '🌐' },
  { id: 'other', label: 'Other', icon: '💡' },
] as const;

export const CATEGORY_LABELS = Object.fromEntries(
  PROBLEM_CATEGORIES.map((c) => [c.id, c.label]),
);

// Problem status config
export const PROBLEM_STATUSES = [
  { id: 'open', label: 'Open', color: 'status-open' },
  { id: 'exploring', label: 'Exploring', color: 'status-exploring' },
  { id: 'proposed', label: 'Proposed', color: 'status-proposed' },
  { id: 'exists', label: 'Exists', color: 'status-exists' },
  { id: 'solved', label: 'Solved', color: 'status-solved' },
] as const;

// Reputation levels
export const REPUTATION_LEVELS = {
  newcomer:    { label: 'Newcomer',    min: 0,    max: 99 },
  contributor: { label: 'Contributor', min: 100,  max: 499 },
  finder:      { label: 'Finder',      min: 500,  max: 1999 },
  expert:      { label: 'Expert',      min: 2000, max: 9999 },
  legend:      { label: 'Legend',      min: 10000, max: Infinity },
} as const;

// Frequency options for problem submission
export const FREQUENCY_OPTIONS = [
  { value: 'daily',   label: 'Daily' },
  { value: 'weekly',  label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'rarely',  label: 'Rarely' },
] as const;

// Impact rating labels
export const IMPACT_LABELS: Record<number, string> = {
  1: 'Minor inconvenience',
  2: 'Somewhat frustrating',
  3: 'Significant pain point',
  4: 'Major blocker',
  5: 'Business-critical',
};

// Feed sort options
export const FEED_SORT_OPTIONS = [
  { value: 'hot',  label: 'Hot' },
  { value: 'new',  label: 'New' },
  { value: 'top',  label: 'Top' },
] as const;

// Navigation
export const NAV_ITEMS = [
  { href: '/',              label: 'Home',          iconName: 'Home' },
  { href: '/explore',       label: 'Explore',       iconName: 'Compass' },
  { href: '/notifications', label: 'Notifications', iconName: 'Bell' },
] as const;

// Reaction emojis
export const REACTION_CONFIG = {
  thumbsUp: { emoji: '👍', label: 'Helpful' },
  bulb:     { emoji: '💡', label: 'Insightful' },
  heart:    { emoji: '❤️',  label: 'Relatable' },
} as const;

// App metadata
export const APP_NAME = 'ProblemHunt';
export const APP_DESCRIPTION = 'The community for people who share real-world problems worth solving.';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
