'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn, formatCount } from '@/lib/utils';
import { springSnappy } from '@/lib/motion';
import type { VoteType } from '@/types/domain';

type VoteAction = 'upvote' | 'downvote';

export interface UpvoteButtonProps {
  voteCount: number;
  downvoteCount?: number;
  userVoteType?: VoteType | null;
  onVote: (type: VoteAction) => void;
  isLoading?: boolean;
  variant?: 'vertical' | 'horizontal';
  disabled?: boolean;
  className?: string;
}

function VoteActionButton({
  action,
  isActive,
  count,
  disabled,
  isLoading,
  animating,
  onPress,
}: {
  action: VoteAction;
  isActive: boolean;
  count: number;
  disabled?: boolean;
  isLoading?: boolean;
  animating: boolean;
  onPress: () => void;
}) {
  const Icon = action === 'upvote' ? ChevronUp : ChevronDown;

  return (
    <motion.button
      type="button"
      onClick={onPress}
      disabled={disabled || isLoading}
      animate={animating ? { scale: [1, 0.9, 1.1, 1] } : {}}
      whileTap={{ scale: 1.15 }}
      transition={animating ? { duration: 0.25, ease: [0.34, 1.56, 0.64, 1] } : { type: 'spring', stiffness: 400, damping: 15 }}
      className={cn(
        'flex h-8 w-14 items-center justify-center gap-1 rounded-sm border',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        isActive
          ? action === 'upvote'
            ? 'bg-problem-dim border-problem-border text-problem-500'
            : 'bg-error-dim border-error-border text-error'
          : 'bg-bg-secondary border-border-subtle text-text-secondary hover:bg-bg-tertiary hover:border-border-default hover:text-text-primary',
      )}
      aria-label={`${action === 'upvote' ? 'Upvote' : 'Downvote'} (${count})`}
      aria-pressed={isActive}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2} />
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={count}
          initial={{ y: -6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 6, opacity: 0 }}
          transition={springSnappy}
          className="text-xs font-medium tabular-nums"
        >
          {formatCount(count)}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

export function UpvoteButton({
  voteCount,
  downvoteCount = 0,
  userVoteType,
  onVote,
  isLoading,
  variant = 'vertical',
  disabled,
  className,
}: UpvoteButtonProps) {
  const [animating, setAnimating] = useState<VoteAction | null>(null);

  const handleVote = (type: VoteAction) => {
    if (disabled || isLoading) return;
    setAnimating(type);
    setTimeout(() => setAnimating(null), 260);
    onVote(type);
  };

  if (variant === 'horizontal') {
    return (
      <div className={cn('inline-flex items-center gap-2', className)}>
        <VoteActionButton
          action="upvote"
          isActive={userVoteType === 'upvote'}
          count={voteCount}
          disabled={disabled}
          isLoading={isLoading}
          animating={animating === 'upvote'}
          onPress={() => handleVote('upvote')}
        />
        <VoteActionButton
          action="downvote"
          isActive={userVoteType === 'downvote'}
          count={downvoteCount}
          disabled={disabled}
          isLoading={isLoading}
          animating={animating === 'downvote'}
          onPress={() => handleVote('downvote')}
        />
      </div>
    );
  }

  return (
    <div className={cn('flex w-12 flex-col gap-1', className)}>
      <VoteActionButton
        action="upvote"
        isActive={userVoteType === 'upvote'}
        count={voteCount}
        disabled={disabled}
        isLoading={isLoading}
        animating={animating === 'upvote'}
        onPress={() => handleVote('upvote')}
      />
      <VoteActionButton
        action="downvote"
        isActive={userVoteType === 'downvote'}
        count={downvoteCount}
        disabled={disabled}
        isLoading={isLoading}
        animating={animating === 'downvote'}
        onPress={() => handleVote('downvote')}
      />
    </div>
  );
}
