-- ==============================================================================
-- Readers Hub - Supabase Seed Data
-- ==============================================================================
-- Run this in the Supabase SQL editor after running schema.sql to populate
-- initial demo profiles, community posts, bookshelf items, and reading sessions.

-- 1. SEED PROFILES
-- Note: In production Supabase, profiles link to auth.users. 
-- For seeding stand-alone development environments, we insert mock profiles 
-- (if auth.users foreign key allows or during initial setup).

-- Demo profile 1: Elena Rostova (Literary Scholar)
INSERT INTO public.profiles (
    id, username, full_name, avatar_url, bio, total_minutes_read, current_streak, last_read_date, rank_tier, daily_goal_minutes
) VALUES (
    'a1111111-1111-1111-1111-111111111111',
    'elena_reads',
    'Elena Rostova',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
    'Curating classic literature, philosophy, and rainy day tea.',
    3240,
    14,
    CURRENT_DATE,
    'Literary Scholar',
    60
) ON CONFLICT (id) DO UPDATE SET
    total_minutes_read = EXCLUDED.total_minutes_read,
    current_streak = EXCLUDED.current_streak;

-- Demo profile 2: Marcus Vance (Master of Tomes)
INSERT INTO public.profiles (
    id, username, full_name, avatar_url, bio, total_minutes_read, current_streak, last_read_date, rank_tier, daily_goal_minutes
) VALUES (
    'b2222222-2222-2222-2222-222222222222',
    'marcus_vance',
    'Marcus Vance',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    'Deep reading advocate. 100 pages a day keeps distraction away.',
    6480,
    38,
    CURRENT_DATE,
    'Master of Tomes',
    90
) ON CONFLICT (id) DO UPDATE SET
    total_minutes_read = EXCLUDED.total_minutes_read,
    current_streak = EXCLUDED.current_streak;

-- Demo profile 3: Maya Patel (Avid Reader)
INSERT INTO public.profiles (
    id, username, full_name, avatar_url, bio, total_minutes_read, current_streak, last_read_date, rank_tier, daily_goal_minutes
) VALUES (
    'c3333333-3333-3333-3333-333333333333',
    'maya_patel',
    'Maya Patel',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250',
    'Fiction, Japanese novels, and cozy coffee shops.',
    1420,
    9,
    CURRENT_DATE,
    'Avid Reader',
    45
) ON CONFLICT (id) DO UPDATE SET
    total_minutes_read = EXCLUDED.total_minutes_read,
    current_streak = EXCLUDED.current_streak;

-- 2. SEED POSTS
INSERT INTO public.posts (
    id, user_id, book_title, book_author, cover_image_url, quote_text, recommendation_text, page_number, rating, tag, post_type, upvotes_count, comments_count, created_at
) VALUES 
(
    'd4444444-4444-4444-4444-444444444441',
    'a1111111-1111-1111-1111-111111111111',
    'The Creative Act: A Way of Being',
    'Rick Rubin',
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400',
    'The object of art is not to make saleable products. It is to save oneself from an empty life.',
    'A transformative meditation on tuning into your senses, silence, and intuition. Read slowly with your favorite tea.',
    142,
    5.0,
    'Creativity',
    'passage',
    42,
    5,
    timezone('utc'::text, now() - INTERVAL '2 hours')
),
(
    'd4444444-4444-4444-4444-444444444442',
    'c3333333-3333-3333-3333-333333333333',
    'Before the Coffee Gets Cold',
    'Toshikazu Kawaguchi',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400',
    'No matter what difficulties people face, they will always have the strength to overcome them. It just takes heart.',
    'Just finished this heartwarming Japanese novel set in a tiny subterranean Tokyo café. Tender and quietly poignant.',
    89,
    4.8,
    'Fiction',
    'finished_book',
    28,
    3,
    timezone('utc'::text, now() - INTERVAL '5 hours')
),
(
    'd4444444-4444-4444-4444-444444444443',
    'b2222222-2222-2222-2222-222222222222',
    'Meditations',
    'Marcus Aurelius',
    'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&q=80&w=400',
    'You have power over your mind - not outside events. Realize this, and you will find strength.',
    'Timeless stoic reflection written on the Danubian frontier. Essential for quiet focus and inner calm.',
    47,
    5.0,
    'Philosophy',
    'passage',
    64,
    9,
    timezone('utc'::text, now() - INTERVAL '1 day')
)
ON CONFLICT (id) DO NOTHING;

-- 3. SEED READING SESSIONS
INSERT INTO public.reading_sessions (
    id, user_id, book_title, duration_minutes, duration_seconds, session_date, created_at
) VALUES 
(
    'e5555555-5555-5555-5555-555555555551',
    'a1111111-1111-1111-1111-111111111111',
    'The Creative Act: A Way of Being',
    45,
    2700,
    CURRENT_DATE,
    timezone('utc'::text, now() - INTERVAL '3 hours')
),
(
    'e5555555-5555-5555-5555-555555555552',
    'b2222222-2222-2222-2222-222222222222',
    'Meditations',
    75,
    4500,
    CURRENT_DATE,
    timezone('utc'::text, now() - INTERVAL '4 hours')
),
(
    'e5555555-5555-5555-5555-555555555553',
    'c3333333-3333-3333-3333-333333333333',
    'Before the Coffee Gets Cold',
    35,
    2100,
    CURRENT_DATE,
    timezone('utc'::text, now() - INTERVAL '6 hours')
)
ON CONFLICT (id) DO NOTHING;
