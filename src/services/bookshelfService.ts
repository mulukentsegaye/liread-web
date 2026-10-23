import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface BookshelfItem {
  id: string;
  userId: string;
  title: string;
  author: string;
  coverImageUrl?: string;
  status: 'currently_reading' | 'finished' | 'want_to_read';
  progressPercentage: number;
  rating?: number;
  createdAt: string;
}

function getLocalKey(userId: string): string {
  return `liread_bookshelf_${userId}`;
}

export const bookshelfService = {
  /**
   * Helper to retrieve locally cached bookshelf items for offline / instant UI.
   */
  getLocalBookshelf(userId: string): BookshelfItem[] {
    try {
      const raw = localStorage.getItem(getLocalKey(userId));
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  /**
   * Helper to save locally cached bookshelf items.
   */
  saveLocalBookshelf(userId: string, items: BookshelfItem[]): void {
    try {
      localStorage.setItem(getLocalKey(userId), JSON.stringify(items));
    } catch (err) {
      console.warn('Could not cache bookshelf in localStorage:', err);
    }
  },

  /**
   * Get all books on a user's bookshelf (Supabase with localStorage fallback/sync).
   */
  async getBookshelf(userId: string): Promise<BookshelfItem[]> {
    if (!userId) return [];

    const localItems = this.getLocalBookshelf(userId);

    if (!isSupabaseConfigured()) {
      return localItems;
    }

    try {
      const { data, error } = await supabase
        .from('bookshelf')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) {
        console.warn('Failed to fetch bookshelf from Supabase:', error.message);
        return localItems;
      }

      if (data) {
        const mapped: BookshelfItem[] = data.map((b) => ({
          id: b.id,
          userId: b.user_id,
          title: b.title,
          author: b.author,
          coverImageUrl: (b.title?.toLowerCase().includes('meditations') && (!b.cover_image_url || b.cover_image_url.includes('12818862') || b.cover_image_url.includes('13202688'))) ? 'https://covers.openlibrary.org/b/isbn/9780812968255-L.jpg' : (b.cover_image_url || undefined),
          status: b.status,
          progressPercentage: b.progress_percentage ?? 0,
          rating: b.rating || undefined,
          createdAt: b.created_at,
        }));

        // Cache the latest server data locally
        this.saveLocalBookshelf(userId, mapped);
        return mapped;
      }

      return localItems;
    } catch (err) {
      console.warn('Bookshelf network fetch error:', err);
      return localItems;
    }
  },

  /**
   * Check if a specific book is on the user's bookshelf and return its current status.
   */
  async getBookStatus(
    userId: string,
    title: string
  ): Promise<{ id: string; status: 'currently_reading' | 'finished' | 'want_to_read'; progressPercentage: number } | null> {
    if (!userId || !title) return null;

    const trimmedTitle = title.trim().toLowerCase();

    // 1. Fast check local cache first
    const local = this.getLocalBookshelf(userId);
    const localMatch = local.find((b) => b.title.trim().toLowerCase() === trimmedTitle);

    if (localMatch) {
      return {
        id: localMatch.id,
        status: localMatch.status,
        progressPercentage: localMatch.progressPercentage,
      };
    }

    // 2. Query Supabase
    if (!isSupabaseConfigured()) return null;

    try {
      const { data, error } = await supabase
        .from('bookshelf')
        .select('id, status, progress_percentage, title')
        .eq('user_id', userId)
        .ilike('title', title.trim())
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          status: data.status,
          progressPercentage: data.progress_percentage ?? 0,
        };
      }
    } catch (err) {
      console.warn('Could not query book status from Supabase:', err);
    }

    return null;
  },

  /**
   * Add or update a book's status on the user's bookshelf (e.g. want_to_read, currently_reading, finished).
   */
  async setBookStatus(
    userId: string,
    book: {
      title: string;
      author: string;
      coverImageUrl?: string;
      status: 'currently_reading' | 'finished' | 'want_to_read';
      progressPercentage?: number;
    }
  ): Promise<BookshelfItem> {
    const trimmedTitle = book.title.trim();
    const cleanAuthor = (book.author || 'Unknown Author').trim();
    const progress = typeof book.progressPercentage === 'number' ? book.progressPercentage : (book.status === 'finished' ? 100 : 0);
    const now = new Date().toISOString();

    let resolvedItem: BookshelfItem = {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      userId,
      title: trimmedTitle,
      author: cleanAuthor,
      coverImageUrl: book.coverImageUrl,
      status: book.status,
      progressPercentage: progress,
      createdAt: now,
    };

    // 1. Persist to Supabase if connected
    if (isSupabaseConfigured()) {
      try {
        // Check if row already exists for this user and title
        const { data: existing } = await supabase
          .from('bookshelf')
          .select('*')
          .eq('user_id', userId)
          .ilike('title', trimmedTitle)
          .maybeSingle();

        if (existing) {
          const { data: updated, error: updateErr } = await supabase
            .from('bookshelf')
            .update({
              status: book.status,
              author: cleanAuthor || existing.author,
              cover_image_url: book.coverImageUrl || existing.cover_image_url,
              progress_percentage: progress,
              updated_at: now,
            })
            .eq('id', existing.id)
            .select('*')
            .single();

          if (!updateErr && updated) {
            resolvedItem = {
              id: updated.id,
              userId: updated.user_id,
              title: updated.title,
              author: updated.author,
              coverImageUrl: updated.cover_image_url || undefined,
              status: updated.status,
              progressPercentage: updated.progress_percentage ?? 0,
              rating: updated.rating || undefined,
              createdAt: updated.created_at,
            };
          }
        } else {
          const { data: inserted, error: insertErr } = await supabase
            .from('bookshelf')
            .insert({
              user_id: userId,
              title: trimmedTitle,
              author: cleanAuthor,
              cover_image_url: book.coverImageUrl || null,
              status: book.status,
              progress_percentage: progress,
              created_at: now,
              updated_at: now,
            })
            .select('*')
            .single();

          if (!insertErr && inserted) {
            resolvedItem = {
              id: inserted.id,
              userId: inserted.user_id,
              title: inserted.title,
              author: inserted.author,
              coverImageUrl: inserted.cover_image_url || undefined,
              status: inserted.status,
              progressPercentage: inserted.progress_percentage ?? 0,
              rating: inserted.rating || undefined,
              createdAt: inserted.created_at,
            };
          }
        }
      } catch (err) {
        console.warn('Supabase setBookStatus error, falling back to local sync:', err);
      }
    }

    // 2. Synchronize with localStorage
    const local = this.getLocalBookshelf(userId);
    const existingIndex = local.findIndex((b) => b.title.trim().toLowerCase() === trimmedTitle.toLowerCase());
    if (existingIndex >= 0) {
      local[existingIndex] = resolvedItem;
    } else {
      local.unshift(resolvedItem);
    }
    this.saveLocalBookshelf(userId, local);

    return resolvedItem;
  },

  /**
   * Update progress or status of an existing book item.
   */
  async updateBookProgress(
    userId: string,
    bookId: string,
    updates: {
      progressPercentage?: number;
      status?: 'currently_reading' | 'finished' | 'want_to_read';
      rating?: number;
    }
  ): Promise<void> {
    const now = new Date().toISOString();

    // 1. Update localStorage
    if (userId) {
      const local = this.getLocalBookshelf(userId);
      const matchIndex = local.findIndex((b) => b.id === bookId);
      if (matchIndex >= 0) {
        if (typeof updates.progressPercentage === 'number') {
          local[matchIndex].progressPercentage = updates.progressPercentage;
        }
        if (updates.status) {
          local[matchIndex].status = updates.status;
        }
        if (typeof updates.rating === 'number') {
          local[matchIndex].rating = updates.rating;
        }
        this.saveLocalBookshelf(userId, local);
      }
    }

    // 2. Update Supabase
    if (isSupabaseConfigured() && !bookId.startsWith('local-')) {
      const updatePayload: any = { updated_at: now };
      if (typeof updates.progressPercentage === 'number') {
        updatePayload.progress_percentage = updates.progressPercentage;
      }
      if (updates.status) {
        updatePayload.status = updates.status;
      }
      if (typeof updates.rating === 'number') {
        updatePayload.rating = updates.rating;
      }

      try {
        await supabase
          .from('bookshelf')
          .update(updatePayload)
          .eq('id', bookId);
      } catch (err) {
        console.warn('Failed to update progress in Supabase:', err);
      }
    }
  },

  /**
   * Remove a book from user's bookshelf by title.
   */
  async removeBookByTitle(userId: string, title: string): Promise<void> {
    const trimmedTitle = title.trim();

    // 1. Remove from localStorage
    if (userId) {
      const local = this.getLocalBookshelf(userId);
      const filtered = local.filter((b) => b.title.trim().toLowerCase() !== trimmedTitle.toLowerCase());
      this.saveLocalBookshelf(userId, filtered);
    }

    // 2. Remove from Supabase
    if (isSupabaseConfigured() && userId) {
      try {
        await supabase
          .from('bookshelf')
          .delete()
          .eq('user_id', userId)
          .ilike('title', trimmedTitle);
      } catch (err) {
        console.warn('Failed to remove book from Supabase:', err);
      }
    }
  },

  /**
   * Remove a book from user's bookshelf by item ID.
   */
  async removeBook(userId: string, bookId: string): Promise<void> {
    // 1. Remove from localStorage
    if (userId) {
      const local = this.getLocalBookshelf(userId);
      const filtered = local.filter((b) => b.id !== bookId);
      this.saveLocalBookshelf(userId, filtered);
    }

    // 2. Remove from Supabase
    if (isSupabaseConfigured() && !bookId.startsWith('local-')) {
      try {
        await supabase.from('bookshelf').delete().eq('id', bookId);
      } catch (err) {
        console.warn('Failed to remove book ID from Supabase:', err);
      }
    }
  },
};
