export type VibeId = 
  | 'dark-academia'
  | 'deep-orbit'
  | 'lofi-cafe'
  | 'botanical-zen'
  | 'nordic-studio' 
  | 'midnight-library' 
  | 'sepia-manuscript' 
  | 'kyoto-minimalist' 
  | 'cyber-codex';

// Backward compatibility alias
export type ThemeId = VibeId;

export interface VibeColors {
  bg: string;
  card: string;
  cardSubtle: string;
  cardHover: string;
  border: string;
  borderSubtle: string;
  ink: string;
  inkSecondary: string;
  inkMuted: string;
  accent: string;
  accentHover: string;
  accentSubtle: string;
  secondary: string;
  secondaryHover: string;
  secondarySubtle: string;
  badgeBg: string;
  badgeText: string;
  ambientGlow: string;
}

export interface VibeConfig {
  id: VibeId;
  name: string;
  tagline: string;
  concept: string;
  description: string;
  mode: 'light' | 'dark' | 'warm';
  isDefault?: boolean;
  colors: VibeColors;
  typography: {
    uiFont: string;
    quoteFont: string;
    description: string;
  };
  surfaceFeel: string;
  swatches: string[];
}

export type AmbientSoundId = 'birds' | 'rain' | 'fireplace' | 'deep-space';

export interface AmbientTrackConfig {
  id: AmbientSoundId;
  name: string;
  subtitle: string;
  description: string;
  themeVibe: string;
  themeId: string;
  streamUrl: string;
  fallbackUrl?: string;
  iconName: string;
}

export const AMBIENT_SOUNDS: Record<AmbientSoundId, AmbientTrackConfig> = {
  'birds': {
    id: 'birds',
    name: 'Daylight Birds',
    subtitle: 'Morning Meadow & Gentle Wind',
    description: 'Gentle forest morning breeze and birdsong',
    themeVibe: 'Nordic Studio',
    themeId: 'nordic-studio',
    streamUrl: 'https://assets.mixkit.co/active_storage/sfx/1253/1253-preview.mp3',
    fallbackUrl: 'https://cdn.freesound.org/previews/316/316921_5121236-lq.mp3',
    iconName: 'Bird',
  },
  'rain': {
    id: 'rain',
    name: 'Rain on Glass',
    subtitle: 'Window Patter & Gray Skies',
    description: 'Soothing steady rain against library window panes',
    themeVibe: 'Midnight Library',
    themeId: 'midnight-library',
    streamUrl: 'https://assets.mixkit.co/active_storage/sfx/1251/1251-preview.mp3',
    fallbackUrl: 'https://cdn.freesound.org/previews/346/346170_5121236-lq.mp3',
    iconName: 'CloudRain',
  },
  'fireplace': {
    id: 'fireplace',
    name: 'Hearth Fireplace',
    subtitle: 'Crackling Cedar & Warm Embers',
    description: 'Crackling oak embers in a mahogany study',
    themeVibe: 'Dark Academia',
    themeId: 'dark-academia',
    streamUrl: 'https://assets.mixkit.co/active_storage/sfx/1252/1252-preview.mp3',
    fallbackUrl: 'https://cdn.freesound.org/previews/399/399934_5121236-lq.mp3',
    iconName: 'Flame',
  },
  'deep-space': {
    id: 'deep-space',
    name: 'Cosmic Drone',
    subtitle: 'Nebula Resonance & Deep Focus',
    description: 'Hypnotic resonant space hum for deep focus',
    themeVibe: 'Cyber Codex',
    themeId: 'cyber-codex',
    streamUrl: 'https://assets.mixkit.co/active_storage/sfx/2432/2432-preview.mp3',
    fallbackUrl: 'https://cdn.freesound.org/previews/384/384849_5121236-lq.mp3',
    iconName: 'Orbit',
  },
};

export const THEME_AMBIENT_MAP: Record<string, AmbientSoundId> = {
  'nordic-studio': 'birds',
  'midnight-library': 'rain',
  'dark-academia': 'fireplace',
  'sepia-manuscript': 'fireplace',
  'kyoto-minimalist': 'birds',
  'cyber-codex': 'deep-space',
  // Backward compatibility aliases
  'botanical-zen': 'birds',
  'deep-orbit': 'deep-space',
  'lofi-cafe': 'rain',
};
