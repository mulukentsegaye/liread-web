import React, { useState, useEffect, useRef } from 'react';
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
import { LandingPage } from './components/landing/LandingPage';
import { LoginPage } from './components/auth/LoginPage';
import { AuthModal } from './components/auth/AuthModal';
import { useTimerStore } from './stores/timerStore';
import { useAuthStore } from './stores/authStore';
import { useFeedStore } from './stores/feedStore';
import { useTheme } from './context/ThemeContext';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'app'>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.hash === '#app') return 'app';
      if (window.location.hash === '#login') return 'login';
    }
    return 'landing';
  });
  const [transitionStage, setTransitionStage] = useState<'idle' | 'exiting' | 'entering'>('entering');
  const isTransitioningRef = useRef(false);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [activeTab, setActiveTab] = useState<NavigationTab>('feed');
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { isPopoverOpen, closePopover, theme } = useTheme();
  const { setFullScreenOpen, setBook, startTimer } = useTimerStore();
  const { user, updateUser, initAuth } = useAuthStore();
  const { fetchPosts } = useFeedStore();

  // Settle initial tranquil page entrance
  useEffect(() => {
    const timer = setTimeout(() => {
      setTransitionStage('idle');
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Ensure landing and login start in light mode; home page ('app') respects user's theme selection (light/dark)
  useEffect(() => {
    if (currentView === 'landing' || currentView === 'login') {
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [currentView, theme]);

  useEffect(() => {
    // Initialize Supabase Auth & Realtime Feed sync
    initAuth();
    fetchPosts(user.id);
  }, []);

  const navigateWithTransition = (nextView: 'landing' | 'login' | 'app') => {
    if (nextView === currentView && transitionStage === 'idle') return;
    if (isTransitioningRef.current) return;

    isTransitioningRef.current = true;
    setTransitionStage('exiting');

    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    transitionTimeoutRef.current = setTimeout(() => {
      // 1. Update active view state and url hash
      setCurrentView(nextView);
      window.location.hash = nextView === 'app' ? '#app' : (nextView === 'login' ? '#login' : '#landing');

      // 2. Synchronize theme attributes
      if (nextView === 'app') {
        if (theme === 'dark') {
          document.documentElement.setAttribute('data-theme', 'dark');
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.setAttribute('data-theme', 'light');
          document.documentElement.classList.remove('dark');
        }
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        document.documentElement.classList.remove('dark');
      }

      // 3. Reset scroll position seamlessly at the transition boundary
      window.scrollTo(0, 0);

      // 4. Begin serene entrance
      setTransitionStage('entering');

      transitionTimeoutRef.current = setTimeout(() => {
        setTransitionStage('idle');
        isTransitioningRef.current = false;
      }, 380);
    }, 200);
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const target: 'landing' | 'login' | 'app' = 
        hash === '#app' ? 'app' : (hash === '#login' ? 'login' : 'landing');
      if (target !== currentView && !isTransitioningRef.current) {
        navigateWithTransition(target);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [currentView, theme]);

  const handleEnterApp = () => {
    navigateWithTransition('app');
  };

  const handleGoToLanding = () => {
    navigateWithTransition('landing');
  };

  const handleGoToLogin = () => {
    navigateWithTransition('login');
  };

  const handleTabChange = (tab: NavigationTab) => {
    if (tab === 'timer') {
      setFullScreenOpen(true);
      return;
    }
    setActiveTab(tab);
    const mainEl = document.getElementById('main-viewport');
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    }
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

  const transitionClass = transitionStage === 'exiting' ? 'page-exit' : (transitionStage === 'entering' ? 'page-enter' : '');

  // 0. Render Login Page when in 'login' view
  if (currentView === 'login') {
    return (
      <div className={`w-full min-h-screen ${transitionClass}`}>
        {transitionStage !== 'idle' && <div className="peaceful-top-beam" aria-hidden="true" />}
        <LoginPage
          onSuccess={handleEnterApp}
          onGoBack={handleGoToLanding}
        />
      </div>
    );
  }

  // 1. Render Premium Clean Landing Page when in 'landing' view
  if (currentView === 'landing') {
    return (
      <div className={`w-full min-h-screen ${transitionClass}`}>
        {transitionStage !== 'idle' && <div className="peaceful-top-beam" aria-hidden="true" />}
        <LandingPage
          onEnterApp={handleEnterApp}
          onGoToLogin={handleGoToLogin}
          onOpenTimer={() => {
            handleEnterApp();
            setFullScreenOpen(true);
          }}
        />
        {/* Vibe Atmospheric Theme Selector Modal */}
        <VibeSelector
          isOpen={isPopoverOpen}
          onClose={closePopover}
        />
      </div>
    );
  }

  return (
    <div 
      className={`h-screen max-h-screen flex flex-col w-full transition-colors duration-500 overflow-hidden ${transitionClass}`}
      style={{
        backgroundColor: 'var(--vibe-bg)',
        color: 'var(--vibe-ink)',
      }}
    >
      {transitionStage !== 'idle' && <div className="peaceful-top-beam" aria-hidden="true" />}
      
      {/* 1. Sticky Top Application Header with Vibe Trigger */}
      <Header 
        onSearch={(query) => setSearchQuery(query)} 
        onGoToLanding={handleGoToLanding}
        onGoToLogin={() => setAuthModalOpen(true)}
      />

      {/* 2. Main Responsive App Shell: 
          - Mobile (< 768px): 1-column main viewport
          - Tablet (768px - 1279px): 2-column layout (compact left sidebar + main center viewport with top summary bar)
          - Desktop (1280px+): 3-column layout (left sidebar, center viewport, right sidebar)
          Each column scrolls independently with overscroll-contain
      */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 flex-1 min-h-0 flex items-stretch gap-4 sm:gap-6 lg:gap-8 justify-between overflow-hidden">
        
        {/* Left Sidebar (Desktop & Tablet only: md+) */}
        <SidebarLeft
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onGoToLanding={handleGoToLanding}
          onGoToLogin={handleGoToLogin}
        />

        {/* Center Main Viewport (Independent scroll container) */}
        <main 
          id="main-viewport"
          className="flex-1 min-w-0 h-full overflow-y-auto overscroll-contain py-4 sm:py-6 pb-36 md:pb-28 px-0.5"
        >
          
          {/* Tablet Collapsible Top Summary Bar (md:block xl:hidden) */}
          <TabletSummaryBar 
            onViewLeaderboard={() => handleTabChange('leaderboard')}
            onAdjustGoal={handleAdjustGoal}
          />

          {/* Active View Mount with Peaceful Tab Transition */}
          <div key={activeTab} className="tab-content-enter">
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
          </div>
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

      {/* 7. Supabase Account & Connection Settings Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* 8. Fixed Bottom Mobile Navigation Bar (< md) */}
      <MobileNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

    </div>
  );
};

export default App;
