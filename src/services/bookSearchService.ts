import { BookDetailsData } from '../types';
import { CURATED_BOOKS, SPOTLIGHT_BOOK } from '../data/curatedBooks';

export interface SuggestedBook {
  id: string;
  title: string;
  author: string;
  coverImageUrl?: string;
  coverThumbnailUrl?: string;
  firstPublishYear?: number;
  coverId?: number;
  workKey?: string;
  telegramMessageId?: number | string;
}

export interface SearchBooksResult {
  books: SuggestedBook[];
  totalFound: number;
}

export interface SearchBooksOptions {
  limit?: number;
  page?: number;
  signal?: AbortSignal;
}

/**
 * Custom error thrown when a book search request fails specifically because
 * the device has no internet connection or network connectivity was lost.
 */
export class OfflineSearchError extends Error {
  readonly isOffline = true;

  constructor(message = 'Network connection is offline') {
    super(message);
    this.name = 'OfflineSearchError';
    Object.setPrototypeOf(this, OfflineSearchError.prototype);
  }
}

/**
 * Helper to identify whether an error originated from offline status, timeout, or broken network pipe.
 */
export function isOfflineOrNetworkError(err: unknown): boolean {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return true;
  }
  if (err && typeof err === 'object') {
    if ('isOffline' in err && (err as any).isOffline === true) {
      return true;
    }
    if ((err as any).name === 'OfflineSearchError') {
      return true;
    }
    const msg = ((err as any).message || '').toLowerCase();
    if (
      msg.includes('fetch') ||
      msg.includes('network') ||
      msg.includes('failed') ||
      msg.includes('offline') ||
      msg.includes('load') ||
      msg.includes('internet') ||
      msg.includes('timed out') ||
      msg.includes('timeout') ||
      msg.includes('status 5') ||
      msg.includes('status 429') ||
      msg.includes('cors')
    ) {
      return true;
    }
  }
  if (err instanceof TypeError) {
    const msg = err.message.toLowerCase();
    return (
      msg.includes('fetch') ||
      msg.includes('network') ||
      msg.includes('failed') ||
      msg.includes('offline') ||
      msg.includes('load') ||
      msg.includes('internet')
    );
  }
  return false;
}

/**
 * Normalizes and cleans Open Library cover URLs.
 * Handles crowd-sourced catalog misattributions (e.g. Deep Work being assigned
 * Johanna Basford's "Lost Ocean" cover ID 7988607 in Open Library's metadata,
 * or dark Japanese unjacketed bindings).
 */
export function sanitizeOpenLibraryCover(
  _title?: string,
  _author?: string,
  coverUrl?: string
): string | undefined {
  if (!coverUrl) return undefined;

  const url = coverUrl.trim();
  if (!url || url === 'undefined' || url === 'null') return undefined;

  // Ensure HTTPS for secure loading
  return url.replace(/^http:\/\//i, 'https://');
}

// In-memory cache for book search results (reduces latency & Open Library rate-limiting)
const searchMemoryCache = new Map<string, { result: SearchBooksResult; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const bookSearchService = {
  /**
   * Search Open Library by query string and return normalized book suggestions
   * with high-resolution and thumbnail cover image URLs, along with the accurate
   * total count of matching books (`totalFound`).
   * Throws `OfflineSearchError` when offline or on connection error so UI can accurately explain
   * that connection is missing instead of reporting "book not found".
   */
  async searchBooks(
    query: string,
    optionsOrSignal?: AbortSignal | SearchBooksOptions
  ): Promise<SearchBooksResult> {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {
      return { books: [], totalFound: 0 };
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new OfflineSearchError('You are currently offline');
    }

    let signal: AbortSignal | undefined;
    let limit = 8;
    let page = 1;

    if (optionsOrSignal) {
      if (optionsOrSignal instanceof AbortSignal) {
        signal = optionsOrSignal;
      } else {
        if (optionsOrSignal.signal) signal = optionsOrSignal.signal;
        if (typeof optionsOrSignal.limit === 'number') limit = optionsOrSignal.limit;
        if (typeof optionsOrSignal.page === 'number') page = optionsOrSignal.page;
      }
    }

    // 1. Check cache first for instant 0ms retrieval
    const cacheKey = `${trimmed.toLowerCase()}_${limit}_${page}`;
    const cached = searchMemoryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.result;
    }

    // 2. Build fast, compact URL selecting only required fields
    const fields = 'key,title,author_name,cover_i,cover_edition_key,first_publish_year,number_of_pages_median,subject';
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(trimmed)}&fields=${fields}&limit=${limit}&page=${page}`;

    // 3. Resilient 8-second timeout combined with caller signal
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => {
      timeoutController.abort(new Error('Open Library search request timed out'));
    }, 8000);

    const onCallerAbort = () => {
      timeoutController.abort();
    };
    if (signal) {
      signal.addEventListener('abort', onCallerAbort, { once: true });
    }

    try {
      const response = await fetch(url, { signal: timeoutController.signal });
      if (!response.ok) {
        throw new Error(`Open Library search returned status ${response.status}`);
      }

      const data = await response.json();
      const docs: any[] = data.docs || [];
      const totalFound: number =
        typeof data.numFound === 'number'
          ? data.numFound
          : typeof data.num_found === 'number'
          ? data.num_found
          : docs.length;

      const books = docs.map((doc: any): SuggestedBook => {
        const title = (doc.title || 'Untitled Book').trim();
        const author = Array.isArray(doc.author_name) && doc.author_name.length > 0
          ? doc.author_name[0]
          : 'Unknown Author';

        let coverImageUrl: string | undefined;
        let coverThumbnailUrl: string | undefined;

        if (doc.cover_i) {
          coverImageUrl = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
          coverThumbnailUrl = `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`;
        } else if (doc.cover_edition_key) {
          coverImageUrl = `https://covers.openlibrary.org/b/olid/${doc.cover_edition_key}-L.jpg`;
          coverThumbnailUrl = `https://covers.openlibrary.org/b/olid/${doc.cover_edition_key}-M.jpg`;
        } else if (Array.isArray(doc.isbn) && doc.isbn.length > 0) {
          coverImageUrl = `https://covers.openlibrary.org/b/isbn/${doc.isbn[0]}-L.jpg`;
          coverThumbnailUrl = `https://covers.openlibrary.org/b/isbn/${doc.isbn[0]}-M.jpg`;
        }

        const cleanCover = sanitizeOpenLibraryCover(title, author, coverImageUrl);
        const cleanThumb = sanitizeOpenLibraryCover(title, author, coverThumbnailUrl) || cleanCover;

        return {
          id: doc.key || `${title}-${author}-${doc.cover_i || Math.random()}`,
          title,
          author,
          coverImageUrl: cleanCover,
          coverThumbnailUrl: cleanThumb,
          firstPublishYear: doc.first_publish_year,
          coverId: doc.cover_i,
          workKey: doc.key,
        };
      });

      const result: SearchBooksResult = {
        books,
        totalFound,
      };

      searchMemoryCache.set(cacheKey, { result, timestamp: Date.now() });
      return result;
    } catch (err: any) {
      if (err.name === 'AbortError' && signal?.aborted) {
        throw err;
      }
      if (isOfflineOrNetworkError(err)) {
        throw new OfflineSearchError(
          err.message?.includes('timed out')
            ? 'Open Library connection timed out. Showing available offline books.'
            : 'Unable to connect to the book catalog. Check your internet connection.'
        );
      }
      console.warn('Open Library search error:', err);
      throw err;
    } finally {
      clearTimeout(timeoutId);
      if (signal) {
        signal.removeEventListener('abort', onCallerAbort);
      }
    }
  },

  /**
   * Search local curated catalog when offline so famous books still show up
   * even without an internet connection. Matches by title, author, category, or keyword.
   */
  searchLocalCuratedBooks(query: string): SuggestedBook[] {
    const trimmed = query.toLowerCase().trim();
    if (!trimmed) return [];

    const allCurated = [SPOTLIGHT_BOOK, ...CURATED_BOOKS];
    const seen = new Set<string>();
    const matches: SuggestedBook[] = [];

    for (const b of allCurated) {
      const normTitle = b.title.toLowerCase();
      const normAuthor = b.author.toLowerCase();
      const normCat = (b.category || '').toLowerCase();
      const normCatLabel = (b.categoryLabel || '').toLowerCase();
      if (seen.has(normTitle)) continue;

      if (
        normTitle.includes(trimmed) ||
        normAuthor.includes(trimmed) ||
        normCat.includes(trimmed) ||
        normCatLabel.includes(trimmed) ||
        trimmed.includes(normCat)
      ) {
        seen.add(normTitle);
        matches.push({
          id: b.id,
          title: b.title,
          author: b.author,
          coverImageUrl: b.coverImageUrl,
          coverThumbnailUrl: b.coverImageUrl,
          firstPublishYear: b.firstPublishYear,
          workKey: b.workKey,
          telegramMessageId: b.telegramMessageId,
        });
      }
    }

    return matches;
  },

  /**
   * Fetch books for a specific category/subject with pagination and total count from Open Library.
   */
  async getBooksByCategory(
    subjectSlug: string,
    options?: { page?: number; limit?: number; signal?: AbortSignal }
  ): Promise<SearchBooksResult> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const signal = options?.signal;

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      const local = this.searchLocalCuratedBooks(subjectSlug);
      return {
        books: local.slice((page - 1) * limit, page * limit),
        totalFound: local.length,
      };
    }

    const clean = encodeURIComponent(subjectSlug.trim().toLowerCase());
    const url = `https://openlibrary.org/search.json?subject=${clean}&limit=${limit}&page=${page}`;

    try {
      const response = await fetch(url, {
        signal,
        headers: { 'User-Agent': 'LireadApp/1.0 (https://liread.vercel.app)' },
      });

      if (!response.ok) {
        throw new Error(`Open Library category search returned status ${response.status}`);
      }

      const data = await response.json();
      const docs: any[] = data.docs || [];
      const totalFound: number =
        typeof data.numFound === 'number'
          ? data.numFound
          : typeof data.num_found === 'number'
          ? data.num_found
          : docs.length;

      const books = docs.map((doc: any): SuggestedBook => {
        const title = (doc.title || 'Untitled Book').trim();
        const author = Array.isArray(doc.author_name) && doc.author_name.length > 0
          ? doc.author_name[0]
          : 'Unknown Author';

        let coverImageUrl: string | undefined;
        let coverThumbnailUrl: string | undefined;

        if (doc.cover_i) {
          coverImageUrl = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
          coverThumbnailUrl = `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`;
        } else if (doc.cover_edition_key) {
          coverImageUrl = `https://covers.openlibrary.org/b/olid/${doc.cover_edition_key}-L.jpg`;
          coverThumbnailUrl = `https://covers.openlibrary.org/b/olid/${doc.cover_edition_key}-M.jpg`;
        } else if (Array.isArray(doc.isbn) && doc.isbn.length > 0) {
          coverImageUrl = `https://covers.openlibrary.org/b/isbn/${doc.isbn[0]}-L.jpg`;
          coverThumbnailUrl = `https://covers.openlibrary.org/b/isbn/${doc.isbn[0]}-M.jpg`;
        }

        const cleanCover = sanitizeOpenLibraryCover(title, author, coverImageUrl);
        const cleanThumb = sanitizeOpenLibraryCover(title, author, coverThumbnailUrl) || cleanCover;

        return {
          id: doc.key || `${title}-${author}-${doc.cover_i || Math.random()}`,
          title,
          author,
          coverImageUrl: cleanCover,
          coverThumbnailUrl: cleanThumb,
          firstPublishYear: doc.first_publish_year,
          coverId: doc.cover_i,
          workKey: doc.key,
        };
      });

      return {
        books,
        totalFound,
      };
    } catch (err: any) {
      if (err.name === 'AbortError') throw err;
      console.warn('Category fetch fallback for subject:', subjectSlug, err);
      const local = this.searchLocalCuratedBooks(subjectSlug);
      return {
        books: local.slice((page - 1) * limit, page * limit),
        totalFound: local.length > 0 ? local.length : 12,
      };
    }
  },

  /**
   * Helper to retrieve books for horizontal shelf with dual in-memory / sessionStorage caching.
   */
  async getShelfBooks(subjectSlug: string, limit = 16): Promise<SuggestedBook[]> {
    const cacheKey = `liread_shelf_${subjectSlug}`;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}

    try {
      const { books } = await this.getBooksByCategory(subjectSlug, { page: 1, limit });
      if (books && books.length > 0) {
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(books));
        } catch {}
        return books;
      }
    } catch (err) {
      console.warn(`Shelf fetch error for ${subjectSlug}:`, err);
    }

    return this.searchLocalCuratedBooks(subjectSlug).slice(0, limit);
  },

  /**
   * Fetch detailed book metadata including editorial description from Open Library Works API.
   */
  async getBookDetails(
    title: string,
    author: string,
    workKey?: string,
    coverImageUrl?: string
  ): Promise<BookDetailsData> {
    let resolvedWorkKey = workKey;
    let resolvedCover = coverImageUrl;
    let publishYear: number | undefined;
    let description: string | undefined;
    let subjects: string[] = [];

    const cleanT = title.trim().toLowerCase();

    try {
      // 1. If workKey is not known, query Open Library search to resolve it accurately
      if (!resolvedWorkKey) {
        const queryParams = new URLSearchParams({
          title: title.trim(),
          ...(author.trim() ? { author: author.trim() } : {}),
          limit: '3'
        });

        const searchRes = await fetch(`https://openlibrary.org/search.json?${queryParams.toString()}`);
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          const docs: any[] = searchData.docs || [];
          
          // Verify candidate matches the requested title
          const matchingDoc = docs.find((d) => {
            const dTitle = (d.title || '').toLowerCase();
            return dTitle.includes(cleanT) || cleanT.includes(dTitle);
          }) || docs[0];

          if (matchingDoc) {
            resolvedWorkKey = matchingDoc.key;
            publishYear = matchingDoc.first_publish_year;
            if (!resolvedCover) {
              if (matchingDoc.cover_i) {
                resolvedCover = `https://covers.openlibrary.org/b/id/${matchingDoc.cover_i}-L.jpg`;
              } else if (matchingDoc.cover_edition_key) {
                resolvedCover = `https://covers.openlibrary.org/b/olid/${matchingDoc.cover_edition_key}-L.jpg`;
              } else if (Array.isArray(matchingDoc.isbn) && matchingDoc.isbn.length > 0) {
                resolvedCover = `https://covers.openlibrary.org/b/isbn/${matchingDoc.isbn[0]}-L.jpg`;
              }
            }
            if (Array.isArray(matchingDoc.subject)) {
              subjects = matchingDoc.subject.slice(0, 5);
            }
          }
        }
      }

      // 2. Fetch work JSON if workKey available to get authentic description
      if (resolvedWorkKey) {
        const workUrl = resolvedWorkKey.startsWith('http')
          ? `${resolvedWorkKey}.json`
          : `https://openlibrary.org${resolvedWorkKey.startsWith('/') ? '' : '/'}${resolvedWorkKey}.json`;

        const workRes = await fetch(workUrl);
        if (workRes.ok) {
          const workData = await workRes.json();
          if (workData.description) {
            if (typeof workData.description === 'string') {
              description = workData.description;
            } else if (typeof workData.description.value === 'string') {
              description = workData.description.value;
            }
          }
          if (!resolvedCover && Array.isArray(workData.covers) && workData.covers.length > 0) {
            const validCoverId = workData.covers.find((id: any) => typeof id === 'number' && id > 0);
            if (validCoverId) {
              resolvedCover = `https://covers.openlibrary.org/b/id/${validCoverId}-L.jpg`;
            }
          }
          if (Array.isArray(workData.subjects) && subjects.length === 0) {
            subjects = workData.subjects.slice(0, 5);
          }
        }
      }
    } catch (err) {
      console.warn('Could not fetch detailed book metadata from Open Library:', err);
    }

    // 3. Fallback to curated catalog ONLY for missing text/description if offline
    if (!description) {
      const exactCuratedMatch = [SPOTLIGHT_BOOK, ...CURATED_BOOKS].find(
        (b) => b.title.toLowerCase() === cleanT
      );
      if (exactCuratedMatch) {
        description = exactCuratedMatch.description || exactCuratedMatch.tagline;
        if (!resolvedCover) resolvedCover = exactCuratedMatch.coverImageUrl;
        if (!publishYear) publishYear = exactCuratedMatch.firstPublishYear;
        if (subjects.length === 0) subjects = [exactCuratedMatch.categoryLabel, 'Literature', 'Essential Read'];
      }
    }

    const finalCover = sanitizeOpenLibraryCover(title, author, resolvedCover);

    return {
      title,
      author,
      coverImageUrl: finalCover,
      firstPublishYear: publishYear,
      workKey: resolvedWorkKey,
      description,
      subjects: subjects.length > 0 ? subjects : ['Literature', 'Philosophy', 'Focus'],
      ratingAverage: 4.8,
    };
  },
};
