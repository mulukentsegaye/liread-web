import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeMode, VibeConfig } from '../types/theme';

export const LIGHT_THEME: VibeConfig = {
  id: 'light',
  name: 'Light Mode',
  tagline: 'Warm Alabaster & Forest Sage',
  concept: 'Warm Alabaster reading aesthetic with Forest Sage botanical highlights and crisp typography.',
  description: 'Warm Alabaster (#FBFBF9) background, elevated crisp white cards, Forest Sage (#2D6A4F) accents, and charcoal reader ink.',
  mode: 'light',
  isDefault: true,
  colors: {
    bg: '#FBFBF9',
    card: '#FFFFFF',
    cardSubtle: '#F4F4F0',
    cardHover: '#F0EFEA',
    border: '#E7E5E0',
    borderSubtle: '#EFECE6',
    ink: '#18181B',
    inkSecondary: '#52525B',
    inkMuted: '#71717A',
    accent: '#2D6A4F',
    accentHover: '#22533D',
    accentSubtle: '#EBF2ED',
    secondary: '#D97706',
    secondaryHover: '#B45309',
    secondarySubtle: '#FEF3C7',
    badgeBg: '#EBF2ED',
    badgeText: '#2D6A4F',
    ambientGlow: 'none',
  },
  typography: {
    uiFont: 'Plus Jakarta Sans',
    quoteFont: 'Newsreader',
    description: 'Modern Geometric Sans UI × Classic Bookprint Serif Quotes',
  },
  surfaceFeel: 'Clean 1px borders, subtle soft diffused shadows, and rounded tactile cards.',
  swatches: ['#FBFBF9', '#FFFFFF', '#2D6A4F', '#D97706'],
};

export const DARK_THEME: VibeConfig = {
  id: 'dark',
  name: 'Dark Mode',
  tagline: 'Deep Obsidian & Electric Indigo',
  concept: 'Deep Obsidian (#0B0F19) workspace with Electric Indigo (#6366F1) brand highlights and eye-comfort midnight clarity.',
  description: 'Deep Obsidian background paired with Electric Indigo brand accents and clean typography.',
  mode: 'dark',
  colors: {
    bg: '#0B0F19',
    card: '#131926',
    cardSubtle: '#1B2335',
    cardHover: '#202A3E',
    border: '#232D42',
    borderSubtle: '#1E273A',
    ink: '#F1F5F9',
    inkSecondary: '#CBD5E1',
    inkMuted: '#94A3B8',
    accent: '#6366F1',
    accentHover: '#4F46E5',
    accentSubtle: 'rgba(99, 102, 241, 0.15)',
    secondary: '#F59E0B',
    secondaryHover: '#D97706',
    secondarySubtle: 'rgba(245, 158, 11, 0.15)',
    badgeBg: 'rgba(99, 102, 241, 0.16)',
    badgeText: '#818CF8',
    ambientGlow: 'none',
  },
  typography: {
    uiFont: 'Plus Jakarta Sans',
    quoteFont: 'Newsreader',
    description: 'Luminous Sans UI × Archival Serif Quotes',
  },
  surfaceFeel: 'OLED-friendly dark cards, subtle night edges, warm reading glow.',
  swatches: ['#0B0F19', '#131926', '#6366F1', '#F59E0B'],
};

export const VIBES: Record<ThemeMode, VibeConfig> = {
  light: LIGHT_THEME,
  dark: DARK_THEME,
};

export const VIBE_DEFINITIONS = VIBES;
export const DEFAULT_VIBE: ThemeMode = 'light';
const STORAGE_KEY = 'readers_hub_theme';

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
      localStorage.setItem('readers_hub_vibe', mode);
    } catch (e) {
      console.warn('Failed to save theme to localStorage:', e);
    }
    applyThemeToDocument(mode);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('readers-hub-theme-changed', { detail: { theme: mode } }));
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
