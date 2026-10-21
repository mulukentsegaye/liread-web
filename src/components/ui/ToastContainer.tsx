import React from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X, 
  ArrowRight 
} from 'lucide-react';
import { useNoticeStore, ToastItem } from '../../stores/noticeStore';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useNoticeStore();

  if (toasts.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Notifications"
      className="fixed top-5 right-4 sm:right-6 z-[115] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-[calc(100%-2rem)] pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

interface ToastCardProps {
  toast: ToastItem;
  onDismiss: () => void;
}

const ToastCard: React.FC<ToastCardProps> = ({ toast, onDismiss }) => {
  const isSuccess = toast.type === 'success';
  const isWarning = toast.type === 'warning';
  const isError = toast.type === 'error';
  const isInfo = toast.type === 'info';

  const accentColorClass = isSuccess
    ? 'border-emerald-500/30 dark:border-emerald-500/40'
    : isWarning
    ? 'border-amber-500/30 dark:border-amber-500/40'
    : isError
    ? 'border-rose-500/30 dark:border-rose-500/40'
    : 'border-sky-500/30 dark:border-sky-500/40';

  const topGlowGradient = isSuccess
    ? 'from-emerald-500 to-teal-400'
    : isWarning
    ? 'from-amber-500 to-orange-400'
    : isError
    ? 'from-rose-500 to-red-400'
    : 'from-sky-500 to-indigo-400';

  const iconBg = isSuccess
    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
    : isWarning
    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
    : isError
    ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
    : 'bg-sky-500/15 text-sky-600 dark:text-sky-400';

  return (
    <div
      role="status"
      aria-live="polite"
      className={`relative overflow-hidden rounded-2xl bg-vibe-card/95 backdrop-blur-md border ${accentColorClass} shadow-xl p-3.5 sm:p-4 pointer-events-auto transition-all duration-300 celebration-toast-enter`}
    >
      {/* Ambient Top Glow Line */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${topGlowGradient}`} />

      <div className="flex items-start gap-3">
        {/* Status Icon */}
        <div className={`w-8 h-8 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
          {isSuccess && <CheckCircle2 className="w-4.5 h-4.5" />}
          {isWarning && <AlertTriangle className="w-4.5 h-4.5" />}
          {isError && <AlertCircle className="w-4.5 h-4.5" />}
          {isInfo && <Info className="w-4.5 h-4.5" />}
        </div>

        {/* Content details */}
        <div className="flex-1 min-w-0 pr-1">
          {toast.title && (
            <h4 className="font-heading text-sm font-semibold text-vibe-ink tracking-tight mb-0.5">
              {toast.title}
            </h4>
          )}
          <p className="text-xs text-vibe-ink-secondary leading-relaxed">
            {toast.message}
          </p>

          {/* Optional Action Button */}
          {toast.action && (
            <div className="mt-2.5">
              <button
                type="button"
                onClick={() => {
                  toast.action?.onClick();
                  onDismiss();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-vibe-accent text-white hover:bg-vibe-accent-hover transition-colors shadow-xs"
              >
                <span>{toast.action.label}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="flex-shrink-0 w-6 h-6 rounded-lg text-vibe-ink-muted hover:text-vibe-ink hover:bg-vibe-card-subtle flex items-center justify-center transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
