import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  X,
  KeyRound
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useNoticeStore } from '../../stores/noticeStore';
import { describeAuthError } from '../../lib/authErrors';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { updatePassword } = useAuthStore();
  const { showToast } = useNoticeStore();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNewPassword('');
      setConfirmPassword('');
      setErrorMsg(null);
      setIsSuccess(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading && !isSuccess) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, isSuccess, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(newPassword);
      setIsSuccess(true);

      // Clean up reset-password anchor/hash from URL
      try {
        const clean = new URL(window.location.href);
        clean.hash = clean.hash.replace(/#reset-password/g, '').replace(/type=recovery/g, '');
        window.history.replaceState({}, '', clean.toString());
      } catch {}

      showToast({
        type: 'success',
        title: 'Password Updated',
        message: 'Your new password has been set. You are now signed in!',
      });

      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1400);
    } catch (err: any) {
      const msg = describeAuthError(err);
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      onClick={() => {
        if (!loading && !isSuccess) onClose();
      }}
    >
      <div 
        className="w-full max-w-sm rounded-3xl bg-vibe-card border border-vibe-border shadow-2xl p-6 text-vibe-ink animate-in zoom-in-95 duration-200 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-vibe-accent" />

        {/* Header */}
        <div className="flex items-start justify-between pb-3 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-vibe-accent/15 text-vibe-accent flex items-center justify-center flex-shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-vibe-ink">
                Set New Password
              </h3>
              <p className="text-[11px] text-vibe-ink-muted">
                Choose a new secure password
              </p>
            </div>
          </div>

          {!loading && !isSuccess && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 rounded-full flex items-center justify-center text-vibe-ink-muted hover:text-vibe-ink hover:bg-vibe-card-subtle transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {isSuccess ? (
          <div className="space-y-4 py-4 text-center animate-in fade-in duration-300">
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-vibe-ink">
                Password Successfully Reset!
              </p>
              <p className="text-xs text-vibe-ink-secondary">
                Your account is ready. Redirecting you to your library...
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs flex items-start gap-2 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="leading-snug flex-1">{errorMsg}</span>
              </div>
            )}

            {/* New Password */}
            <div className="space-y-1 text-left">
              <label className="text-xs font-semibold text-vibe-ink">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-vibe-ink-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="At least 6 characters"
                  required
                  autoFocus
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-vibe-card-subtle border border-vibe-border text-xs text-vibe-ink placeholder:text-vibe-ink-muted focus:outline-hidden focus:border-vibe-accent transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-vibe-ink-muted hover:text-vibe-ink transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1 text-left">
              <label className="text-xs font-semibold text-vibe-ink">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-vibe-ink-muted" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="Repeat new password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-vibe-card-subtle border border-vibe-border text-xs text-vibe-ink placeholder:text-vibe-ink-muted focus:outline-hidden focus:border-vibe-accent transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-vibe-ink-muted hover:text-vibe-ink transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-2.5 rounded-full border border-vibe-border text-xs font-semibold text-vibe-ink-muted hover:text-vibe-ink hover:bg-vibe-card-subtle transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !newPassword || !confirmPassword}
                className="flex-1 py-2.5 rounded-full bg-vibe-accent text-white text-xs font-semibold hover:bg-vibe-accent-hover transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
