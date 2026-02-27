'use client';

import { forwardRef, ButtonHTMLAttributes, AnchorHTMLAttributes, ReactElement, cloneElement, Children } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  /** Render as a child element (e.g. <Link>). Passes className + disabled to the child. */
  asChild?: boolean;
}

function buttonClasses({
  variant = 'primary',
  size = 'md',
  isDisabled = false,
  className,
}: {
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  isDisabled?: boolean;
  className?: string;
}) {
  return cn(
    'inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
    'select-none whitespace-nowrap',
    isDisabled && 'opacity-50 pointer-events-none',

    variant === 'primary' && [
      'bg-problem-500 text-white',
      'hover:bg-problem-600 active:bg-problem-600',
      'rounded-sm',
    ],
    variant === 'secondary' && [
      'bg-bg-tertiary border border-border-default text-text-primary',
      'hover:bg-bg-overlay active:bg-bg-overlay',
      'rounded-sm',
    ],
    variant === 'ghost' && [
      'bg-transparent text-text-secondary',
      'hover:bg-bg-secondary hover:text-text-primary',
      'active:bg-bg-tertiary',
      'rounded-sm',
    ],
    variant === 'destructive' && [
      'bg-error-dim border border-error-border text-error',
      'hover:bg-[rgba(239,68,68,0.20)]',
      'rounded-sm',
    ],

    size === 'sm' && 'h-8 px-3 text-xs',
    size === 'md' && 'h-10 px-4 text-sm',
    size === 'lg' && 'h-11 px-6 text-sm',
    size === 'icon' && 'h-9 w-9 p-0',

    className,
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;
    const classes = buttonClasses({ variant, size, isDisabled, className });

    if (asChild) {
      const child = Children.only(children) as ReactElement<{ className?: string }>;
      return cloneElement(child, {
        ...props,
        className: cn(classes, child.props.className),
      });
    }

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={classes}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
            {children}
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
