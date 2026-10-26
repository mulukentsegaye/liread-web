-- ==============================================================================
-- Liread: Follows Table & Profile Privacy Migration
-- Run this script in Supabase SQL Editor (Dashboard -> SQL Editor -> New query)
-- ==============================================================================

-- 1. Add privacy field to profiles (Default: false = Public)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false;

-- 2. Create Follows table
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_follower_following UNIQUE (follower_id, following_id),
    CONSTRAINT cannot_follow_self CHECK (follower_id <> following_id)
);

-- Indexes for high-performance follower & following counts
CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);

-- Enable Row Level Security
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone (including guests) can query follow counts and relationships
DROP POLICY IF EXISTS "Anyone can view follows" ON public.follows;
CREATE POLICY "Anyone can view follows" 
    ON public.follows FOR SELECT 
    USING (true);

-- Authenticated users can follow other readers
DROP POLICY IF EXISTS "Authenticated users can follow" ON public.follows;
CREATE POLICY "Authenticated users can follow" 
    ON public.follows FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = follower_id);

-- Users can remove their own follows (unfollow)
DROP POLICY IF EXISTS "Users can unfollow" ON public.follows;
CREATE POLICY "Users can unfollow" 
    ON public.follows FOR DELETE 
    TO authenticated 
    USING (auth.uid() = follower_id);

-- 3. Update Bookshelf policy to allow viewing other readers' books if not private
DROP POLICY IF EXISTS "Users can view their own bookshelf" ON public.bookshelf;
DROP POLICY IF EXISTS "Public bookshelves are viewable if not private" ON public.bookshelf;
CREATE POLICY "Public bookshelves are viewable if not private" 
    ON public.bookshelf FOR SELECT 
    USING (
        auth.uid() = user_id 
        OR EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE public.profiles.id = public.bookshelf.user_id 
            AND COALESCE(public.profiles.is_private, false) = false
        )
    );

