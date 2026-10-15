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

export const bookshelfService = {
  /**
   * Get all books on a user's bookshelf
   */
  async getBookshelf(userId: string): Promise<BookshelfItem[]> {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
      .from('bookshelf')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.warn('Failed to fetch bookshelf:', error.message);
      return [];
    }

    if (!data) return [];

    return data.map((b) => ({
      id: b.id,
      userId: b.user_id,
      title: b.title,
      author: b.author,
      coverImageUrl: b.cover_image_url || undefined,
      status: b.status,
      progressPercentage: b.progress_percentage,
      rating: b.rating || undefined,
      createdAt: b.created_at,
    }));
  },

  /**
   * Add a new book to the bookshelf
   */
  async addBook(userId: string, book: {
    title: string;
    author: string;
    coverImageUrl?: string;
    status?: 'currently_reading' | 'finished' | 'want_to_read';
    progressPercentage?: number;
  }): Promise<BookshelfItem | null> {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('bookshelf')
      .insert({
        user_id: userId,
        title: book.title,
        author: book.author,
        cover_image_url: book.coverImageUrl || null,
        status: book.status || 'currently_reading',
        progress_percentage: book.progressPercentage || 0,
      })
      .select('*')
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      author: data.author,
      coverImageUrl: data.cover_image_url || undefined,
      status: data.status,
      progressPercentage: data.progress_percentage,
      rating: data.rating || undefined,
      createdAt: data.created_at,
    };
  },

  /**
   * Update progress or status of a book
   */
  async updateBookProgress(bookId: string, updates: {
    progressPercentage?: number;
    status?: 'currently_reading' | 'finished' | 'want_to_read';
    rating?: number;
  }) {
    if (!isSupabaseConfigured()) return;

    const updatePayload: any = { updated_at: new Date().toISOString() };
    if (typeof updates.progressPercentage === 'number') {
      updatePayload.progress_percentage = updates.progressPercentage;
    }
    if (updates.status) {
      updatePayload.status = updates.status;
    }
    if (typeof updates.rating === 'number') {
      updatePayload.rating = updates.rating;
    }

    const { error } = await supabase
      .from('bookshelf')
      .update(updatePayload)
      .eq('id', bookId);

    if (error) throw error;
  },

  /**
   * Remove a book from user's bookshelf
   */
  async removeBook(bookId: string) {
    if (!isSupabaseConfigured()) return;
    const { error } = await supabase.from('bookshelf').delete().eq('id', bookId);
    if (error) throw error;
  },
};
