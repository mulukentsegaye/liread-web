import { ReaderTheme, ReaderFontFamily } from '../../types/reader';

export interface ThemeConfig {
  id: ReaderTheme;
  name: string;
  bg: string;
  text: string;
  cardBg: string;
  border: string;
  accent: string;
  subtleText: string;
  highlightBg: string;
}

export const READER_THEMES: Record<ReaderTheme, ThemeConfig> = {
  day: {
    id: 'day',
    name: 'Day',
    bg: '#ffffff',
    text: '#1a1a1a',
    cardBg: '#f8f9fa',
    border: '#e5e7eb',
    accent: '#059669',
    subtleText: '#6b7280',
    highlightBg: '#fef08a',
  },
  sepia: {
    id: 'sepia',
    name: 'Sepia',
    bg: '#fbf0d9',
    text: '#2e2319',
    cardBg: '#f3e5c8',
    border: '#e7d6b5',
    accent: '#965a2d',
    subtleText: '#7d6955',
    highlightBg: '#fed7aa',
  },
  night: {
    id: 'night',
    name: 'Night',
    bg: '#1c1d22',
    text: '#d6d6d8',
    cardBg: '#25262c',
    border: '#32343c',
    accent: '#10b981',
    subtleText: '#9ca3af',
    highlightBg: '#854d0e',
  },
  contrast: {
    id: 'contrast',
    name: 'Contrast',
    bg: '#000000',
    text: '#ededed',
    cardBg: '#121212',
    border: '#27272a',
    accent: '#34d399',
    subtleText: '#a1a1aa',
    highlightBg: '#713f12',
  },
};

export function getFontFamilyCss(family: ReaderFontFamily): string {
  switch (family) {
    case 'serif':
      return 'Newsreader, "Cormorant Garamond", Georgia, serif';
    case 'sans':
      return 'Inter, system-ui, -apple-system, sans-serif';
    case 'mono':
      return '"DM Mono", ui-monospace, monospace';
    case 'original':
    default:
      return 'inherit';
  }
}
