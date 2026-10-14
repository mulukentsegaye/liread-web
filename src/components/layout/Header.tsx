import React, { useState } from 'react';
import { Search, Bell, BookOpen, Flame, X } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const { user } = useAuthStore();
  const [searchVal, setSearchVal] = useState('');
  const [isMobileSearchOpen, setMobileSearchOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#f8f9f8]/95 backdrop-blur-md border-b border-[#e8ece8] px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 transition-colors">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#36523f] flex items-center justify-center text-white shadow-xs transition-transform active:scale-95">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-100" />
          </div>
          <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#1e2e23]">
            Readers Hub
          </span>
        </div>

        {/* Center Search Bar (Tablet & Desktop: md+) */}
        <div className="hidden md:flex flex-1 max-w-xl mx-auto px-2">
          <div className="relative w-full flex items-center">
            <Search className="absolute left-4 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchVal}
              onChange={handleSearchChange}
              placeholder="Search books, people, or a little inspiration"
              className="w-full bg-[#f1f4f1] hover:bg-[#ebf0eb] focus:bg-white text-sm text-gray-800 placeholder-gray-400 pl-11 pr-14 py-2.5 rounded-full border border-[#e1e6e1] focus:border-[#38523f] focus:outline-none focus:ring-2 focus:ring-[#38523f]/15 transition-all shadow-inner"
            />
            <div className="absolute right-3.5 flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-white/80 border border-gray-200 text-[11px] font-mono text-gray-400 shadow-xs">
              <span>⌘</span>
              <span>K</span>
            </div>
          </div>
        </div>

        {/* Right Section: Mobile search button, Streak badge, Date, Notifications, Profile */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 justify-end">
          
          {/* Mobile Search Toggle Button (< md) */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen(!isMobileSearchOpen)}
            aria-label="Toggle search"
            className="md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-gray-600 hover:text-gray-900 active:bg-gray-200/60 transition-colors"
          >
            {isMobileSearchOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </button>

          {/* Mobile Streak Indicator Badge */}
          <div className="flex sm:hidden items-center gap-1 bg-[#eff5f0] border border-[#e0ece2] px-2 py-1 rounded-full text-[#35523f]">
            <Flame className="w-3.5 h-3.5 fill-[#35523f]" />
            <span className="text-xs font-bold font-mono">{user.currentStreak}d</span>
          </div>

          {/* Desktop Date Display */}
          <span className="hidden lg:inline-block text-xs font-medium text-gray-500 tracking-wide">
            Tuesday, October 13
          </span>

          {/* Notifications Button */}
          <button 
            type="button"
            aria-label="Notifications"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center relative rounded-full text-gray-600 hover:text-gray-900 hover:bg-[#ebf0eb] transition-colors"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#d97706] ring-2 ring-white"></span>
          </button>

          {/* User Profile Avatar Button */}
          <button 
            type="button" 
            className="min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#38523f] rounded-full"
            title={`${user.fullName} (${user.subtitle})`}
          >
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-[#e2e7e2] hover:ring-[#38523f] transition-all"
            />
          </button>

        </div>
      </div>

      {/* Expandable Mobile Search Input Drawer */}
      {isMobileSearchOpen && (
        <div className="md:hidden mt-2 pt-2 border-t border-[#e8ece8] animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              autoFocus
              value={searchVal}
              onChange={handleSearchChange}
              placeholder="Search books, authors, or quotes..."
              className="w-full bg-[#f1f4f1] text-sm text-gray-800 placeholder-gray-400 pl-10 pr-4 py-2.5 rounded-xl border border-[#e1e6e1] focus:border-[#38523f] focus:outline-none"
            />
          </div>
        </div>
      )}
    </header>
  );
};
