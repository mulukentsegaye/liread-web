import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ThemeId, VibeId } from '../types/theme';

interface ThemeState {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: (typeof window !== 'undefined' && (localStorage.getItem('readers_hub_vibe') as ThemeId)) || 'botanical-zen',
      setTheme: (theme: ThemeId) => {
        set({ theme });
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', theme);
          window.dispatchEvent(new CustomEvent('readers-hub-theme-changed', { detail: { theme } }));
        }
      },
    }),
    {
      name: 'readers_hub_theme_store_v1',
    }
  )
);
