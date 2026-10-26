import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import { SanctuaryView } from './components/sanctuary/SanctuaryView';
import { BookshelfView } from './components/bookshelf/BookshelfView';
import { BookDetailsView } from './components/book/BookDetailsView';
import { ExploreView } from './components/explore/ExploreView';
import { ProfileView } from './components/profile/ProfileView';
import { useReaderStore } from './stores/readerStore';

const ReadEraLibraryView = React.lazy(() =>
  import('./components/reader/ReadEraLibraryView').then((m) => ({ default: m.ReadEraLibraryView }))
);
const ReadEraViewer = React.lazy(() =>
  import('./components/reader/ReadEraViewer').then((m) => ({ default: m.ReadEraViewer }))
);
import { VibeSelector } from './components/theme/VibeSelector';
import { LandingPage } from './components/landing/LandingPage';
import { LoginPage } from './components/auth/LoginPage';
import { AuthModal } from './components/auth/AuthModal';
import { ResetPasswordModal } from './components/auth/ResetPasswordModal';
import { CelebrationToast } from './components/ui/CelebrationToast';
import { SessionReflectionModal } from './components/timer/SessionReflectionModal';
import { ToastContainer } from './components/ui/ToastContainer';
import { AlertModal } from './components/ui/AlertModal';
import { GoalAdjustModal } from './components/ui/GoalAdjustModal';
import { InfoModal } from './components/ui/InfoModal';
import { useNoticeStore } from './stores/noticeStore';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { useTimerStore } from './stores/timerStore';
import { coReadingService } from './services/coReadingService';
import { useAuthStore } from './stores/authStore';
import { useFeedStore } from './stores/feedStore';
import { useTheme } from './context/ThemeContext';
import { authService } from './services/authService';
import { sanctuaryService } from './services/sanctuaryService';
import { bookshelfService } from './services/bookshelfService';
import { PullToRefresh } from './components/common/PullToRefresh';
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
  const [viewingProfileUserId, setViewingProfileUserId] = useState<string | null>(null);
  const [exploreSearchQuery, setExploreSearchQuery] = useState('');
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [preSelectedBook, setPreSelectedBook] = useState<{
    title: string;
    author: string;
    coverImageUrl?: string;
    quoteText?: string;
    pageNumber?: number | string;
  } | null>(null);

  const { isPopoverOpen, closePopover, theme } = useTheme();
  const { isFullScreenOpen, setFullScreenOpen, setBook, startTimer, prepareTimerForBook } = useTimerStore();
  const { isReaderOpen } = useReaderStore();
  const { 
    user, 
    isAuthenticated, 
    isGuest, 
    authReady, 
    updateUser, 
    initAuth,
    isAuthModalOpen,
    authModalTab,
    openAuthModal,
    closeAuthModal,
    isResetPasswordOpen,
    openResetPasswordModal,
    closeResetPasswordModal,
  } = useAuthStore();
  const { showAlertModal, openGoalModal } = useNoticeStore();
  const { fetchPosts } = useFeedStore();
  const isOnline = useOnlineStatus();

  // Scroll Container Ref & Live Pull-To-Refresh State
  const mainViewportRef = useRef<HTMLDivElement>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefreshCurrentPage = useCallback(async () => {
    try {
      const minDelay = new Promise((resolve) => setTimeout(resolve, 850));
      const tasks: Promise<any>[] = [minDelay];

      // Refresh active user profile & streak if signed in
      if (user?.id && !isGuest) {
        tasks.push(
          authService.getUserProfile(user.id).then((fresh) => {
            if (fresh) updateUser(fresh);
          }).catch(() => {})
        );
      }

      // Tab-specific live refresh
      if (activeTab === 'feed') {
        tasks.push(fetchPosts(user?.id));
      } else if (activeTab === 'bookshelf' || activeTab === 'saved') {
        if (user?.id) {
          tasks.push(bookshelfService.getBookshelf(user.id).catch(() => []));
        }
        tasks.push(fetchPosts(user?.id));
      } else if (activeTab === 'sanctuary' || activeTab === 'leaderboard') {
        tasks.push(sanctuaryService.getConsistentReaders(user?.id).catch(() => []));
        tasks.push(sanctuaryService.getLiveCoReaders().catch(() => []));
        tasks.push(sanctuaryService.getWeeklyCurators().catch(() => []));
      }

      await Promise.allSettled(tasks);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.warn('Pull-to-refresh execution error:', err);
    }
  }, [user?.id, isGuest, activeTab, fetchPosts, updateUser]);

  // Real-time Co-Reading Presence tracking
  const isTimerRunning = useTimerStore((s) => s.isRunning);
  const timerBookTitle = useTimerStore((s) => s.bookTitle);
  const timerBookAuthor = useTimerStore((s) => s.bookAuthor);
  const timerStartTime = useTimerStore((s) => s.startTime);

  useEffect(() => {
    if (isTimerRunning && timerBookTitle) {
      coReadingService.track({
        userId: user?.id || 'guest',
        username: user?.username || 'reader',
        fullName: user?.fullName || (isGuest ? 'Guest Explorer' : 'Quiet Reader'),
        avatarUrl: user?.avatarUrl,
        bookTitle: timerBookTitle,
        bookAuthor: timerBookAuthor,
        startedAt: timerStartTime || Date.now(),
      });
    } else {
      coReadingService.untrack();
    }
  }, [
    isTimerRunning,
    timerBookTitle,
    timerBookAuthor,
    timerStartTime,
    user?.id,
    user?.username,
    user?.fullName,
    user?.avatarUrl,
    isGuest,
  ]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isTimerRunning) {
        coReadingService.untrack();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isTimerRunning]);

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
          if (type === 'recovery') {
            openResetPasswordModal();
          }
        } catch (err) {
          console.warn('Email confirmation/recovery failed:', err);
        }
      }

      // Check URL hash for recovery or reset-password
      const hash = window.location.hash || '';
      if (hash.includes('type=recovery') || hash.includes('reset-password')) {
        openResetPasswordModal();
      }

      if (cancelled) return;
      await initAuth();

      if (!cancelled && tokenHash && type !== 'recovery') {
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
      useFeedStore.getState().setFeedTab('for_you');
      fetchPosts(user.id);
    } else if (currentView === 'app' && !user) {
      useFeedStore.getState().setFeedTab('for_you');
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
    useFeedStore.getState().setFeedTab('for_you');
    navigateWithTransition('app');
  };

  const handleGuestEnterApp = () => {
    // signInAsGuest already called by the calling page; just navigate
    useFeedStore.getState().setFeedTab('for_you');
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
    setPreviousTab(activeTab);
    if (tab === 'profile') {
      // Direct navigation to profile tab defaults to own profile
      setViewingProfileUserId(null);
    }
    setActiveTab(tab);
    const mainEl = document.getElementById('main-viewport');
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const handleViewUserProfile = (userId: string) => {
    if (!userId) return;
    setPreviousTab(activeTab);
    setViewingProfileUserId(userId);
    setActiveTab('profile');
    const mainEl = document.getElementById('main-viewport');
    if (mainEl) {
      mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleSelectBookForTimer = (title: string, author: string, cover?: string) => {
    prepareTimerForBook(title, author, cover);
  };

  const handleAdjustGoal = () => {
    if (!user) return;
    if (isGuest) {
      showAlertModal({
        type: 'guest',
        title: 'Guest Mode is Read-Only',
        message: 'Create a free Liread account to set daily reading goals, protect your reading streaks, and join the Reading Community.',
        confirmLabel: 'Create Account',
        cancelLabel: 'Keep Browsing',
        onConfirm: () => openAuthModal('signup'),
      });
      return;
    }
    const current = user.dailyGoalMinutes || 60;
    openGoalModal(current, (newMinutes) => {
      updateUser({ dailyGoalMinutes: newMinutes });
    });
  };

  const handleOpenCreateModal = (initialBook?: {
    title: string;
    author: string;
    coverImageUrl?: string;
    quoteText?: string;
    pageNumber?: number | string;
  }) => {
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
    telegramMessageId?: number | string;
  }) => {
    setPreviousTab(activeTab === 'book_details' ? 'feed' : activeTab);
    setSelectedBookDetails({
      title: book.title,
      author: book.author,
      coverImageUrl: book.coverImageUrl,
      firstPublishYear: book.firstPublishYear,
      workKey: book.workKey,
      description: book.description,
      telegramMessageId: book.telegramMessageId,
    });
    setActiveTab('book_details');
    const mainEl = document.getElementById('main-viewport');
    if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSeeAllBooks = (query: string) => {
    setExploreSearchQuery(query);
    setActiveTab('explore');
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
        <ToastContainer />
        <AlertModal />
        <InfoModal />
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
        <ToastContainer />
        <AlertModal />
        <InfoModal />
      </div>
    );
  }

  return (
    <div
      className="h-[100dvh] max-h-[100dvh] min-h-[100dvh] flex flex-col w-full transition-colors duration-500 overflow-hidden"
      style={{
        backgroundColor: 'var(--vibe-bg)',
        color: 'var(--vibe-ink)',
      }}
    >
      {transitionStage !== 'idle' && <div className="peaceful-top-beam" aria-hidden="true" />}

      {!isOnline && (
        <div className="w-full bg-amber-600 dark:bg-amber-700 text-white text-xs font-medium text-center py-1.5 px-4 flex items-center justify-center gap-2 shadow-xs transition-all">
          <WifiOff className="w-3.5 h-3.5 flex-shrink-0" />
          <span>You are offline. Reading timer, cached summaries, and offline books remain accessible.</span>
        </div>
      )}

      {isGuest && (
        <div className="w-full bg-amber-500 text-white text-xs font-medium text-center py-1.5 px-4">
          You’re browsing as a guest — <button onClick={handleGoToLogin} className="underline font-semibold">create an account</button> to post, save, and track reading.
        </div>
      )}

      <Header
        onSearch={(query) => {
          if (activeTab === 'explore') {
            setExploreSearchQuery(query);
          }
        }}
        onSeeAll={handleSeeAllBooks}
        onGoToLanding={handleGoToLanding}
        onGoToLogin={() => openAuthModal('signin')}
        onViewProfile={() => handleTabChange('profile')}
        onViewSanctuary={() => handleTabChange('sanctuary')}
        onSelectBookForTimer={handleSelectBookForTimer}
        onShareBook={(book) => handleOpenCreateModal(book)}
        onViewBookDetails={handleViewBookDetails}
        onRefresh={handleRefreshCurrentPage}
      />

      <div 
        className={`w-full px-2.5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 flex-1 min-h-0 flex items-stretch gap-3 sm:gap-6 lg:gap-8 justify-between overflow-hidden transition-opacity duration-300 ease-out ${
          isFullScreenOpen ? 'opacity-30 pointer-events-none' : 'opacity-100'
        }`}
      >

        <SidebarLeft
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onGoToLanding={handleGoToLanding}
          onGoToLogin={() => openAuthModal('signin')}
        />

        <main
          id="main-viewport"
          ref={mainViewportRef}
          className="flex-1 min-w-0 h-full overflow-y-auto overflow-x-hidden overscroll-contain py-3 sm:py-6 pb-[calc(env(safe-area-inset-bottom)+4.75rem)] md:pb-24 px-0.5 sm:px-1 w-full max-w-full relative"
        >
          <PullToRefresh
            onRefresh={handleRefreshCurrentPage}
            scrollContainerRef={mainViewportRef}
          >
            <TabletSummaryBar
              onViewLeaderboard={() => handleTabChange('sanctuary')}
              onAdjustGoal={handleAdjustGoal}
            />

            <div key={`${activeTab}-${refreshKey}`} className="tab-content-enter">
            {activeTab === 'feed' && (
              <FeedContainer
                onOpenCreateModal={handleOpenCreateModal}
                onSelectBookForTimer={handleSelectBookForTimer}
                onViewBookDetails={(title: string, author: string, cover?: string) =>
                  handleViewBookDetails({ title, author, coverImageUrl: cover })
                }
                onViewUserProfile={handleViewUserProfile}
              />
            )}

            {activeTab === 'explore' && (
              <ExploreView
                onViewBookDetails={handleViewBookDetails}
                onStartTimer={handleSelectBookForTimer}
                onShareBook={handleOpenCreateModal}
                initialSearchQuery={exploreSearchQuery}
                onClearInitialSearch={() => setExploreSearchQuery('')}
              />
            )}

            {activeTab === 'book_details' && selectedBookDetails && (
              <BookDetailsView
                key={`${selectedBookDetails.title}-${selectedBookDetails.author}`}
                book={selectedBookDetails}
                onBack={() => handleTabChange(previousTab || 'feed')}
                onStartTimer={handleSelectBookForTimer}
                onShareBook={handleOpenCreateModal}
                onViewBookDetails={(title: string, author: string, cover?: string) =>
                  handleViewBookDetails({ title, author, coverImageUrl: cover })
                }
                onViewUserProfile={handleViewUserProfile}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView onBack={() => handleTabChange('feed')} />
            )}

            {(activeTab === 'sanctuary' || activeTab === 'leaderboard') && (
              <SanctuaryView
                onBack={() => handleTabChange('feed')}
                onStartTimer={handleSelectBookForTimer}
                onAdjustGoal={handleAdjustGoal}
                onViewUserProfile={handleViewUserProfile}
              />
            )}

            {activeTab === 'reader' && (
              <React.Suspense fallback={<div className="py-16 text-center text-xs text-vibe-ink-muted">Loading E-Reader Library...</div>}>
                <ReadEraLibraryView />
              </React.Suspense>
            )}

            {(activeTab === 'bookshelf' || activeTab === 'saved') && (
              <BookshelfView 
                initialTab={activeTab} 
                onBack={() => handleTabChange('feed')} 
                onViewBookDetails={(title: string, author: string, cover?: string) =>
                  handleViewBookDetails({ title, author, coverImageUrl: cover })
                }
                onExploreClick={() => handleTabChange('explore')}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileView
                viewingUserId={viewingProfileUserId}
                onViewUserProfile={handleViewUserProfile}
                onBack={() => {
                  setViewingProfileUserId(null);
                  handleTabChange(previousTab || 'feed');
                }}
                onStartTimer={(book) => handleSelectBookForTimer(book.title, book.author, book.coverImageUrl)}
                onAdjustGoal={handleAdjustGoal}
                onOpenAuthModal={(t) => openAuthModal(t)}
                onViewBookDetails={(title: string, author: string, cover?: string) =>
                  handleViewBookDetails({ title, author, coverImageUrl: cover })
                }
              />
            )}
          </div>
          </PullToRefresh>
        </main>

        <SidebarRight
          onViewLeaderboard={() => handleTabChange('sanctuary')}
          onAdjustGoal={handleAdjustGoal}
          onViewUserProfile={handleViewUserProfile}
        />

      </div>

      <CelebrationToast />
      <SessionReflectionModal />
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
        defaultTab={authModalTab}
        onClose={closeAuthModal}
      />

      <ResetPasswordModal
        isOpen={isResetPasswordOpen}
        onClose={closeResetPasswordModal}
        onSuccess={() => navigateWithTransition('app')}
      />

      <ToastContainer />
      <AlertModal />
      <GoalAdjustModal />
      <InfoModal />

      <MobileNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {isReaderOpen && (
        <React.Suspense fallback={null}>
          <ReadEraViewer
            onOpenShareModal={(quoteData) => {
              setPreSelectedBook({
                title: quoteData.bookTitle,
                author: quoteData.bookAuthor,
                quoteText: quoteData.quoteText,
                pageNumber: quoteData.pageNumber,
              });
              setCreateModalOpen(true);
            }}
          />
        </React.Suspense>
      )}

    </div>
  );
};

export default App;
