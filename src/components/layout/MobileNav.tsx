import React from 'react';
import { MessageSquare, Compass, Clock, BarChart3, Trophy, Library } from 'lucide-react';
import { NavigationTab } from './SidebarLeft';

interface MobileNavProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, onTabChange }) => {
  const items = [
    { id: 'feed' as NavigationTab, label: 'Feed', icon: MessageSquare },
    { id: 'explore' as NavigationTab, label: 'Explore', icon: Compass },
    { id: 'timer' as NavigationTab, label: 'Timer', icon: Clock },
    { id: 'analytics' as NavigationTab, label: 'Analytics', icon: BarChart3 },
    { id: 'bookshelf' as NavigationTab, label: 'Library', icon: Library },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-vibe-card/95 backdrop-blur-md border-t border-vibe-border px-2 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-vibe-elevated transition-colors duration-500">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            aria-label={item.label}
            className={`min-w-[52px] h-11 flex flex-col items-center justify-center gap-0.5 px-2.5 rounded-xl transition-all duration-200 active:scale-95 ${
              isActive 
                ? 'bg-vibe-accent text-white shadow-xs font-semibold' 
                : 'text-vibe-ink-muted hover:text-vibe-ink'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] leading-tight tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
