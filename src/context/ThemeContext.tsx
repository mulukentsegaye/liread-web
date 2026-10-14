import React, { createContext, useContext, useEffect, useState } from 'react';
import { VibeId, VibeConfig } from '../types/theme';

export const DEFAULT_VIBE: VibeId = 'botanical-zen';

export const VIBE_DEFINITIONS: Record<VibeId, VibeConfig> = {
  'dark-academia': {
    id: 'dark-academia',
    name: 'Grand Archive',
    tagline: 'Candlelit Library & Leather',
    concept: 'Ancient midnight library with velvet, mahogany, and brass accents',
    description: 'Deep espresso walnut surfaces, aged leather textures, antique brass foil, and crimson bookmark ribbons.',
    mode: 'dark',
    colors: {
      bg: '#120E0A',
      card: '#1C1611',
      cardSubtle: '#241C15',
      cardHover: '#2A2119',
      border: '#3A2E21',
      borderSubtle: '#2E2319',
      ink: '#EAE0D5',
      inkSecondary: '#C2B5A5',
      inkMuted: '#8C7D6E',
      accent: '#D4AF37',
      accentHover: '#C49F2F',
      accentSubtle: 'rgba(212, 175, 55, 0.15)',
      secondary: '#8B1E24',
      secondaryHover: '#A8252C',
      secondarySubtle: 'rgba(139, 30, 36, 0.18)',
      badgeBg: '#2E2218',
      badgeText: '#D4AF37',
      ambientGlow: 'rgba(212, 175, 55, 0.14)',
    },
    typography: {
      uiFont: 'Inter, sans-serif',
      quoteFont: 'Cormorant Garamond, serif',
      description: 'Classical literary serif with antique gold accents',
    },
    surfaceFeel: 'Aged Leather & Polished Mahogany',
    swatches: ['#120E0A', '#1C1611', '#D4AF37', '#8B1E24'],
  },
  'deep-orbit': {
    id: 'deep-orbit',
    name: 'Deep Orbit',
    tagline: 'Sci-Fi Holo-Deck & Cosmic Glass',
    concept: 'Observatory aboard a silent deep-space vessel gazing into nebula fields',
    description: 'Void black-blue expanse, translucent frosted holo-deck glass, bioluminescent teal, and nebula violet aurora glows.',
    mode: 'dark',
    colors: {
      bg: '#05070E',
      card: 'rgba(15, 23, 42, 0.72)',
      cardSubtle: 'rgba(30, 41, 59, 0.6)',
      cardHover: 'rgba(30, 41, 59, 0.85)',
      border: 'rgba(0, 245, 212, 0.22)',
      borderSubtle: 'rgba(0, 245, 212, 0.12)',
      ink: '#F0F6FC',
      inkSecondary: '#94A3B8',
      inkMuted: '#64748B',
      accent: '#00F5D4',
      accentHover: '#00D4B8',
      accentSubtle: 'rgba(0, 245, 212, 0.15)',
      secondary: '#7B2CBF',
      secondaryHover: '#9D4EDD',
      secondarySubtle: 'rgba(123, 44, 191, 0.22)',
      badgeBg: 'rgba(0, 245, 212, 0.12)',
      badgeText: '#00F5D4',
      ambientGlow: 'rgba(0, 245, 212, 0.25)',
    },
    typography: {
      uiFont: 'Space Grotesk, sans-serif',
      quoteFont: 'Space Grotesk, monospace',
      description: 'Futuristic telemetry monospace with cyan bioluminescence',
    },
    surfaceFeel: 'Frosted Holo-Glass & Starlight',
    swatches: ['#05070E', '#0F172A', '#00F5D4', '#7B2CBF'],
  },
  'lofi-cafe': {
    id: 'lofi-cafe',
    name: 'Rainy Tokyo Café',
    tagline: 'Cozy Lo-Fi & Neon Dusk',
    concept: 'Rainy night at a quiet Shibuya bookstore café with warm tungsten lamps',
    description: 'Midnight indigo-slate backdrop, warm dusk purple tactile cards, matcha latte green, warm amber lamps, and sakura pink.',
    mode: 'dark',
    colors: {
      bg: '#161925',
      card: '#212536',
      cardSubtle: '#2C3147',
      cardHover: '#353B55',
      border: '#30364F',
      borderSubtle: '#2A2E44',
      ink: '#F8F9FA',
      inkSecondary: '#C4CAD8',
      inkMuted: '#7E88A1',
      accent: '#80ED99',
      accentHover: '#6FD887',
      accentSubtle: 'rgba(128, 237, 153, 0.15)',
      secondary: '#FF9F1C',
      secondaryHover: '#FFAE3E',
      secondarySubtle: 'rgba(255, 159, 28, 0.2)',
      badgeBg: '#2C3147',
      badgeText: '#80ED99',
      ambientGlow: 'rgba(255, 159, 28, 0.18)',
    },
    typography: {
      uiFont: 'Inter, sans-serif',
      quoteFont: 'Newsreader, Georgia, serif',
      description: 'Warm cafe editorial paired with neon pastel accents',
    },
    surfaceFeel: 'Soft Tactile Velvet & Tungsten Lamp',
    swatches: ['#161925', '#212536', '#80ED99', '#FF9F1C'],
  },
  'botanical-zen': {
    id: 'botanical-zen',
    name: 'Solar Punk Botanical',
    tagline: 'Sunlit Greenhouse Sanctuary',
    concept: 'Reading inside a sun-drenched botanical conservatory among ferns and natural wood',
    description: 'Soft moss mist, frosted sunlight surfaces, deep forest green text, sunbeam gold, and leaf emerald accents.',
    mode: 'light',
    isDefault: true,
    colors: {
      bg: '#EEF2EB',
      card: '#FFFFFF',
      cardSubtle: '#F4F7F2',
      cardHover: '#EBF1E8',
      border: '#CBD5C0',
      borderSubtle: '#DFE6D7',
      ink: '#1B3B2B',
      inkSecondary: '#496253',
      inkMuted: '#7B9485',
      accent: '#40916C',
      accentHover: '#337959',
      accentSubtle: 'rgba(64, 145, 108, 0.14)',
      secondary: '#F4A261',
      secondaryHover: '#E76F51',
      secondarySubtle: 'rgba(244, 162, 97, 0.18)',
      badgeBg: '#E2ECE4',
      badgeText: '#1B3B2B',
      ambientGlow: 'rgba(64, 145, 108, 0.15)',
    },
    typography: {
      uiFont: 'Inter, sans-serif',
      quoteFont: 'Newsreader, Georgia, serif',
      description: 'Organic serif editorial with natural plant-tinted shadows',
    },
    surfaceFeel: 'Organic Wood & Frosted Sunlight Glass',
    swatches: ['#EEF2EB', '#FFFFFF', '#40916C', '#F4A261'],
  },
  'nordic-studio': {
    id: 'nordic-studio',
    name: 'Nordic Studio',
    tagline: 'Clean Editorial & Sage Linen',
    concept: 'Minimalist Scandinavian studio with clean lines and quiet focus',
    description: 'Off-white linen canvas, crisp card geometry, and balanced forest greens.',
    mode: 'light',
    colors: {
      bg: '#F8F9F8',
      card: '#FFFFFF',
      cardSubtle: '#F1F4F1',
      cardHover: '#EBF0EB',
      border: '#E1E6E1',
      borderSubtle: '#EAEFEA',
      ink: '#1E2E23',
      inkSecondary: '#4B554D',
      inkMuted: '#8C9C90',
      accent: '#35523F',
      accentHover: '#2A4232',
      accentSubtle: 'rgba(53, 82, 63, 0.12)',
      secondary: '#D97706',
      secondaryHover: '#B45309',
      secondarySubtle: 'rgba(217, 119, 6, 0.15)',
      badgeBg: '#E5EDE6',
      badgeText: '#24392B',
      ambientGlow: 'rgba(53, 82, 63, 0.1)',
    },
    typography: {
      uiFont: 'Inter, sans-serif',
      quoteFont: 'Newsreader, serif',
      description: 'Nordic editorial serif with balanced contrast',
    },
    surfaceFeel: 'Linen Paper & Modernist Geometry',
    swatches: ['#F8F9F8', '#FFFFFF', '#35523F', '#D97706'],
  },
};

interface ThemeContextType {
  vibe: VibeId;
  vibeConfig: VibeConfig;
  allVibes: VibeConfig[];
  setVibe: (vibe: VibeId) => void;
  isPopoverOpen: boolean;
  togglePopover: () => void;
  openPopover: () => void;
  closePopover: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vibe, setVibeState] = useState<VibeId>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('readers_hub_vibe') as VibeId;
      if (saved && VIBE_DEFINITIONS[saved]) return saved;
    }
    return DEFAULT_VIBE;
  });

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const setVibe = (newVibe: VibeId) => {
    setVibeState(newVibe);
    if (typeof window !== 'undefined') {
      localStorage.setItem('readers_hub_vibe', newVibe);
      document.documentElement.setAttribute('data-theme', newVibe);
      if (VIBE_DEFINITIONS[newVibe]?.mode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', vibe);
    if (VIBE_DEFINITIONS[vibe]?.mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [vibe]);

  const togglePopover = () => setIsPopoverOpen((prev) => !prev);
  const openPopover = () => setIsPopoverOpen(true);
  const closePopover = () => setIsPopoverOpen(false);

  const value: ThemeContextType = {
    vibe,
    vibeConfig: VIBE_DEFINITIONS[vibe] || VIBE_DEFINITIONS[DEFAULT_VIBE],
    allVibes: Object.values(VIBE_DEFINITIONS),
    setVibe,
    isPopoverOpen,
    togglePopover,
    openPopover,
    closePopover,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
