import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

export const runtime = 'edge';
export const maxDuration = 15;

// --- Rule-based fast check (no API call needed) ---

const SOLUTION_FRAMING_PREFIXES = [
  /^i want/i,
  /^add /i,
  /^build /i,
  /^create /i,
  /^make /i,
  /^implement /i,
  /^develop /i,
  /^we need/i,
  /^please add/i,
  /^can you/i,
];

export function checkSolutionFramingSync(title: string): boolean {
  return SOLUTION_FRAMING_PREFIXES.some((r) => r.test(title.trim()));
}

// --- Response schema ---

const framingSchema = z.object({
  isSolutionFraming: z.boolean(),
  explanation: z.string(),
});

export type FramingResult = z.infer<typeof framingSchema>;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description } = body as { title?: string; description?: string };

    if (!title) {
      return Response.json({ isSolutionFraming: false, explanation: '' });
    }

    // Fast rule-based check
    if (checkSolutionFramingSync(title)) {
      return Response.json({
        isSolutionFraming: true,
        explanation: 'Your title reads like a feature request. Try starting with the problem you experience instead.',
      } satisfies FramingResult);
    }

    // If no description, skip AI check
    if (!description || description.trim().length < 50) {
      return Response.json({ isSolutionFraming: false, explanation: '' } satisfies FramingResult);
    }

    // AI check for ambiguous cases
    const { object } = await generateObject({
      model: google('gemini-1.5-flash-latest'),
      schema: framingSchema,
      prompt: `Is this a problem statement or a solution/feature request?

Title: ${title.trim()}
Description: ${description.trim()}

Answer with JSON: { "isSolutionFraming": boolean, "explanation": string (max 20 words) }`,
      temperature: 0.1,
    });

    return Response.json(object);
  } catch (err) {
    console.error('[framing] error:', err);
    // Fail gracefully — don't block the user
    return Response.json({ isSolutionFraming: false, explanation: '' } satisfies FramingResult);
  }
}
