-- ==============================================================================
-- Liread: Enable Public Bookmark Counts & Realtime Sync for Saved Posts
-- ==============================================================================
-- This script fixes the issue where bookmark / save counts on passages do not
-- synchronize across users or reflect on other devices upon refreshing.
--
-- Root Cause:
-- The default RLS policy on `public.saved_posts` was restricted to:
-- `USING (auth.uid() = user_id)`, which prevented other devices from reading
-- the total count of readers who saved a passage.
--
-- Instructions:
-- Run this script in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query).
-- ==============================================================================

-- 1. Add `bookmarks_count` column to `public.posts` if not present
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS bookmarks_count INTEGER NOT NULL DEFAULT 0 CHECK (bookmarks_count >= 0);

-- 2. Recalculate and synchronize existing bookmark counts
UPDATE public.posts p
SET bookmarks_count = (
    SELECT COUNT(*) 
    FROM public.saved_posts s 
    WHERE s.post_id = p.id
);

-- 3. Update Row Level Security (RLS) on `public.saved_posts`
-- Allow all users to read saved posts so total bookmark counts can be calculated by any client,
-- while strictly preserving that users can ONLY insert/delete their own saves.
DROP POLICY IF EXISTS "Users can view their own saved posts" ON public.saved_posts;
DROP POLICY IF EXISTS "Saved posts are viewable by everyone" ON public.saved_posts;

CREATE POLICY "Saved posts are viewable by everyone" 
    ON public.saved_posts FOR SELECT 
    USING (true);

-- 4. Automatic Database Trigger: Keep `posts.bookmarks_count` perfectly synchronized
CREATE OR REPLACE FUNCTION public.handle_saved_post_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.posts
        SET bookmarks_count = bookmarks_count + 1
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.posts
        SET bookmarks_count = GREATEST(0, bookmarks_count - 1)
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_saved_post_added ON public.saved_posts;
CREATE TRIGGER on_saved_post_added
    AFTER INSERT ON public.saved_posts
    FOR EACH ROW EXECUTE FUNCTION public.handle_saved_post_change();

DROP TRIGGER IF EXISTS on_saved_post_removed ON public.saved_posts;
CREATE TRIGGER on_saved_post_removed
    AFTER DELETE ON public.saved_posts
    FOR EACH ROW EXECUTE FUNCTION public.handle_saved_post_change();

-- 5. Add `saved_posts` to Supabase Realtime publication
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
          AND schemaname = 'public' 
          AND tablename = 'saved_posts'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.saved_posts;
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- 6. Verification query
SELECT 
    id,
    book_title,
    upvotes_count,
    bookmarks_count,
    comments_count
FROM public.posts
ORDER BY created_at DESC
LIMIT 10;
