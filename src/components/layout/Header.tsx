import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, BookOpen, Flame, X, Loader2, Sparkles, Clock } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { DEFAULT_USER_AVATAR } from '../../data/defaults';
import { VibeTriggerButton } from '../theme/VibeTriggerButton';
import { bookSearchService, SuggestedBook } from '../../services/bookSearchService';

interface HeaderProps {
  onSearch?: (query: string) => void;
  onGoToLanding?: () => void;
  onGoToLogin?: () => void;
  onSelectBookForTimer?: (title: string, author: string, cover?: string) => void;
  onShareBook?: (book: { title: string; author: string; coverImageUrl?: string }) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onSearch, 
  onGoToLanding, 
  onGoToLogin,
  onSelectBookForTimer,
  onShareBook
}) => {
  const { user, isAuthenticated, isGuest } = useAuthStore();
  const [searchVal, setSearchVal] = useState('');
  const [isMobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);

  // Open Library interactive search state
  const [suggestions, setSuggestions] = useState<SuggestedBook[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounced search on searchVal change
  useEffect(() => {
    const query = searchVal.trim();

    if (query.length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    setShowDropdown(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const timer = setTimeout(async () => {
      try {
        const results = await bookSearchService.searchBooks(query, controller.signal);
        setSuggestions(results);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Open Library search error in Header:', err);
        }
      } finally {
        setIsSearching(false);
      }
    }, 320);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchVal]);

  // Click outside to dismiss search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      const clickedDesktop = desktopSearchRef.current && desktopSearchRef.current.contains(target);
      const clickedMobile = mobileSearchRef.current && mobileSearchRef.current.contains(target);

      if (!clickedDesktop && !clickedMobile) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchVal(val);
    onSearch?.(val);
  };

  const handleClearSearch = () => {
    setSearchVal('');
    setSuggestions([]);
    setShowDropdown(false);
    onSearch?.('');
  };

  const handleSelectForTimer = (book: SuggestedBook) => {
    setShowDropdown(false);
    onSelectBookForTimer?.(book.title, book.author, book.coverImageUrl);
  };

  const handleSelectForShare = (book: SuggestedBook) => {
    setShowDropdown(false);
    onShareBook?.({
      title: book.title,
      author: book.author,
      coverImageUrl: book.coverImageUrl,
    });
  };

  const connectionLabel = isAuthenticated ? 'Live' : (isGuest ? 'Guest' : 'Offline');
  const connectionColor = isAuthenticated ? 'bg-emerald-500' : (isGuest ? 'bg-amber-400' : 'bg-rose-400');

  const renderSuggestionsDropdown = () => {
    if (!showDropdown || searchVal.trim().length < 2) return null;

    return (
      <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-vibe-border bg-vibe-card shadow-2xl overflow-hidden max-h-96 overflow-y-auto backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
        <div className="px-3.5 py-2.5 bg-vibe-card-subtle/90 border-b border-vibe-border flex items-center justify-between text-xs text-vibe-ink-muted font-medium">
          <span className="flex items-center gap-1.5 text-vibe-ink font-semibold">
            <BookOpen className="w-4 h-4 text-vibe-accent" />
            Open Library Suggestions
          </span>
          {isSearching ? (
            <span className="flex items-center gap-1.5 text-vibe-accent text-[11px]">
              <Loader2 className="w-3 h-3 animate-spin" />
              Searching...
            </span>
          ) : (
            <span className="text-[11px] text-vibe-ink-muted">
              {suggestions.length} {suggestions.length === 1 ? 'book' : 'books'} found
            </span>
          )}
        </div>

        {isSearching && suggestions.length === 0 ? (
          <div className="p-6 text-center text-xs text-vibe-ink-muted space-y-2">
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-vibe-accent" />
            <p>Searching Open Library for "{searchVal}"...</p>
          </div>
        ) : suggestions.length > 0 ? (
          <div className="divide-y divide-vibe-border/50">
            {suggestions.map((book) => (
              <div
                key={book.id}
                className="p-3 hover:bg-vibe-card-subtle/80 flex items-center gap-3 transition-colors group"
              >
                {/* Book cover thumbnail */}
                <div className="w-10 h-14 rounded-md overflow-hidden bg-vibe-border/30 flex-shrink-0 border border-vibe-border shadow-xs flex items-center justify-center">
                  {book.coverThumbnailUrl ? (
                    <img
                      src={book.coverThumbnailUrl}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      loading="lazy"
                    />
                  ) : (
                    <BookOpen className="w-4 h-4 text-vibe-ink-muted" />
                  )}
                </div>

                {/* Book metadata */}
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-semibold text-vibe-ink truncate group-hover:text-vibe-accent transition-colors">
                    {book.title}
                  </p>
                  <p className="text-[11px] text-vibe-ink-muted truncate">
                    by {book.author}
                    {book.firstPublishYear && (
                      <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-vibe-card-subtle border border-vibe-border">
                        {book.firstPublishYear}
                      </span>
                    )}
                  </p>
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleSelectForTimer(book)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-vibe-card-subtle hover:bg-vibe-accent hover:text-white border border-vibe-border transition-all active:scale-95"
                    title={`Read "${book.title}" with immersion timer`}
                  >
                    <Clock className="w-3 h-3" />
                    <span className="hidden sm:inline">Timer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectForShare(book)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-vibe-accent text-white hover:bg-vibe-accent-hover shadow-xs transition-all active:scale-95"
                    title={`Share a passage or moment from "${book.title}"`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-vibe-ink-muted space-y-1">
            <p className="font-semibold text-vibe-ink">No books found for "{searchVal}"</p>
            <p className="text-[11px] text-vibe-ink-muted/80">Try checking the spelling or searching another title or author.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-vibe-border bg-vibe-card/90 backdrop-blur-md transition-colors duration-500">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-0 flex items-center h-14 sm:h-15 gap-3 sm:gap-4">

        {/* Brand / Logo */}
        <button
          type="button"
          onClick={onGoToLanding}
          className="flex items-center gap-2.5 flex-shrink-0 group outline-none"
          title="Readers Hub — Home"
        >
          <div className="w-8 h-8 rounded-xl bg-vibe-accent flex items-center justify-center shadow-sm transition-all group-hover:scale-105 group-active:scale-95">
            <BookOpen className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display text-2xl font-bold tracking-tight text-vibe-ink hidden sm:block">
            Readers Hub
          </span>
        </button>

        {/* Center Search Bar (md+) */}
        <div className="hidden md:flex flex-1 max-w-lg mx-auto relative" ref={desktopSearchRef}>
          <div className="relative w-full flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-vibe-ink-muted pointer-events-none" strokeWidth={1.75} />
            <input
              type="text"
              value={searchVal}
              onChange={handleSearchChange}
              onFocus={() => {
                if (suggestions.length > 0 || searchVal.trim().length >= 2) {
                  setShowDropdown(true);
                }
              }}
              placeholder="Search books, authors, passages..."
              className="w-full bg-vibe-bg text-sm text-vibe-ink placeholder:text-vibe-ink-muted pl-10 pr-9 py-2 rounded-xl border border-vibe-border focus:border-vibe-accent focus:outline-none focus:ring-2 focus:ring-vibe-accent/15 transition-all"
            />
            {isSearching ? (
              <Loader2 className="absolute right-3 w-4 h-4 text-vibe-accent animate-spin" />
            ) : searchVal ? (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 p-1 rounded-lg text-vibe-ink-muted hover:text-vibe-ink hover:bg-vibe-card-subtle transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>

          {renderSuggestionsDropdown()}
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
            onClick={() => {
              setMobileSearchOpen(!isMobileSearchOpen);
              if (!isMobileSearchOpen && searchVal.trim().length >= 2) {
                setShowDropdown(true);
              }
            }}
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
            title={`${user?.fullName ?? 'Guest'} — Account settings`}
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
        <div className="md:hidden px-4 pb-3 border-t border-vibe-border-subtle relative" ref={mobileSearchRef}>
          <div className="relative flex items-center mt-2">
            <Search className="absolute left-3.5 w-4 h-4 text-vibe-ink-muted pointer-events-none" strokeWidth={1.75} />
            <input
              type="text"
              autoFocus
              value={searchVal}
              onChange={handleSearchChange}
              onFocus={() => {
                if (suggestions.length > 0 || searchVal.trim().length >= 2) {
                  setShowDropdown(true);
                }
              }}
              placeholder="Search books, authors, passages..."
              className="w-full bg-vibe-bg text-sm text-vibe-ink placeholder:text-vibe-ink-muted pl-10 pr-9 py-2.5 rounded-xl border border-vibe-border focus:border-vibe-accent focus:outline-none focus:ring-2 focus:ring-vibe-accent/15 transition-all"
            />
            {isSearching ? (
              <Loader2 className="absolute right-3 w-4 h-4 text-vibe-accent animate-spin" />
            ) : searchVal ? (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 p-1 rounded-lg text-vibe-ink-muted hover:text-vibe-ink hover:bg-vibe-card-subtle transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>

          {renderSuggestionsDropdown()}
        </div>
      )}
    </header>
  );
};
