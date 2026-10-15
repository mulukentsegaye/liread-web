import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ThemeMode } from '../types/theme';

interface ThemeState {
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: (typeof window !== 'undefined' && localStorage.getItem('readers_hub_theme') === 'dark') ? 'dark' : 'light',
      isDark: (typeof window !== 'undefined' && localStorage.getItem('readers_hub_theme') === 'dark'),
      setTheme: (theme: ThemeMode) => {
        const isDark = theme === 'dark';
        set({ theme, isDark });
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', theme);
          document.documentElement.classList.toggle('dark', isDark);
          window.dispatchEvent(new CustomEvent('readers-hub-theme-changed', { detail: { theme } }));
        }
      },
      toggleTheme: () => {
        const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
        get().setTheme(nextTheme);
      },
    }),
    {
      name: 'readers_hub_theme_store_v2',
    }
  )
);
