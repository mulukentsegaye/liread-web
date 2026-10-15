import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Key, 
  Database as DatabaseIcon, 
  LogIn, 
  UserPlus, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { 
  isSupabaseConfigured, 
  getSupabaseConfig, 
  reconfigureSupabase, 
  testSupabaseConnection 
} from '../../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'signin' | 'signup' | 'config';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  defaultTab = 'signin' 
}) => {
  const { 
    user, 
    isAuthenticated, 
    signIn, 
    signUp, 
    signOut, 
    isLoading, 
    initAuth 
  } = useAuthStore();

  const [tab, setTab] = useState<'signin' | 'signup' | 'config'>(defaultTab);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');

  // Config states
  const initialConfig = getSupabaseConfig();
  const [customUrl, setCustomUrl] = useState(
    initialConfig.url.includes('placeholder') ? '' : initialConfig.url
  );
  const [customKey, setCustomKey] = useState(
    initialConfig.anonKey.includes('placeholder') ? '' : initialConfig.anonKey
  );

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (isAuthenticated) {
        setTab('config');
      } else {
        setTab(defaultTab);
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
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setStatusMessage({ 
        type: 'error', 
        text: err.message || 'Failed to sign in. Please check your credentials.' 
      });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    if (!username.trim() || !fullName.trim()) {
      setStatusMessage({ type: 'error', text: 'Please fill in both username and full name.' });
      return;
    }

    try {
      await signUp(email, password, username, fullName);
      setStatusMessage({ 
        type: 'success', 
        text: 'Account created! Please check your email to verify your account or proceed.' 
      });
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setStatusMessage({ 
        type: 'error', 
        text: err.message || 'Failed to sign up. Please try again.' 
      });
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setStatusMessage(null);

    try {
      reconfigureSupabase(customUrl.trim(), customKey.trim());
      const test = await testSupabaseConnection();

      if (test.ok) {
        setStatusMessage({ type: 'success', text: 'Supabase connected successfully!' });
        await initAuth();
      } else {
        setStatusMessage({ type: 'error', text: test.message });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to connect.' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setStatusMessage(null);
    try {
      const test = await testSupabaseConnection();
      setStatusMessage({
        type: test.ok ? 'success' : 'error',
        text: test.message,
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Connection test error' });
    } finally {
      setIsTesting(false);
    }
  };

  const isConfigured = isSupabaseConfigured();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md rounded-2xl sm:rounded-3xl p-5 sm:p-7 bg-vibe-card border border-vibe-border text-vibe-ink shadow-vibe-elevated flex flex-col justify-between max-h-[95vh] overflow-y-auto transition-all duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-vibe-border pb-3.5 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-vibe-accent/15 text-vibe-accent flex items-center justify-center">
                <DatabaseIcon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-vibe-ink">
                  {isAuthenticated ? 'Your Account & Backend' : 'Readers Hub Account'}
                </h2>
                <p className="text-[11px] text-vibe-ink-muted">
                  Powered by Supabase PostgreSQL & Auth
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close modal"
              className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full text-vibe-ink-muted hover:text-vibe-ink hover:bg-vibe-card-subtle transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Nav Tabs */}
          <div className="flex rounded-xl bg-vibe-card-subtle p-1 border border-vibe-border mb-4">
            {!isAuthenticated ? (
              <>
                <button
                  type="button"
                  onClick={() => setTab('signin')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    tab === 'signin'
                      ? 'bg-vibe-card text-vibe-ink shadow-xs border border-vibe-border'
                      : 'text-vibe-ink-muted hover:text-vibe-ink'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setTab('signup')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    tab === 'signup'
                      ? 'bg-vibe-card text-vibe-ink shadow-xs border border-vibe-border'
                      : 'text-vibe-ink-muted hover:text-vibe-ink'
                  }`}
                >
                  Create Account
                </button>
              </>
            ) : null}

            <button
              type="button"
              onClick={() => setTab('config')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                tab === 'config'
                  ? 'bg-vibe-card text-vibe-ink shadow-xs border border-vibe-border'
                  : 'text-vibe-ink-muted hover:text-vibe-ink'
              }`}
            >
              <span>Backend Config</span>
              <span className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            </button>
          </div>

          {/* Status Message Banner */}
          {statusMessage && (
            <div 
              className={`mb-4 p-3 rounded-xl text-xs flex items-start gap-2 border ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
                  : 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              )}
              <span className="leading-snug">{statusMessage.text}</span>
            </div>
          )}

          {/* TAB 1: Sign In */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-3.5">
              {!isConfigured && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-700 dark:text-amber-300">
                  ⚡ <strong>Offline Mode:</strong> Supabase credentials not yet detected. You can connect your Supabase project in the <strong>Backend Config</strong> tab.
                </div>
              )}

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
                  className="w-full bg-vibe-card-subtle px-3 py-2 text-xs rounded-xl border border-vibe-border text-vibe-ink focus:border-vibe-accent focus:outline-none"
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
                  className="w-full bg-vibe-card-subtle px-3 py-2 text-xs rounded-xl border border-vibe-border text-vibe-ink focus:border-vibe-accent focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full min-h-[40px] flex items-center justify-center gap-2 rounded-xl bg-vibe-accent hover:bg-vibe-accent-hover text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
              >
                {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <LogIn className="w-3.5 h-3.5" />}
                <span>Sign In with Supabase</span>
              </button>
            </form>
          )}

          {/* TAB 2: Create Account */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-vibe-ink-secondary mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="bookworm_alex"
                  className="w-full bg-vibe-card-subtle px-3 py-2 text-xs rounded-xl border border-vibe-border text-vibe-ink focus:border-vibe-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-vibe-ink-secondary mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="w-full bg-vibe-card-subtle px-3 py-2 text-xs rounded-xl border border-vibe-border text-vibe-ink focus:border-vibe-accent focus:outline-none"
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
                  className="w-full bg-vibe-card-subtle px-3 py-2 text-xs rounded-xl border border-vibe-border text-vibe-ink focus:border-vibe-accent focus:outline-none"
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
                  className="w-full bg-vibe-card-subtle px-3 py-2 text-xs rounded-xl border border-vibe-border text-vibe-ink focus:border-vibe-accent focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full min-h-[40px] flex items-center justify-center gap-2 rounded-xl bg-vibe-accent hover:bg-vibe-accent-hover text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50 mt-1"
              >
                {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                <span>Create Reader Account</span>
              </button>
            </form>
          )}

          {/* TAB 3: Supabase Backend Configuration */}
          {tab === 'config' && (
            <div className="space-y-4">
              {isAuthenticated ? (
                <div className="p-3.5 rounded-xl bg-vibe-card-subtle border border-vibe-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-vibe-border"
                    />
                    <div>
                      <p className="text-xs font-bold text-vibe-ink">{user.fullName}</p>
                      <p className="text-[11px] text-vibe-ink-muted">@{user.username} · {user.rankTier}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={signOut}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-vibe-border text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : null}

              {/* Status Indicator Pill */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-vibe-card-subtle border border-vibe-border">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  <span className="text-xs font-semibold text-vibe-ink">
                    {isConfigured ? 'Connected to Supabase' : 'Offline / Local Mode'}
                  </span>
                </div>

                {isConfigured && (
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="text-[11px] text-vibe-accent hover:underline flex items-center gap-1 font-medium"
                  >
                    {isTesting ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
                    <span>Ping Database</span>
                  </button>
                )}
              </div>

              {/* Dynamic Connection Form */}
              <form onSubmit={handleSaveConfig} className="space-y-3 pt-1">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-vibe-ink-secondary">
                      Supabase Project URL
                    </label>
                    <a
                      href="https://app.supabase.com"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-vibe-accent hover:underline flex items-center gap-0.5"
                    >
                      <span>Get from Supabase</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://your-project-id.supabase.co"
                    className="w-full bg-vibe-card-subtle px-3 py-2 text-xs rounded-xl border border-vibe-border text-vibe-ink focus:border-vibe-accent focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-vibe-ink-secondary mb-1">
                    Supabase Public Anon Key
                  </label>
                  <input
                    type="text"
                    value={customKey}
                    onChange={(e) => setCustomKey(e.target.value)}
                    placeholder="eyJhbGciOi..."
                    className="w-full bg-vibe-card-subtle px-3 py-2 text-xs rounded-xl border border-vibe-border text-vibe-ink focus:border-vibe-accent focus:outline-none font-mono text-[11px]"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={isTesting}
                    className="flex-1 min-h-[38px] flex items-center justify-center gap-1.5 rounded-xl bg-vibe-accent hover:bg-vibe-accent-hover text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
                  >
                    {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                    <span>Save & Connect</span>
                  </button>

                  {customUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomUrl('');
                        setCustomKey('');
                        reconfigureSupabase('', '');
                        setStatusMessage({ type: 'info', text: 'Reverted to default configuration.' });
                      }}
                      className="px-3 min-h-[38px] rounded-xl border border-vibe-border text-xs font-semibold text-vibe-ink-muted hover:text-vibe-ink hover:bg-vibe-card-subtle transition-colors"
                      title="Reset to environment defaults"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </form>

              {/* Setup Guide Link */}
              <div className="p-3 rounded-xl bg-vibe-card-subtle border border-vibe-border-subtle text-[11px] space-y-1 text-vibe-ink-secondary">
                <p className="font-semibold text-vibe-ink">Quick Setup Instructions:</p>
                <ol className="list-decimal list-inside space-y-0.5 text-vibe-ink-muted">
                  <li>Create a project at <a href="https://app.supabase.com" target="_blank" rel="noreferrer" className="text-vibe-accent underline">supabase.com</a></li>
                  <li>Copy SQL from <code className="px-1 py-0.5 rounded bg-vibe-card border border-vibe-border text-[10px]">supabase/schema.sql</code> and run it in the SQL Editor</li>
                  <li>(Optional) Run <code className="px-1 py-0.5 rounded bg-vibe-card border border-vibe-border text-[10px]">supabase/seed.sql</code> to load mock data</li>
                  <li>Copy Project URL and Anon Key above or into your <code className="px-1 py-0.5 rounded bg-vibe-card border border-vibe-border text-[10px]">.env</code></li>
                </ol>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
