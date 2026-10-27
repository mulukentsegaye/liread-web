-- ==============================================================================
-- Liread - Security Hardening & Privilege Integrity Migration
-- Protects gamification statistics, post counts, user privacy, and storage.
-- ==============================================================================

-- 1. PREVENT CLIENT-SIDE LEADERBOARD & STAT CHEATING ON PROFILES
-- Guarantees that clients using the anon key cannot directly alter
-- total_minutes_read, current_streak, last_read_date, or rank_tier.
CREATE OR REPLACE FUNCTION public.protect_profile_system_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Only allow internal database triggers or service_role to alter reading stats
    IF (auth.role() <> 'service_role') THEN
        NEW.total_minutes_read := OLD.total_minutes_read;
        NEW.current_streak := OLD.current_streak;
        NEW.last_read_date := OLD.last_read_date;
        NEW.rank_tier := OLD.rank_tier;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_profile_system_fields ON public.profiles;
CREATE TRIGGER trg_protect_profile_system_fields
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.protect_profile_system_fields();


-- 2. PREVENT CLIENT-SIDE MANIPULATION OF POST ENGAGEMENT COUNTS
-- Upvotes, bookmarks, and comment counts must only increment/decrement via verified triggers.
CREATE OR REPLACE FUNCTION public.protect_post_system_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF (auth.role() <> 'service_role') THEN
        NEW.upvotes_count := OLD.upvotes_count;
        NEW.bookmarks_count := OLD.bookmarks_count;
        NEW.comments_count := OLD.comments_count;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_post_system_counts ON public.posts;
CREATE TRIGGER trg_protect_post_system_counts
    BEFORE UPDATE ON public.posts
    FOR EACH ROW EXECUTE FUNCTION public.protect_post_system_counts();


-- 3. RESPECT PRIVACY IN READING SESSIONS
-- Prevents third parties from querying reading sessions of users who set is_private = true.
DROP POLICY IF EXISTS "Anyone can view reading sessions" ON public.reading_sessions;
DROP POLICY IF EXISTS "Public reading sessions viewable if not private" ON public.reading_sessions;
CREATE POLICY "Public reading sessions viewable if not private"
    ON public.reading_sessions FOR SELECT
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE public.profiles.id = public.reading_sessions.user_id
            AND COALESCE(public.profiles.is_private, false) = false
        )
    );


-- 4. HARDEN SUPABASE STORAGE UPLOADS (USER PATH ISOLATION)
-- Ensures users can only upload avatars inside their own user ID folder
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
CREATE POLICY "Authenticated users can upload avatars"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'avatars' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Allow authenticated users to update or delete their own avatar files
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'avatars' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'avatars' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );
