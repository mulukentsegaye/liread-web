import React, { useState, useEffect } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  Flame, 
  BookOpen, 
  Clock, 
  User, 
  RefreshCw, 
  Bookmark,
  ShieldCheck,
  Loader2,
  Mail
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useNoticeStore } from '../../stores/noticeStore';
import { DEFAULT_USER_AVATAR } from '../../data/defaults';
import { describeAuthError } from '../../lib/authErrors';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'signin' | 'signup' | 'account';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  defaultTab = 'signin' 
}) => {
  const { 
    user, 
    isAuthenticated, 
    isGuest,
    signIn, 
    signUp, 
    signOut, 
    isLoading,
    resendConfirmationEmail
  } = useAuthStore();
  const { showToast } = useNoticeStore();

  const [tab, setTab] = useState<'signin' | 'signup' | 'account'>(
    isAuthenticated ? 'account' : defaultTab
  );

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [isResending, setIsResending] = useState(false);

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

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

  useEffect(() => {
    if (isOpen) {
      if (isAuthenticated) {
        setTab('account');
      } else {
        setTab(defaultTab === 'account' ? 'signin' : defaultTab);
      }
      setStatusMessage(null);
    }
  }, [isOpen, isAuthenticated, defaultTab]);

  if (!isOpen) return null;

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
      }, 900);
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
      }, 1000);
    } catch (err: any) {
      const msg = describeAuthError(err);
      setStatusMessage({ type: 'error', text: msg });
      showToast({ type: 'error', title: 'Registration Notice', message: msg });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      onClose();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Failed to sign out. Please try again.' });
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md rounded-2xl sm:rounded-3xl p-5 sm:p-7 bg-vibe-card border border-vibe-border text-vibe-ink shadow-vibe-elevated flex flex-col justify-between max-h-[95vh] overflow-y-auto transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-vibe-border pb-3.5 mb-4">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-vibe-accent/15 text-vibe-accent flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h2 className="font-heading text-base sm:text-lg font-bold text-vibe-ink truncate">
                  {tab === 'account' 
                    ? (isGuest ? 'Guest Account' : 'Your Account')
                    : (tab === 'signup' ? 'Create Reader Account' : 'Sign In to Liread')}
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close modal"
              className="min-w-[34px] min-h-[34px] flex items-center justify-center rounded-full text-vibe-ink-muted hover:text-vibe-ink hover:bg-vibe-card-subtle transition-colors flex-shrink-0"
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
                    className="self-start inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-vibe-accent text-white font-semibold text-xs hover:bg-vibe-accent-hover disabled:opacity-50 transition-colors shadow-xs"
                  >
                    {isResending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                    <span>Resend confirmation link</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* VIEW 1: AUTHENTICATED MEMBER ACCOUNT */}
          {tab === 'account' && isAuthenticated && !isGuest && user && (
            <div className="space-y-4">
              
              {/* Profile Card */}
              <div className="p-4 rounded-2xl bg-vibe-card-subtle border border-vibe-border flex items-center gap-3.5">
                <img
                  src={user.avatarUrl || DEFAULT_USER_AVATAR}
                  alt={user.fullName}
                  className="w-13 h-13 rounded-full object-cover ring-2 ring-vibe-accent/30 flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading text-sm font-bold text-vibe-ink truncate">
                      {user.fullName}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-vibe-accent/10 text-vibe-accent border border-vibe-accent/20 flex-shrink-0">
                      {user.rankTier}
                    </span>
                  </div>
                  <p className="text-xs text-vibe-ink-muted truncate mt-0.5">
                    @{user.username}
                  </p>
                </div>
              </div>

              {/* Reading Stats Summary */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 rounded-xl bg-vibe-card-subtle border border-vibe-border text-center">
                  <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
                    <Flame className="w-3.5 h-3.5 fill-current" />
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Streak</span>
                  </div>
                  <span className="font-mono text-base font-bold text-vibe-ink">
                    {user.currentStreak}
                  </span>
                  <span className="block text-[10px] text-vibe-ink-muted">days</span>
                </div>

                <div className="p-3 rounded-xl bg-vibe-card-subtle border border-vibe-border text-center">
                  <div className="flex items-center justify-center gap-1 text-vibe-accent mb-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Books</span>
                  </div>
                  <span className="font-mono text-base font-bold text-vibe-ink">
                    {user.bookshelfCount}
                  </span>
                  <span className="block text-[10px] text-vibe-ink-muted">saved</span>
                </div>

                <div className="p-3 rounded-xl bg-vibe-card-subtle border border-vibe-border text-center">
                  <div className="flex items-center justify-center gap-1 text-sky-500 mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold">Time</span>
                  </div>
                  <span className="font-mono text-base font-bold text-vibe-ink">
                    {user.totalMinutesRead}
                  </span>
                  <span className="block text-[10px] text-vibe-ink-muted">mins</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full min-h-[40px] inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/30 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out of Account</span>
                </button>
              </div>

            </div>
          )}

          {/* VIEW 2: GUEST ACCOUNT VIEW */}
          {tab === 'account' && isGuest && (
            <div className="space-y-4">
              
              {/* Guest Explorer Card */}
              <div className="p-4 rounded-2xl bg-vibe-card-subtle border border-vibe-border space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={DEFAULT_USER_AVATAR}
                    alt="Guest"
                    className="w-12 h-12 rounded-full object-cover ring-1 ring-vibe-border flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading text-sm font-bold text-vibe-ink truncate">Guest Explorer</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        Guest Mode
                      </span>
                    </div>
                    <p className="text-xs text-vibe-ink-muted truncate mt-0.5">Read-only browsing session</p>
                  </div>
                </div>

                <p className="text-xs text-vibe-ink-secondary leading-relaxed">
                  Your reading timer history, custom ambience, and shelf items are stored locally in this browser. Create an account to permanently sync your reading progress and unlock community features.
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => setTab('signup')}
                  className="w-full min-h-[42px] inline-flex items-center justify-center gap-2 rounded-xl bg-vibe-accent hover:bg-vibe-accent-hover text-white text-xs font-semibold shadow-xs transition-all active:scale-98"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Free Account</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTab('signin')}
                  className="w-full min-h-[40px] inline-flex items-center justify-center gap-2 rounded-xl border border-vibe-border bg-vibe-card text-xs font-semibold text-vibe-ink hover:bg-vibe-card-subtle transition-all"
                >
                  <LogIn className="w-3.5 h-3.5 text-vibe-accent" />
                  <span>Sign In to Existing Account</span>
                </button>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full min-h-[38px] inline-flex items-center justify-center gap-2 rounded-xl text-xs font-medium text-vibe-ink-muted hover:text-rose-500 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Exit Guest Mode</span>
                </button>
              </div>

            </div>
          )}

          {/* VIEW 3: SIGN IN FORM */}
          {tab === 'signin' && (
            <div className="space-y-4">
              
              {/* Segmented Switch */}
              <div className="flex rounded-xl bg-vibe-card-subtle p-1 border border-vibe-border">
                <button
                  type="button"
                  onClick={() => setTab('signin')}
                  className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-vibe-card text-vibe-ink shadow-xs border border-vibe-border transition-all"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setTab('signup')}
                  className="flex-1 py-1.5 text-xs font-semibold rounded-lg text-vibe-ink-muted hover:text-vibe-ink transition-all"
                >
                  Create Account
                </button>
              </div>

              <form onSubmit={handleSignIn} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-vibe-ink-secondary mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="reader@example.com"
                    className="w-full bg-vibe-card-subtle px-3 py-2 text-xs rounded-xl border border-vibe-border text-vibe-ink focus:border-vibe-accent focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-vibe-ink-secondary mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-vibe-card-subtle px-3 py-2 text-xs rounded-xl border border-vibe-border text-vibe-ink focus:border-vibe-accent focus:outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full min-h-[42px] flex items-center justify-center gap-2 rounded-xl bg-vibe-accent hover:bg-vibe-accent-hover text-white text-xs font-semibold shadow-xs transition-all active:scale-98 disabled:opacity-50"
                >
                  {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <LogIn className="w-3.5 h-3.5" />}
                  <span>Sign In</span>
                </button>
              </form>

              {isGuest && (
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setTab('account')}
                    className="text-xs text-vibe-ink-muted hover:text-vibe-ink transition-colors"
                  >
                    ← Back to Guest Profile
                  </button>
                </div>
              )}

            </div>
          )}

          {/* VIEW 4: CREATE ACCOUNT FORM */}
          {tab === 'signup' && (
            <div className="space-y-4">
              
              {/* Segmented Switch */}
              <div className="flex rounded-xl bg-vibe-card-subtle p-1 border border-vibe-border">
                <button
                  type="button"
                  onClick={() => setTab('signin')}
                  className="flex-1 py-1.5 text-xs font-semibold rounded-lg text-vibe-ink-muted hover:text-vibe-ink transition-all"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setTab('signup')}
                  className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-vibe-card text-vibe-ink shadow-xs border border-vibe-border transition-all"
                >
                  Create Account
                </button>
              </div>

              <form onSubmit={handleSignUp} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-vibe-ink-secondary mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full bg-vibe-card-subtle px-3 py-2 text-xs rounded-xl border border-vibe-border text-vibe-ink focus:border-vibe-accent focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-vibe-ink-secondary mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                    className="w-full bg-vibe-card-subtle px-3 py-2 text-xs rounded-xl border border-vibe-border text-vibe-ink focus:border-vibe-accent focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-vibe-ink-secondary mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="reader@example.com"
                    className="w-full bg-vibe-card-subtle px-3 py-2 text-xs rounded-xl border border-vibe-border text-vibe-ink focus:border-vibe-accent focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-vibe-ink-secondary mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-vibe-card-subtle px-3 py-2 text-xs rounded-xl border border-vibe-border text-vibe-ink focus:border-vibe-accent focus:outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full min-h-[42px] flex items-center justify-center gap-2 rounded-xl bg-vibe-accent hover:bg-vibe-accent-hover text-white text-xs font-semibold shadow-xs transition-all active:scale-98 disabled:opacity-50 mt-1"
                >
                  {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                  <span>Create Account</span>
                </button>
              </form>

              {isGuest && (
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setTab('account')}
                    className="text-xs text-vibe-ink-muted hover:text-vibe-ink transition-colors"
                  >
                    ← Back to Guest Profile
                  </button>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
