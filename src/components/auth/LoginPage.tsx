import React, { useState } from 'react';
import { 
  BookOpen, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Flame,
  Clock,
  ShieldCheck,
  Bookmark
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface LoginPageProps {
  onSuccess: () => void;
  onGoBack: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onGoBack }) => {
  const { login } = useAuthStore();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isForgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    if (mode === 'signup' && (!fullName || !username)) {
      setErrorMsg('Please provide your full name and a unique username.');
      return;
    }

    setLoading(true);

    try {
      if (isSupabaseConfigured()) {
        if (mode === 'signup') {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
                username: username.replace(/^@/, ''),
              },
            },
          });
          if (error) throw error;
          
          login({
            id: data.user?.id || 'user-alex-morgan',
            fullName: fullName || 'Book Lover',
            username: username.replace(/^@/, '') || 'reader',
            subtitle: email,
          });
          setSuccessMsg('Account created successfully! Welcome to Readers Hub.');
          setTimeout(() => onSuccess(), 800);
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          
          login({
            id: data.user?.id,
            fullName: data.user?.user_metadata?.full_name || email.split('@')[0] || 'Reader',
            username: data.user?.user_metadata?.username || email.split('@')[0] || 'reader',
          });
          setSuccessMsg('Signed in successfully! Opening your library...');
          setTimeout(() => onSuccess(), 600);
        }
      } else {
        // Simulated local authentication when Supabase is not configured
        await new Promise((res) => setTimeout(res, 600));
        
        login({
          fullName: mode === 'signup' ? fullName : (email.split('@')[0] || 'Reader'),
          username: mode === 'signup' ? username.replace(/^@/, '') : (email.split('@')[0] || 'reader'),
        });
        
        setSuccessMsg(mode === 'signup' ? 'Welcome to Readers Hub!' : 'Welcome back to Readers Hub!');
        setTimeout(() => onSuccess(), 600);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setLoading(true);
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.resetPasswordForEmail(resetEmail);
      } catch (e) {
        // Fallback gracefully
      }
    }
    setTimeout(() => {
      setLoading(false);
      setResetSent(true);
    }, 500);
  };

  return (
    <div 
      className="min-h-screen w-full flex flex-col justify-between transition-colors duration-500 overflow-x-clip"
      style={{
        backgroundColor: 'var(--vibe-bg)',
        color: 'var(--vibe-ink)',
      }}
    >
      {/* 1. Sleek Top Navigation Bar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onGoBack}
          className="group flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-vibe-ink-secondary hover:text-vibe-ink hover:bg-vibe-card-subtle transition-all border border-vibe-border shadow-xs active:scale-95"
          title="Return to Home"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:hidden">
            <div className="w-7 h-7 rounded-lg bg-vibe-accent flex items-center justify-center text-white shadow-xs">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-serif text-lg font-bold tracking-tight text-vibe-ink">
              Readers Hub
            </span>
          </div>
        </div>
      </header>

      {/* 2. Main Authentication Shell */}
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-1 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 rounded-3xl bg-vibe-card border border-vibe-border shadow-vibe-elevated overflow-hidden transition-all duration-500">
          
          {/* Left Column: Bookish Atmosphere Showcase (Desktop only: lg+) */}
          <div className="hidden lg:flex lg:col-span-5 p-8 xl:p-10 flex-col justify-between relative bg-vibe-card-subtle border-r border-vibe-border overflow-hidden">
            {/* Top Brand Block */}
            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-vibe-accent flex items-center justify-center text-white shadow-xs">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="font-serif text-2xl font-bold tracking-tight text-vibe-ink">
                  Readers Hub
                </span>
              </div>
              <p className="text-xs text-vibe-ink-secondary leading-relaxed">
                Your dedicated space for active reading sessions, inspiring passages, and mindful habits.
              </p>
            </div>

            {/* Center Editorial Quote Card */}
            <div className="relative z-10 my-8 p-5 rounded-2xl bg-vibe-card/90 backdrop-blur-md border border-vibe-border shadow-soft space-y-3">
              <div className="flex items-center gap-2 text-vibe-accent text-xs font-semibold">
                <Bookmark className="w-3.5 h-3.5 fill-current" />
                <span>Passage of the Day</span>
              </div>
              <blockquote className="font-serif italic text-sm text-vibe-ink leading-relaxed">
                “A reader lives a thousand lives before he dies. The man who never reads lives only one.”
              </blockquote>
              <div className="flex items-center justify-between pt-2 border-t border-vibe-border-subtle text-[11px] text-vibe-ink-muted">
                <span>George R.R. Martin</span>
                <span className="font-mono">A Dance with Dragons</span>
              </div>
            </div>

            {/* Bottom Quick Feature Highlights */}
            <div className="relative z-10 space-y-2 text-xs text-vibe-ink-secondary">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-vibe-accent-subtle text-vibe-accent flex items-center justify-center flex-shrink-0">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                </div>
                <span>Keep your daily streak alive with persistent web timers</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-vibe-accent-subtle text-vibe-accent flex items-center justify-center flex-shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <span>Track active minutes and compete on leaderboards</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-vibe-accent-subtle text-vibe-accent flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <span>Clean, distraction-free environment for deep focus</span>
              </div>
            </div>
          </div>

          {/* Right Column: Authentication Card */}
          <div className="col-span-1 lg:col-span-7 p-6 sm:p-10 xl:p-12 flex flex-col justify-center">
            
            {/* Header Titles */}
            <div className="mb-6 sm:mb-8 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-vibe-accent-subtle text-vibe-accent text-[11px] font-semibold mb-2 shadow-xs">
                <Sparkles className="w-3 h-3" />
                <span>Reader Account</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-vibe-ink tracking-tight">
                {mode === 'signin' ? 'Welcome Back, Reader' : 'Begin Your Reading Journey'}
              </h1>
              <p className="text-xs sm:text-sm text-vibe-ink-secondary mt-1">
                {mode === 'signin' 
                  ? 'Sign in to sync your active sessions, streak stats, and saved passages.' 
                  : 'Create your personalized library account in seconds.'}
              </p>
            </div>

            {/* Mode Switcher Tabs (Sign In / Sign Up) */}
            <div className="flex items-center p-1 rounded-full bg-vibe-card-subtle border border-vibe-border mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-full transition-all text-center ${
                  mode === 'signin'
                    ? 'bg-vibe-card text-vibe-accent shadow-xs border border-vibe-border'
                    : 'text-vibe-ink-muted hover:text-vibe-ink'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-full transition-all text-center ${
                  mode === 'signup'
                    ? 'bg-vibe-card text-vibe-accent shadow-xs border border-vibe-border'
                    : 'text-vibe-ink-muted hover:text-vibe-ink'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Alert Notifications */}
            {errorMsg && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed flex-1">{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span className="leading-relaxed flex-1 font-medium">{successMsg}</span>
              </div>
            )}

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {mode === 'signup' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-semibold text-vibe-ink">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-vibe-ink-muted" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Jane Doe"
                        required={mode === 'signup'}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-vibe-card-subtle border border-vibe-border text-xs sm:text-sm text-vibe-ink placeholder:text-vibe-ink-muted focus:outline-none focus:border-vibe-accent focus:ring-2 focus:ring-vibe-accent/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Username */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-semibold text-vibe-ink">
                      Username
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-vibe-ink-muted">@</span>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="janedoe"
                        required={mode === 'signup'}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-vibe-card-subtle border border-vibe-border text-xs sm:text-sm text-vibe-ink placeholder:text-vibe-ink-muted focus:outline-none focus:border-vibe-accent focus:ring-2 focus:ring-vibe-accent/20 transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-vibe-ink">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-vibe-ink-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="reader@readershub.app"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-vibe-card-subtle border border-vibe-border text-xs sm:text-sm text-vibe-ink placeholder:text-vibe-ink-muted focus:outline-none focus:border-vibe-accent focus:ring-2 focus:ring-vibe-accent/20 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-vibe-ink">
                    Password
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(email);
                        setForgotPasswordOpen(true);
                      }}
                      className="text-[11px] font-medium text-vibe-accent hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-vibe-ink-muted" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-vibe-card-subtle border border-vibe-border text-xs sm:text-sm text-vibe-ink placeholder:text-vibe-ink-muted focus:outline-none focus:border-vibe-accent focus:ring-2 focus:ring-vibe-accent/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-vibe-ink-muted hover:text-vibe-ink transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              {mode === 'signin' && (
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-vibe-border text-vibe-accent accent-vibe-accent focus:ring-0"
                    />
                    <span className="text-xs text-vibe-ink-secondary">Remember my active device</span>
                  </label>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[44px] py-3 px-6 rounded-full bg-vibe-accent hover:bg-vibe-accent-hover text-white text-xs sm:text-sm font-semibold shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{mode === 'signin' ? 'Sign In' : 'Complete Registration'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Notice */}
            <p className="mt-6 text-center text-[11px] text-vibe-ink-muted leading-relaxed">
              By continuing, you agree to Readers Hub's{' '}
              <a href="#terms" onClick={(e) => { e.preventDefault(); alert("Readers Hub Terms of Service:\nRespectful community conduct and genuine reading session tracking."); }} className="text-vibe-accent underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#privacy" onClick={(e) => { e.preventDefault(); alert("Readers Hub Privacy Policy:\nYour reading logs and personal notes remain private to your account."); }} className="text-vibe-accent underline">
                Privacy Policy
              </a>.
            </p>

          </div>
        </div>
      </main>

      {/* 3. Sleek Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 text-center text-xs text-vibe-ink-muted">
        <span>© 2026 Readers Hub · Crafted for book lovers and quiet focus</span>
      </footer>

      {/* 4. Forgot Password Modal */}
      {isForgotPasswordOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-3xl bg-vibe-card border border-vibe-border shadow-2xl p-6 text-vibe-ink animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-vibe-ink mb-1">
              Reset Your Password
            </h3>
            <p className="text-xs text-vibe-ink-muted mb-4">
              Enter your email address to receive password reset instructions.
            </p>

            {resetSent ? (
              <div className="space-y-4 text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="text-xs text-vibe-ink-secondary">
                  Password reset link sent to <strong>{resetEmail}</strong>. Please check your inbox.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setForgotPasswordOpen(false);
                    setResetSent(false);
                  }}
                  className="w-full py-2.5 rounded-full bg-vibe-accent text-white text-xs font-semibold hover:bg-vibe-accent-hover transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3.5">
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-vibe-card-subtle border border-vibe-border text-xs text-vibe-ink placeholder:text-vibe-ink-muted focus:outline-none focus:border-vibe-accent"
                />
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(false)}
                    className="flex-1 py-2 rounded-full border border-vibe-border text-xs font-semibold text-vibe-ink-muted hover:text-vibe-ink transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2 rounded-full bg-vibe-accent text-white text-xs font-semibold hover:bg-vibe-accent-hover transition-colors"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
