import React, { useState } from 'react';
import { Search, Bell, BookOpen, Flame, X } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { DEFAULT_USER_AVATAR } from '../../data/defaults';
import { VibeTriggerButton } from '../theme/VibeTriggerButton';

interface HeaderProps {
  onSearch?: (query: string) => void;
  onGoToLanding?: () => void;
  onGoToLogin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearch, onGoToLanding, onGoToLogin }) => {
  const { user, isAuthenticated, isGuest } = useAuthStore();
  const [searchVal, setSearchVal] = useState('');
  const [isMobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
    onSearch?.(e.target.value);
  };

  const connectionLabel = isAuthenticated ? 'Live' : (isGuest ? 'Guest' : 'Offline');
  const connectionColor = isAuthenticated ? 'bg-emerald-500' : (isGuest ? 'bg-amber-400' : 'bg-rose-400');

  return (
    <header className="sticky top-0 z-30 w-full border-b border-vibe-border bg-vibe-card/90 backdrop-blur-md transition-colors duration-500">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-0 flex items-center h-14 sm:h-15 gap-3 sm:gap-4">

        {/* Brand / Logo */}
        <button
          type="button"
          onClick={onGoToLanding}
          className="flex items-center gap-2.5 flex-shrink-0 group outline-none"
          title="Readers Hub â€” Home"
        >
          <div className="w-8 h-8 rounded-xl bg-vibe-accent flex items-center justify-center shadow-sm transition-all group-hover:scale-105 group-active:scale-95">
            <BookOpen className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display text-2xl font-bold tracking-tight text-vibe-ink hidden sm:block">
            Readers Hub
          </span>
        </button>

        {/* Center Search Bar (md+) */}
        <div className="hidden md:flex flex-1 max-w-md mx-auto">
          <div className="relative w-full flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-vibe-ink-muted pointer-events-none" strokeWidth={1.75} />
            <input
              type="text"
              value={searchVal}
              onChange={handleSearchChange}
              placeholder="Search books, authors, passagesâ€¦"
              className="w-full bg-vibe-bg text-sm text-vibe-ink placeholder:text-vibe-ink-muted pl-10 pr-4 py-2 rounded-xl border border-vibe-border focus:border-vibe-accent focus:outline-none focus:ring-2 focus:ring-vibe-accent/15 transition-all"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 ml-auto">

          {/* Theme Toggle */}
          <VibeTriggerButton variant="header" />

          {/* Connection status */}
          <button
            type="button"
            onClick={onGoToLogin}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border border-vibe-border bg-vibe-card-subtle hover:bg-vibe-card-hover transition-colors"
            title="Account & connection settings"
          >
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${connectionColor}`} />
            <span className="text-vibe-ink-secondary">{connectionLabel}</span>
          </button>

          {/* Mobile search toggle */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen(!isMobileSearchOpen)}
            aria-label="Search"
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-vibe-ink-secondary hover:text-vibe-ink hover:bg-vibe-card-subtle transition-colors"
          >
            {isMobileSearchOpen ? (
              <X className="w-4.5 h-4.5" strokeWidth={2} />
            ) : (
              <Search className="w-4.5 h-4.5" strokeWidth={1.75} />
            )}
          </button>

          {/* Streak badge (mobile) */}
          <div className="flex sm:hidden items-center gap-1 px-2 py-1 rounded-lg bg-vibe-accent-subtle border border-vibe-accent/20 text-vibe-accent">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span className="font-mono text-xs font-bold leading-none">{user?.currentStreak ?? 0}</span>
          </div>

          {/* Streak badge (desktop) */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-vibe-accent-subtle border border-vibe-accent/20 text-vibe-accent">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span className="font-mono text-xs font-bold">{user?.currentStreak ?? 0}d</span>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotificationsOpen(!isNotificationsOpen)}
              aria-label="Notifications"
              className="relative w-9 h-9 flex items-center justify-center rounded-xl text-vibe-ink-secondary hover:text-vibe-ink hover:bg-vibe-card-subtle transition-colors"
            >
              <Bell className="w-4.5 h-4.5" strokeWidth={1.75} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-vibe-secondary ring-1 ring-vibe-card" />
            </button>

            {isNotificationsOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setNotificationsOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-vibe-card border border-vibe-border shadow-vibe-elevated p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-vibe-border">
                    <span className="font-heading text-xs font-bold text-vibe-ink">Notifications</span>
                    <span className="text-[10px] text-vibe-ink-muted">All caught up</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-vibe-card-subtle border border-vibe-border/60">
                      <p className="font-semibold text-vibe-ink">Welcome to Readers Hub</p>
                      <p className="text-vibe-ink-muted text-[11px] mt-0.5 leading-relaxed">
                        Start your reading timer today to log your first streak session and climb the weekly leaderboard.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Profile avatar */}
          <button
            type="button"
            onClick={onGoToLogin}
            className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-vibe-accent/40 transition-all active:scale-95 flex-shrink-0"
            title={`${user?.fullName ?? 'Guest'} â€” Account settings`}
          >
            <img
              src={user?.avatarUrl ?? DEFAULT_USER_AVATAR}
              alt={user?.fullName ?? 'Guest'}
              className="w-full h-full object-cover"
            />
          </button>

        </div>
      </div>

      {/* Mobile search drawer */}
      {isMobileSearchOpen && (
        <div className="md:hidden px-4 pb-3 border-t border-vibe-border-subtle">
          <div className="relative flex items-center mt-2">
            <Search className="absolute left-3.5 w-4 h-4 text-vibe-ink-muted pointer-events-none" strokeWidth={1.75} />
            <input
              type="text"
              autoFocus
              value={searchVal}
              onChange={handleSearchChange}
              placeholder="Search books, authors or quotesâ€¦"
              className="w-full bg-vibe-bg text-sm text-vibe-ink placeholder:text-vibe-ink-muted pl-10 pr-4 py-2.5 rounded-xl border border-vibe-border focus:border-vibe-accent focus:outline-none focus:ring-2 focus:ring-vibe-accent/15 transition-all"
            />
          </div>
        </div>
      )}
    </header>
  );
};
