import React, { useState } from 'react';
import { Search, Bell, BookOpen } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

interface HeaderProps {
  onSearch?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const { user } = useAuthStore();
  const [searchVal, setSearchVal] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchVal(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#f8f9f8]/90 backdrop-blur-md border-b border-[#e8ece8] px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
        
        {/* Logo / Brand */}
        <div className="flex items-center gap-3 min-w-[200px]">
          <div className="w-9 h-9 rounded-xl bg-[#36523f] flex items-center justify-center text-white shadow-sm transition-transform hover:scale-105">
            <BookOpen className="w-5 h-5 text-emerald-100" />
          </div>
          <span className="font-serif text-2xl font-bold tracking-tight text-[#1e2e23]">
            Readers Hub
          </span>
        </div>

        {/* Center Search Bar */}
        <div className="flex-1 max-w-xl mx-auto">
          <div className="relative flex items-center">
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

        {/* Right Section: Date, Notifications, Profile */}
        <div className="flex items-center gap-5 min-w-[200px] justify-end">
          <span className="hidden md:inline-block text-xs font-medium text-gray-500 tracking-wide">
            Tuesday, October 13
          </span>

          <button 
            type="button"
            aria-label="Notifications"
            className="relative p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-[#ebf0eb] transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#d97706] ring-2 ring-white"></span>
          </button>

          <button 
            type="button" 
            className="flex items-center focus:outline-none focus:ring-2 focus:ring-[#38523f] rounded-full"
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
    </header>
  );
};
