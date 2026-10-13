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

export type NavigationTab = 'feed' | 'timer' | 'analytics' | 'leaderboard' | 'bookshelf' | 'saved';

interface SidebarLeftProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

export const SidebarLeft: React.FC<SidebarLeftProps> = ({ activeTab, onTabChange }) => {
  const { user } = useAuthStore();

  const navItems = [
    { id: 'feed' as NavigationTab, label: 'Discover Feed', icon: Compass },
    { id: 'timer' as NavigationTab, label: 'Reading Timer', icon: Clock },
    { id: 'analytics' as NavigationTab, label: 'Analytics', icon: BarChart3 },
    { id: 'leaderboard' as NavigationTab, label: 'Leaderboard', icon: Trophy },
  ];

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col justify-between h-[calc(100vh-65px)] sticky top-[65px] py-6 pr-4 pl-2 overflow-y-auto">
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
                className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#e5ede6] text-[#24392b] font-semibold shadow-xs'
                    : 'text-[#4b554d] hover:bg-[#edf2ee] hover:text-[#24392b]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#324f3b]' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Your Reading Space Section */}
        <div>
          <div className="px-4 text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-2">
            Your Reading Space
          </div>
          <div className="space-y-1">
            <button
              onClick={() => onTabChange('bookshelf')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all ${
                activeTab === 'bookshelf'
                  ? 'bg-[#e5ede6] text-[#24392b] font-semibold'
                  : 'text-[#4b554d] hover:bg-[#edf2ee] hover:text-[#24392b]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Library className="w-4 h-4 text-gray-400" />
                <span>My bookshelf</span>
              </div>
              <span className="text-xs font-medium text-gray-400 px-1.5 py-0.5 rounded-md">
                {user.bookshelfCount}
              </span>
            </button>

            <button
              onClick={() => onTabChange('saved')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all ${
                activeTab === 'saved'
                  ? 'bg-[#e5ede6] text-[#24392b] font-semibold'
                  : 'text-[#4b554d] hover:bg-[#edf2ee] hover:text-[#24392b]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Bookmark className="w-4 h-4 text-gray-400" />
                <span>Saved passages</span>
              </div>
              <span className="text-xs font-medium text-gray-400 px-1.5 py-0.5 rounded-md">
                {user.savedPassagesCount}
              </span>
            </button>
          </div>
        </div>

        {/* Inspiration Callout Card */}
        <div className="mx-2 p-4 rounded-2xl bg-[#eff5f0] border border-[#e2ece3] relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2 text-[#466a50]">
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="font-serif italic text-sm text-[#273d2f] leading-snug font-medium mb-2">
            “A few pages a day. A whole world within.”
          </p>
          <p className="text-[11px] text-gray-500 leading-tight">
            Make room for your next chapter.
          </p>
        </div>

      </div>

      {/* Sidebar Footer */}
      <div className="pt-6 border-t border-[#e8ece8] space-y-3">
        <button
          onClick={() => alert("Reader Community & Help Guide:\n- Track your daily reading time.\n- Share quotes and thoughts with the community.\n- Climb the weekly leaderboards!")}
          className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-gray-400" />
          <span>Help & community</span>
        </button>

        {/* Profile Card */}
        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-[#ebf0eb] transition-colors cursor-pointer group">
          <div className="flex items-center gap-3">
            <img
              src={user.avatarUrl}
              alt={user.fullName}
              className="w-9 h-9 rounded-full object-cover ring-1 ring-gray-200"
            />
            <div className="text-left">
              <p className="text-xs font-semibold text-gray-800 leading-tight">
                {user.fullName}
              </p>
              <p className="text-[11px] text-gray-400 leading-tight mt-0.5">
                {user.subtitle || 'The everyday reader'}
              </p>
            </div>
          </div>
          <ChevronsUpDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </div>
      </div>
    </aside>
  );
};
