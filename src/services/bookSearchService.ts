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
 * Helper to identify whether an error originated from offline status or broken network pipe.
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

export const bookSearchService = {
  /**
   * Search Open Library by query string and return normalized book suggestions
   * with high-resolution and thumbnail cover image URLs.
   * Throws `OfflineSearchError` when offline so UI can accurately explain
   * that connection is missing instead of reporting "book not found".
   */
  async searchBooks(query: string, signal?: AbortSignal): Promise<SuggestedBook[]> {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {
      return [];
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new OfflineSearchError('You are currently offline');
    }

    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(trimmed)}&limit=8`;

    try {
      const response = await fetch(url, { signal });
      if (!response.ok) {
        throw new Error(`Open Library search returned status ${response.status}`);
      }

      const data = await response.json();
      const docs: any[] = data.docs || [];

      return docs.map((doc: any): SuggestedBook => {
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

        return {
          id: doc.key || `${title}-${author}-${doc.cover_i || Math.random()}`,
          title,
          author,
          coverImageUrl,
          coverThumbnailUrl,
          firstPublishYear: doc.first_publish_year,
          coverId: doc.cover_i,
          workKey: doc.key,
        };
      });
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw err;
      }
      if (isOfflineOrNetworkError(err)) {
        throw new OfflineSearchError('Open Library search failed because you are offline');
      }
      console.warn('Open Library search error:', err);
      return [];
    }
  },

  /**
   * Search local curated catalog when offline so famous books still show up
   * even without an internet connection.
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
      if (seen.has(normTitle)) continue;

      if (
        normTitle.includes(trimmed) ||
        normAuthor.includes(trimmed) ||
        trimmed.includes(normTitle)
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
        });
      }
    }

    return matches;
  },

  /**
   * Fetch detailed book metadata including synopsis description from Open Library Works API.
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

    // 1. Check local verified curated collection first for instant 100% precision
    const cleanT = title.trim().toLowerCase();
    const curatedMatch = [SPOTLIGHT_BOOK, ...CURATED_BOOKS].find(
      (b) => b.title.toLowerCase() === cleanT || 
             (cleanT.length > 5 && b.title.toLowerCase().includes(cleanT)) ||
             (cleanT.length > 5 && cleanT.includes(b.title.toLowerCase()))
    );

    if (curatedMatch) {
      return {
        title: curatedMatch.title,
        author: curatedMatch.author,
        coverImageUrl: curatedMatch.coverImageUrl || resolvedCover,
        firstPublishYear: curatedMatch.firstPublishYear,
        workKey: curatedMatch.workKey || resolvedWorkKey,
        description: curatedMatch.description || curatedMatch.tagline,
        subjects: [curatedMatch.categoryLabel, 'Literature', 'Essential Read'],
        ratingAverage: curatedMatch.ratingAverage,
      };
    }

    try {
      // 2. If workKey is not known, query search to resolve it accurately
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
          
          // Verify candidate actually matches the requested title
          const matchingDoc = docs.find((d) => {
            const dTitle = (d.title || '').toLowerCase();
            return dTitle.includes(cleanT) || cleanT.includes(dTitle);
          }) || docs[0];

          if (matchingDoc) {
            resolvedWorkKey = matchingDoc.key;
            publishYear = matchingDoc.first_publish_year;
            if (!resolvedCover && matchingDoc.cover_i) {
              resolvedCover = `https://covers.openlibrary.org/b/id/${matchingDoc.cover_i}-L.jpg`;
            }
            if (Array.isArray(matchingDoc.subject)) {
              subjects = matchingDoc.subject.slice(0, 5);
            }
          }
        }
      }

      // 3. Fetch work JSON if workKey available
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
          if (Array.isArray(workData.subjects) && subjects.length === 0) {
            subjects = workData.subjects.slice(0, 5);
          }
        }
      }
    } catch (err) {
      console.warn('Could not fetch detailed book metadata from Open Library:', err);
    }

    return {
      title,
      author,
      coverImageUrl: resolvedCover,
      firstPublishYear: publishYear,
      workKey: resolvedWorkKey,
      description,
      subjects: subjects.length > 0 ? subjects : ['Literature', 'Philosophy', 'Focus'],
      ratingAverage: 4.8,
    };
  },
};
