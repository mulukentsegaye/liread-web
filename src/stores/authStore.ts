import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile } from '../types';
import { CURRENT_USER } from '../data/mockData';
import { authService } from '../services/authService';
import { sessionsService } from '../services/sessionsService';
import { isSupabaseConfigured } from '../lib/supabase';

interface AuthStore {
  user: UserProfile;
  todayMinutesRead: number;
  isAuthenticated: boolean;
  isLoading: boolean;
  isBackendConnected: boolean;

  // Actions
  initAuth: () => Promise<void>;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, username: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  login: (partial?: Partial<UserProfile>) => void;
  updateUser: (partial: Partial<UserProfile>) => Promise<void>;
  logSessionMinutes: (minutes: number, bookTitle?: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: CURRENT_USER,
      todayMinutesRead: 42,
      isAuthenticated: false,
      isLoading: false,
      isBackendConnected: isSupabaseConfigured(),

      initAuth: async () => {
        const configured = isSupabaseConfigured();
        set({ isBackendConnected: configured });
        if (!configured) return;

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
                todayMinutesRead: todayMins || profile.totalMinutesRead % 60,
              });
            } else {
              set({ isAuthenticated: true });
            }
          } else {
            set({ isAuthenticated: false });
          }

          // Listen for session updates
          authService.onAuthStateChange(async (updatedSession) => {
            if (updatedSession?.user) {
              const profile = await authService.getUserProfile(updatedSession.user.id);
              if (profile) {
                set({ user: profile, isAuthenticated: true });
              }
            } else {
              set({ isAuthenticated: false, user: CURRENT_USER });
            }
          });
        } catch (err) {
          console.warn('Supabase auth initialization skipped or failed:', err);
        } finally {
          set({ isLoading: false });
        }
      },

      signIn: async (email, password) => {
        set({ isLoading: true });
        try {
          const { user } = await authService.signIn(email, password);
          if (user) {
            const profile = await authService.getUserProfile(user.id);
            if (profile) {
              set({ user: profile, isAuthenticated: true });
            }
          }
        } finally {
          set({ isLoading: false });
        }
      },

      signUp: async (email, password, username, fullName) => {
        set({ isLoading: true });
        try {
          const { user } = await authService.signUp(email, password, username, fullName);
          if (user) {
            const profile = await authService.getUserProfile(user.id);
            if (profile) {
              set({ user: profile, isAuthenticated: true });
            }
          }
        } finally {
          set({ isLoading: false });
        }
      },

      signOut: async () => {
        try {
          await authService.signOut();
        } catch (err) {
          console.warn('Sign out error:', err);
        } finally {
          set({
            user: CURRENT_USER,
            isAuthenticated: false,
            todayMinutesRead: 42,
          });
        }
      },

      login: (partial?: Partial<UserProfile>) => {
        set((state) => ({
          isAuthenticated: true,
          user: partial ? { ...state.user, ...partial } : state.user,
        }));
      },

      refreshProfile: async () => {
        const { user, isAuthenticated } = get();
        if (isAuthenticated && isSupabaseConfigured()) {
          const profile = await authService.getUserProfile(user.id);
          if (profile) {
            set({ user: profile });
          }
        }
      },

      updateUser: async (partial) => {
        const { user, isAuthenticated } = get();
        const updated = { ...user, ...partial };
        set({ user: updated });

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
        const { user, todayMinutesRead, isAuthenticated } = get();
        const newToday = todayMinutesRead + minutes;
        const newTotal = user.totalMinutesRead + minutes;

        set({
          todayMinutesRead: newToday,
          user: {
            ...user,
            totalMinutesRead: newTotal,
          },
        });

        if (isAuthenticated && isSupabaseConfigured()) {
          try {
            await sessionsService.logSession(
              {
                bookTitle,
                durationMinutes: minutes,
                durationSeconds: minutes * 60,
              },
              user.id
            );
            // Refresh updated profile with new streak and rank tier computed by database trigger
            const updatedProfile = await authService.getUserProfile(user.id);
            if (updatedProfile) {
              set({ user: updatedProfile });
            }
          } catch (err) {
            console.warn('Could not save session to Supabase:', err);
          }
        }
      },
    }),
    {
      name: 'readers_hub_user_profile_v2',
      partialize: (state) => ({
        user: state.user,
        todayMinutesRead: state.todayMinutesRead,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.user?.avatarUrl && (
          state.user.avatarUrl.includes('photo-1534528741775') ||
          state.user.avatarUrl.includes('photo-1494790108377') ||
          state.user.avatarUrl.includes('photo-1544005313-94ddf0286df2')
        )) {
          state.user.avatarUrl = CURRENT_USER.avatarUrl;
        }
      },
    }
  )
);
