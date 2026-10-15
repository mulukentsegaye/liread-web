export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          total_minutes_read: number;
          current_streak: number;
          last_read_date: string | null;
          rank_tier: string;
          daily_goal_minutes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          total_minutes_read?: number;
          current_streak?: number;
          last_read_date?: string | null;
          rank_tier?: string;
          daily_goal_minutes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          total_minutes_read?: number;
          current_streak?: number;
          last_read_date?: string | null;
          rank_tier?: string;
          daily_goal_minutes?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          book_title: string;
          book_author: string;
          cover_image_url: string | null;
          quote_text: string | null;
          recommendation_text: string | null;
          page_number: number | null;
          rating: number | null;
          tag: string;
          post_type: 'passage' | 'finished_book' | 'recommendation';
          upvotes_count: number;
          comments_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          book_title: string;
          book_author: string;
          cover_image_url?: string | null;
          quote_text?: string | null;
          recommendation_text?: string | null;
          page_number?: number | null;
          rating?: number | null;
          tag?: string;
          post_type?: 'passage' | 'finished_book' | 'recommendation';
          upvotes_count?: number;
          comments_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          book_title?: string;
          book_author?: string;
          cover_image_url?: string | null;
          quote_text?: string | null;
          recommendation_text?: string | null;
          page_number?: number | null;
          rating?: number | null;
          tag?: string;
          post_type?: 'passage' | 'finished_book' | 'recommendation';
          upvotes_count?: number;
          comments_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      post_upvotes: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          created_at?: string;
        };
      };
      reading_sessions: {
        Row: {
          id: string;
          user_id: string;
          book_title: string;
          duration_minutes: number;
          duration_seconds: number;
          session_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          book_title: string;
          duration_minutes: number;
          duration_seconds?: number;
          session_date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          book_title?: string;
          duration_minutes?: number;
          duration_seconds?: number;
          session_date?: string;
          created_at?: string;
        };
      };
      saved_posts: {
        Row: {
          id: string;
          user_id: string;
          post_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          post_id?: string;
          created_at?: string;
        };
      };
      bookshelf: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          author: string;
          cover_image_url: string | null;
          status: 'currently_reading' | 'finished' | 'want_to_read';
          progress_percentage: number;
          rating: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          author: string;
          cover_image_url?: string | null;
          status?: 'currently_reading' | 'finished' | 'want_to_read';
          progress_percentage?: number;
          rating?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          author?: string;
          cover_image_url?: string | null;
          status?: 'currently_reading' | 'finished' | 'want_to_read';
          progress_percentage?: number;
          rating?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      post_comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          comment_text: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          comment_text: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          comment_text?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_daily_leaderboard: {
        Args: {
          target_date?: string;
          max_limit?: number;
        };
        Returns: {
          user_id: string;
          username: string;
          full_name: string | null;
          avatar_url: string | null;
          rank_tier: string;
          minutes_read: number;
          leaderboard_rank: number;
        }[];
      };
      get_weekly_leaderboard: {
        Args: {
          start_date?: string;
          max_limit?: number;
        };
        Returns: {
          user_id: string;
          username: string;
          full_name: string | null;
          avatar_url: string | null;
          rank_tier: string;
          minutes_read: number;
          leaderboard_rank: number;
        }[];
      };
      get_lifetime_leaderboard: {
        Args: {
          max_limit?: number;
        };
        Returns: {
          user_id: string;
          username: string;
          full_name: string | null;
          avatar_url: string | null;
          rank_tier: string;
          minutes_read: number;
          leaderboard_rank: number;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
