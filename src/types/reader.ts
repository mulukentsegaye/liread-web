export type BookFormat = 'pdf' | 'epub' | 'txt' | 'mobi' | 'fb2';

export type ReaderTheme = 'day' | 'sepia' | 'night' | 'contrast';

export type ReaderFontFamily = 'serif' | 'sans' | 'mono' | 'original';

export type ReadingMode = 'paginated' | 'continuous';

export interface Bookmark {
  id: string;
  location: string | number; // page number or EPUB CFI
  label: string;
  createdAt: string;
  previewText?: string;
}

export interface Highlight {
  id: string;
  text: string;
  color: 'amber' | 'emerald' | 'sky' | 'rose';
  location: string | number;
  note?: string;
  createdAt: string;
}

export interface TocItem {
  id: string;
  label: string;
  href: string;
  subitems?: TocItem[];
}

export interface StoredBook {
  id: string;
  title: string;
  author: string;
  format: BookFormat;
  fileBlob: Blob | ArrayBuffer;
  fileSize: number;
  coverUrl?: string;
  totalPages?: number;
  currentPage: number;
  currentLocation?: string; // CFI string for EPUB or chapter href
  progressPercent: number;
  lastReadTimestamp: number;
  createdAt: number;
  isFavorite: boolean;
  readingStatus: 'reading_now' | 'have_read' | 'to_read';
  bookmarks: Bookmark[];
  highlights: Highlight[];
}

export interface ReaderSettings {
  theme: ReaderTheme;
  fontFamily: ReaderFontFamily;
  fontSize: number; // 14 to 32
  lineHeight: number; // 1.4 to 2.2
  margin: 'compact' | 'comfortable' | 'spacious';
  readingMode: ReadingMode;
}
