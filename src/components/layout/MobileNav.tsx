import React from 'react';
import { Compass, Clock, BarChart3, Trophy, Library } from 'lucide-react';
import { NavigationTab } from './SidebarLeft';

interface MobileNavProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, onTabChange }) => {
  const items = [
    { id: 'feed' as NavigationTab, label: 'Feed', icon: Compass },
    { id: 'timer' as NavigationTab, label: 'Timer', icon: Clock },
    { id: 'analytics' as NavigationTab, label: 'Analytics', icon: BarChart3 },
    { id: 'leaderboard' as NavigationTab, label: 'Rankings', icon: Trophy },
    { id: 'bookshelf' as NavigationTab, label: 'Library', icon: Library },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#e8ece8] px-2 py-2 flex items-center justify-around">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              isActive 
                ? 'text-[#35523f] font-semibold' 
                : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px]">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
