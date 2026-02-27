'use client';

import { useEffect, useRef, useState } from 'react';
import { experimental_useObject as useObject } from 'ai/react';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/Spinner';
import { AlertCircle, CheckCircle2, XCircle, Lightbulb, Sparkles } from 'lucide-react';

// ---------- Schema (mirrors route.ts) ----------

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

type ClarityResult = z.infer<typeof claritySchema>;

// ---------- Sub-components ----------

const CHECK_LABELS: Record<keyof ClarityResult['checks'], string> = {
  hasClearProblemStatement: 'Clear problem statement',
  hasContext: 'Context provided',
  hasAudienceInfo: 'Audience identified',
  hasFrequencyInfo: 'Frequency / severity hinted',
  isNotSolutionFraming: 'Framed as a problem (not a feature)',
  isSpecificEnough: 'Specific enough for builders',
};

function ScoreRing({ score }: { score: number | undefined }) {
  const s = score ?? 0;
  const color =
    s >= 80 ? 'text-solution-500' : s >= 60 ? 'text-yellow-400' : 'text-problem-500';

  return (
    <div className="flex flex-col items-center justify-center gap-1">
      <div className={cn('text-3xl font-extrabold tabular-nums leading-none', color)}>
        {s}
      </div>
      <div className="text-[10px] text-text-muted uppercase tracking-widest">Clarity</div>
    </div>
  );
}

function CheckRow({ label, value }: { label: string; value: boolean | undefined }) {
  if (value === undefined) {
    return (
      <li className="flex items-center gap-2 text-xs text-text-muted">
        <span className="h-3.5 w-3.5 rounded-full bg-bg-tertiary animate-pulse" />
        {label}
      </li>
    );
  }

  return (
    <li className="flex items-center gap-2 text-xs">
      {value ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-solution-500 flex-shrink-0" strokeWidth={2.5} />
      ) : (
        <XCircle className="h-3.5 w-3.5 text-problem-500 flex-shrink-0" strokeWidth={2.5} />
      )}
      <span className={value ? 'text-text-secondary' : 'text-text-primary font-medium'}>
        {label}
      </span>
    </li>
  );
}

// ---------- Panel ----------

interface AiInsightPanelProps {
  title: string;
  description: string;
  /** Minimum description length before triggering (default 50) */
  minLength?: number;
}

export function AiInsightPanel({ title, description, minLength = 50 }: AiInsightPanelProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const { object: clarity, isLoading, error, submit } = useObject({
    api: '/api/ai/clarity',
    schema: claritySchema,
  });

  // Debounce trigger — only fire when description meets min length
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (description.length >= minLength && title.length >= 10) {
      debounceRef.current = setTimeout(() => {
        submit({ title, description });
      }, 500);
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description]);

  // Don't show panel if description too short
  if (description.length < minLength) {
    return (
      <div className="rounded-xl border border-border-subtle bg-bg-secondary p-4">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Sparkles className="h-4 w-4" strokeWidth={1.5} />
          <span>AI clarity feedback appears here as you write…</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl border bg-bg-secondary p-4 transition-colors',
        error
          ? 'border-border-subtle'
          : clarity && (clarity.score ?? 0) >= 75
          ? 'border-solution-border'
          : clarity && (clarity.score ?? 0) >= 50
          ? 'border-border-default'
          : 'border-problem-border'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles
            className={cn(
              'h-4 w-4',
              isLoading ? 'text-text-muted animate-pulse' : 'text-problem-500'
            )}
            strokeWidth={1.5}
          />
          <span className="text-xs font-semibold text-text-primary">AI Clarity Check</span>
        </div>
        {isLoading && <Spinner className="h-3.5 w-3.5" />}
      </div>

      {error ? (
        <div className="flex items-start gap-2 text-xs text-text-muted">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
          AI feedback unavailable right now. Continue writing — you can still submit.
        </div>
      ) : (
        <div className="flex gap-4">
          {/* Score ring */}
          <div className="flex-shrink-0">
            <ScoreRing score={clarity?.score} />
          </div>

          {/* Checks */}
          <div className="flex-1 min-w-0">
            <ul className="space-y-1.5 mb-3">
              {(Object.keys(CHECK_LABELS) as Array<keyof ClarityResult['checks']>).map((key) => (
                <CheckRow
                  key={key}
                  label={CHECK_LABELS[key]}
                  value={clarity?.checks?.[key]}
                />
              ))}
            </ul>

            {/* Suggestions */}
            {clarity?.suggestions && clarity.suggestions.length > 0 && (
              <div className="mt-3 border-t border-border-subtle pt-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Lightbulb className="h-3 w-3 text-yellow-400" strokeWidth={2} />
                  <span className="text-xs font-medium text-text-secondary">Suggestions</span>
                </div>
                <ul className="space-y-1.5">
                  {clarity.suggestions.map((s, i) => (
                    <li key={i} className="text-xs text-text-secondary leading-relaxed">
                      · {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Framing Warning Banner ----------

interface FramingWarningProps {
  title: string;
}

export function FramingWarning({ title }: FramingWarningProps) {
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

  const isSolutionFramed = SOLUTION_FRAMING_PREFIXES.some((r) => r.test(title.trim()));

  if (!isSolutionFramed || title.trim().length < 10) return null;

  return (
    <div className="flex items-start gap-2.5 rounded-lg bg-problem-dim border border-problem-border p-3">
      <AlertCircle className="h-4 w-4 text-problem-500 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
      <div>
        <p className="text-xs font-medium text-problem-500 mb-0.5">Solution framing detected</p>
        <p className="text-xs text-text-secondary">
          Your title reads like a feature request. Try starting with the problem you experience.{' '}
          <span className="text-text-muted">e.g. "Tracking async decisions is impossible in Slack threads"</span>
        </p>
      </div>
    </div>
  );
}
