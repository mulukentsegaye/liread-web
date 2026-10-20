-- ==============================================================================
-- Readers Hub - Complete Supabase Setup & Demo Accounts Seed Script
-- ==============================================================================
-- This script is 100% self-contained and idempotent. It:
--   1. Ensures required PostgreSQL extensions exist (uuid-ossp, pgcrypto).
--   2. Creates all necessary tables if they don't exist yet:
--        - public.profiles
--        - public.posts
--        - public.post_upvotes
--        - public.reading_sessions
--        - public.saved_posts
--        - public.bookshelf
--        - public.post_comments
--   3. Enables Row Level Security (RLS) & configures permissive policies.
--   4. Creates automated triggers (new user profiles, session sync, upvote sync).
--   5. Creates RPC aggregation functions (get_daily/weekly/lifetime_leaderboard).
--   6. Configures public storage buckets (book-covers, avatars).
--   7. Seeds 5 authentic demo accounts with password 'Password123!':
--        - demo@readershub.com (Primary Demo User: Alex Miller)
--        - elena@readershub.com (Elena Rostova - Master of Tomes)
--        - marcus@readershub.com (Marcus Vance - Literary Scholar)
--        - sophia@readershub.com (Sophia Chen - Bookworm)
--        - lucas@readershub.com (Lucas Gray - Novice Reader)
--   8. Seeds realistic reading sessions (powers the 7-day chart & daily goal gauge).
--   9. Seeds bookshelf library items, community posts, bookmarks, and comments.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 2. CREATE DATABASE TABLES (IF NOT ALREADY CREATED)
-- ------------------------------------------------------------------------------

-- 2.1 Profiles
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

-- 2.2 Posts
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
    tag TEXT DEFAULT 'General',
    post_type TEXT NOT NULL DEFAULT 'passage' CHECK (post_type IN ('passage', 'recommendation', 'finished_book')),
    upvotes_count INTEGER NOT NULL DEFAULT 0 CHECK (upvotes_count >= 0),
    comments_count INTEGER NOT NULL DEFAULT 0 CHECK (comments_count >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.3 Post Upvotes
CREATE TABLE IF NOT EXISTS public.post_upvotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_post_user_upvote UNIQUE (post_id, user_id)
);

-- 2.4 Reading Sessions
CREATE TABLE IF NOT EXISTS public.reading_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    book_title TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes >= 0),
    duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.5 Saved Posts (Bookmarks)
CREATE TABLE IF NOT EXISTS public.saved_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_saved_post UNIQUE (user_id, post_id)
);

-- 2.6 Bookshelf
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

-- 2.7 Post Comments
CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 3. INDEXES
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookshelf ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to allow safe re-runs
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
CREATE POLICY "Users can delete their own profile" ON public.profiles FOR DELETE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Posts are viewable by everyone" ON public.posts;
CREATE POLICY "Posts are viewable by everyone" ON public.posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;
CREATE POLICY "Authenticated users can create posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own posts" ON public.posts;
CREATE POLICY "Users can update own posts" ON public.posts FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;
CREATE POLICY "Users can delete own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Upvotes are viewable by everyone" ON public.post_upvotes;
CREATE POLICY "Upvotes are viewable by everyone" ON public.post_upvotes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can upvote" ON public.post_upvotes;
CREATE POLICY "Authenticated users can upvote" ON public.post_upvotes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove their upvote" ON public.post_upvotes;
CREATE POLICY "Users can remove their upvote" ON public.post_upvotes FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own reading sessions" ON public.reading_sessions;
CREATE POLICY "Users can view their own reading sessions" ON public.reading_sessions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own reading sessions" ON public.reading_sessions;
CREATE POLICY "Users can insert their own reading sessions" ON public.reading_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own reading sessions" ON public.reading_sessions;
CREATE POLICY "Users can update their own reading sessions" ON public.reading_sessions FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own reading sessions" ON public.reading_sessions;
CREATE POLICY "Users can delete their own reading sessions" ON public.reading_sessions FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own saved posts" ON public.saved_posts;
CREATE POLICY "Users can view their own saved posts" ON public.saved_posts FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can save posts" ON public.saved_posts;
CREATE POLICY "Users can save posts" ON public.saved_posts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove saved posts" ON public.saved_posts;
CREATE POLICY "Users can remove saved posts" ON public.saved_posts FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own bookshelf" ON public.bookshelf;
CREATE POLICY "Users can view their own bookshelf" ON public.bookshelf FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can add books to bookshelf" ON public.bookshelf;
CREATE POLICY "Users can add books to bookshelf" ON public.bookshelf FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own bookshelf" ON public.bookshelf;
CREATE POLICY "Users can update their own bookshelf" ON public.bookshelf FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove books from bookshelf" ON public.bookshelf;
CREATE POLICY "Users can remove books from bookshelf" ON public.bookshelf FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.post_comments;
CREATE POLICY "Comments are viewable by everyone" ON public.post_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.post_comments;
CREATE POLICY "Authenticated users can create comments" ON public.post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comments" ON public.post_comments;
CREATE POLICY "Users can delete own comments" ON public.post_comments FOR DELETE USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 5. AUTOMATED TRIGGERS & RPC FUNCTIONS
-- ------------------------------------------------------------------------------

-- 5.1 Profile creation on signup trigger
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
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5.2 Reading session sync trigger
CREATE OR REPLACE FUNCTION public.handle_reading_session_inserted()
RETURNS TRIGGER AS $$
DECLARE
    current_user_profile RECORD;
    new_streak INTEGER;
    new_rank TEXT;
    new_total_minutes INTEGER;
    yesterday_date DATE := NEW.session_date - 1;
BEGIN
    SELECT total_minutes_read, current_streak, last_read_date
    INTO current_user_profile
    FROM public.profiles
    WHERE id = NEW.user_id;

    IF NOT FOUND THEN
        RETURN NEW;
    END IF;

    new_total_minutes := current_user_profile.total_minutes_read + NEW.duration_minutes;

    IF current_user_profile.last_read_date IS NULL THEN
        new_streak := 1;
    ELSIF current_user_profile.last_read_date = NEW.session_date THEN
        new_streak := current_user_profile.current_streak;
    ELSIF current_user_profile.last_read_date = yesterday_date THEN
        new_streak := current_user_profile.current_streak + 1;
    ELSE
        new_streak := 1;
    END IF;

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

DROP TRIGGER IF EXISTS on_reading_session_created ON public.reading_sessions;
CREATE TRIGGER on_reading_session_created
    AFTER INSERT ON public.reading_sessions
    FOR EACH ROW EXECUTE FUNCTION public.handle_reading_session_inserted();

-- 5.3 Upvotes count sync trigger
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

DROP TRIGGER IF EXISTS on_post_upvote_added ON public.post_upvotes;
CREATE TRIGGER on_post_upvote_added
    AFTER INSERT ON public.post_upvotes
    FOR EACH ROW EXECUTE FUNCTION public.handle_post_upvote_change();

DROP TRIGGER IF EXISTS on_post_upvote_removed ON public.post_upvotes;
CREATE TRIGGER on_post_upvote_removed
    AFTER DELETE ON public.post_upvotes
    FOR EACH ROW EXECUTE FUNCTION public.handle_post_upvote_change();

-- 5.4 Comments count sync trigger
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

DROP TRIGGER IF EXISTS on_post_comment_added ON public.post_comments;
CREATE TRIGGER on_post_comment_added
    AFTER INSERT ON public.post_comments
    FOR EACH ROW EXECUTE FUNCTION public.handle_post_comment_change();

DROP TRIGGER IF EXISTS on_post_comment_removed ON public.post_comments;
CREATE TRIGGER on_post_comment_removed
    AFTER DELETE ON public.post_comments
    FOR EACH ROW EXECUTE FUNCTION public.handle_post_comment_change();

-- ------------------------------------------------------------------------------
-- 6. LEADERBOARD AGGREGATION RPC FUNCTIONS
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 7. STORAGE BUCKETS
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) 
VALUES ('book-covers', 'book-covers', true) 
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true) 
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Read Access for Book Covers" ON storage.objects;
CREATE POLICY "Public Read Access for Book Covers" ON storage.objects FOR SELECT USING (bucket_id = 'book-covers');

DROP POLICY IF EXISTS "Public Read Access for Avatars" ON storage.objects;
CREATE POLICY "Public Read Access for Avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

-- ------------------------------------------------------------------------------
-- 8. CLEANUP PREVIOUS DEMO USERS (Safe rerun)
-- ------------------------------------------------------------------------------
DELETE FROM public.post_comments WHERE user_id IN (
    'a1111111-1111-1111-1111-111111111111',
    'b2222222-2222-2222-2222-222222222222',
    'c3333333-3333-3333-3333-333333333333',
    'd4444444-4444-4444-4444-444444444444',
    'e5555555-5555-5555-5555-555555555555'
);

DELETE FROM public.saved_posts WHERE user_id IN (
    'a1111111-1111-1111-1111-111111111111',
    'b2222222-2222-2222-2222-222222222222',
    'c3333333-3333-3333-3333-333333333333',
    'd4444444-4444-4444-4444-444444444444',
    'e5555555-5555-5555-5555-555555555555'
);

DELETE FROM public.post_upvotes WHERE user_id IN (
    'a1111111-1111-1111-1111-111111111111',
    'b2222222-2222-2222-2222-222222222222',
    'c3333333-3333-3333-3333-333333333333',
    'd4444444-4444-4444-4444-444444444444',
    'e5555555-5555-5555-5555-555555555555'
);

DELETE FROM public.reading_sessions WHERE user_id IN (
    'a1111111-1111-1111-1111-111111111111',
    'b2222222-2222-2222-2222-222222222222',
    'c3333333-3333-3333-3333-333333333333',
    'd4444444-4444-4444-4444-444444444444',
    'e5555555-5555-5555-5555-555555555555'
);

DELETE FROM public.bookshelf WHERE user_id IN (
    'a1111111-1111-1111-1111-111111111111',
    'b2222222-2222-2222-2222-222222222222',
    'c3333333-3333-3333-3333-333333333333',
    'd4444444-4444-4444-4444-444444444444',
    'e5555555-5555-5555-5555-555555555555'
);

DELETE FROM public.posts WHERE user_id IN (
    'a1111111-1111-1111-1111-111111111111',
    'b2222222-2222-2222-2222-222222222222',
    'c3333333-3333-3333-3333-333333333333',
    'd4444444-4444-4444-4444-444444444444',
    'e5555555-5555-5555-5555-555555555555'
);

DELETE FROM public.profiles WHERE id IN (
    'a1111111-1111-1111-1111-111111111111',
    'b2222222-2222-2222-2222-222222222222',
    'c3333333-3333-3333-3333-333333333333',
    'd4444444-4444-4444-4444-444444444444',
    'e5555555-5555-5555-5555-555555555555'
);

DELETE FROM auth.identities WHERE user_id IN (
    'a1111111-1111-1111-1111-111111111111',
    'b2222222-2222-2222-2222-222222222222',
    'c3333333-3333-3333-3333-333333333333',
    'd4444444-4444-4444-4444-444444444444',
    'e5555555-5555-5555-5555-555555555555'
);

DELETE FROM auth.users WHERE id IN (
    'a1111111-1111-1111-1111-111111111111',
    'b2222222-2222-2222-2222-222222222222',
    'c3333333-3333-3333-3333-333333333333',
    'd4444444-4444-4444-4444-444444444444',
    'e5555555-5555-5555-5555-555555555555'
);

-- ------------------------------------------------------------------------------
-- 9. INSERT DEMO ACCOUNTS INTO auth.users (Password: Password123!)
-- ------------------------------------------------------------------------------
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token
)
VALUES
    (
        '00000000-0000-0000-0000-000000000000',
        'a1111111-1111-1111-1111-111111111111',
        'authenticated',
        'authenticated',
        'demo@readershub.com',
        crypt('Password123!', gen_salt('bf')),
        timezone('utc'::text, now()),
        '{"provider":"email","providers":["email"]}',
        '{"username":"alex_miller","full_name":"Alex Miller","avatar_url":"https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"}',
        timezone('utc'::text, now()),
        timezone('utc'::text, now()),
        ''
    ),
    (
        '00000000-0000-0000-0000-000000000000',
        'b2222222-2222-2222-2222-222222222222',
        'authenticated',
        'authenticated',
        'elena@readershub.com',
        crypt('Password123!', gen_salt('bf')),
        timezone('utc'::text, now()),
        '{"provider":"email","providers":["email"]}',
        '{"username":"elena_rostova","full_name":"Elena Rostova","avatar_url":"https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80"}',
        timezone('utc'::text, now()),
        timezone('utc'::text, now()),
        ''
    ),
    (
        '00000000-0000-0000-0000-000000000000',
        'c3333333-3333-3333-3333-333333333333',
        'authenticated',
        'authenticated',
        'marcus@readershub.com',
        crypt('Password123!', gen_salt('bf')),
        timezone('utc'::text, now()),
        '{"provider":"email","providers":["email"]}',
        '{"username":"marcus_vance","full_name":"Marcus Vance","avatar_url":"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80"}',
        timezone('utc'::text, now()),
        timezone('utc'::text, now()),
        ''
    ),
    (
        '00000000-0000-0000-0000-000000000000',
        'd4444444-4444-4444-4444-444444444444',
        'authenticated',
        'authenticated',
        'sophia@readershub.com',
        crypt('Password123!', gen_salt('bf')),
        timezone('utc'::text, now()),
        '{"provider":"email","providers":["email"]}',
        '{"username":"sophia_chen","full_name":"Sophia Chen","avatar_url":"https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80"}',
        timezone('utc'::text, now()),
        timezone('utc'::text, now()),
        ''
    ),
    (
        '00000000-0000-0000-0000-000000000000',
        'e5555555-5555-5555-5555-555555555555',
        'authenticated',
        'authenticated',
        'lucas@readershub.com',
        crypt('Password123!', gen_salt('bf')),
        timezone('utc'::text, now()),
        '{"provider":"email","providers":["email"]}',
        '{"username":"lucas_gray","full_name":"Lucas Gray","avatar_url":"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80"}',
        timezone('utc'::text, now()),
        timezone('utc'::text, now()),
        ''
    );

-- ------------------------------------------------------------------------------
-- 10. LINK IDENTITIES INTO auth.identities
-- ------------------------------------------------------------------------------
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'auth' AND table_name = 'identities' AND column_name = 'provider_id'
    ) THEN
        INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
        VALUES 
            ('a1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', jsonb_build_object('sub', 'a1111111-1111-1111-1111-111111111111', 'email', 'demo@readershub.com'), 'email', 'a1111111-1111-1111-1111-111111111111', timezone('utc'::text, now()), timezone('utc'::text, now()), timezone('utc'::text, now())),
            ('b2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', jsonb_build_object('sub', 'b2222222-2222-2222-2222-222222222222', 'email', 'elena@readershub.com'), 'email', 'b2222222-2222-2222-2222-222222222222', timezone('utc'::text, now()), timezone('utc'::text, now()), timezone('utc'::text, now())),
            ('c3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', jsonb_build_object('sub', 'c3333333-3333-3333-3333-333333333333', 'email', 'marcus@readershub.com'), 'email', 'c3333333-3333-3333-3333-333333333333', timezone('utc'::text, now()), timezone('utc'::text, now()), timezone('utc'::text, now())),
            ('d4444444-4444-4444-4444-444444444444', 'd4444444-4444-4444-4444-444444444444', jsonb_build_object('sub', 'd4444444-4444-4444-4444-444444444444', 'email', 'sophia@readershub.com'), 'email', 'd4444444-4444-4444-4444-444444444444', timezone('utc'::text, now()), timezone('utc'::text, now()), timezone('utc'::text, now())),
            ('e5555555-5555-5555-5555-555555555555', 'e5555555-5555-5555-5555-555555555555', jsonb_build_object('sub', 'e5555555-5555-5555-5555-555555555555', 'email', 'lucas@readershub.com'), 'email', 'e5555555-5555-5555-5555-555555555555', timezone('utc'::text, now()), timezone('utc'::text, now()), timezone('utc'::text, now()))
        ON CONFLICT (id) DO NOTHING;
    ELSE
        INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
        VALUES 
            ('a1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', jsonb_build_object('sub', 'a1111111-1111-1111-1111-111111111111', 'email', 'demo@readershub.com'), 'email', timezone('utc'::text, now()), timezone('utc'::text, now()), timezone('utc'::text, now())),
            ('b2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', jsonb_build_object('sub', 'b2222222-2222-2222-2222-222222222222', 'email', 'elena@readershub.com'), 'email', timezone('utc'::text, now()), timezone('utc'::text, now()), timezone('utc'::text, now())),
            ('c3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', jsonb_build_object('sub', 'c3333333-3333-3333-3333-333333333333', 'email', 'marcus@readershub.com'), 'email', timezone('utc'::text, now()), timezone('utc'::text, now()), timezone('utc'::text, now())),
            ('d4444444-4444-4444-4444-444444444444', 'd4444444-4444-4444-4444-444444444444', jsonb_build_object('sub', 'd4444444-4444-4444-4444-444444444444', 'email', 'sophia@readershub.com'), 'email', timezone('utc'::text, now()), timezone('utc'::text, now()), timezone('utc'::text, now())),
            ('e5555555-5555-5555-5555-555555555555', 'e5555555-5555-5555-5555-555555555555', jsonb_build_object('sub', 'e5555555-5555-5555-5555-555555555555', 'email', 'lucas@readershub.com'), 'email', timezone('utc'::text, now()), timezone('utc'::text, now()), timezone('utc'::text, now()))
        ON CONFLICT (id) DO NOTHING;
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping auth.identities insert: %', SQLERRM;
END $$;

-- ------------------------------------------------------------------------------
-- 11. UPSERT PROFILES INTO public.profiles
-- ------------------------------------------------------------------------------
INSERT INTO public.profiles (
    id,
    username,
    full_name,
    avatar_url,
    bio,
    total_minutes_read,
    current_streak,
    last_read_date,
    rank_tier,
    daily_goal_minutes,
    created_at,
    updated_at
)
VALUES
    (
        'a1111111-1111-1111-1111-111111111111',
        'alex_miller',
        'Alex Miller',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        'Avid reader exploring philosophy, craft & slow living.',
        1420,
        7,
        CURRENT_DATE,
        'Avid Reader',
        60,
        timezone('utc'::text, now() - INTERVAL '30 days'),
        timezone('utc'::text, now())
    ),
    (
        'b2222222-2222-2222-2222-222222222222',
        'elena_rostova',
        'Elena Rostova',
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
        'Literature professor & collector of vintage Penguin classics.',
        6480,
        24,
        CURRENT_DATE,
        'Master of Tomes',
        90,
        timezone('utc'::text, now() - INTERVAL '90 days'),
        timezone('utc'::text, now())
    ),
    (
        'c3333333-3333-3333-3333-333333333333',
        'marcus_vance',
        'Marcus Vance',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        'History, stoicism, and deep work enthusiast.',
        3850,
        14,
        CURRENT_DATE,
        'Literary Scholar',
        45,
        timezone('utc'::text, now() - INTERVAL '60 days'),
        timezone('utc'::text, now())
    ),
    (
        'd4444444-4444-4444-4444-444444444444',
        'sophia_chen',
        'Sophia Chen',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
        'UX designer by day, fiction world-builder by night.',
        890,
        5,
        CURRENT_DATE,
        'Bookworm',
        30,
        timezone('utc'::text, now() - INTERVAL '20 days'),
        timezone('utc'::text, now())
    ),
    (
        'e5555555-5555-5555-5555-555555555555',
        'lucas_gray',
        'Lucas Gray',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
        'Building a daily reading habit one chapter at a time.',
        210,
        3,
        CURRENT_DATE,
        'Novice Reader',
        20,
        timezone('utc'::text, now() - INTERVAL '7 days'),
        timezone('utc'::text, now())
    )
ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    bio = EXCLUDED.bio,
    total_minutes_read = EXCLUDED.total_minutes_read,
    current_streak = EXCLUDED.current_streak,
    last_read_date = EXCLUDED.last_read_date,
    rank_tier = EXCLUDED.rank_tier,
    daily_goal_minutes = EXCLUDED.daily_goal_minutes,
    updated_at = EXCLUDED.updated_at;

-- ------------------------------------------------------------------------------
-- 12. READING SESSIONS (Powers Daily Goal Gauge, 7-Day Chart & Leaderboards)
-- ------------------------------------------------------------------------------
INSERT INTO public.reading_sessions (
    user_id,
    book_title,
    duration_minutes,
    duration_seconds,
    session_date,
    created_at
)
VALUES
    -- Alex Miller (Active 45 min today out of 60 min goal = 75% complete gauge)
    ('a1111111-1111-1111-1111-111111111111', 'The Creative Act: A Way of Being', 45, 2700, CURRENT_DATE, timezone('utc'::text, now())),
    ('a1111111-1111-1111-1111-111111111111', 'The Creative Act: A Way of Being', 50, 3000, CURRENT_DATE - 1, timezone('utc'::text, now() - INTERVAL '1 day')),
    ('a1111111-1111-1111-1111-111111111111', 'Meditations', 90, 5400, CURRENT_DATE - 2, timezone('utc'::text, now() - INTERVAL '2 days')),
    ('a1111111-1111-1111-1111-111111111111', 'Meditations', 75, 4500, CURRENT_DATE - 3, timezone('utc'::text, now() - INTERVAL '3 days')),
    ('a1111111-1111-1111-1111-111111111111', 'Atomic Habits', 35, 2100, CURRENT_DATE - 4, timezone('utc'::text, now() - INTERVAL '4 days')),
    ('a1111111-1111-1111-1111-111111111111', 'Atomic Habits', 60, 3600, CURRENT_DATE - 5, timezone('utc'::text, now() - INTERVAL '5 days')),
    ('a1111111-1111-1111-1111-111111111111', 'Before the Coffee Gets Cold', 45, 2700, CURRENT_DATE - 6, timezone('utc'::text, now() - INTERVAL '6 days')),

    -- Elena Rostova (Top Weekly Leader - 80 min today)
    ('b2222222-2222-2222-2222-222222222222', 'War and Peace', 80, 4800, CURRENT_DATE, timezone('utc'::text, now())),
    ('b2222222-2222-2222-2222-222222222222', 'War and Peace', 95, 5700, CURRENT_DATE - 1, timezone('utc'::text, now() - INTERVAL '1 day')),
    ('b2222222-2222-2222-2222-222222222222', 'The Brothers Karamazov', 110, 6600, CURRENT_DATE - 2, timezone('utc'::text, now() - INTERVAL '2 days')),
    ('b2222222-2222-2222-2222-222222222222', 'Anna Karenina', 75, 4500, CURRENT_DATE - 3, timezone('utc'::text, now() - INTERVAL '3 days')),
    ('b2222222-2222-2222-2222-222222222222', 'Crime and Punishment', 90, 5400, CURRENT_DATE - 4, timezone('utc'::text, now() - INTERVAL '4 days')),

    -- Marcus Vance (Rank 2 Weekly - 60 min today)
    ('c3333333-3333-3333-3333-333333333333', 'Letters from a Stoic', 60, 3600, CURRENT_DATE, timezone('utc'::text, now())),
    ('c3333333-3333-3333-3333-333333333333', 'The Daily Stoic', 45, 2700, CURRENT_DATE - 1, timezone('utc'::text, now() - INTERVAL '1 day')),
    ('c3333333-3333-3333-3333-333333333333', 'Discourses', 70, 4200, CURRENT_DATE - 2, timezone('utc'::text, now() - INTERVAL '2 days')),
    ('c3333333-3333-3333-3333-333333333333', 'SPQR: A History of Ancient Rome', 50, 3000, CURRENT_DATE - 3, timezone('utc'::text, now() - INTERVAL '3 days')),

    -- Sophia Chen (35 min today)
    ('d4444444-4444-4444-4444-444444444444', 'Exhalation', 35, 2100, CURRENT_DATE, timezone('utc'::text, now())),
    ('d4444444-4444-4444-4444-444444444444', 'Exhalation', 40, 2400, CURRENT_DATE - 1, timezone('utc'::text, now() - INTERVAL '1 day')),
    ('d4444444-4444-4444-4444-444444444444', 'Stories of Your Life and Others', 45, 2700, CURRENT_DATE - 2, timezone('utc'::text, now() - INTERVAL '2 days')),

    -- Lucas Gray (20 min today)
    ('e5555555-5555-5555-5555-555555555555', 'Thinking, Fast and Slow', 20, 1200, CURRENT_DATE, timezone('utc'::text, now())),
    ('e5555555-5555-5555-5555-555555555555', 'Thinking, Fast and Slow', 25, 1500, CURRENT_DATE - 1, timezone('utc'::text, now() - INTERVAL '1 day'));

-- Re-assert profile totals and streaks to match target stats
UPDATE public.profiles SET total_minutes_read = 1420, current_streak = 7, rank_tier = 'Avid Reader' WHERE id = 'a1111111-1111-1111-1111-111111111111';
UPDATE public.profiles SET total_minutes_read = 6480, current_streak = 24, rank_tier = 'Master of Tomes' WHERE id = 'b2222222-2222-2222-2222-222222222222';
UPDATE public.profiles SET total_minutes_read = 3850, current_streak = 14, rank_tier = 'Literary Scholar' WHERE id = 'c3333333-3333-3333-3333-333333333333';
UPDATE public.profiles SET total_minutes_read = 890, current_streak = 5, rank_tier = 'Bookworm' WHERE id = 'd4444444-4444-4444-4444-444444444444';
UPDATE public.profiles SET total_minutes_read = 210, current_streak = 3, rank_tier = 'Novice Reader' WHERE id = 'e5555555-5555-5555-5555-555555555555';

-- ------------------------------------------------------------------------------
-- 13. BOOKSHELF LIBRARY (Populates the Bookshelf tab)
-- ------------------------------------------------------------------------------
INSERT INTO public.bookshelf (
    user_id,
    title,
    author,
    cover_image_url,
    status,
    progress_percentage,
    rating
)
VALUES
    -- Alex Miller's Bookshelf (demo@readershub.com)
    (
        'a1111111-1111-1111-1111-111111111111',
        'The Creative Act: A Way of Being',
        'Rick Rubin',
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
        'currently_reading',
        68,
        5.0
    ),
    (
        'a1111111-1111-1111-1111-111111111111',
        'Meditations',
        'Marcus Aurelius',
        'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=400&q=80',
        'currently_reading',
        42,
        4.8
    ),
    (
        'a1111111-1111-1111-1111-111111111111',
        'Before the Coffee Gets Cold',
        'Toshikazu Kawaguchi',
        'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80',
        'finished',
        100,
        4.5
    ),
    (
        'a1111111-1111-1111-1111-111111111111',
        'Atomic Habits',
        'James Clear',
        'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=400&q=80',
        'finished',
        100,
        5.0
    ),
    (
        'a1111111-1111-1111-1111-111111111111',
        'Klara and the Sun',
        'Kazuo Ishiguro',
        'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=400&q=80',
        'want_to_read',
        0,
        NULL
    ),
    (
        'a1111111-1111-1111-1111-111111111111',
        'Tomorrow, and Tomorrow, and Tomorrow',
        'Gabrielle Zevin',
        'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=400&q=80',
        'want_to_read',
        0,
        NULL
    ),

    -- Elena Rostova's Classics
    (
        'b2222222-2222-2222-2222-222222222222',
        'War and Peace',
        'Leo Tolstoy',
        'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=400&q=80',
        'currently_reading',
        82,
        5.0
    ),
    (
        'b2222222-2222-2222-2222-222222222222',
        'The Brothers Karamazov',
        'Fyodor Dostoevsky',
        'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=400&q=80',
        'finished',
        100,
        5.0
    );

-- ------------------------------------------------------------------------------
-- 14. COMMUNITY POSTS (Populates the Discover Feed)
-- ------------------------------------------------------------------------------
INSERT INTO public.posts (
    id,
    user_id,
    book_title,
    book_author,
    cover_image_url,
    quote_text,
    recommendation_text,
    page_number,
    rating,
    tag,
    post_type,
    upvotes_count,
    comments_count,
    created_at
)
VALUES
    (
        'f1111111-1111-1111-1111-111111111111',
        'a1111111-1111-1111-1111-111111111111',
        'The Creative Act: A Way of Being',
        'Rick Rubin',
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
        'The object of art is not to make art; it is to be in that wonderful state which makes art inevitable.',
        'A masterclass in stripping away self-doubt and seeing the world through curiosity.',
        42,
        5.0,
        'Creativity',
        'passage',
        18,
        3,
        timezone('utc'::text, now() - INTERVAL '2 hours')
    ),
    (
        'f2222222-2222-2222-2222-222222222222',
        'b2222222-2222-2222-2222-222222222222',
        'War and Peace',
        'Leo Tolstoy',
        'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=400&q=80',
        'If everyone fought for their own convictions, there would be no war.',
        'Tolstoy captures the microscopic nuances of human consciousness with astonishing clarity.',
        284,
        5.0,
        'Classics',
        'passage',
        34,
        7,
        timezone('utc'::text, now() - INTERVAL '5 hours')
    ),
    (
        'f3333333-3333-3333-3333-333333333333',
        'c3333333-3333-3333-3333-333333333333',
        'Meditations',
        'Marcus Aurelius',
        'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=400&q=80',
        'You have power over your mind - not outside events. Realize this, and you will find strength.',
        'Timeless notes written for oneself in military tents that echo through the centuries.',
        67,
        4.8,
        'Philosophy',
        'passage',
        29,
        4,
        timezone('utc'::text, now() - INTERVAL '1 day')
    ),
    (
        'f4444444-4444-4444-4444-444444444444',
        'd4444444-4444-4444-4444-444444444444',
        'Exhalation',
        'Ted Chiang',
        'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=400&q=80',
        'Contemplate the marvel that is existence, and rejoice that you are able to do so.',
        'Nine transcendent short stories that will rewire how you think about time and human nature.',
        155,
        5.0,
        'Sci-Fi',
        'recommendation',
        22,
        2,
        timezone('utc'::text, now() - INTERVAL '2 days')
    ),
    (
        'f5555555-5555-5555-5555-555555555555',
        'e5555555-5555-5555-5555-555555555555',
        'Before the Coffee Gets Cold',
        'Toshikazu Kawaguchi',
        'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80',
        'Water flows from high places to low places. That is the nature of gravity. Emotions also, seem to act according to gravity.',
        'A warm, melancholy cup of storytelling in a small Tokyo cafe alleyway.',
        92,
        4.5,
        'Fiction',
        'finished_book',
        15,
        1,
        timezone('utc'::text, now() - INTERVAL '3 days')
    );

-- ------------------------------------------------------------------------------
-- 15. SAVED POSTS (Commonplace Book Bookmarks for Alex Miller)
-- ------------------------------------------------------------------------------
INSERT INTO public.saved_posts (user_id, post_id, created_at)
VALUES
    ('a1111111-1111-1111-1111-111111111111', 'f2222222-2222-2222-2222-222222222222', timezone('utc'::text, now() - INTERVAL '4 hours')),
    ('a1111111-1111-1111-1111-111111111111', 'f3333333-3333-3333-3333-333333333333', timezone('utc'::text, now() - INTERVAL '1 day')),
    ('a1111111-1111-1111-1111-111111111111', 'f4444444-4444-4444-4444-444444444444', timezone('utc'::text, now() - INTERVAL '2 days'))
ON CONFLICT (user_id, post_id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 16. POST UPVOTES (Community likes)
-- ------------------------------------------------------------------------------
INSERT INTO public.post_upvotes (post_id, user_id)
VALUES
    ('f1111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222'),
    ('f1111111-1111-1111-1111-111111111111', 'c3333333-3333-3333-3333-333333333333'),
    ('f1111111-1111-1111-1111-111111111111', 'd4444444-4444-4444-4444-444444444444'),
    ('f2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111'),
    ('f2222222-2222-2222-2222-222222222222', 'c3333333-3333-3333-3333-333333333333'),
    ('f3333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111'),
    ('f3333333-3333-3333-3333-333333333333', 'b2222222-2222-2222-2222-222222222222'),
    ('f4444444-4444-4444-4444-444444444444', 'a1111111-1111-1111-1111-111111111111')
ON CONFLICT (post_id, user_id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 17. POST COMMENTS (Community discussions)
-- ------------------------------------------------------------------------------
INSERT INTO public.post_comments (post_id, user_id, comment_text, created_at)
VALUES
    (
        'f1111111-1111-1111-1111-111111111111',
        'b2222222-2222-2222-2222-222222222222',
        'One of my favorite passages from Rubin. It takes the pressure off the outcome.',
        timezone('utc'::text, now() - INTERVAL '1 hour')
    ),
    (
        'f1111111-1111-1111-1111-111111111111',
        'c3333333-3333-3333-3333-333333333333',
        'So true. Treating the practice as an end in itself changes everything.',
        timezone('utc'::text, now() - INTERVAL '40 minutes')
    ),
    (
        'f2222222-2222-2222-2222-222222222222',
        'a1111111-1111-1111-1111-111111111111',
        'Incredible quote Elena. Tolstoy’s ability to weave philosophy into human drama is unmatched.',
        timezone('utc'::text, now() - INTERVAL '3 hours')
    );

-- ------------------------------------------------------------------------------
-- 18. VERIFICATION SUMMARY
-- ------------------------------------------------------------------------------
SELECT 
    'Setup & Seed completed successfully!' AS status,
    (SELECT COUNT(*) FROM auth.users WHERE id IN ('a1111111-1111-1111-1111-111111111111','b2222222-2222-2222-2222-222222222222','c3333333-3333-3333-3333-333333333333','d4444444-4444-4444-4444-444444444444','e5555555-5555-5555-5555-555555555555')) AS demo_users_count,
    (SELECT COUNT(*) FROM public.posts) AS total_posts,
    (SELECT COUNT(*) FROM public.bookshelf WHERE user_id = 'a1111111-1111-1111-1111-111111111111') AS alex_books,
    (SELECT COUNT(*) FROM public.reading_sessions WHERE user_id = 'a1111111-1111-1111-1111-111111111111') AS alex_sessions;
