'use client';

import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export interface TagChipProps {
  label: string;
  onClick?: () => void;
  onRemove?: () => void;
  isActive?: boolean;
  className?: string;
}

export function TagChip({
  label,
  onClick,
  onRemove,
  isActive,
  className,
}: TagChipProps) {
  const isClickable = !!onClick;
  const isRemovable = !!onRemove;

  const baseStyles = cn(
    'inline-flex items-center gap-1 rounded-full px-2.5 py-1',
    'text-xs font-medium',
    'transition-colors duration-150',

    isActive
      ? 'bg-problem-dim border border-problem-border text-problem-500'
      : 'bg-bg-tertiary text-text-tertiary border border-transparent',

    isClickable && !isActive && 'hover:bg-bg-overlay hover:text-text-secondary cursor-pointer',
    isClickable && 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',

    className,
  );

  if (isClickable) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={baseStyles}
        aria-pressed={isActive}
      >
        {label}
        {isRemovable && (
          <span
            role="button"
            aria-label={`Remove ${label}`}
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="ml-0.5 rounded-full p-0.5 hover:bg-black/20 cursor-pointer"
          >
            <X className="h-2.5 w-2.5" strokeWidth={2} />
          </span>
        )}
      </button>
    );
  }

  return (
    <span className={baseStyles}>
      {label}
      {isRemovable && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          className="ml-0.5 rounded-full p-0.5 hover:bg-black/20"
        >
          <X className="h-2.5 w-2.5" strokeWidth={2} />
        </button>
      )}
    </span>
  );
}
