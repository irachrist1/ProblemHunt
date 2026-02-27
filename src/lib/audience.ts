const MAX_AUDIENCE_ITEMS = 5;
const MAX_AUDIENCE_LENGTH = 120;

export function normalizeAudienceInput(input: string): string[] {
  const unique = new Set<string>();
  for (const token of input.split(/[,\n;]+/)) {
    const normalized = token.trim().replace(/\s+/g, ' ');
    if (!normalized) continue;
    unique.add(normalized);
  }
  return Array.from(unique);
}

export function validateAudienceTokens(tokens: string[]): string | null {
  if (tokens.length === 0) return 'Please provide at least one audience.';
  if (tokens.length > MAX_AUDIENCE_ITEMS) return 'Please provide at most 5 audiences.';
  if (tokens.some((a) => a.length > MAX_AUDIENCE_LENGTH)) {
    return 'Each audience must be 120 characters or less.';
  }
  return null;
}
