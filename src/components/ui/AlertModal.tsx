import React, { useEffect } from 'react';
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Sparkles, 
  X, 
  ArrowRight 
} from 'lucide-react';
import { useNoticeStore } from '../../stores/noticeStore';

export const AlertModal: React.FC = () => {
  const { alertModal, closeAlertModal } = useNoticeStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && alertModal) {
        if (alertModal.onCancel) {
          alertModal.onCancel();
        }
        closeAlertModal();
      }
    };
    if (alertModal) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [alertModal, closeAlertModal]);

  if (!alertModal) return null;

  const isGuest = alertModal.type === 'guest';
  const isWarning = alertModal.type === 'warning';
  const isError = alertModal.type === 'error';
  const isSuccess = alertModal.type === 'success';

  const confirmText = alertModal.confirmLabel || (isGuest ? 'Create Account' : 'Got it');
  const cancelText = alertModal.cancelLabel || (isGuest ? 'Keep Browsing' : (alertModal.onCancel ? 'Cancel' : undefined));

  const handleConfirm = () => {
    if (alertModal.onConfirm) {
      alertModal.onConfirm();
    }
    closeAlertModal();
  };

  const handleCancel = () => {
    if (alertModal.onCancel) {
      alertModal.onCancel();
    }
    closeAlertModal();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-modal-title"
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={handleCancel}
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-vibe-card border border-vibe-border shadow-2xl p-6 sm:p-7 overflow-hidden transition-all duration-300 celebration-toast-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow Line */}
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${
            isGuest
              ? 'from-emerald-500 via-amber-400 to-emerald-400'
              : isError
              ? 'from-rose-500 to-red-400'
              : isWarning
              ? 'from-amber-500 to-orange-400'
              : isSuccess
              ? 'from-emerald-500 to-teal-400'
              : 'from-sky-500 to-indigo-400'
          }`}
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleCancel}
          aria-label="Close dialog"
          className="absolute top-4.5 right-4.5 w-8 h-8 rounded-full text-vibe-ink-muted hover:text-vibe-ink hover:bg-vibe-card-subtle flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center text-center mt-2">
          {/* Icon Badge */}
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4.5 shadow-md ${
              isGuest
                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white'
                : isError
                ? 'bg-gradient-to-br from-rose-500 to-rose-600 text-white'
                : isWarning
                ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white'
                : isSuccess
                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white'
                : 'bg-gradient-to-br from-sky-500 to-indigo-600 text-white'
            }`}
          >
            {isGuest ? (
              <Sparkles className="w-7 h-7 animate-bounce-subtle" />
            ) : isError ? (
              <AlertCircle className="w-7 h-7" />
            ) : isWarning ? (
              <AlertTriangle className="w-7 h-7" />
            ) : isSuccess ? (
              <CheckCircle2 className="w-7 h-7" />
            ) : (
              <Info className="w-7 h-7" />
            )}
          </div>

          {/* Title */}
          <h3
            id="alert-modal-title"
            className="font-heading text-xl font-bold text-vibe-ink tracking-tight mb-2"
          >
            {alertModal.title}
          </h3>

          {/* Message */}
          <p className="text-sm text-vibe-ink-secondary leading-relaxed max-w-sm mb-6">
            {alertModal.message}
          </p>

          {/* Action Buttons */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-2.5">
            {cancelText && (
              <button
                type="button"
                onClick={handleCancel}
                className="w-full sm:w-auto flex-1 px-4 py-2.5 rounded-xl border border-vibe-border bg-vibe-card-subtle text-vibe-ink-secondary hover:text-vibe-ink hover:bg-vibe-card-hover text-sm font-medium transition-colors"
              >
                {cancelText}
              </button>
            )}

            <button
              type="button"
              onClick={handleConfirm}
              className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-vibe-accent hover:bg-vibe-accent-hover text-white text-sm font-semibold shadow-sm transition-all"
            >
              <span>{confirmText}</span>
              {isGuest && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
