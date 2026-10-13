import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { SidebarLeft, NavigationTab } from './components/layout/SidebarLeft';
import { SidebarRight } from './components/layout/SidebarRight';
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
    <div className="min-h-screen bg-[#f8f9f8] text-[#2c332d] flex flex-col font-sans pb-24 md:pb-28">
      {/* Top Application Header */}
      <Header onSearch={(query) => setSearchQuery(query)} />

      {/* Main 3-Column Desktop Layout */}
      <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-8 flex-1 flex gap-6 lg:gap-8 justify-between">
        
        {/* Left Sidebar (Desktop only) */}
        <div className="hidden md:block">
          <SidebarLeft
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>

        {/* Center Main Viewport */}
        <main className="flex-1 min-w-0 max-w-2xl mx-auto w-full">
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

        {/* Right Stats & Leaderboard Sidebar (Large screens only) */}
        <div className="hidden xl:block">
          <SidebarRight
            onViewLeaderboard={() => handleTabChange('leaderboard')}
            onAdjustGoal={handleAdjustGoal}
          />
        </div>

      </div>

      {/* Persistent Floating Web Timer Bar */}
      <FloatingTimerBar />

      {/* Distraction-Free Full-Screen Timer Mode */}
      <FullTimerModal />

      {/* Share a Moment / Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      {/* Mobile Navigation Bar */}
      <MobileNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
};

export default App;
