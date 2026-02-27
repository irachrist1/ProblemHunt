'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { z } from 'zod';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVisitorId } from '@/lib/visitor';
import { PROBLEM_CATEGORIES, FREQUENCY_OPTIONS, IMPACT_LABELS } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/Toast';
import { ConvexError } from 'convex/values';

// ─── Form schema (subset of full schema for wizard validation per step) ───

const step1Schema = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(120, 'Title must be at most 120 characters'),
  description: z
    .string()
    .min(50, 'Description must be at least 50 characters')
    .max(5000, 'Max 5000 characters'),
  workarounds: z.string().max(1000).optional(),
});

const step2Schema = z.object({
  category: z.string().min(1, 'Please select a category'),
  audience: z.string().min(1, 'Describe who has this problem'),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'rarely']),
  impactRating: z.number().min(1).max(5),
});

type Step1 = z.infer<typeof step1Schema>;
type Step2 = z.infer<typeof step2Schema>;

const STEPS = [
  { id: 1, label: 'Describe' },
  { id: 2, label: 'Classify' },
  { id: 3, label: 'Tags' },
  { id: 4, label: 'Review' },
];

export default function SubmitPage() {
  const router = useRouter();
  const toast = useToast();
  const { visitorId } = useVisitorId();
  const createProblem = useMutation(api.problems.mutations.createProblem);

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    workarounds: '',
    category: '',
    audience: '',
    frequency: 'daily' as const,
    impactRating: 3,
    visibility: 'public' as 'public' | 'anonymous',
    isAnonymous: false,
  });

  const updateForm = (updates: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleSubmit = async () => {
    const audienceTokens = formData.audience
      .split(/[,\n;]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (audienceTokens.length === 0) {
      toast.error('Please provide at least one audience.');
      return;
    }
    if (audienceTokens.length > 5) {
      toast.error('Please provide at most 5 audiences.');
      return;
    }
    if (audienceTokens.some((a) => a.length > 120)) {
      toast.error('Each audience must be 120 characters or less.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { slug } = await createProblem({
        title: formData.title,
        description: formData.description,
        workarounds: formData.workarounds || undefined,
        category: formData.category,
        audience: audienceTokens,
        frequency: formData.frequency,
        impactRating: formData.impactRating,
        visibility: formData.visibility,
        isAnonymous: formData.isAnonymous,
        visitorId: visitorId ?? undefined,
      });

      toast.success('Problem posted! The community will see it now.');
      router.push(`/p/${slug}`);
    } catch (err) {
      if (err instanceof ConvexError) {
        toast.error(err.data as string);
      } else {
        toast.error("Couldn't post your problem. Please try again.");
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen px-5 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-text-primary">Share a problem</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Describe a real problem worth solving. Be specific.
        </p>
      </div>

      {/* Step progress */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <div
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors',
                step > s.id
                  ? 'bg-solution-500 text-white'
                  : step === s.id
                  ? 'bg-problem-500 text-white'
                  : 'bg-bg-tertiary text-text-muted',
              )}
            >
              {step > s.id ? (
                <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
              ) : (
                s.id
              )}
            </div>
            <span
              className={cn(
                'ml-2 text-xs font-medium',
                step === s.id ? 'text-text-primary' : 'text-text-muted',
              )}
            >
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'mx-3 h-px w-8 flex-1',
                  step > s.id ? 'bg-solution-500' : 'bg-border-subtle',
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Describe */}
      {step === 1 && (
        <div className="flex flex-col gap-6 max-w-lg">
          <Input
            label="Problem title *"
            value={formData.title}
            onChange={(e) => updateForm({ title: e.target.value })}
            placeholder="e.g. It's impossible to track why a CI build failed without digging through 500 lines of logs"
            maxLength={120}
          />
          <Textarea
            label="Description *"
            value={formData.description}
            onChange={(e) => updateForm({ description: e.target.value })}
            placeholder="Describe the problem in detail. When does it happen? What's the impact? What have you tried?"
            rows={6}
            showCount
            maxLength={5000}
          />
          <Textarea
            label="Current workarounds (optional)"
            value={formData.workarounds}
            onChange={(e) => updateForm({ workarounds: e.target.value })}
            placeholder="How do you currently deal with this problem, even if the workaround is painful?"
            rows={3}
            maxLength={1000}
          />
        </div>
      )}

      {/* Step 2: Classify */}
      {step === 2 && (
        <div className="flex flex-col gap-6 max-w-lg">
          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary">Category *</label>
            <div className="flex flex-wrap gap-2">
              {PROBLEM_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => updateForm({ category: cat.label })}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
                    formData.category === cat.label
                      ? 'bg-problem-dim border border-problem-border text-problem-500'
                      : 'bg-bg-tertiary text-text-tertiary hover:bg-bg-overlay',
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Audience */}
          <Input
            label="Who has this problem? *"
            value={formData.audience}
            onChange={(e) => updateForm({ audience: e.target.value })}
            placeholder="e.g. Backend developers, DevOps engineers, SREs"
            helperText="Separate audiences with commas, semicolons, or new lines (max 5)."
          />

          {/* Frequency */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary">How often? *</label>
            <div className="flex gap-2">
              {FREQUENCY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateForm({ frequency: opt.value as any })}
                  className={cn(
                    'rounded-sm px-4 py-2 text-xs font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
                    formData.frequency === opt.value
                      ? 'bg-problem-dim border border-problem-border text-problem-500'
                      : 'bg-bg-tertiary border border-border-subtle text-text-tertiary hover:bg-bg-overlay',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Impact rating */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary">
              Impact rating: {IMPACT_LABELS[formData.impactRating]}
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => updateForm({ impactRating: rating })}
                  className={cn(
                    'h-10 w-10 rounded-sm text-sm font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
                    formData.impactRating === rating
                      ? 'bg-problem-500 text-white'
                      : formData.impactRating > rating
                      ? 'bg-problem-dim border border-problem-border text-problem-400'
                      : 'bg-bg-tertiary border border-border-subtle text-text-tertiary hover:bg-bg-overlay',
                  )}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Tags */}
      {step === 3 && (
        <div className="flex flex-col gap-6 max-w-lg">
          <p className="text-sm text-text-secondary">
            Tags help others discover your problem. (Tag system coming soon — skip for now)
          </p>
          <div className="rounded-md border border-border-subtle bg-bg-secondary px-4 py-6 text-center">
            <p className="text-xs text-text-tertiary">Tags will be suggested by AI after posting.</p>
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <div className="flex flex-col gap-6 max-w-lg">
          <div className="rounded-md border border-border-default bg-bg-secondary p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Review your problem</h3>

            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs text-text-tertiary mb-1">Title</p>
                <p className="text-sm text-text-primary">{formData.title}</p>
              </div>
              <div>
                <p className="text-xs text-text-tertiary mb-1">Category</p>
                <p className="text-sm text-text-primary">{formData.category}</p>
              </div>
              <div>
                <p className="text-xs text-text-tertiary mb-1">Description</p>
                <p className="text-sm text-text-secondary line-clamp-3">{formData.description}</p>
              </div>
            </div>
          </div>

          {/* Visibility */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-text-secondary">Visibility</label>
            <div className="flex gap-2">
              {(['public', 'anonymous'] as const).map((vis) => (
                <button
                  key={vis}
                  type="button"
                  onClick={() =>
                    updateForm({
                      visibility: vis,
                      isAnonymous: vis === 'anonymous',
                    })
                  }
                  className={cn(
                    'flex-1 rounded-sm py-2 text-xs font-medium transition-colors',
                    'border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
                    formData.visibility === vis
                      ? 'bg-problem-dim border-problem-border text-problem-500'
                      : 'bg-bg-tertiary border-border-subtle text-text-tertiary hover:bg-bg-overlay',
                  )}
                >
                  {vis === 'public' ? 'Public (show my name)' : 'Anonymous'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 max-w-lg">
        {step > 1 ? (
          <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            Back
          </Button>
        ) : (
          <div />
        )}

        {step < STEPS.length ? (
          <Button
            onClick={() => setStep((s) => s + 1)}
            disabled={
              (step === 1 && (formData.title.length < 10 || formData.description.length < 50)) ||
              (step === 2 && (!formData.category || !formData.audience))
            }
          >
            Continue
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </Button>
        ) : (
          <Button onClick={handleSubmit} isLoading={isSubmitting}>
            Post problem
          </Button>
        )}
      </div>
    </div>
  );
}
