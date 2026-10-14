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
import { useTimerStore } from './stores/timerStore';
import { useAuthStore } from './stores/authStore';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('feed');
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
    <div className="min-h-screen bg-[#f8f9f8] text-[#2c332d] flex flex-col font-sans overflow-x-hidden w-full pb-44 md:pb-28">
      
      {/* 1. Sticky Top Application Header */}
      <Header onSearch={(query) => setSearchQuery(query)} />

      {/* 2. Main Responsive App Shell: 
          - Mobile (< 768px): 1-column main viewport
          - Tablet (768px - 1279px): 2-column layout (compact left sidebar + main center viewport with top summary bar)
          - Desktop (1280px+): 3-column layout (left sidebar, center viewport, right sidebar)
      */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex-1 flex gap-4 lg:gap-8 justify-between">
        
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

          {activeTab === 'analytics' && <AnalyticsView />}

          {activeTab === 'leaderboard' && <LeaderboardView />}

          {(activeTab === 'bookshelf' || activeTab === 'saved') && (
            <BookshelfView initialTab={activeTab} />
          )}
        </main>

        {/* Right Stats & Leaderboard Sidebar (Desktop only: xl+) */}
        <div className="hidden xl:block">
          <SidebarRight
            onViewLeaderboard={() => handleTabChange('leaderboard')}
            onAdjustGoal={handleAdjustGoal}
          />
        </div>

      </div>

      {/* 3. Persistent Floating Mini-Timer Bar (Positioned above mobile nav on mobile, bottom-center on desktop) */}
      <FloatingTimerBar />

      {/* 4. Distraction-Free Full-Screen Reading Timer Mode */}
      <FullTimerModal />

      {/* 5. Create Reading Moment Modal (Full-screen mobile / bottom-sheet) */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      {/* 6. Fixed Bottom Mobile Navigation Bar (< md) */}
      <MobileNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

    </div>
  );
};

export default App;
