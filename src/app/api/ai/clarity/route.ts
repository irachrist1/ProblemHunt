import { streamObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

export const runtime = 'edge';
export const maxDuration = 30;

const claritySchema = z.object({
  score: z.number().min(0).max(100),
  checks: z.object({
    hasClearProblemStatement: z.boolean(),
    hasContext: z.boolean(),
    hasAudienceInfo: z.boolean(),
    hasFrequencyInfo: z.boolean(),
    isNotSolutionFraming: z.boolean(),
    isSpecificEnough: z.boolean(),
  }),
  suggestions: z.array(z.string()).max(3),
});

export type ClarityResult = z.infer<typeof claritySchema>;

function buildPrompt(title: string, description: string): string {
  return `You are evaluating a problem statement for a community platform where builders discover what to build next.

Score this submission from 0–100 for problem clarity. Evaluate each criterion:

1. hasClearProblemStatement: Is the core problem stated clearly and specifically?
2. hasContext: Does it explain who faces this problem and under what circumstances?
3. hasAudienceInfo: Is the affected audience identifiable?
4. hasFrequencyInfo: Is there any indication of how often this occurs?
5. isNotSolutionFraming: Is it framed as a problem, NOT as a feature request or solution?
6. isSpecificEnough: Is it specific enough that a builder could understand what to build?

Also provide up to 3 specific, actionable suggestions to improve the submission. Keep suggestions concise (< 20 words each).

Problem title: ${title}
Problem description: ${description}

Respond with valid JSON matching the schema.`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description } = body as { title: string; description: string };

    if (!title || !description) {
      return new Response('Missing title or description', { status: 400 });
    }

    const result = streamObject({
      model: google('gemini-1.5-flash-latest'),
      schema: claritySchema,
      prompt: buildPrompt(title.trim(), description.trim()),
      temperature: 0.1,
    });

    return result.toTextStreamResponse();
  } catch (err) {
    console.error('[clarity] error:', err);
    return new Response('Internal error', { status: 500 });
  }
}
