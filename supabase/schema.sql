-- ==============================================================================
-- Readers Hub - Supabase Database Schema, Indexes, RLS Policies & Triggers
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. TABLES DEFINITION
-- ==============================================================================

-- 2.1 PROFILES TABLE
-- Extends auth.users with public profile metadata, reading statistics & rankings
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    total_minutes_read INTEGER NOT NULL DEFAULT 0 CHECK (total_minutes_read >= 0),
    current_streak INTEGER NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
    last_read_date DATE,
    rank_tier TEXT NOT NULL DEFAULT 'Novice Reader',
    daily_goal_minutes INTEGER NOT NULL DEFAULT 60 CHECK (daily_goal_minutes > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.2 POSTS TABLE
-- Community feed for book recommendations, passage quotes, and ratings
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    book_title TEXT NOT NULL,
    book_author TEXT NOT NULL,
    cover_image_url TEXT,
    quote_text TEXT,
    recommendation_text TEXT,
    page_number INTEGER,
    rating NUMERIC(2, 1) CHECK (rating >= 0 AND rating <= 5),
    tag TEXT DEFAULT 'General', -- e.g. Creativity, Fiction, Philosophy, Memoir
    post_type TEXT NOT NULL DEFAULT 'passage' CHECK (post_type IN ('passage', 'recommendation', 'finished_book')),
    upvotes_count INTEGER NOT NULL DEFAULT 0 CHECK (upvotes_count >= 0),
    comments_count INTEGER NOT NULL DEFAULT 0 CHECK (comments_count >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.3 POST UPVOTES TABLE
-- Enforces one upvote per user per post
CREATE TABLE IF NOT EXISTS public.post_upvotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_post_user_upvote UNIQUE (post_id, user_id)
);

-- 2.4 READING SESSIONS TABLE
-- Logs individual active reading timer sessions
CREATE TABLE IF NOT EXISTS public.reading_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    book_title TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes >= 0),
    duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.5 SAVED POSTS (BOOKMARKS)
-- Allows users to save favorite passages and book recommendations
CREATE TABLE IF NOT EXISTS public.saved_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_saved_post UNIQUE (user_id, post_id)
);

-- 2.6 BOOKSHELF TABLE
-- Personal library shelves tracking reading progress, status and personal ratings
CREATE TABLE IF NOT EXISTS public.bookshelf (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    cover_image_url TEXT,
    status TEXT NOT NULL DEFAULT 'currently_reading' CHECK (status IN ('currently_reading', 'finished', 'want_to_read')),
    progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    rating NUMERIC(2, 1) CHECK (rating >= 0 AND rating <= 5),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.7 POST COMMENTS TABLE
-- Community discussions and replies under reading moments
CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 3. PERFORMANCE INDEXES
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_total_minutes ON public.profiles(total_minutes_read DESC);

CREATE INDEX IF NOT EXISTS idx_posts_user_id ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_upvotes ON public.posts(upvotes_count DESC);

CREATE INDEX IF NOT EXISTS idx_post_upvotes_post_id ON public.post_upvotes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_upvotes_user_id ON public.post_upvotes(user_id);

CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_id ON public.reading_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_date ON public.reading_sessions(session_date DESC);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_date ON public.reading_sessions(user_id, session_date);

CREATE INDEX IF NOT EXISTS idx_saved_posts_user_id ON public.saved_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_bookshelf_user_id ON public.bookshelf(user_id);
CREATE INDEX IF NOT EXISTS idx_bookshelf_status ON public.bookshelf(user_id, status);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookshelf ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- 4.1 PROFILES POLICIES
-- Anyone can view user profiles
CREATE POLICY "Public profiles are viewable by everyone" 
    ON public.profiles FOR SELECT 
    USING (true);

-- Users can only insert their own profile
CREATE POLICY "Users can insert their own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- 4.2 POSTS POLICIES
-- Anyone can view posts
CREATE POLICY "Posts are viewable by everyone" 
    ON public.posts FOR SELECT 
    USING (true);

-- Authenticated users can create posts
CREATE POLICY "Authenticated users can create posts" 
    ON public.posts FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Post owners can update their posts
CREATE POLICY "Users can update own posts" 
    ON public.posts FOR UPDATE 
    USING (auth.uid() = user_id);

-- Post owners can delete their posts
CREATE POLICY "Users can delete own posts" 
    ON public.posts FOR DELETE 
    USING (auth.uid() = user_id);

-- 4.3 POST UPVOTES POLICIES
CREATE POLICY "Upvotes are viewable by everyone" 
    ON public.post_upvotes FOR SELECT 
    USING (true);

CREATE POLICY "Authenticated users can upvote" 
    ON public.post_upvotes FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their upvote" 
    ON public.post_upvotes FOR DELETE 
    USING (auth.uid() = user_id);

-- 4.4 READING SESSIONS POLICIES
-- Users can view their own reading sessions
CREATE POLICY "Users can view their own reading sessions" 
    ON public.reading_sessions FOR SELECT 
    USING (auth.uid() = user_id);

-- Users can log reading sessions
CREATE POLICY "Users can insert their own reading sessions" 
    ON public.reading_sessions FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own reading sessions
CREATE POLICY "Users can update their own reading sessions" 
    ON public.reading_sessions FOR UPDATE 
    USING (auth.uid() = user_id);

-- Users can delete their own reading sessions
CREATE POLICY "Users can delete their own reading sessions" 
    ON public.reading_sessions FOR DELETE 
    USING (auth.uid() = user_id);

-- 4.5 SAVED POSTS POLICIES
CREATE POLICY "Users can view their own saved posts" 
    ON public.saved_posts FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can save posts" 
    ON public.saved_posts FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove saved posts" 
    ON public.saved_posts FOR DELETE 
    USING (auth.uid() = user_id);

-- 4.6 BOOKSHELF POLICIES
CREATE POLICY "Users can view their own bookshelf" 
    ON public.bookshelf FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can add books to bookshelf" 
    ON public.bookshelf FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookshelf" 
    ON public.bookshelf FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can remove books from bookshelf" 
    ON public.bookshelf FOR DELETE 
    USING (auth.uid() = user_id);

-- 4.7 POST COMMENTS POLICIES
CREATE POLICY "Comments are viewable by everyone" 
    ON public.post_comments FOR SELECT 
    USING (true);

CREATE POLICY "Authenticated users can create comments" 
    ON public.post_comments FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" 
    ON public.post_comments FOR DELETE 
    USING (auth.uid() = user_id);

-- ==============================================================================
-- 5. AUTOMATED TRIGGERS & RPC FUNCTIONS
-- ==============================================================================

-- 5.1 AUTOMATIC PROFILE CREATION ON AUTH SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        username, 
        full_name, 
        avatar_url,
        rank_tier,
        daily_goal_minutes
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'reader_' || substr(NEW.id::text, 1, 8)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Avid Reader'),
        NEW.raw_user_meta_data->>'avatar_url',
        'Novice Reader',
        60
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5.2 AUTOMATIC SYNC: READING SESSION -> PROFILES TOTAL MINUTES, STREAK & RANK TIER
CREATE OR REPLACE FUNCTION public.handle_reading_session_inserted()
RETURNS TRIGGER AS $$
DECLARE
    current_user_profile RECORD;
    new_streak INTEGER;
    new_rank TEXT;
    new_total_minutes INTEGER;
    yesterday_date DATE := NEW.session_date - 1;
BEGIN
    -- Fetch the current profile for the user
    SELECT total_minutes_read, current_streak, last_read_date
    INTO current_user_profile
    FROM public.profiles
    WHERE id = NEW.user_id;

    IF NOT FOUND THEN
        RETURN NEW;
    END IF;

    -- 1. Calculate updated total minutes read
    new_total_minutes := current_user_profile.total_minutes_read + NEW.duration_minutes;

    -- 2. Calculate consecutive reading streak
    IF current_user_profile.last_read_date IS NULL THEN
        new_streak := 1;
    ELSIF current_user_profile.last_read_date = NEW.session_date THEN
        -- Already read today; streak remains unchanged
        new_streak := current_user_profile.current_streak;
    ELSIF current_user_profile.last_read_date = yesterday_date THEN
        -- Read yesterday; increment streak by 1
        new_streak := current_user_profile.current_streak + 1;
    ELSE
        -- Streak broken; reset to 1
        new_streak := 1;
    END IF;

    -- 3. Determine Rank Tier based on total minutes read
    IF new_total_minutes >= 6000 THEN
        new_rank := 'Master of Tomes';
    ELSIF new_total_minutes >= 3000 THEN
        new_rank := 'Literary Scholar';
    ELSIF new_total_minutes >= 1200 THEN
        new_rank := 'Avid Reader';
    ELSIF new_total_minutes >= 300 THEN
        new_rank := 'Bookworm';
    ELSE
        new_rank := 'Novice Reader';
    END IF;

    -- 4. Update profiles table
    UPDATE public.profiles
    SET 
        total_minutes_read = new_total_minutes,
        current_streak = new_streak,
        last_read_date = GREATEST(COALESCE(current_user_profile.last_read_date, NEW.session_date), NEW.session_date),
        rank_tier = new_rank,
        updated_at = timezone('utc'::text, now())
    WHERE id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_reading_session_created
    AFTER INSERT ON public.reading_sessions
    FOR EACH ROW EXECUTE FUNCTION public.handle_reading_session_inserted();

-- 5.3 AUTOMATIC SYNC: POST UPVOTES COUNT
CREATE OR REPLACE FUNCTION public.handle_post_upvote_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.posts
        SET upvotes_count = upvotes_count + 1
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.posts
        SET upvotes_count = GREATEST(0, upvotes_count - 1)
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_post_upvote_added
    AFTER INSERT ON public.post_upvotes
    FOR EACH ROW EXECUTE FUNCTION public.handle_post_upvote_change();

CREATE OR REPLACE TRIGGER on_post_upvote_removed
    AFTER DELETE ON public.post_upvotes
    FOR EACH ROW EXECUTE FUNCTION public.handle_post_upvote_change();

-- 5.4 AUTOMATIC SYNC: POST COMMENTS COUNT
CREATE OR REPLACE FUNCTION public.handle_post_comment_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.posts
        SET comments_count = comments_count + 1
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.posts
        SET comments_count = GREATEST(0, comments_count - 1)
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_post_comment_added
    AFTER INSERT ON public.post_comments
    FOR EACH ROW EXECUTE FUNCTION public.handle_post_comment_change();

CREATE OR REPLACE TRIGGER on_post_comment_removed
    AFTER DELETE ON public.post_comments
    FOR EACH ROW EXECUTE FUNCTION public.handle_post_comment_change();

-- ==============================================================================
-- 6. COMMUNITY LEADERBOARD AGGREGATION FUNCTIONS / RPC
-- ==============================================================================

-- 6.1 Daily Leaderboard RPC
CREATE OR REPLACE FUNCTION public.get_daily_leaderboard(target_date DATE DEFAULT CURRENT_DATE, max_limit INTEGER DEFAULT 10)
RETURNS TABLE (
    user_id UUID,
    username TEXT,
    full_name TEXT,
    avatar_url TEXT,
    rank_tier TEXT,
    minutes_read BIGINT,
    leaderboard_rank BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id AS user_id,
        p.username,
        p.full_name,
        p.avatar_url,
        p.rank_tier,
        COALESCE(SUM(rs.duration_minutes), 0) AS minutes_read,
        DENSE_RANK() OVER (ORDER BY COALESCE(SUM(rs.duration_minutes), 0) DESC) AS leaderboard_rank
    FROM public.profiles p
    INNER JOIN public.reading_sessions rs ON rs.user_id = p.id
    WHERE rs.session_date = target_date
    GROUP BY p.id, p.username, p.full_name, p.avatar_url, p.rank_tier
    ORDER BY minutes_read DESC
    LIMIT max_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6.2 Weekly Leaderboard RPC
CREATE OR REPLACE FUNCTION public.get_weekly_leaderboard(start_date DATE DEFAULT (CURRENT_DATE - INTERVAL '6 days')::DATE, max_limit INTEGER DEFAULT 10)
RETURNS TABLE (
    user_id UUID,
    username TEXT,
    full_name TEXT,
    avatar_url TEXT,
    rank_tier TEXT,
    minutes_read BIGINT,
    leaderboard_rank BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id AS user_id,
        p.username,
        p.full_name,
        p.avatar_url,
        p.rank_tier,
        COALESCE(SUM(rs.duration_minutes), 0) AS minutes_read,
        DENSE_RANK() OVER (ORDER BY COALESCE(SUM(rs.duration_minutes), 0) DESC) AS leaderboard_rank
    FROM public.profiles p
    INNER JOIN public.reading_sessions rs ON rs.user_id = p.id
    WHERE rs.session_date >= start_date AND rs.session_date <= CURRENT_DATE
    GROUP BY p.id, p.username, p.full_name, p.avatar_url, p.rank_tier
    ORDER BY minutes_read DESC
    LIMIT max_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6.3 Lifetime Leaderboard RPC
CREATE OR REPLACE FUNCTION public.get_lifetime_leaderboard(max_limit INTEGER DEFAULT 50)
RETURNS TABLE (
    user_id UUID,
    username TEXT,
    full_name TEXT,
    avatar_url TEXT,
    rank_tier TEXT,
    minutes_read INTEGER,
    leaderboard_rank BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id AS user_id,
        p.username,
        p.full_name,
        p.avatar_url,
        p.rank_tier,
        p.total_minutes_read AS minutes_read,
        DENSE_RANK() OVER (ORDER BY p.total_minutes_read DESC) AS leaderboard_rank
    FROM public.profiles p
    WHERE p.total_minutes_read > 0
    ORDER BY p.total_minutes_read DESC
    LIMIT max_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 7. SUPABASE STORAGE BUCKET CONFIGURATION & POLICIES
-- ==============================================================================

-- Create public storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('book-covers', 'book-covers', true) 
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true) 
ON CONFLICT (id) DO NOTHING;

-- Public read access for book covers and avatars
CREATE POLICY "Public Read Access for Book Covers" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'book-covers');

CREATE POLICY "Public Read Access for Avatars" 
    ON storage.objects FOR SELECT 
    USING (bucket_id = 'avatars');

-- Authenticated users can upload covers and avatars
CREATE POLICY "Authenticated users can upload book covers" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'book-covers' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload avatars" 
    ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- ==============================================================================
-- 8. SUPABASE REALTIME REPLICATION CONFIGURATION
-- ==============================================================================
-- Enable Realtime publication on posts, upvotes, and comments for live community feed
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.post_upvotes;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.post_comments;
EXCEPTION WHEN OTHERS THEN
    -- If publication already includes table or does not exist, continue cleanly
    NULL;
END $$;

