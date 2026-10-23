import { create } from 'zustand';
import { StoredBook, ReaderSettings, ReaderTheme, ReaderFontFamily, ReadingMode, TocItem, BookFormat } from '../types/reader';
import { readerStorageService } from '../services/readerStorageService';
import { extractBookCover, cleanFilenameMeta } from '../services/bookCoverExtractor';

interface ReaderStore {
  books: StoredBook[];
  isLoadingBooks: boolean;
  activeBook: StoredBook | null;
  isReaderOpen: boolean;
  currentPage: number;
  totalPages: number;
  progressPercent: number;
  currentLocation: string;
  toc: TocItem[];
  settings: ReaderSettings;
  isControlsVisible: boolean;
  isTocOpen: boolean;
  isSettingsOpen: boolean;
  isBookmarksOpen: boolean;

  // Actions
  loadBooks: () => Promise<void>;
  openBook: (book: StoredBook) => void;
  closeBook: () => void;
  importBookFile: (file: File) => Promise<StoredBook>;
  updateProgress: (page: number, totalPages?: number, location?: string) => Promise<void>;
  setToc: (toc: TocItem[]) => void;
  toggleControls: () => void;
  setControlsVisible: (visible: boolean) => void;
  setIsTocOpen: (open: boolean) => void;
  setIsSettingsOpen: (open: boolean) => void;
  setIsBookmarksOpen: (open: boolean) => void;
  setTheme: (theme: ReaderTheme) => void;
  setFontFamily: (family: ReaderFontFamily) => void;
  setFontSize: (size: number) => void;
  setReadingMode: (mode: ReadingMode) => void;
  toggleFavorite: (bookId: string) => Promise<void>;
  deleteBook: (bookId: string) => Promise<void>;
  addBookmark: (label: string) => Promise<void>;
  removeBookmark: (bookmarkId: string) => Promise<void>;
  addHighlight: (text: string, color: 'amber' | 'emerald' | 'sky' | 'rose') => Promise<void>;
  removeHighlight: (highlightId: string) => Promise<void>;
}

const DEFAULT_SETTINGS: ReaderSettings = {
  theme: (typeof window !== 'undefined' && localStorage.getItem('readers_hub_reader_theme') as ReaderTheme) || 'sepia',
  fontFamily: (typeof window !== 'undefined' && localStorage.getItem('readers_hub_reader_font') as ReaderFontFamily) || 'serif',
  fontSize: (typeof window !== 'undefined' && Number(localStorage.getItem('readers_hub_reader_size'))) || 18,
  lineHeight: 1.7,
  margin: 'comfortable',
  readingMode: 'paginated',
};

function detectFormat(fileName: string): BookFormat {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'pdf';
  if (ext === 'epub') return 'epub';
  if (ext === 'mobi') return 'mobi';
  if (ext === 'fb2') return 'fb2';
  return 'txt';
}

function cleanTitleFromFilename(fileName: string): string {
  // Remove extension
  const withoutExt = fileName.replace(/\.[^/.]+$/, '');
  // Clean up common file delimiters
  return withoutExt
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export const useReaderStore = create<ReaderStore>((set, get) => ({
  books: [],
  isLoadingBooks: false,
  activeBook: null,
  isReaderOpen: false,
  currentPage: 1,
  totalPages: 1,
  progressPercent: 0,
  currentLocation: '',
  toc: [],
  settings: DEFAULT_SETTINGS,
  isControlsVisible: true,
  isTocOpen: false,
  isSettingsOpen: false,
  isBookmarksOpen: false,

  loadBooks: async () => {
    set({ isLoadingBooks: true });
    try {
      const books = await readerStorageService.seedSampleBooksIfEmpty();
      set({ books, isLoadingBooks: false });

      // Automatically extract & generate covers in the background for any books missing covers
      const missingCovers = books.filter((b) => !b.coverUrl && b.fileBlob);
      if (missingCovers.length > 0) {
        (async () => {
          let updatedAny = false;
          for (const book of missingCovers) {
            try {
              const res = await extractBookCover({
                fileBlob: book.fileBlob,
                format: book.format,
                title: book.title,
                author: book.author,
              });

              if (res?.coverUrl) {
                const updates: Partial<StoredBook> = { coverUrl: res.coverUrl };
                if (book.author === 'Unknown Author' && res.author) {
                  updates.author = res.author;
                }
                if (res.title && (book.title.toLowerCase().includes('oceanofpdf') || book.title.length < 3)) {
                  updates.title = res.title;
                }
                if (res.totalPages && !book.totalPages) {
                  updates.totalPages = res.totalPages;
                }
                await readerStorageService.updateBook(book.id, updates);
                updatedAny = true;
              }
            } catch (err) {
              console.warn('Cover extraction failed for existing book:', book.title, err);
            }
          }

          if (updatedAny) {
            const reloaded = await readerStorageService.getAllBooks();
            set({ books: reloaded });
          }
        })();
      }
    } catch (err) {
      console.warn('Failed to load books from IndexedDB:', err);
      set({ isLoadingBooks: false });
    }
  },

  openBook: (book: StoredBook) => {
    set({
      activeBook: book,
      isReaderOpen: true,
      currentPage: book.currentPage || 1,
      totalPages: book.totalPages || 1,
      progressPercent: book.progressPercent || 0,
      currentLocation: book.currentLocation || '',
      isControlsVisible: true,
      isTocOpen: false,
      isSettingsOpen: false,
      isBookmarksOpen: false,
    });
    // Record last read timestamp
    readerStorageService.updateBookProgress(book.id, {
      currentPage: book.currentPage || 1,
      totalPages: book.totalPages,
      currentLocation: book.currentLocation,
      progressPercent: book.progressPercent || 0,
    });
  },

  closeBook: () => {
    const { activeBook, currentPage, totalPages, currentLocation, progressPercent } = get();
    if (activeBook) {
      readerStorageService.updateBookProgress(activeBook.id, {
        currentPage,
        totalPages,
        currentLocation,
        progressPercent,
      });
    }
    set({
      activeBook: null,
      isReaderOpen: false,
      isControlsVisible: true,
      isTocOpen: false,
      isSettingsOpen: false,
      isBookmarksOpen: false,
    });
    get().loadBooks();
  },

  importBookFile: async (file: File): Promise<StoredBook> => {
    const format = detectFormat(file.name);
    const cleaned = cleanFilenameMeta(file.name);
    const id = `book-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    let title = cleaned.title || file.name;
    let author = cleaned.author || 'Unknown Author';
    let coverUrl: string | undefined;
    let totalPages: number | undefined;

    // Immediately extract the cover page from the file
    try {
      const extracted = await extractBookCover({
        fileBlob: file,
        format,
        title,
        author,
      });

      if (extracted?.coverUrl) {
        coverUrl = extracted.coverUrl;
      }
      if (extracted?.author && author === 'Unknown Author') {
        author = extracted.author;
      }
      if (extracted?.title && (title.toLowerCase().includes('oceanofpdf') || title === file.name)) {
        title = extracted.title;
      }
      if (extracted?.totalPages) {
        totalPages = extracted.totalPages;
      }
    } catch (err) {
      console.warn('Cover extraction failed during import:', err);
    }

    const newBook: StoredBook = {
      id,
      title,
      author,
      format,
      fileBlob: file,
      fileSize: file.size,
      coverUrl,
      totalPages,
      currentPage: 1,
      progressPercent: 0,
      lastReadTimestamp: Date.now(),
      createdAt: Date.now(),
      isFavorite: false,
      readingStatus: 'reading_now',
      bookmarks: [],
      highlights: [],
    };

    await readerStorageService.saveBook(newBook);
    await get().loadBooks();
    return newBook;
  },

  updateProgress: async (page: number, totalPages?: number, location?: string) => {
    const { activeBook } = get();
    if (!activeBook) return;

    const calcTotal = totalPages || activeBook.totalPages || 1;
    const progress = Math.min(100, Math.max(0, (page / calcTotal) * 100));

    set({
      currentPage: page,
      totalPages: calcTotal,
      progressPercent: progress,
      currentLocation: location || '',
    });

    await readerStorageService.updateBookProgress(activeBook.id, {
      currentPage: page,
      totalPages: calcTotal,
      currentLocation: location,
      progressPercent: progress,
    });
  },

  setToc: (toc: TocItem[]) => set({ toc }),

  toggleControls: () => set((state) => ({ isControlsVisible: !state.isControlsVisible })),

  setControlsVisible: (visible: boolean) => set({ isControlsVisible: visible }),

  setIsTocOpen: (open: boolean) => set({ isTocOpen: open }),

  setIsSettingsOpen: (open: boolean) => set({ isSettingsOpen: open }),

  setIsBookmarksOpen: (open: boolean) => set({ isBookmarksOpen: open }),

  setTheme: (theme: ReaderTheme) => {
    set((state) => ({ settings: { ...state.settings, theme } }));
    localStorage.setItem('readers_hub_reader_theme', theme);
  },

  setFontFamily: (fontFamily: ReaderFontFamily) => {
    set((state) => ({ settings: { ...state.settings, fontFamily } }));
    localStorage.setItem('readers_hub_reader_font', fontFamily);
  },

  setFontSize: (fontSize: number) => {
    set((state) => ({ settings: { ...state.settings, fontSize } }));
    localStorage.setItem('readers_hub_reader_size', String(fontSize));
  },

  setReadingMode: (readingMode: ReadingMode) => {
    set((state) => ({ settings: { ...state.settings, readingMode } }));
  },

  toggleFavorite: async (bookId: string) => {
    await readerStorageService.toggleFavorite(bookId);
    await get().loadBooks();
  },

  deleteBook: async (bookId: string) => {
    await readerStorageService.deleteBook(bookId);
    await get().loadBooks();
  },

  addBookmark: async (label: string) => {
    const { activeBook, currentPage, currentLocation } = get();
    if (!activeBook) return;

    const bookmark = {
      id: `bm-${Date.now()}`,
      location: currentLocation || currentPage,
      label: label || `Page ${currentPage}`,
      createdAt: new Date().toISOString(),
    };

    await readerStorageService.addBookmark(activeBook.id, bookmark);
    const updated = await readerStorageService.getBook(activeBook.id);
    if (updated) set({ activeBook: updated });
  },

  removeBookmark: async (bookmarkId: string) => {
    const { activeBook } = get();
    if (!activeBook) return;
    await readerStorageService.removeBookmark(activeBook.id, bookmarkId);
    const updated = await readerStorageService.getBook(activeBook.id);
    if (updated) set({ activeBook: updated });
  },

  addHighlight: async (text: string, color: 'amber' | 'emerald' | 'sky' | 'rose') => {
    const { activeBook, currentPage, currentLocation } = get();
    if (!activeBook) return;

    const highlight = {
      id: `hl-${Date.now()}`,
      text,
      color,
      location: currentLocation || currentPage,
      createdAt: new Date().toISOString(),
    };

    await readerStorageService.addHighlight(activeBook.id, highlight);
    const updated = await readerStorageService.getBook(activeBook.id);
    if (updated) set({ activeBook: updated });
  },

  removeHighlight: async (highlightId: string) => {
    const { activeBook } = get();
    if (!activeBook) return;
    await readerStorageService.removeHighlight(activeBook.id, highlightId);
    const updated = await readerStorageService.getBook(activeBook.id);
    if (updated) set({ activeBook: updated });
  },
}));
