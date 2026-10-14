export type VibeId = 
  | 'dark-academia' 
  | 'deep-orbit' 
  | 'lofi-cafe' 
  | 'botanical-zen'
  | 'nordic-studio';

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
