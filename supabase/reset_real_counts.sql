-- ==============================================================================
-- Liread: Recalculate and Synchronize Real Likes & Comments
-- ==============================================================================
-- Run this query once in the Supabase SQL Editor to ensure every post's counters
-- perfectly match the actual rows in post_upvotes and post_comments.
-- ==============================================================================

UPDATE public.posts p
SET upvotes_count = (SELECT COUNT(*) FROM public.post_upvotes u WHERE u.post_id = p.id),
    comments_count = (SELECT COUNT(*) FROM public.post_comments c WHERE c.post_id = p.id);

SELECT 
    id,
    book_title,
    upvotes_count,
    comments_count
FROM public.posts
ORDER BY created_at DESC;
