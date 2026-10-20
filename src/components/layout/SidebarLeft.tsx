import React from 'react';
import {
  Compass,
  Clock,
  BarChart3,
  Trophy,
  Library,
  Bookmark,
  Sparkles,
  HelpCircle,
  ChevronsUpDown,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { DEFAULT_USER_AVATAR } from '../../data/defaults';
import { VibeTriggerButton } from '../theme/VibeTriggerButton';

export type NavigationTab = 'feed' | 'timer' | 'analytics' | 'leaderboard' | 'bookshelf' | 'saved';

interface SidebarLeftProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  onGoToLanding?: () => void;
  onGoToLogin?: () => void;
}

export const SidebarLeft: React.FC<SidebarLeftProps> = ({ activeTab, onTabChange, onGoToLanding, onGoToLogin }) => {
  const { user } = useAuthStore();

  const mainNavItems = [
    { id: 'feed' as NavigationTab,        label: 'Discover',       icon: Compass,  },
    { id: 'timer' as NavigationTab,       label: 'Reading Timer',  icon: Clock,    },
    { id: 'analytics' as NavigationTab,   label: 'My Progress',    icon: BarChart3,},
    { id: 'leaderboard' as NavigationTab, label: 'Leaderboard',    icon: Trophy,   },
  ];

  const libraryItems = [
    { id: 'bookshelf' as NavigationTab, label: 'My Bookshelf', icon: Library,  badge: user?.bookshelfCount ?? 0 },
    { id: 'saved' as NavigationTab,     label: 'Saved Passages', icon: Bookmark, badge: user?.savedPassagesCount ?? 0 },
  ];

  return (
    <aside className="hidden md:flex flex-col justify-between h-full py-5 pb-8 md:w-16 lg:w-60 xl:w-64 flex-shrink-0 md:px-1 lg:pr-3 lg:pl-1 overflow-y-auto overscroll-contain select-none transition-all duration-500">
      <div className="space-y-5 flex-shrink-0">

        {/* Primary Navigation */}
        <nav className="space-y-0.5">
          <p className="hidden lg:block px-3 text-[10px] font-mono font-bold tracking-widest uppercase text-vibe-ink-muted mb-2">
            Navigation
          </p>
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                title={item.label}
                aria-label={item.label}
                className={`w-full h-10 flex items-center justify-center lg:justify-start gap-3 px-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-vibe-accent text-white shadow-sm'
                    : 'text-vibe-ink-secondary hover:bg-vibe-card-subtle hover:text-vibe-ink'
                }`}
              >
                <Icon className="w-4.5 h-4.5 flex-shrink-0" strokeWidth={isActive ? 2.5 : 1.75} />
                <span className="hidden lg:inline truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Library Section */}
        <nav className="space-y-0.5">
          <p className="hidden lg:block px-3 text-[10px] font-mono font-bold tracking-widest uppercase text-vibe-ink-muted mb-2">
            Library
          </p>
          {libraryItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                title={item.label}
                aria-label={item.label}
                className={`w-full h-10 flex items-center justify-center lg:justify-between px-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-vibe-accent text-white shadow-sm'
                    : 'text-vibe-ink-secondary hover:bg-vibe-card-subtle hover:text-vibe-ink'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4.5 h-4.5 flex-shrink-0" strokeWidth={isActive ? 2.5 : 1.75} />
                  <span className="hidden lg:inline truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`hidden lg:inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-md font-mono text-[10px] font-semibold transition-colors ${
                    isActive ? 'bg-white/20 text-white' : 'bg-vibe-card text-vibe-ink-muted border border-vibe-border'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Inspiration Quote Card (desktop only) */}
        <div className="hidden lg:block mx-1 p-4 rounded-2xl bg-vibe-card border border-vibe-border shadow-soft">
          <Sparkles className="w-4 h-4 text-vibe-accent mb-2.5" strokeWidth={1.75} />
          <p className="font-display italic text-sm text-vibe-ink leading-snug mb-1 font-normal">
            "A few pages a day. A whole world within."
          </p>
          <p className="text-[11px] text-vibe-ink-muted">
            Keep your story going.
          </p>
        </div>

      </div>

      {/* Sidebar Footer */}
      <div className="space-y-1 flex-shrink-0 border-t border-vibe-border pt-4 mt-4">

        {/* Help */}
        <button
          onClick={() => alert("Readers Hub Help:\n- Track your reading time with the timer\n- Share passages from books you love\n- Climb the weekly leaderboard\n- Build a 7-day reading streak!")}
          title="Help & community"
          aria-label="Help & community"
          className="w-full h-10 flex items-center justify-center lg:justify-start gap-3 px-3 text-sm font-medium text-vibe-ink-muted hover:text-vibe-ink hover:bg-vibe-card-subtle rounded-xl transition-colors"
        >
          <HelpCircle className="w-4.5 h-4.5 flex-shrink-0" strokeWidth={1.75} />
          <span className="hidden lg:inline">Help & community</span>
        </button>

        {/* Theme Toggle */}
        <VibeTriggerButton variant="sidebar" />

        {/* Profile Card */}
        <div
          onClick={onGoToLogin}
          role="button"
          tabIndex={0}
          title="Account settings"
          className="flex items-center justify-center lg:justify-between px-3 py-2.5 rounded-xl hover:bg-vibe-card-subtle transition-colors cursor-pointer group select-none"
          onKeyDown={(e) => e.key === 'Enter' && onGoToLogin?.()}
        >
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={user?.avatarUrl ?? DEFAULT_USER_AVATAR}
              alt={user?.fullName ?? 'Guest'}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0 ring-1 ring-vibe-border"
            />
            <div className="hidden lg:block text-left min-w-0">
              <p className="text-xs font-semibold text-vibe-ink leading-tight truncate">
                {user?.fullName ?? 'Guest Explorer'}
              </p>
              <p className="text-[11px] text-vibe-ink-muted mt-0.5 truncate">
                {user?.subtitle ?? 'Browsing as guest'}
              </p>
            </div>
          </div>
          <ChevronsUpDown className="hidden lg:block w-3.5 h-3.5 text-vibe-ink-muted group-hover:text-vibe-ink transition-colors flex-shrink-0" strokeWidth={1.75} />
        </div>

      </div>
    </aside>
  );
};
