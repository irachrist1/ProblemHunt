import { internalAction } from '../_generated/server';
import { v } from 'convex/values';
import { api } from '../_generated/api';

// ---------- Tag Taxonomy ----------

const TAG_TAXONOMY = [
  'remote-work', 'async-communication', 'productivity', 'onboarding', 'developer-tools',
  'devex', 'ci-cd', 'documentation', 'code-review', 'testing', 'security', 'monitoring',
  'data-engineering', 'analytics', 'reporting', 'finance', 'expense-management', 'invoicing',
  'sales', 'crm', 'customer-success', 'support', 'marketing', 'seo', 'content',
  'hr', 'recruiting', 'performance-reviews', 'meetings', 'scheduling', 'project-management',
  'design', 'ux-research', 'accessibility', 'mobile', 'ios', 'android', 'api', 'integrations',
  'pricing', 'billing', 'compliance', 'privacy', 'gdpr', 'enterprise', 'smb', 'startup',
  'ai-ml', 'llm', 'vector-search', 'b2b-saas', 'devops', 'cloud', 'kubernetes', 'serverless',
];

// ---------- Auto-Tagging Action ----------

export const autoTagProblem = internalAction({
  args: {
    problemId: v.id('problems'),
    title: v.string(),
    description: v.string(),
  },
  handler: async (ctx, { problemId, title, description }) => {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.warn('[autoTagProblem] GOOGLE_GENERATIVE_AI_API_KEY not set — skipping');
      return;
    }

    const prompt = `Given this problem submission, suggest 3–5 relevant tags from the provided taxonomy.
Also suggest up to 2 new tags if none of the taxonomy tags fit well.
Tags must be lowercase, hyphenated (e.g. "remote-work", "developer-tools").

Problem: ${title}\n${description}

Taxonomy: ${TAG_TAXONOMY.join(', ')}

Respond with ONLY valid JSON: { "existingTags": string[], "newTagSuggestions": string[] }`;

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 256 },
          }),
        }
      );

      if (!res.ok) {
        console.error('[autoTagProblem] Gemini API error:', res.status);
        return;
      }

      const data = await res.json() as {
        candidates?: Array<{ content: { parts: Array<{ text: string }> } }>;
      };
      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

      // Parse JSON (may be wrapped in markdown code block)
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return;

      const result = JSON.parse(jsonMatch[0]) as {
        existingTags?: string[];
        newTagSuggestions?: string[];
      };

      const allTagNames = [
        ...(result.existingTags ?? []),
        ...(result.newTagSuggestions ?? []),
      ].slice(0, 7);

      if (allTagNames.length === 0) return;

      // Store suggested tags in aiAnalyses table
      await ctx.runMutation(api.ai.mutations.storeSuggestedTags, {
        problemId,
        suggestedTags: allTagNames,
      });
    } catch (err) {
      console.error('[autoTagProblem] error:', err);
    }
  },
});
