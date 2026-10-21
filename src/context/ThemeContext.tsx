import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeMode, VibeConfig } from '../types/theme';

export const LIGHT_THEME: VibeConfig = {
  id: 'light',
  name: 'Light Mode',
  tagline: 'Whitey-Silver & Deep Emerald',
  concept: 'Whitey-Silver reading aesthetic with Deep Emerald botanical highlights and crisp typography.',
  description: 'Whitey-Silver (#F3F4F6) background, elevated pure white cards, Deep Emerald (#059669) accents, and Warm Amber (#D97706) streaks & ranks.',
  mode: 'light',
  isDefault: true,
  colors: {
    bg: '#F3F4F6',
    card: '#FFFFFF',
    cardSubtle: '#F9FAFB',
    cardHover: '#F3F4F6',
    border: '#E5E7EB',
    borderSubtle: '#F3F4F6',
    ink: '#111827',
    inkSecondary: '#4B5563',
    inkMuted: '#9CA3AF',
    accent: '#059669',
    accentHover: '#047857',
    accentSubtle: '#ECFDF5',
    secondary: '#D97706',
    secondaryHover: '#B45309',
    secondarySubtle: '#FEF3C7',
    badgeBg: '#ECFDF5',
    badgeText: '#059669',
    ambientGlow: 'none',
  },
  typography: {
    uiFont: 'Inter',
    quoteFont: 'Cormorant Garamond',
    description: 'Avant-Garde Archivist (Cormorant Garamond, Syne, Inter, DM Mono)',
  },
  surfaceFeel: 'Clean 1px borders, subtle soft diffused shadows, and rounded tactile cards.',
  swatches: ['#F3F4F6', '#FFFFFF', '#059669', '#D97706'],
};

export const DARK_THEME: VibeConfig = {
  id: 'dark',
  name: 'Dark Mode',
  tagline: 'Deep Obsidian & Mint-Emerald',
  concept: 'Deep Obsidian (#0B0F19) workspace with Luminous Mint-Emerald (#34D399) highlights and Bright Gold (#FBBF24) streak accents.',
  description: 'Deep Obsidian background paired with Elevated Slate (#111827) cards, Luminous Mint-Emerald accents, and Bright Gold secondary details.',
  mode: 'dark',
  colors: {
    bg: '#0B0F19',
    card: '#111827',
    cardSubtle: '#1F2937',
    cardHover: '#283548',
    border: '#1F2937',
    borderSubtle: '#172033',
    ink: '#F9FAFB',
    inkSecondary: '#CBD5E1',
    inkMuted: '#94A3B8',
    accent: '#34D399',
    accentHover: '#10B981',
    accentSubtle: 'rgba(52, 211, 153, 0.15)',
    secondary: '#FBBF24',
    secondaryHover: '#F59E0B',
    secondarySubtle: 'rgba(251, 191, 36, 0.15)',
    badgeBg: 'rgba(52, 211, 153, 0.15)',
    badgeText: '#34D399',
    ambientGlow: 'none',
  },
  typography: {
    uiFont: 'Inter',
    quoteFont: 'Cormorant Garamond',
    description: 'Avant-Garde Archivist Midnight (Cormorant Garamond, Syne, Inter, DM Mono)',
  },
  surfaceFeel: 'OLED-friendly dark cards, elevated slate hierarchy, glowing emerald accents.',
  swatches: ['#0B0F19', '#111827', '#34D399', '#FBBF24'],
};

export const VIBES: Record<ThemeMode, VibeConfig> = {
  light: LIGHT_THEME,
  dark: DARK_THEME,
};

export const VIBE_DEFINITIONS = VIBES;
export const DEFAULT_VIBE: ThemeMode = 'light';
const STORAGE_KEY = 'liread_theme';

export interface ThemeContextValue {
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  // Backward compatibility aliases
  vibe: ThemeMode;
  vibeConfig: VibeConfig;
  allVibes: VibeConfig[];
  setVibe: (id: ThemeMode) => void;
  isPopoverOpen: boolean;
  setPopoverOpen: (open: boolean) => void;
  togglePopover: () => void;
  openPopover: () => void;
  closePopover: () => void;
}

export type ThemeContextType = ThemeContextValue;

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') {
        return stored;
      }
    }
    return 'light';
  });

  const applyThemeToDocument = (mode: ThemeMode) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const isApp = typeof window !== 'undefined' && window.location.hash === '#app';

    // The landing page and login page always stay strictly in Light Mode.
    // Dark mode only applies within the home page/app workspace (#app) when selected.
    if (isApp && mode === 'dark') {
      root.setAttribute('data-theme', 'dark');
      root.classList.add('dark');
    } else {
      root.setAttribute('data-theme', 'light');
      root.classList.remove('dark');
    }
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
      localStorage.setItem('liread_vibe', mode);
    } catch (e) {
      console.warn('Failed to save theme to localStorage:', e);
    }
    applyThemeToDocument(mode);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('liread-theme-changed', { detail: { theme: mode } }));
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    applyThemeToDocument(theme);
    const handleHashChange = () => {
      applyThemeToDocument(theme);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [theme]);

  const value: ThemeContextValue = {
    theme,
    isDark: theme === 'dark',
    setTheme,
    toggleTheme,
    // Aliases
    vibe: theme,
    vibeConfig: VIBES[theme] || LIGHT_THEME,
    allVibes: [LIGHT_THEME, DARK_THEME],
    setVibe: setTheme,
    isPopoverOpen: false,
    setPopoverOpen: () => {},
    togglePopover: toggleTheme,
    openPopover: () => {},
    closePopover: () => {},
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
