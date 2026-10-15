import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile } from '../types';
import { CURRENT_USER } from '../data/mockData';

interface AuthStore {
  user: UserProfile;
  isAuthenticated: boolean;
  todayMinutesRead: number;
  login: (userProfile?: Partial<UserProfile>) => void;
  logout: () => void;
  updateUser: (partial: Partial<UserProfile>) => void;
  logSessionMinutes: (minutes: number) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: CURRENT_USER,
      isAuthenticated: true, // Default authenticated to support seamless demo experience
      todayMinutesRead: 42, // Pre-seeded at 42 mins (matches "42 of 60 minutes" in mockup)

      login: (userProfile?: Partial<UserProfile>) => {
        set((state) => ({
          isAuthenticated: true,
          user: userProfile ? { ...state.user, ...userProfile } : state.user,
        }));
      },

      logout: () => {
        set({ isAuthenticated: false });
      },

      updateUser: (partial) => {
        set((state) => ({
          user: { ...state.user, ...partial },
        }));
      },

      logSessionMinutes: (minutes) => {
        set((state) => {
          const newToday = state.todayMinutesRead + minutes;
          const newTotal = state.user.totalMinutesRead + minutes;
          return {
            todayMinutesRead: newToday,
            user: {
              ...state.user,
              totalMinutesRead: newTotal,
            },
          };
        });
      },
    }),
    {
      name: 'readers_hub_user_profile_v2',
    }
  )
);
