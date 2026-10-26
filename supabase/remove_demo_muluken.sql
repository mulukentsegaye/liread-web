-- ==============================================================================
-- Purge 'muluken' Demo Account from Supabase Auth & Public Tables
-- Run this in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query)
-- ==============================================================================

DO $$
DECLARE
    target_user_id UUID := '954799c4-68d3-4ea1-9624-0ed2002dd5f6';
BEGIN
    -- 1. Remove user activity and content records
    DELETE FROM public.comments WHERE user_id = target_user_id;
    DELETE FROM public.post_upvotes WHERE user_id = target_user_id;
    DELETE FROM public.saved_posts WHERE user_id = target_user_id;
    DELETE FROM public.bookshelf WHERE user_id = target_user_id;
    DELETE FROM public.reading_sessions WHERE user_id = target_user_id;
    DELETE FROM public.posts WHERE user_id = target_user_id;

    -- 2. Remove profile from public.profiles
    DELETE FROM public.profiles WHERE id = target_user_id OR username = 'muluken';

    -- 3. Remove user identity from auth.users
    DELETE FROM auth.users WHERE id = target_user_id OR email ILIKE '%muluken%';
    
    RAISE NOTICE 'Demo user muluken successfully removed from database.';
END $$;
