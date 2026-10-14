import React, { createContext, useContext, useEffect, useState } from 'react';
import { VibeId, VibeConfig } from '../types/theme';

export const DEFAULT_VIBE: VibeId = 'nordic-studio';
const STORAGE_KEY = 'readers_hub_vibe';

export const VIBES: Record<VibeId, VibeConfig> = {
  'nordic-studio': {
    id: 'nordic-studio',
    name: 'Nordic Studio',
    tagline: 'Clean, Airy, Daylight Minimal',
    concept: 'Inspired by Kinfolk Magazine, Notion, and Scandinavian reading lounges. Calm, hyper-legible, and distraction-free.',
    description: 'Warm Alabaster background (#FBFBF9), Pure White elevated cards (#FFFFFF), Crisp Stone borders (#E6E4DD), Deep Charcoal text (#18181B), Botanical Sage Green (#2D6A4F) and Soft Terracotta (#E07A5F).',
    mode: 'light',
    isDefault: true,
    colors: {
      bg: '#FBFBF9',
      card: '#FFFFFF',
      cardSubtle: '#F4F3EE',
      cardHover: '#F8F7F2',
      border: '#E6E4DD',
      borderSubtle: '#EDECE7',
      ink: '#18181B',
      inkSecondary: '#52525B',
      inkMuted: '#71717A',
      accent: '#2D6A4F',
      accentHover: '#22533D',
      accentSubtle: '#EBF2ED',
      secondary: '#E07A5F',
      secondaryHover: '#CD674C',
      secondarySubtle: '#FAF0ED',
      badgeBg: '#EBF2ED',
      badgeText: '#2D6A4F',
      ambientGlow: 'radial-gradient(1000px 500px at 50% 0%, rgba(45, 106, 79, 0.05) 0%, transparent 80%)',
    },
    typography: {
      uiFont: 'Plus Jakarta Sans',
      quoteFont: 'Newsreader',
      description: 'Geometric Sans UI × Warm Literary Serif Quotes',
    },
    surfaceFeel: 'Subtle 1px borders, soft diffused shadows, and pill-shaped buttons.',
    swatches: ['#FBFBF9', '#FFFFFF', '#2D6A4F', '#E07A5F'],
  },
  'midnight-library': {
    id: 'midnight-library',
    name: 'Midnight Library',
    tagline: 'Archival Serenity & Banker’s Lamp',
    concept: 'Deep obsidian vaults, quiet sanctuary, and luminous emerald desk lamps for immersive night reading.',
    description: 'Inky midnight slate paired with banker’s lamp emerald and warm amber reading glow.',
    mode: 'dark',
    colors: {
      bg: '#0B0F17',
      card: '#131926',
      cardSubtle: '#1B2335',
      cardHover: '#1E273A',
      border: '#232D42',
      borderSubtle: '#2E3A54',
      ink: '#F1F5F9',
      inkSecondary: '#CBD5E1',
      inkMuted: '#94A3B8',
      accent: '#10B981',
      accentHover: '#059669',
      accentSubtle: 'rgba(16, 185, 129, 0.14)',
      secondary: '#F59E0B',
      secondaryHover: '#D97706',
      secondarySubtle: 'rgba(245, 158, 11, 0.14)',
      badgeBg: 'rgba(16, 185, 129, 0.16)',
      badgeText: '#34D399',
      ambientGlow: 'radial-gradient(900px 500px at 70% 0%, rgba(16, 185, 129, 0.09) 0%, transparent 70%), radial-gradient(700px 400px at 15% 20%, rgba(245, 158, 11, 0.05) 0%, transparent 60%)',
    },
    typography: {
      uiFont: 'Plus Jakarta Sans',
      quoteFont: 'Newsreader',
      description: 'Luminous Sans UI × Archival Serif Quotes',
    },
    surfaceFeel: 'OLED-friendly dark cards, subtle neon edges, warm candlelight glow',
    swatches: ['#0B0F17', '#131926', '#10B981', '#F59E0B'],
  },
  'dark-academia': {
    id: 'dark-academia',
    name: 'Dark Academia',
    tagline: 'Leather, Espresso & Candlelight',
    concept: 'Ancient Oxford library with velvet, weathered oak, brass, and candlelight warmth.',
    description: 'Deep espresso walnut background (#120E0A), aged leather surfaces (#1C1611), antique brass accents (#D4AF37), and crimson bookmark touches.',
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
      ambientGlow: 'radial-gradient(900px 500px at 50% 0%, rgba(212, 175, 55, 0.12) 0%, transparent 70%)',
    },
    typography: {
      uiFont: 'Plus Jakarta Sans',
      quoteFont: 'Lora',
      description: 'Classical literary serif with antique gold accents and candlelit parchment warmth',
    },
    surfaceFeel: 'Aged Leather, double-lined vintage borders & Polished Mahogany',
    swatches: ['#120E0A', '#1C1611', '#D4AF37', '#8B1E24'],
  },
  'sepia-manuscript': {
    id: 'sepia-manuscript',
    name: 'Sepia Manuscript',
    tagline: 'Warm Linen & Vintage Bookshop',
    concept: 'Soft deckle-edge paper, warm afternoon tea, and soothing low eye-strain sepia tones.',
    description: 'Antique vellum paper feel, iron gall ink typography, and warm cognac touches.',
    mode: 'warm',
    colors: {
      bg: '#F6F1E9',
      card: '#FDFBF7',
      cardSubtle: '#EEE7DC',
      cardHover: '#E7DFD2',
      border: '#DFD4C3',
      borderSubtle: '#E9E0D3',
      ink: '#2D2319',
      inkSecondary: '#574737',
      inkMuted: '#7C6C5D',
      accent: '#B86221',
      accentHover: '#984D14',
      accentSubtle: '#EFE3D3',
      secondary: '#5B7052',
      secondaryHover: '#475940',
      secondarySubtle: '#E7ECE6',
      badgeBg: '#EFE3D3',
      badgeText: '#B86221',
      ambientGlow: 'radial-gradient(900px 500px at 50% 0%, rgba(184, 98, 33, 0.06) 0%, transparent 70%)',
    },
    typography: {
      uiFont: 'Plus Jakarta Sans',
      quoteFont: 'Newsreader',
      description: 'Gentle UI Sans × Literary Bookprint Serif',
    },
    surfaceFeel: 'Natural textured paper feel, gentle contrast, eye-fatigue prevention',
    swatches: ['#F6F1E9', '#FDFBF7', '#B86221', '#5B7052'],
  },
  'kyoto-minimalist': {
    id: 'kyoto-minimalist',
    name: 'Kyoto Minimalist',
    tagline: 'Sumi Ink, Mist & River Stone',
    concept: 'Wabi-sabi balance, white sand gardens, deep pine indigo, and vermilion seal stamps.',
    description: 'River stone gray borders, sumi ink text, and calm indigo accents.',
    mode: 'light',
    colors: {
      bg: '#F3F3F1',
      card: '#FAFAF9',
      cardSubtle: '#E7E7E3',
      cardHover: '#EEEEEC',
      border: '#D5D5CF',
      borderSubtle: '#E0E0DC',
      ink: '#121314',
      inkSecondary: '#3B3E43',
      inkMuted: '#696C73',
      accent: '#2B3A42',
      accentHover: '#1B252B',
      accentSubtle: '#E4E9EC',
      secondary: '#C2410C',
      secondaryHover: '#9A3412',
      secondarySubtle: '#FAECE7',
      badgeBg: '#E4E9EC',
      badgeText: '#2B3A42',
      ambientGlow: 'radial-gradient(900px 500px at 50% 0%, rgba(43, 58, 66, 0.05) 0%, transparent 75%)',
    },
    typography: {
      uiFont: 'Plus Jakarta Sans',
      quoteFont: 'Newsreader',
      description: 'Clean Geometric Sans × Contemplative Literary Serif',
    },
    surfaceFeel: 'Clean architectural line work, river stone serenity, crisp contrast',
    swatches: ['#F3F3F1', '#FAFAF9', '#2B3A42', '#C2410C'],
  },
  'cyber-codex': {
    id: 'cyber-codex',
    name: 'Cyber Codex',
    tagline: 'Neo-Tokyo Synth & OLED Reading',
    concept: 'Digital archive kiosk, deep OLED violet, electric cyan data lines, and neon magenta markers.',
    description: 'Ultra dark OLED background with high-contrast electric cyan and neon rose.',
    mode: 'dark',
    colors: {
      bg: '#0A0912',
      card: '#131122',
      cardSubtle: '#1D1933',
      cardHover: '#24203E',
      border: '#2E2750',
      borderSubtle: '#3B3266',
      ink: '#F1F3FB',
      inkSecondary: '#CBD0E8',
      inkMuted: '#968DB8',
      accent: '#06B6D4',
      accentHover: '#0891B2',
      accentSubtle: 'rgba(6, 182, 212, 0.14)',
      secondary: '#F43F5E',
      secondaryHover: '#E11D48',
      secondarySubtle: 'rgba(244, 63, 94, 0.14)',
      badgeBg: 'rgba(6, 182, 212, 0.16)',
      badgeText: '#22D3EE',
      ambientGlow: 'radial-gradient(800px 500px at 75% 0%, rgba(6, 182, 212, 0.12) 0%, transparent 70%), radial-gradient(700px 400px at 15% 20%, rgba(244, 63, 94, 0.08) 0%, transparent 60%)',
    },
    typography: {
      uiFont: 'Plus Jakarta Sans',
      quoteFont: 'Lora',
      description: 'Cyber Terminal Sans × Digital Manuscript Serif',
    },
    surfaceFeel: 'Futuristic glassmorphism, glowing accents, hyper-contrast reading',
    swatches: ['#0A0912', '#131122', '#06B6D4', '#F43F5E'],
  },
  'botanical-zen': {
    id: 'botanical-zen',
    name: 'Botanical Greenhouse',
    tagline: 'Sunlit Greenhouse Sanctuary',
    concept: 'Morning reading in a lush plant conservatory surrounded by ferns and sunlight.',
    description: 'Calm herbal sage green (#40916C), terracotta warmth (#F4A261), soft linen cards (#FFFFFF), and natural leaf text.',
    mode: 'light',
    isDefault: false,
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
      ambientGlow: 'radial-gradient(900px 500px at 50% 0%, rgba(244, 162, 97, 0.1) 0%, transparent 65%), radial-gradient(700px 400px at 80% 50%, rgba(64, 145, 108, 0.08) 0%, transparent 60%)',
    },
    typography: {
      uiFont: 'Plus Jakarta Sans',
      quoteFont: 'Newsreader',
      description: 'Organic typography with natural sunlit freshness',
    },
    surfaceFeel: 'Organic borders, soft green-tinted shadows, and calm breathing aura',
    swatches: ['#EEF2EB', '#FFFFFF', '#40916C', '#F4A261'],
  },
  'deep-orbit': {
    id: 'deep-orbit',
    name: 'Deep Orbit',
    tagline: 'Sci-Fi Holo-Deck & Cosmic Glass',
    concept: 'Reading aboard a quiet starship observatory overlooking a nebula. Sleek, futuristic, and luminous.',
    description: 'Void Black-Blue background (#05070E), Frosted Holo-Glass cards, Cyan bioluminescent teal (#00F5D4), Nebula Violet (#7B2CBF).',
    mode: 'dark',
    colors: {
      bg: '#05070E',
      card: '#0F172A',
      cardSubtle: '#1E293B',
      cardHover: '#283548',
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
      ambientGlow: 'radial-gradient(900px 500px at 70% 0%, rgba(0, 245, 212, 0.12) 0%, transparent 70%), radial-gradient(700px 400px at 20% 80%, rgba(123, 44, 191, 0.1) 0%, transparent 60%)',
    },
    typography: {
      uiFont: 'Plus Jakarta Sans',
      quoteFont: 'Lora',
      description: 'Digital Modern Sans × Cosmic Manuscript Serif',
    },
    surfaceFeel: 'Holographic glass borders, bioluminescent telemetry and cyber glow',
    swatches: ['#05070E', '#0F172A', '#00F5D4', '#7B2CBF'],
  },
  'lofi-cafe': {
    id: 'lofi-cafe',
    name: 'Rainy Tokyo Café',
    tagline: 'Cozy Lo-Fi & Neon Dusk',
    concept: 'A warm corner booth in a rainy Shibuya café with steaming coffee and lo-fi beats.',
    description: 'Neon Midnight Slate (#161925), Warm Coffee Vellum (#212536), Matcha Neon Green (#80ED99), Tangerine Glow (#FF9F1C).',
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
      ambientGlow: 'radial-gradient(circle at 80% 20%, rgba(255, 159, 28, 0.15) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(128, 237, 153, 0.12) 0%, transparent 55%)',
    },
    typography: {
      uiFont: 'Plus Jakarta Sans',
      quoteFont: 'Newsreader',
      description: 'Warm Modern Sans × Cozy Literary Serif',
    },
    surfaceFeel: 'Tactile coffee shop cards, rainy mist glow and cozy retro-modern accents',
    swatches: ['#161925', '#212536', '#80ED99', '#FF9F1C'],
  },
};

interface ThemeContextValue {
  vibe: VibeId;
  theme: VibeId;
  vibeConfig: VibeConfig;
  allVibes: VibeConfig[];
  setVibe: (id: VibeId) => void;
  setTheme: (id: VibeId) => void;
  isPopoverOpen: boolean;
  setPopoverOpen: (open: boolean) => void;
  openPopover: () => void;
  closePopover: () => void;
  togglePopover: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vibe, setVibeState] = useState<VibeId>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY) as VibeId;
      if (stored && VIBES[stored]) {
        return stored;
      }
    }
    return DEFAULT_VIBE;
  });

  const [isPopoverOpen, setPopoverOpen] = useState(false);

  const applyVibeToDocument = (vibeId: VibeId) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    // Set data-theme on <html> root element
    root.setAttribute('data-theme', vibeId);

    // Toggle dark class for Tailwind utilities
    const config = VIBES[vibeId];
    if (config?.mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const setVibe = (id: VibeId) => {
    if (!VIBES[id]) return;
    setVibeState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch (e) {
      console.warn('Failed to save vibe to localStorage:', e);
    }
    applyVibeToDocument(id);
  };

  const togglePopover = () => setPopoverOpen((prev) => !prev);
  const openPopover = () => setPopoverOpen(true);
  const closePopover = () => setPopoverOpen(false);

  useEffect(() => {
    applyVibeToDocument(vibe);
  }, [vibe]);

  // Ensure default theme (Nordic Studio) is strictly at the top of options
  const allVibes = Object.values(VIBES).sort((a, b) => {
    if (a.isDefault) return -1;
    if (b.isDefault) return 1;
    return 0;
  });

  const value: ThemeContextValue = {
    vibe,
    theme: vibe,
    vibeConfig: VIBES[vibe] || VIBES[DEFAULT_VIBE],
    allVibes,
    setVibe,
    setTheme: setVibe,
    isPopoverOpen,
    setPopoverOpen,
    openPopover,
    closePopover,
    togglePopover,
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
