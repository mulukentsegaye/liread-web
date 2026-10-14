import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeId = 'dark-academia' | 'deep-orbit' | 'lofi-cafe' | 'botanical-zen';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  subtitle: string;
  previewBg: string;
  previewSurface: string;
  previewAccent: string;
  previewText: string;
  iconName: string;
  isDark: boolean;
  fontFamily: string;
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  'dark-academia': {
    id: 'dark-academia',
    name: 'Grand Archive',
    subtitle: 'Candlelit Library & Leather',
    previewBg: '#120E0A',
    previewSurface: '#1C1611',
    previewAccent: '#D4AF37',
    previewText: '#EAE0D5',
    iconName: 'BookMarked',
    isDark: true,
    fontFamily: '"Cormorant Garamond", "Playfair Display", Georgia, serif',
  },
  'deep-orbit': {
    id: 'deep-orbit',
    name: 'Deep Orbit',
    subtitle: 'Sci-Fi Holo-Deck & Cosmic Glass',
    previewBg: '#05070E',
    previewSurface: '#0F172A',
    previewAccent: '#00F5D4',
    previewText: '#F0F6FC',
    iconName: 'Orbit',
    isDark: true,
    fontFamily: '"Space Grotesk", "JetBrains Mono", sans-serif',
  },
  'lofi-cafe': {
    id: 'lofi-cafe',
    name: 'Rainy Tokyo Café',
    subtitle: 'Cozy Lo-Fi & Neon Dusk',
    previewBg: '#161925',
    previewSurface: '#212536',
    previewAccent: '#80ED99',
    previewText: '#F8F9FA',
    iconName: 'Coffee',
    isDark: true,
    fontFamily: '"Inter", sans-serif',
  },
  'botanical-zen': {
    id: 'botanical-zen',
    name: 'Solar Punk Botanical',
    subtitle: 'Sunlit Greenhouse Sanctuary',
    previewBg: '#EEF2EB',
    previewSurface: '#FFFFFF',
    previewAccent: '#40916C',
    previewText: '#1B3B2B',
    iconName: 'Leaf',
    isDark: false,
    fontFamily: '"Newsreader", Georgia, serif',
  },
};

interface ThemeStore {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  getThemeConfig: () => ThemeConfig;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'botanical-zen',
      setTheme: (newTheme) => {
        set({ theme: newTheme });
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', newTheme);
          if (THEMES[newTheme].isDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },
      getThemeConfig: () => THEMES[get().theme] || THEMES['botanical-zen'],
    }),
    {
      name: 'readers_hub_active_theme_v2',
      onRehydrateStorage: () => (state) => {
        if (state && typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', state.theme);
          if (THEMES[state.theme]?.isDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },
    }
  )
);
