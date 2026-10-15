import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeMode, VibeConfig } from '../types/theme';

export const LIGHT_THEME: VibeConfig = {
  id: 'light',
  name: 'Light Mode',
  tagline: 'Clean, Airy, Daylight Minimal',
  concept: 'Warm paper alabaster reading aesthetic with crisp typography and distraction-free clarity.',
  description: 'Pure alabaster background, elevated crisp white cards, botanical emerald accents, and charcoal reader ink.',
  mode: 'light',
  isDefault: true,
  colors: {
    bg: '#FAFAF9',
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
    ambientGlow: 'radial-gradient(1100px 600px at 50% -10%, rgba(45, 106, 79, 0.04) 0%, transparent 80%)',
  },
  typography: {
    uiFont: 'Plus Jakarta Sans',
    quoteFont: 'Newsreader',
    description: 'Modern Geometric Sans UI × Classic Bookprint Serif Quotes',
  },
  surfaceFeel: 'Clean 1px borders, subtle soft diffused shadows, and rounded tactile cards.',
  swatches: ['#FAFAF9', '#FFFFFF', '#2D6A4F', '#D97706'],
};

export const DARK_THEME: VibeConfig = {
  id: 'dark',
  name: 'Dark Mode',
  tagline: 'Archival Serenity & Midnight Focus',
  concept: 'Eye-comfort midnight slate sanctuary with luminous emerald desk highlights and soft reading glow.',
  description: 'Inky midnight slate paired with luminous emerald accents and warm amber bookmark ribbons.',
  mode: 'dark',
  colors: {
    bg: '#0B0F17',
    card: '#131926',
    cardSubtle: '#1B2335',
    cardHover: '#202A3E',
    border: '#232D42',
    borderSubtle: '#1E273A',
    ink: '#F1F5F9',
    inkSecondary: '#CBD5E1',
    inkMuted: '#94A3B8',
    accent: '#10B981',
    accentHover: '#059669',
    accentSubtle: 'rgba(16, 185, 129, 0.15)',
    secondary: '#F59E0B',
    secondaryHover: '#D97706',
    secondarySubtle: 'rgba(245, 158, 11, 0.15)',
    badgeBg: 'rgba(16, 185, 129, 0.16)',
    badgeText: '#34D399',
    ambientGlow: 'radial-gradient(900px 500px at 70% 0%, rgba(16, 185, 129, 0.08) 0%, transparent 70%)',
  },
  typography: {
    uiFont: 'Plus Jakarta Sans',
    quoteFont: 'Newsreader',
    description: 'Luminous Sans UI × Archival Serif Quotes',
  },
  surfaceFeel: 'OLED-friendly dark cards, subtle night edges, warm reading glow.',
  swatches: ['#0B0F17', '#131926', '#10B981', '#F59E0B'],
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

    root.setAttribute('data-theme', mode);
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
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
