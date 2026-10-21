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
import { BookDetailsView } from './components/book/BookDetailsView';
import { ExploreView } from './components/explore/ExploreView';
import { VibeSelector } from './components/theme/VibeSelector';
import { LandingPage } from './components/landing/LandingPage';
import { LoginPage } from './components/auth/LoginPage';
import { AuthModal } from './components/auth/AuthModal';
import { CelebrationToast } from './components/ui/CelebrationToast';
import { useTimerStore } from './stores/timerStore';
import { useAuthStore } from './stores/authStore';
import { useFeedStore } from './stores/feedStore';
import { useTheme } from './context/ThemeContext';
import { authService } from './services/authService';
import { BookDetailsData } from './types';

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
  const targetViewRef = useRef<'landing' | 'login' | 'app' | null>(null);
  const currentViewRef = useRef<'landing' | 'login' | 'app'>(currentView);
  const exitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const enterTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keep currentViewRef synced with latest state
  useEffect(() => {
    currentViewRef.current = currentView;
  }, [currentView]);

  // Clean up any pending transition timers on unmount
  useEffect(() => {
    return () => {
      if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
      if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current);
    };
  }, []);

  const [activeTab, setActiveTab] = useState<NavigationTab>('feed');
  const [previousTab, setPreviousTab] = useState<NavigationTab>('feed');
  const [selectedBookDetails, setSelectedBookDetails] = useState<BookDetailsData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [preSelectedBook, setPreSelectedBook] = useState<{
    title: string;
    author: string;
    coverImageUrl?: string;
  } | null>(null);

  const { isPopoverOpen, closePopover, theme } = useTheme();
  const { isFullScreenOpen, setFullScreenOpen, setBook, startTimer } = useTimerStore();
  const { user, isAuthenticated, isGuest, authReady, updateUser, initAuth } = useAuthStore();
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

  // Boot: handle the Supabase email-confirmation callback, then initialise auth.
  // PKCE confirmation links arrive as ?token_hash=...&type=signup, which the
  // SDK's detectSessionInUrl does NOT process on its own.
  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      const params = new URLSearchParams(window.location.search);
      const tokenHash = params.get('token_hash') || params.get('token');
      const type = params.get('type') || 'signup';

      if (tokenHash) {
        try {
          await authService.verifyEmailToken(tokenHash, type);
          const clean = new URL(window.location.href);
          clean.searchParams.delete('token_hash');
          clean.searchParams.delete('token');
          clean.searchParams.delete('type');
          window.history.replaceState({}, '', clean.toString());
        } catch (err) {
          console.warn('Email confirmation failed:', err);
        }
      }

      if (cancelled) return;
      await initAuth();

      if (!cancelled && tokenHash) {
        const { isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated) navigateWithTransition('app');
      }
    };

    boot();
    return () => { cancelled = true; };
  }, []);

  // Fetch posts when entering app, or when user changes (login/guest)
  useEffect(() => {
    if (currentView === 'app' && user?.id) {
      fetchPosts(user.id);
    } else if (currentView === 'app' && !user) {
      fetchPosts(undefined);
    }
  }, [currentView, user?.id]);

  // Auth guard: if user lands on #app without authenticated/guest session, redirect to login
  useEffect(() => {
    if (!authReady) return;
    const hasAccess = isAuthenticated || isGuest;
    if (currentView === 'app' && !hasAccess) {
      navigateWithTransition('login');
    } else if (currentView === 'landing' && hasAccess && window.location.hash === '#app') {
      // already handled via initial state
    }
  }, [authReady, isAuthenticated, isGuest]);

  const navigateWithTransition = (nextView: 'landing' | 'login' | 'app') => {
    // Guard: cannot enter app without authentication or guest mode
    if (nextView === 'app') {
      const hasAccess = useAuthStore.getState().isAuthenticated || useAuthStore.getState().isGuest;
      if (!hasAccess) {
        nextView = 'login';
      }
    }

    // If already at target view and idle, do nothing
    if (nextView === currentViewRef.current && transitionStage === 'idle') {
      return;
    }

    // If already transitioning to this exact target view, avoid duplicate work
    if (targetViewRef.current === nextView && isTransitioningRef.current) {
      return;
    }

    targetViewRef.current = nextView;
    isTransitioningRef.current = true;

    // Clear any pending transitions
    if (exitTimeoutRef.current) clearTimeout(exitTimeoutRef.current);
    if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current);

    setTransitionStage('exiting');

    exitTimeoutRef.current = setTimeout(() => {
      setCurrentView(nextView);
      currentViewRef.current = nextView;

      const targetHash = nextView === 'app' ? '#app' : (nextView === 'login' ? '#login' : '#landing');
      if (window.location.hash !== targetHash) {
        window.location.hash = targetHash;
      }

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

      window.scrollTo(0, 0);
      setTransitionStage('entering');

      enterTimeoutRef.current = setTimeout(() => {
        setTransitionStage('idle');
        isTransitioningRef.current = false;
        targetViewRef.current = null;
      }, 380);
    }, 200);

    // Watchdog fallback: guarantee unlock after 850ms in case of unexpected interrupts
    setTimeout(() => {
      if (isTransitioningRef.current && targetViewRef.current === nextView) {
        setTransitionStage('idle');
        isTransitioningRef.current = false;
        targetViewRef.current = null;
      }
    }, 850);
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const target: 'landing' | 'login' | 'app' =
        hash === '#app' ? 'app' : (hash === '#login' ? 'login' : 'landing');

      if (target === 'app') {
        const hasAccess = useAuthStore.getState().isAuthenticated || useAuthStore.getState().isGuest;
        if (!hasAccess) {
          navigateWithTransition('login');
          return;
        }
      }

      // Trigger transition only if target is different from current & not already transitioning there
      if (target !== currentViewRef.current && target !== targetViewRef.current) {
        navigateWithTransition(target);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleEnterApp = () => {
    navigateWithTransition('app');
  };

  const handleGuestEnterApp = () => {
    // signInAsGuest already called by the calling page; just navigate
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
    if (!user) return;
    if (isGuest) {
      alert('Guest mode is read-only. Create an account to set a daily goal.');
      return;
    }
    const current = user.dailyGoalMinutes || 60;
    const input = prompt('Set your daily reading goal in minutes:', current.toString());
    if (input) {
      const parsed = parseInt(input, 10);
      if (!isNaN(parsed) && parsed > 0) {
        updateUser({ dailyGoalMinutes: parsed });
      }
    }
  };

  const handleOpenCreateModal = (initialBook?: { title: string; author: string; coverImageUrl?: string }) => {
    setPreSelectedBook(initialBook || null);
    setCreateModalOpen(true);
  };

  const handleViewBookDetails = (book: {
    title: string;
    author: string;
    coverImageUrl?: string;
    firstPublishYear?: number;
    workKey?: string;
    description?: string;
  }) => {
    setPreviousTab(activeTab === 'book_details' ? 'feed' : activeTab);
    setSelectedBookDetails({
      title: book.title,
      author: book.author,
      coverImageUrl: book.coverImageUrl,
      firstPublishYear: book.firstPublishYear,
      workKey: book.workKey,
      description: book.description,
    });
    setActiveTab('book_details');
    const mainEl = document.getElementById('main-viewport');
    if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const transitionClass = transitionStage === 'exiting' ? 'page-exit' : (transitionStage === 'entering' ? 'page-enter' : '');

  if (currentView === 'login') {
    return (
      <div className={`w-full min-h-screen ${transitionClass}`}>
        {transitionStage !== 'idle' && <div className="peaceful-top-beam" aria-hidden="true" />}
        <LoginPage
          onSuccess={handleEnterApp}
          onGoBack={handleGoToLanding}
          onGuest={handleGuestEnterApp}
        />
      </div>
    );
  }

  if (currentView === 'landing') {
    return (
      <div className={`w-full min-h-screen ${transitionClass}`}>
        {transitionStage !== 'idle' && <div className="peaceful-top-beam" aria-hidden="true" />}
        <LandingPage
          onEnterApp={handleEnterApp}
          onGoToLogin={handleGoToLogin}
          onGuest={handleGuestEnterApp}
          onOpenTimer={() => {
            const hasAccess = isAuthenticated || isGuest;
            if (!hasAccess) {
              navigateWithTransition('login');
              return;
            }
            handleEnterApp();
            setFullScreenOpen(true);
          }}
        />
        <VibeSelector
          isOpen={isPopoverOpen}
          onClose={closePopover}
        />
      </div>
    );
  }

  // App shell — requires auth or guest
  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-vibe-bg">
        <div className="w-6 h-6 border-2 border-vibe-border border-t-vibe-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated && !isGuest) {
    return (
      <div className={`w-full min-h-screen ${transitionClass}`}>
        {transitionStage !== 'idle' && <div className="peaceful-top-beam" aria-hidden="true" />}
        <LoginPage onSuccess={handleEnterApp} onGoBack={handleGoToLanding} onGuest={handleGuestEnterApp} />
      </div>
    );
  }

  return (
    <div
      className="h-screen max-h-screen flex flex-col w-full transition-colors duration-500 overflow-hidden"
      style={{
        backgroundColor: 'var(--vibe-bg)',
        color: 'var(--vibe-ink)',
      }}
    >
      {transitionStage !== 'idle' && <div className="peaceful-top-beam" aria-hidden="true" />}

      {isGuest && (
        <div className="w-full bg-amber-500 text-white text-xs font-medium text-center py-1.5 px-4">
          You’re browsing as a guest — <button onClick={handleGoToLogin} className="underline font-semibold">create an account</button> to post, save, and track reading.
        </div>
      )}

      <Header
        onSearch={(query) => {
          setSearchQuery(query);
          if (query.trim() && activeTab !== 'feed' && activeTab !== 'book_details') {
            setActiveTab('feed');
          }
        }}
        onGoToLanding={handleGoToLanding}
        onGoToLogin={() => setAuthModalOpen(true)}
        onSelectBookForTimer={handleSelectBookForTimer}
        onShareBook={(book) => handleOpenCreateModal(book)}
        onViewBookDetails={handleViewBookDetails}
      />

      <div 
        className={`w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 flex-1 min-h-0 flex items-stretch gap-4 sm:gap-6 lg:gap-8 justify-between overflow-hidden transition-opacity duration-300 ease-out ${
          isFullScreenOpen ? 'opacity-30 pointer-events-none' : 'opacity-100'
        }`}
      >

        <SidebarLeft
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onGoToLanding={handleGoToLanding}
          onGoToLogin={() => setAuthModalOpen(true)}
        />

        <main
          id="main-viewport"
          className="flex-1 min-w-0 h-full overflow-y-auto overscroll-contain py-4 sm:py-6 pb-36 md:pb-28 px-0.5"
        >

          <TabletSummaryBar
            onViewLeaderboard={() => handleTabChange('leaderboard')}
            onAdjustGoal={handleAdjustGoal}
          />

          <div key={activeTab} className="tab-content-enter">
            {activeTab === 'feed' && (
              <FeedContainer
                searchQuery={searchQuery}
                onOpenCreateModal={handleOpenCreateModal}
                onSelectBookForTimer={handleSelectBookForTimer}
                onViewBookDetails={(title, author, cover) =>
                  handleViewBookDetails({ title, author, coverImageUrl: cover })
                }
              />
            )}

            {activeTab === 'explore' && (
              <ExploreView
                onViewBookDetails={handleViewBookDetails}
                onStartTimer={handleSelectBookForTimer}
                onShareBook={handleOpenCreateModal}
              />
            )}

            {activeTab === 'book_details' && selectedBookDetails && (
              <BookDetailsView
                book={selectedBookDetails}
                onBack={() => handleTabChange(previousTab || 'feed')}
                onStartTimer={handleSelectBookForTimer}
                onShareBook={handleOpenCreateModal}
                onViewBookDetails={(title, author, cover) =>
                  handleViewBookDetails({ title, author, coverImageUrl: cover })
                }
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView onBack={() => handleTabChange('feed')} />
            )}

            {activeTab === 'leaderboard' && (
              <LeaderboardView onBack={() => handleTabChange('feed')} />
            )}

            {(activeTab === 'bookshelf' || activeTab === 'saved') && (
              <BookshelfView 
                initialTab={activeTab} 
                onBack={() => handleTabChange('feed')} 
                onViewBookDetails={(title, author, cover) =>
                  handleViewBookDetails({ title, author, coverImageUrl: cover })
                }
              />
            )}
          </div>
        </main>

        <SidebarRight
          onViewLeaderboard={() => handleTabChange('leaderboard')}
          onAdjustGoal={handleAdjustGoal}
        />

      </div>

      <CelebrationToast />
      <FloatingTimerBar />
      <FullTimerModal previousTab={activeTab} />

      <CreatePostModal
        isOpen={isCreateModalOpen}
        initialBook={preSelectedBook}
        onClose={() => {
          setCreateModalOpen(false);
          setPreSelectedBook(null);
        }}
      />

      <VibeSelector
        isOpen={isPopoverOpen}
        onClose={closePopover}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <MobileNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

    </div>
  );
};

export default App;
