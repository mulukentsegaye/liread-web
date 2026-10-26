import React, { useState, useEffect } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Loader2, 
  Mail,
  Lock,
  ArrowLeft,
  KeyRound
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useNoticeStore } from '../../stores/noticeStore';
import { describeAuthError } from '../../lib/authErrors';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'signin' | 'signup' | 'forgot' | 'account';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  defaultTab = 'signin' 
}) => {
  const { 
    signIn, 
    signUp, 
    isLoading,
    resendConfirmationEmail,
    resetPasswordForEmail
  } = useAuthStore();
  const { showToast } = useNoticeStore();

  const [tab, setTab] = useState<'signin' | 'signup' | 'forgot'>(
    defaultTab === 'signup' ? 'signup' : defaultTab === 'forgot' ? 'forgot' : 'signin'
  );

  // Sign in / Sign up form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTab(defaultTab === 'signup' ? 'signup' : defaultTab === 'forgot' ? 'forgot' : 'signin');
      setStatusMessage(null);
      setResetSent(false);
    }
  }, [isOpen, defaultTab]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleResendInModal = async () => {
    if (!email.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter your email address to receive the confirmation link.' });
      return;
    }
    setIsResending(true);
    try {
      await resendConfirmationEmail(email.trim());
      setStatusMessage({
        type: 'info',
        text: `Confirmation link resent to ${email}! Check your inbox and spam folder.`,
      });
      showToast({
        type: 'success',
        title: 'Confirmation Email Sent',
        message: `Fresh verification link dispatched to ${email}.`,
      });
    } catch (err: any) {
      const msg = describeAuthError(err);
      setStatusMessage({ type: 'error', text: msg });
      showToast({ type: 'error', title: 'Error Sending Link', message: msg });
    } finally {
      setIsResending(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    if (!email.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter your email address to receive reset instructions.' });
      return;
    }

    setIsSendingReset(true);
    try {
      await resetPasswordForEmail(email.trim());
      setResetSent(true);
      setStatusMessage({
        type: 'info',
        text: `Password reset link sent to ${email.trim()}! Please check your inbox and spam folder.`,
      });
      showToast({
        type: 'success',
        title: 'Reset Link Sent',
        message: `Password recovery link dispatched to ${email.trim()}.`,
      });
    } catch (err: any) {
      const msg = describeAuthError(err);
      setStatusMessage({ type: 'error', text: msg });
      showToast({ type: 'error', title: 'Unable to Send Link', message: msg });
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    try {
      await signIn(email, password);
      setStatusMessage({ type: 'success', text: 'Welcome back! Signed in successfully.' });
      showToast({
        type: 'success',
        title: 'Signed In',
        message: 'Welcome back to Liread!',
      });
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      const msg = describeAuthError(err);
      setStatusMessage({ type: 'error', text: msg });
      showToast({ type: 'error', title: 'Sign In Notice', message: msg });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    if (!username.trim() || !fullName.trim()) {
      setStatusMessage({ type: 'error', text: 'Please fill in both your username and full name.' });
      return;
    }

    try {
      await signUp(email, password, username, fullName);
      if (useAuthStore.getState().pendingConfirmationEmail) {
        setStatusMessage({
          type: 'info',
          text: 'Account created! Check your email to confirm your address, then sign in.',
        });
        showToast({
          type: 'info',
          title: 'Verification Email Sent',
          message: `Check your inbox at ${email} to activate your account.`,
          duration: 8000,
        });
        setTimeout(() => { onClose(); }, 2500);
        return;
      }
      setStatusMessage({
        type: 'success',
        text: 'Account created! You are now signed in.'
      });
      showToast({
        type: 'success',
        title: 'Account Created',
        message: 'Welcome to Liread!',
      });
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err: any) {
      const msg = describeAuthError(err);
      setStatusMessage({ type: 'error', text: msg });
      showToast({ type: 'error', title: 'Registration Notice', message: msg });
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md rounded-2xl sm:rounded-3xl p-5 sm:p-7 bg-vibe-card border border-vibe-border text-vibe-ink shadow-vibe-elevated flex flex-col justify-between max-h-[92vh] overflow-y-auto transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-vibe-border pb-3.5 mb-4">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-vibe-accent/15 text-vibe-accent flex items-center justify-center flex-shrink-0">
                {tab === 'forgot' ? <KeyRound className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <h2 className="font-heading text-base sm:text-lg font-bold text-vibe-ink truncate">
                  {tab === 'signup' 
                    ? 'Create Reader Account' 
                    : tab === 'forgot' 
                    ? 'Reset Password' 
                    : 'Sign In to Liread'}
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close modal"
              className="min-w-[34px] min-h-[34px] flex items-center justify-center rounded-full text-vibe-ink-muted hover:text-vibe-ink hover:bg-vibe-card-subtle transition-colors flex-shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Status Message Banner */}
          {statusMessage && (
            <div 
              className={`mb-4 p-3 rounded-xl text-xs flex flex-col gap-2 border ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
                  : 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30'
              }`}
            >
              <div className="flex items-start gap-2">
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                )}
                <span className="leading-snug flex-1">{statusMessage.text}</span>
              </div>

              {statusMessage.text.toLowerCase().includes('not confirmed') && (
                <div className="pt-2 border-t border-rose-500/20 ml-6">
                  <button
                    type="button"
                    disabled={isResending || !email}
                    onClick={handleResendInModal}
                    className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-vibe-accent text-white font-semibold text-xs hover:bg-vibe-accent-hover disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                  >
                    {isResending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                    <span>Resend confirmation link</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* VIEW: SIGN IN FORM */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-vibe-ink">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full min-h-[42px] px-3.5 text-xs rounded-xl bg-vibe-card-subtle border border-vibe-border text-vibe-ink focus:outline-hidden focus:border-vibe-accent transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-vibe-ink">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setTab('forgot');
                      setStatusMessage(null);
                      setResetSent(false);
                    }}
                    className="text-[11px] font-medium text-vibe-accent hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full min-h-[42px] px-3.5 text-xs rounded-xl bg-vibe-card-subtle border border-vibe-border text-vibe-ink focus:outline-hidden focus:border-vibe-accent transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full min-h-[42px] mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-vibe-accent hover:bg-vibe-accent-hover disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-all active:scale-98 cursor-pointer"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                <span>Sign In to Liread</span>
              </button>

              <div className="pt-2 text-center text-xs text-vibe-ink-muted">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setTab('signup'); setStatusMessage(null); }}
                  className="text-vibe-accent font-semibold hover:underline cursor-pointer"
                >
                  Create one now
                </button>
              </div>
            </form>
          )}

          {/* VIEW: FORGOT PASSWORD FORM */}
          {tab === 'forgot' && (
            <div className="space-y-4">
              {resetSent ? (
                <div className="space-y-4 py-3 text-center animate-in fade-in duration-200">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs sm:text-sm font-semibold text-vibe-ink">
                      Recovery Link Dispatched
                    </p>
                    <p className="text-xs text-vibe-ink-secondary leading-relaxed">
                      We sent password reset instructions to <strong className="text-vibe-ink">{email}</strong>. Please check your inbox and click the link to set a new password.
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTab('signin');
                        setStatusMessage(null);
                        setResetSent(false);
                      }}
                      className="w-full min-h-[42px] inline-flex items-center justify-center gap-2 rounded-xl bg-vibe-accent text-white text-xs font-semibold hover:bg-vibe-accent-hover transition-colors shadow-xs cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Return to Sign In</span>
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-3.5">
                  <p className="text-xs text-vibe-ink-muted leading-relaxed">
                    Enter the email address associated with your Liread account and we'll send you a link to reset your password.
                  </p>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-vibe-ink">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setStatusMessage(null);
                      }}
                      className="w-full min-h-[42px] px-3.5 text-xs rounded-xl bg-vibe-card-subtle border border-vibe-border text-vibe-ink focus:outline-hidden focus:border-vibe-accent transition-colors"
                      placeholder="you@example.com"
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingReset}
                    className="w-full min-h-[42px] mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-vibe-accent hover:bg-vibe-accent-hover disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-all active:scale-98 cursor-pointer"
                  >
                    {isSendingReset ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Link...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        <span>Send Reset Link</span>
                      </>
                    )}
                  </button>

                  <div className="pt-2 flex items-center justify-between text-xs text-vibe-ink-muted">
                    <button
                      type="button"
                      onClick={() => {
                        setTab('signin');
                        setStatusMessage(null);
                      }}
                      className="inline-flex items-center gap-1.5 text-vibe-ink-secondary hover:text-vibe-ink font-medium cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Sign In</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setTab('signup');
                        setStatusMessage(null);
                      }}
                      className="text-vibe-accent font-semibold hover:underline cursor-pointer"
                    >
                      Create account
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* VIEW: SIGN UP FORM */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-vibe-ink">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full min-h-[40px] px-3.5 text-xs rounded-xl bg-vibe-card-subtle border border-vibe-border text-vibe-ink focus:outline-hidden focus:border-vibe-accent transition-colors"
                  placeholder="Virginia Woolf"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-vibe-ink">Username Handle</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setStatusMessage(null);
                  }}
                  className="w-full min-h-[40px] px-3.5 text-xs rounded-xl bg-vibe-card-subtle border border-vibe-border text-vibe-ink focus:outline-hidden focus:border-vibe-accent transition-colors"
                  placeholder="@virginia"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-vibe-ink">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setStatusMessage(null);
                  }}
                  className="w-full min-h-[40px] px-3.5 text-xs rounded-xl bg-vibe-card-subtle border border-vibe-border text-vibe-ink focus:outline-hidden focus:border-vibe-accent transition-colors"
                  placeholder="virginia@example.com"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-vibe-ink">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full min-h-[40px] px-3.5 text-xs rounded-xl bg-vibe-card-subtle border border-vibe-border text-vibe-ink focus:outline-hidden focus:border-vibe-accent transition-colors"
                  placeholder="At least 6 characters"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full min-h-[42px] mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-vibe-accent hover:bg-vibe-accent-hover disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-all active:scale-98 cursor-pointer"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                <span>Join Liread Community</span>
              </button>

              <div className="pt-2 text-center text-xs text-vibe-ink-muted">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setTab('signin'); setStatusMessage(null); }}
                  className="text-vibe-accent font-semibold hover:underline cursor-pointer"
                >
                  Sign in instead
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};