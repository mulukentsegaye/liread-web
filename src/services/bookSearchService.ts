export interface SuggestedBook {
  id: string;
  title: string;
  author: string;
  coverImageUrl?: string;
  coverThumbnailUrl?: string;
  firstPublishYear?: number;
  coverId?: number;
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
};
