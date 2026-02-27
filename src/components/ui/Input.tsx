'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
  helperText?: string;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, hasError, helperText, label, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            // Base
            'h-10 w-full rounded-sm px-3 text-sm text-text-primary',
            'bg-bg-input border',
            'placeholder:text-text-muted',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-border-focus',
            'disabled:opacity-50 disabled:cursor-not-allowed',

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

Input.displayName = 'Input';
