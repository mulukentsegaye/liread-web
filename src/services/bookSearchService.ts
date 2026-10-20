import { BookDetailsData } from '../types';

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

export const bookSearchService = {
  /**
   * Search Open Library by query string and return normalized book suggestions
   * with high-resolution and thumbnail cover image URLs.
   */
  async searchBooks(query: string, signal?: AbortSignal): Promise<SuggestedBook[]> {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {
      return [];
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
          // Open Library Cover API by Cover ID:
          // -L is large / high-resolution
          // -M is medium (ideal for thumbnails / cards)
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
        // Request cancelled by user typing faster
        return [];
      }
      console.warn('Open Library search error:', err);
      return [];
    }
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

    try {
      // If workKey is not known, query search to resolve it
      if (!resolvedWorkKey) {
        const searchRes = await fetch(
          `https://openlibrary.org/search.json?q=${encodeURIComponent(`${title} ${author}`)}&limit=1`
        );
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          const doc = searchData.docs?.[0];
          if (doc) {
            resolvedWorkKey = doc.key;
            publishYear = doc.first_publish_year;
            if (!resolvedCover && doc.cover_i) {
              resolvedCover = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
            }
            if (Array.isArray(doc.subject)) {
              subjects = doc.subject.slice(0, 5);
            }
          }
        }
      }

      // Fetch work JSON if workKey available
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
