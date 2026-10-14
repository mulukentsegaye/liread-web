import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { SidebarLeft, NavigationTab } from './components/layout/SidebarLeft';
import { SidebarRight } from './components/layout/SidebarRight';
import { TabletSummaryBar } from './components/layout/TabletSummaryBar';
import { MobileNav } from './components/layout/MobileNav';
import { FeedContainer } from './components/feed/FeedContainer';
import { CreatePostModal } from './components/feed/CreatePostModal';
import { FloatingTimerBar } from './components/timer/FloatingTimerBar';
import { FullTimerModal } from './components/timer/FullTimerModal';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { LeaderboardView } from './components/leaderboard/LeaderboardView';
import { BookshelfView } from './components/bookshelf/BookshelfView';
import { VibeSelector } from './components/theme/VibeSelector';
import { useTimerStore } from './stores/timerStore';
import { useAuthStore } from './stores/authStore';
import { useTheme } from './context/ThemeContext';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('feed');
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { isPopoverOpen, closePopover } = useTheme();
  const { setFullScreenOpen, setBook, startTimer } = useTimerStore();
  const { user, updateUser } = useAuthStore();

  const handleTabChange = (tab: NavigationTab) => {
    if (tab === 'timer') {
      setFullScreenOpen(true);
      return;
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectBookForTimer = (title: string, author: string, cover?: string) => {
    setBook(title, author, undefined, cover);
    startTimer(title, author, cover);
    setFullScreenOpen(true);
  };

  const handleAdjustGoal = () => {
    const current = user.dailyGoalMinutes || 60;
    const input = prompt('Set your daily reading goal in minutes:', current.toString());
    if (input) {
      const parsed = parseInt(input, 10);
      if (!isNaN(parsed) && parsed > 0) {
        updateUser({ dailyGoalMinutes: parsed });
      }
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col w-full pb-44 md:pb-28 transition-colors duration-500 overflow-x-clip"
      style={{
        backgroundColor: 'var(--vibe-bg)',
        color: 'var(--vibe-ink)',
      }}
    >
      
      {/* 1. Sticky Top Application Header with Vibe Trigger */}
      <Header onSearch={(query) => setSearchQuery(query)} />

      {/* 2. Main Responsive App Shell: 
          - Mobile (< 768px): 1-column main viewport
          - Tablet (768px - 1279px): 2-column layout (compact left sidebar + main center viewport with top summary bar)
          - Desktop (1280px+): 3-column layout (left sidebar, center viewport, right sidebar)
      */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex-1 flex items-start gap-4 lg:gap-8 justify-between">
        
        {/* Left Sidebar (Desktop & Tablet only: md+) */}
        <SidebarLeft
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {/* Center Main Viewport */}
        <main className="flex-1 min-w-0 max-w-2xl mx-auto w-full py-4 sm:py-6">
          
          {/* Tablet Collapsible Top Summary Bar (md:block xl:hidden) */}
          <TabletSummaryBar 
            onViewLeaderboard={() => handleTabChange('leaderboard')}
            onAdjustGoal={handleAdjustGoal}
          />

          {/* Active View Mount */}
          {activeTab === 'feed' && (
            <FeedContainer
              onOpenCreateModal={() => setCreateModalOpen(true)}
              onSelectBookForTimer={handleSelectBookForTimer}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView onBack={() => handleTabChange('feed')} />
          )}

          {activeTab === 'leaderboard' && (
            <LeaderboardView onBack={() => handleTabChange('feed')} />
          )}

          {(activeTab === 'bookshelf' || activeTab === 'saved') && (
            <BookshelfView initialTab={activeTab} onBack={() => handleTabChange('feed')} />
          )}
        </main>

        {/* Right Stats & Leaderboard Sidebar (Desktop only: xl+) */}
        <SidebarRight
          onViewLeaderboard={() => handleTabChange('leaderboard')}
          onAdjustGoal={handleAdjustGoal}
        />

      </div>

      {/* 3. Persistent Floating Mini-Timer Bar (Active theme ambiance glow & creative animations) */}
      <FloatingTimerBar />

      {/* 4. Distraction-Free Full-Screen Reading Timer Mode */}
      <FullTimerModal />

      {/* 5. Create Reading Moment Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      {/* 6. Vibe Atmospheric Theme Selector Modal */}
      <VibeSelector
        isOpen={isPopoverOpen}
        onClose={closePopover}
      />

      {/* 7. Fixed Bottom Mobile Navigation Bar (< md) */}
      <MobileNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

    </div>
  );
};

export default App;
