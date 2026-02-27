'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toastVariants } from '@/lib/motion';

// ─── Types ────────────────────────────────────────────────────────────────

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toast: (opts: Omit<Toast, 'id'>) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <Toaster>');
  return ctx;
}

// ─── Toast config ────────────────────────────────────────────────────────

const VARIANT_CONFIG: Record<
  ToastVariant,
  { icon: typeof CheckCircle2; iconClass: string; borderClass: string; bgClass: string }
> = {
  success: {
    icon: CheckCircle2,
    iconClass: 'text-solution-500',
    borderClass: 'border-solution-border',
    bgClass: 'bg-bg-overlay',
  },
  error: {
    icon: XCircle,
    iconClass: 'text-error',
    borderClass: 'border-error-border',
    bgClass: 'bg-bg-overlay',
  },
  info: {
    icon: Info,
    iconClass: 'text-info',
    borderClass: 'border-border-default',
    bgClass: 'bg-bg-overlay',
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'text-warning',
    borderClass: 'border-border-default',
    bgClass: 'bg-bg-overlay',
  },
};

// ─── Toast Item ───────────────────────────────────────────────────────────

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const config = VARIANT_CONFIG[toast.variant];
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration ?? 4000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <motion.div
      key={toast.id}
      layout
      variants={toastVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn(
        'flex items-start gap-3 rounded-md border p-4',
        'shadow-modal max-w-sm',
        config.bgClass,
        config.borderClass,
      )}
      role="alert"
      aria-live="assertive"
    >
      <Icon className={cn('mt-0.5 h-4 w-4 flex-shrink-0', config.iconClass)} strokeWidth={1.5} />
      <p className="flex-1 text-sm text-text-primary">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 text-text-muted hover:text-text-secondary transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" strokeWidth={1.5} />
      </button>
    </motion.div>
  );
}

// ─── Toaster Provider ────────────────────────────────────────────────────

export function Toaster({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((opts: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev.slice(-4), { ...opts, id }]); // Max 5 toasts
  }, []);

  const ctx: ToastContextValue = {
    toast: addToast,
    success: (message) => addToast({ message, variant: 'success' }),
    error: (message) => addToast({ message, variant: 'error' }),
    info: (message) => addToast({ message, variant: 'info' }),
    warning: (message) => addToast({ message, variant: 'warning' }),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      {/* Toast portal */}
      <div
        aria-label="Notifications"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
