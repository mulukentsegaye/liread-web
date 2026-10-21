import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile } from '../types';
import { GUEST_USER } from '../data/defaults';
import { authService } from '../services/authService';
import { sessionsService } from '../services/sessionsService';
import { isSupabaseConfigured } from '../lib/supabase';

// Keep a single auth-state subscription alive across re-initialisations
let authSubscription: { unsubscribe: () => void } | null = null;

interface AuthStore {
  user: UserProfile | null;
  todayMinutesRead: number;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  isBackendConnected: boolean;
  authReady: boolean;
  pendingConfirmationEmail: string | null;
  isAuthModalOpen: boolean;
  authModalTab: 'signin' | 'signup' | 'account';

  openAuthModal: (tab?: 'signin' | 'signup' | 'account') => void;
  closeAuthModal: () => void;
  initAuth: () => Promise<void>;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, username: string, fullName: string) => Promise<void>;
  signInAsGuest: () => void;
  signOut: () => Promise<void>;
  updateUser: (partial: Partial<UserProfile>) => Promise<void>;
  logSessionMinutes: (minutes: number, bookTitle?: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearPendingConfirmation: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      todayMinutesRead: 0,
      isAuthenticated: false,
      isGuest: false,
      isLoading: false,
      isBackendConnected: isSupabaseConfigured(),
      authReady: false,
      pendingConfirmationEmail: null,
      isAuthModalOpen: false,
      authModalTab: 'signin',

      openAuthModal: (tab = 'signin') => set({ isAuthModalOpen: true, authModalTab: tab }),
      closeAuthModal: () => set({ isAuthModalOpen: false }),

      initAuth: async () => {
        const configured = isSupabaseConfigured();
        set({ isBackendConnected: configured });

        // If already in guest mode from persisted storage, keep it
        const { isGuest, user: persistedUser } = get();
        if (isGuest && persistedUser) {
          set({ authReady: true });
          return;
        }

        if (!configured) {
          // No backend: require guest or real login (no auto-demo)
          set({ isAuthenticated: false, isGuest: false, user: null, authReady: true });
          return;
        }

        set({ isLoading: true });
        try {
          const session = await authService.getSession();
          if (session?.user) {
            const profile = await authService.getUserProfile(session.user.id);
            if (profile) {
              const todayMins = await sessionsService.getTodayMinutes(session.user.id);
              set({
                user: profile,
                isAuthenticated: true,
                isGuest: false,
                todayMinutesRead: todayMins,
                authReady: true,
              });
            } else {
              set({ isAuthenticated: true, isGuest: false, authReady: true });
            }
          } else {
            // No session and not guest -> unauthenticated
            set({ isAuthenticated: false, isGuest: false, user: null, authReady: true });
          }

          // Defer async work out of the auth lock (supabase-js requirement)
          if (authSubscription) {
            authSubscription.unsubscribe();
            authSubscription = null;
          }
          authSubscription = authService.onAuthStateChange((updatedSession: any) => {
            setTimeout(async () => {
              if (updatedSession?.user) {
                const profile = await authService.getUserProfile(updatedSession.user.id);
                if (profile) {
                  const todayMins = await sessionsService.getTodayMinutes(updatedSession.user.id);
                  set({ user: profile, isAuthenticated: true, isGuest: false, todayMinutesRead: todayMins });
                } else {
                  set({ isAuthenticated: true, isGuest: false });
                }
              } else {
                // Only clear auth if not in guest mode (guest is local-only)
                const currentGuest = get().isGuest;
                if (!currentGuest) {
                  set({ isAuthenticated: false, user: null, todayMinutesRead: 0 });
                }
              }
            }, 0);
          });
        } catch (err) {
          console.warn('Supabase auth initialization failed:', err);
          set({ authReady: true });
        } finally {
          set({ isLoading: false });
        }
      },

      signIn: async (email, password) => {
        if (!isSupabaseConfigured()) throw new Error('Supabase is not configured.');
        set({ isLoading: true });
        try {
          const { user } = await authService.signIn(email, password);
          if (user) {
            const profile = await authService.getUserProfile(user.id);
            if (profile) {
              const todayMins = await sessionsService.getTodayMinutes(user.id);
              set({ user: profile, isAuthenticated: true, isGuest: false, todayMinutesRead: todayMins });
            } else {
              set({
                user: {
                  id: user.id,
                  username: (user.user_metadata?.username as string) || email.split('@')[0],
                  fullName: (user.user_metadata?.full_name as string) || email.split('@')[0],
                  avatarUrl: GUEST_USER.avatarUrl,
                  totalMinutesRead: 0,
                  currentStreak: 0,
                  dailyGoalMinutes: 60,
                  rankTier: 'Novice Reader',
                  bookshelfCount: 0,
                  savedPassagesCount: 0,
                },
                isAuthenticated: true,
                isGuest: false,
              });
            }
          }
        } finally {
          set({ isLoading: false });
        }
      },

      signUp: async (email, password, username, fullName) => {
        if (!isSupabaseConfigured()) throw new Error('Supabase is not configured.');
        set({ isLoading: true });
        try {
          const { user, session } = await authService.signUp(email, password, username, fullName);

          // A null session means the project requires email confirmation.
          // The account exists but the user is NOT authenticated yet.
          if (!session) {
            set({
              pendingConfirmationEmail: email,
              isAuthenticated: false,
              isGuest: false,
              user: null,
              authReady: true,
            });
            return;
          }

          if (user) {
            const profile = await authService.getUserProfile(user.id);
            if (profile) {
              const todayMins = await sessionsService.getTodayMinutes(user.id);
              set({ user: profile, isAuthenticated: true, isGuest: false, todayMinutesRead: todayMins, pendingConfirmationEmail: null });
            } else {
              set({
                user: {
                  id: user.id,
                  username: username.replace(/^@/, ''),
                  fullName: fullName || 'Book Lover',
                  avatarUrl: GUEST_USER.avatarUrl,
                  subtitle: email,
                  totalMinutesRead: 0,
                  currentStreak: 0,
                  dailyGoalMinutes: 60,
                  rankTier: 'Novice Reader',
                  bookshelfCount: 0,
                  savedPassagesCount: 0,
                },
                isAuthenticated: true,
                isGuest: false,
                pendingConfirmationEmail: null,
              });
            }
          }
        } finally {
          set({ isLoading: false });
        }
      },

      clearPendingConfirmation: () => set({ pendingConfirmationEmail: null }),

      signInAsGuest: () => {
        set({
          user: { ...GUEST_USER },
          isAuthenticated: false,
          isGuest: true,
          todayMinutesRead: 0,
          authReady: true,
        });
      },

      signOut: async () => {
        try {
          if (get().isAuthenticated) {
            await authService.signOut();
          }
        } catch (err) {
          console.warn('Sign out error:', err);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isGuest: false,
            todayMinutesRead: 0,
          });
        }
      },

      refreshProfile: async () => {
        const { user, isAuthenticated, isGuest } = get();
        if (isGuest) return;
        if (isAuthenticated && user && isSupabaseConfigured()) {
          const profile = await authService.getUserProfile(user.id);
          if (profile) set({ user: profile });
        }
      },

      updateUser: async (partial) => {
        const { user, isAuthenticated, isGuest } = get();
        if (!user) return;
        const updated = { ...user, ...partial };
        set({ user: updated });

        if (isGuest) return; // guest: local only
        if (isAuthenticated && isSupabaseConfigured()) {
          try {
            await authService.updateProfile(user.id, {
              full_name: partial.fullName,
              avatar_url: partial.avatarUrl,
              bio: partial.subtitle,
              daily_goal_minutes: partial.dailyGoalMinutes,
            });
          } catch (err) {
            console.warn('Could not sync user profile to Supabase:', err);
          }
        }
      },

      logSessionMinutes: async (minutes, bookTitle = 'The Creative Act') => {
        const { user, todayMinutesRead, isAuthenticated, isGuest } = get();
        if (!user) return;
        const newToday = todayMinutesRead + minutes;
        const newTotal = user.totalMinutesRead + minutes;
        set({
          todayMinutesRead: newToday,
          user: { ...user, totalMinutesRead: newTotal },
        });

        if (isGuest) return; // guest sessions are local only
        if (isAuthenticated && isSupabaseConfigured()) {
          try {
            await sessionsService.logSession({ bookTitle, durationMinutes: minutes, durationSeconds: minutes * 60 }, user.id);
            const updatedProfile = await authService.getUserProfile(user.id);
            if (updatedProfile) set({ user: updatedProfile });
          } catch (err) {
            console.warn('Could not save session to Supabase:', err);
          }
        }
      },
    }),
    {
      name: 'liread_user_profile_v1',
      partialize: (state) => ({
        user: state.user,
        todayMinutesRead: state.todayMinutesRead,
        isAuthenticated: state.isAuthenticated,
        isGuest: state.isGuest,
      }),    }
  )
);
