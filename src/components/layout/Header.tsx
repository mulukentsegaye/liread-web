import React, { useState } from 'react';
import { Search, Bell, BookOpen, Flame, X } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { VibeTriggerButton } from '../theme/VibeTriggerButton';

interface HeaderProps {
  onSearch?: (query: string) => void;
  onGoToLanding?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearch, onGoToLanding }) => {
  const { user } = useAuthStore();
  const [searchVal, setSearchVal] = useState('');
  const [isMobileSearchOpen, setMobileSearchOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-vibe-card/90 backdrop-blur-md border-b border-vibe-border px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-2.5 sm:py-3 transition-colors duration-500">
      <div className="w-full flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand / Logo (Clickable to Landing Page) */}
        <button 
          type="button"
          onClick={onGoToLanding}
          className="flex items-center gap-2 sm:gap-3 flex-shrink-0 hover:opacity-85 transition-opacity text-left cursor-pointer group outline-none"
          title="Back to Landing Page"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-vibe-accent flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-105 active:scale-95">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-vibe-ink">
            Readers Hub
          </span>
        </button>

        {/* Center Search Bar (Tablet & Desktop: md+) */}
        <div className="hidden md:flex flex-1 max-w-xl mx-auto px-2">
          <div className="relative w-full flex items-center">
            <Search className="absolute left-4 w-4 h-4 text-vibe-ink-muted pointer-events-none" />
            <input
              type="text"
              value={searchVal}
              onChange={handleSearchChange}
              placeholder="Search books, authors, passages or vibes..."
              className="w-full bg-vibe-card-subtle hover:bg-vibe-card-hover focus:bg-vibe-card text-sm text-vibe-ink placeholder:text-vibe-ink-muted pl-11 pr-14 py-2.5 rounded-full border border-vibe-border focus:border-vibe-accent focus:outline-none focus:ring-2 focus:ring-vibe-accent/20 transition-all shadow-inner"
            />
            <div className="absolute right-3.5 flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-vibe-card border border-vibe-border text-[11px] font-mono text-vibe-ink-muted shadow-xs">
              <span>⌘</span>
              <span>K</span>
            </div>
          </div>
        </div>

        {/* Right Section: Vibe Selector Button, Streak badge, Date, Notifications, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0 justify-end">
          
          {/* Landing Page link pill */}
          {onGoToLanding && (
            <button
              type="button"
              onClick={onGoToLanding}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-vibe-ink-secondary hover:text-vibe-ink hover:bg-vibe-card-subtle transition-colors border border-vibe-border shadow-xs"
              title="View Landing Page"
            >
              <span>Landing Page</span>
            </button>
          )}

          {/* Sleek Vibe Selector Header Button */}
          <VibeTriggerButton variant="header" />

          {/* Mobile Search Toggle Button (< md) */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen(!isMobileSearchOpen)}
            aria-label="Toggle search"
            className="md:hidden min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-vibe-ink-secondary hover:text-vibe-ink hover:bg-vibe-card-subtle transition-colors"
          >
            {isMobileSearchOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </button>

          {/* Mobile Streak Indicator Badge */}
          <div className="flex sm:hidden items-center gap-1 bg-vibe-accent-subtle border border-vibe-accent/20 px-2 py-1 rounded-full text-vibe-accent">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span className="text-xs font-bold font-mono">{user.currentStreak}d</span>
          </div>

          {/* Desktop Date Display */}
          <span className="hidden lg:inline-block text-xs font-medium text-vibe-ink-muted tracking-wide">
            Tuesday, October 13
          </span>

          {/* Notifications Button */}
          <button 
            type="button"
            aria-label="Notifications"
            className="min-w-[40px] min-h-[40px] flex items-center justify-center relative rounded-full text-vibe-ink-secondary hover:text-vibe-ink hover:bg-vibe-card-subtle transition-colors"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-vibe-secondary ring-2 ring-vibe-card"></span>
          </button>

          {/* User Profile Avatar Button */}
          <button 
            type="button" 
            className="min-w-[40px] min-h-[40px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-vibe-accent rounded-full"
            title={`${user.fullName} (${user.subtitle})`}
          >
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-vibe-border hover:ring-vibe-accent transition-all"
            />
          </button>

        </div>
      </div>

      {/* Expandable Mobile Search Input Drawer */}
      {isMobileSearchOpen && (
        <div className="md:hidden mt-2 pt-2 border-t border-vibe-border-subtle animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-vibe-ink-muted pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={searchVal}
              onChange={handleSearchChange}
              placeholder="Search books, authors, or quotes..."
              className="w-full bg-vibe-card-subtle text-sm text-vibe-ink placeholder:text-vibe-ink-muted pl-10 pr-4 py-2.5 rounded-xl border border-vibe-border focus:border-vibe-accent focus:outline-none"
            />
          </div>
        </div>
      )}
    </header>
  );
};
