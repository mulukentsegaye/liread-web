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
  ChevronsUpDown 
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
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

  const navItems = [
    { id: 'feed' as NavigationTab, label: 'Discover Feed', icon: Compass },
    { id: 'timer' as NavigationTab, label: 'Reading Timer', icon: Clock },
    { id: 'analytics' as NavigationTab, label: 'Analytics', icon: BarChart3 },
    { id: 'leaderboard' as NavigationTab, label: 'Leaderboard', icon: Trophy },
  ];

  return (
    <aside className="hidden md:flex flex-col justify-between h-[calc(100vh-65px)] sticky top-[65px] self-start py-6 pb-8 md:w-16 lg:w-64 xl:w-72 flex-shrink-0 md:px-1 lg:pr-4 lg:pl-2 overflow-y-auto select-none transition-all duration-500">
      <div className="space-y-6">
        
        {/* Main Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                title={item.label}
                aria-label={item.label}
                className={`w-full min-h-[44px] flex items-center justify-center lg:justify-start gap-3.5 px-3 lg:px-4 py-2.5 rounded-xl text-sm transition-all duration-300 ${
                  isActive
                    ? 'bg-vibe-accent-subtle text-vibe-accent font-semibold border border-vibe-accent/25 shadow-xs'
                    : 'text-vibe-ink-secondary hover:bg-vibe-card-subtle hover:text-vibe-ink'
                }`}
              >
                <Icon 
                  className={`w-5 h-5 flex-shrink-0 transition-colors ${
                    isActive ? 'text-vibe-accent' : 'text-vibe-ink-muted'
                  }`} 
                />
                <span className="hidden lg:inline truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Your Reading Space Section */}
        <div>
          <div className="hidden lg:block px-4 text-[11px] font-semibold tracking-wider text-vibe-ink-muted uppercase mb-2">
            Your Reading Space
          </div>
          <div className="space-y-1">
            <button
              onClick={() => onTabChange('bookshelf')}
              title={`My bookshelf (${user.bookshelfCount})`}
              aria-label="My bookshelf"
              className={`w-full min-h-[44px] flex items-center justify-center lg:justify-between px-3 lg:px-4 py-2.5 rounded-xl text-sm transition-all duration-300 ${
                activeTab === 'bookshelf'
                  ? 'bg-vibe-accent-subtle text-vibe-accent font-semibold border border-vibe-accent/25 shadow-xs'
                  : 'text-vibe-ink-secondary hover:bg-vibe-card-subtle hover:text-vibe-ink'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Library className={`w-5 h-5 flex-shrink-0 ${activeTab === 'bookshelf' ? 'text-vibe-accent' : 'text-vibe-ink-muted'}`} />
                <span className="hidden lg:inline truncate">My bookshelf</span>
              </div>
              <span className="hidden lg:inline-block text-xs font-medium text-vibe-ink-muted px-1.5 py-0.5 rounded-md">
                {user.bookshelfCount}
              </span>
            </button>

            <button
              onClick={() => onTabChange('saved')}
              title={`Saved passages (${user.savedPassagesCount})`}
              aria-label="Saved passages"
              className={`w-full min-h-[44px] flex items-center justify-center lg:justify-between px-3 lg:px-4 py-2.5 rounded-xl text-sm transition-all duration-300 ${
                activeTab === 'saved'
                  ? 'bg-vibe-accent-subtle text-vibe-accent font-semibold border border-vibe-accent/25 shadow-xs'
                  : 'text-vibe-ink-secondary hover:bg-vibe-card-subtle hover:text-vibe-ink'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Bookmark className={`w-5 h-5 flex-shrink-0 ${activeTab === 'saved' ? 'text-vibe-accent' : 'text-vibe-ink-muted'}`} />
                <span className="hidden lg:inline truncate">Saved passages</span>
              </div>
              <span className="hidden lg:inline-block text-xs font-medium text-vibe-ink-muted px-1.5 py-0.5 rounded-md">
                {user.savedPassagesCount}
              </span>
            </button>
          </div>
        </div>

        {/* Literary Inspiration Callout Card */}
        <div className="hidden lg:block mx-2 p-4 rounded-2xl bg-vibe-card border border-vibe-border relative overflow-hidden transition-all duration-500 shadow-soft">
          <div className="flex items-center gap-2 mb-2 text-vibe-accent">
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="font-serif italic text-sm text-vibe-ink leading-snug font-medium mb-2">
            “A few pages a day. A whole world within.”
          </p>
          <p className="text-[11px] text-vibe-ink-muted leading-tight">
            Make room for your next chapter.
          </p>
        </div>

      </div>

      {/* Sidebar Footer */}
      <div className="pt-4 border-t border-vibe-border space-y-1">
        {onGoToLanding && (
          <button
            onClick={onGoToLanding}
            title="Return to Landing Page"
            aria-label="Landing page"
            className="w-full min-h-[44px] flex items-center justify-center lg:justify-start gap-3 px-3 py-2 text-xs font-medium text-vibe-ink-secondary hover:text-vibe-accent hover:bg-vibe-card-subtle rounded-xl transition-colors"
          >
            <Compass className="w-5 h-5 text-vibe-accent flex-shrink-0" />
            <span className="hidden lg:inline">Landing Page</span>
          </button>
        )}

        <button
          onClick={() => alert("Reader Community & Help Guide:\n- Customize your reading vibe.\n- Track active reading time.\n- Share passages and notes.\n- Climb weekly leaderboards!")}
          title="Help & community"
          aria-label="Help & community"
          className="w-full min-h-[44px] flex items-center justify-center lg:justify-start gap-3 px-3 py-2 text-xs font-medium text-vibe-ink-muted hover:text-vibe-ink transition-colors"
        >
          <HelpCircle className="w-5 h-5 text-vibe-ink-muted flex-shrink-0" />
          <span className="hidden lg:inline">Help & community</span>
        </button>

        {/* Theme Mode Toggle (Home Page) */}
        <VibeTriggerButton variant="sidebar" className="mb-2" />

        {/* Profile Card */}
        <div 
          onClick={onGoToLogin}
          role="button"
          tabIndex={0}
          title="Manage Account / Switch User"
          className="flex items-center justify-center lg:justify-between p-2 rounded-xl bg-vibe-card/60 border border-vibe-border hover:bg-vibe-card-subtle transition-colors cursor-pointer group select-none active:scale-98"
        >
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              className="w-9 h-9 rounded-full object-cover ring-1 ring-vibe-border flex-shrink-0"
            />
            <div className="hidden lg:block text-left truncate">
              <p className="text-xs font-semibold text-vibe-ink leading-tight truncate">
                {user.fullName}
              </p>
              <p className="text-[11px] text-vibe-ink-muted leading-tight mt-0.5 truncate">
                {user.subtitle || 'The everyday reader'}
              </p>
            </div>
          </div>
          <ChevronsUpDown className="hidden lg:block w-3.5 h-3.5 text-vibe-ink-muted group-hover:text-vibe-ink transition-colors" />
        </div>
      </div>
    </aside>
  );
};
