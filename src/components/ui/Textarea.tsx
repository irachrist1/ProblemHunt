'use client';

import { forwardRef, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
  helperText?: string;
  label?: string;
  showCount?: boolean;
  maxLength?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      hasError,
      helperText,
      label,
      id,
      showCount,
      maxLength,
      value,
      ...props
    },
    ref,
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    const charCount = typeof value === 'string' ? value.length : 0;

    return (
      <div className="flex flex-col gap-1.5">
        {(label || (showCount && maxLength)) && (
          <div className="flex items-center justify-between">
            {label && (
              <label
                htmlFor={inputId}
                className="text-xs font-medium text-text-secondary"
              >
                {label}
              </label>
            )}
            {showCount && maxLength && (
              <span
                className={cn(
                  'text-xs tabular-nums',
                  charCount > maxLength * 0.9
                    ? charCount >= maxLength
                      ? 'text-error'
                      : 'text-warning'
                    : 'text-text-muted',
                )}
              >
                {charCount}/{maxLength}
              </span>
            )}
          </div>
        )}
        <textarea
          ref={ref}
          id={inputId}
          value={value}
          maxLength={maxLength}
          className={cn(
            // Base
            'w-full rounded-sm px-3 py-2.5 text-sm text-text-primary',
            'bg-bg-input border',
            'placeholder:text-text-muted',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-border-focus',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'resize-y min-h-24',

            // States
            hasError
              ? 'border-error bg-error-dim focus:ring-error/50'
              : 'border-border-default hover:border-border-strong focus:border-border-focus',

            className,
          )}
          aria-invalid={hasError}
          aria-describedby={helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        {helperText && (
          <p
            id={`${inputId}-helper`}
            className={cn(
              'text-xs',
              hasError ? 'text-error' : 'text-text-tertiary',
            )}
            aria-live="polite"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
