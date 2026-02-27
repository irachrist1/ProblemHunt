'use client';

import { useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import type { CommentWithAuthor } from '@/types/domain';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { formatRelativeTime } from '@/lib/utils';
import { MessageSquare, Reply, Trash2, SmilePlus } from 'lucide-react';
import { ConvexError } from 'convex/values';

interface CommentInputProps {
  problemId: Id<'problems'>;
  parentId?: Id<'comments'>;
  onDone?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

function CommentInput({ problemId, parentId, onDone, placeholder, autoFocus }: CommentInputProps) {
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createComment = useMutation(api.comments.mutations.createComment);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setIsSubmitting(true);
    try {
      await createComment({ problemId, parentId, body: body.trim() });
      setBody('');
      onDone?.();
    } catch (err) {
      const msg = err instanceof ConvexError ? (err.data as string) : 'Failed to post comment.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={placeholder ?? 'Add a comment…'}
        maxLength={2000}
        showCount
        rows={3}
        autoFocus={autoFocus}
        required
      />
      <div className="flex items-center gap-2 justify-end">
        {onDone && (
          <Button type="button" variant="ghost" size="sm" onClick={onDone}>
            Cancel
          </Button>
        )}
        <Button type="submit" size="sm" isLoading={isSubmitting} disabled={!body.trim()}>
          Post
        </Button>
      </div>
    </form>
  );
}

// ---------- Reaction emojis ----------

type ReactionKey = 'thumbsUp' | 'bulb' | 'heart';

const REACTION_MAP: Record<ReactionKey, string> = {
  thumbsUp: '👍',
  bulb: '💡',
  heart: '❤️',
};

const REACTION_KEYS = Object.keys(REACTION_MAP) as ReactionKey[];

interface ReactionBarProps {
  commentId: Id<'comments'>;
  reactions: Record<string, number>;
  userReaction: string | null;
}

function ReactionBar({ commentId, reactions, userReaction }: ReactionBarProps) {
  const reactToComment = useMutation(api.comments.mutations.reactToComment);
  const toast = useToast();

  const handleReact = async (key: ReactionKey) => {
    try {
      await reactToComment({ commentId, emoji: key });
    } catch {
      toast.error('Could not add reaction.');
    }
  };

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {REACTION_KEYS.map((key) => {
        const count = reactions[key] ?? 0;
        const isActive = userReaction === key;
        if (count === 0 && !isActive) return null;
        return (
          <button
            key={key}
            onClick={() => handleReact(key)}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors ${
              isActive
                ? 'bg-problem-dim border-problem-border text-problem-500'
                : 'bg-bg-tertiary border-border-subtle text-text-secondary hover:border-border-default'
            }`}
          >
            {REACTION_MAP[key]} {count > 0 && <span>{count}</span>}
          </button>
        );
      })}
      <button
        onClick={() => {/* show emoji picker */}}
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs border border-border-subtle text-text-muted hover:border-border-default hover:text-text-secondary transition-colors"
        aria-label="Add reaction"
      >
        <SmilePlus className="h-3 w-3" strokeWidth={1.5} />
      </button>
    </div>
  );
}

// ---------- Single comment ----------

interface CommentItemProps {
  comment: CommentWithAuthor;
  problemId: Id<'problems'>;
  depth: number;
  currentUserId: string | null;
}

function CommentItem({ comment, problemId, depth, currentUserId }: CommentItemProps) {
  const [replyOpen, setReplyOpen] = useState(false);
  const deleteComment = useMutation(api.comments.mutations.deleteComment);
  const toast = useToast();

  const handleDelete = async () => {
    try {
      await deleteComment({ commentId: comment._id as unknown as Id<'comments'> });
    } catch {
      toast.error('Could not delete comment.');
    }
  };

  const isDeleted = comment.isDeleted;
  const isAuthor = currentUserId === comment.authorId;

  return (
    <div className={`flex gap-3 ${depth > 0 ? 'ml-8 border-l border-border-subtle pl-4' : ''}`}>
      {/* Avatar */}
      <div className="flex-shrink-0 pt-0.5">
        {isDeleted ? (
          <div className="h-7 w-7 rounded-full bg-bg-tertiary" />
        ) : (
          <UserAvatar
            name={comment.author?.name ?? 'Unknown'}
            avatarUrl={comment.author?.avatarUrl ?? undefined}
            size="xs"
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          {!isDeleted && (
            <span className="text-xs font-medium text-text-primary">
              {comment.author?.name ?? 'Unknown'}
            </span>
          )}
          <span className="text-xs text-text-muted">
            {formatRelativeTime(comment.createdAt)}
          </span>
        </div>

        {/* Body */}
        <p
          className={`text-sm leading-relaxed ${
            isDeleted ? 'text-text-muted italic' : 'text-text-secondary'
          }`}
        >
          {comment.body}
        </p>

        {/* Actions */}
        {!isDeleted && (
          <div className="mt-2 flex items-center gap-3">
            <ReactionBar
              commentId={comment._id as unknown as Id<'comments'>}
              reactions={comment.reactions ?? {}}
              userReaction={comment.userReaction ?? null}
            />
            {depth < 1 && (
              <button
                onClick={() => setReplyOpen(!replyOpen)}
                className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors"
              >
                <Reply className="h-3 w-3" strokeWidth={1.5} />
                Reply
              </button>
            )}
            {isAuthor && (
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-error transition-colors"
              >
                <Trash2 className="h-3 w-3" strokeWidth={1.5} />
                Delete
              </button>
            )}
          </div>
        )}

        {/* Reply input */}
        {replyOpen && (
          <div className="mt-3">
            <CommentInput
              problemId={problemId}
              parentId={comment._id as unknown as Id<'comments'>}
              onDone={() => setReplyOpen(false)}
              placeholder="Write a reply…"
              autoFocus
            />
          </div>
        )}

        {/* Nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 flex flex-col gap-4">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply._id}
                comment={reply}
                problemId={problemId}
                depth={depth + 1}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------- Thread ----------

interface CommentThreadProps {
  problemId: Id<'problems'>;
  currentUserId: string | null;
}

export function CommentThread({ problemId, currentUserId }: CommentThreadProps) {
  const comments = useQuery(api.comments.queries.listThreaded, { problemId });

  return (
    <section className="mt-8">
      <h2 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-text-muted" strokeWidth={1.5} />
        {comments === undefined ? 'Comments' : `${comments.length} Comments`}
      </h2>

      {/* New comment input */}
      {currentUserId ? (
        <div className="mb-6">
          <CommentInput problemId={problemId} placeholder="Share your experience or thoughts…" />
        </div>
      ) : (
        <p className="mb-6 text-sm text-text-muted">
          <a href="/auth/sign-in" className="text-problem-500 hover:underline">
            Sign in
          </a>{' '}
          to leave a comment.
        </p>
      )}

      {/* Comment list */}
      {comments === undefined ? (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      ) : comments.length === 0 ? (
        <div className="py-12 text-center text-text-muted text-sm">
          No comments yet. Be the first to share your experience.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {(comments as CommentWithAuthor[]).map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              problemId={problemId}
              depth={0}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </section>
  );
}
