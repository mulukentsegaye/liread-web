-- ==============================================================================
-- Readers Hub - Supabase Demo Accounts & Full Experience Seed Script
-- ==============================================================================
-- This script seeds 5 complete demo accounts with:
--   1. Real Supabase auth.users & auth.identities (Email/Password login enabled)
--   2. Enriched public.profiles (streaks, total minutes, rank tiers, bios, avatars)
--   3. Personal public.bookshelf (Currently Reading, Finished, Want to Read)
--   4. Active public.reading_sessions (today & past 7 days for Analytics & Goals)
--   5. Community public.posts (passage quotes, book ratings & reviews)
--   6. Social interactions (public.post_upvotes, public.post_comments, public.saved_posts)
--
-- DEFAULT LOGIN FOR ALL DEMO ACCOUNTS:
--   Password: Password123!
--   Primary Demo Account: demo@readershub.com
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. CLEANUP PREVIOUS SEEDED DEMO DATA (Idempotent rerun support)
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

-- Clean matching auth users & identities
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
-- 2. INSERT DEMO USERS INTO auth.users
-- Password is 'Password123!' (Bcrypt hashed)
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
-- 3. LINK IDENTITIES INTO auth.identities (Required for GoTrue signInWithPassword)
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
-- 4. UPSERT ENRICHED PROFILES INTO public.profiles
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
-- 5. READING SESSIONS (Powers Daily Gauge, Streak Strip, 7-Day & 30-Day Charts, Leaderboard)
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
    -- Alex Miller (Active Session Today: 45 min out of 60 min goal = 75% complete)
    ('a1111111-1111-1111-1111-111111111111', 'The Creative Act: A Way of Being', 45, 2700, CURRENT_DATE, timezone('utc'::text, now())),
    ('a1111111-1111-1111-1111-111111111111', 'The Creative Act: A Way of Being', 50, 3000, CURRENT_DATE - 1, timezone('utc'::text, now() - INTERVAL '1 day')),
    ('a1111111-1111-1111-1111-111111111111', 'Meditations', 90, 5400, CURRENT_DATE - 2, timezone('utc'::text, now() - INTERVAL '2 days')),
    ('a1111111-1111-1111-1111-111111111111', 'Meditations', 75, 4500, CURRENT_DATE - 3, timezone('utc'::text, now() - INTERVAL '3 days')),
    ('a1111111-1111-1111-1111-111111111111', 'Atomic Habits', 35, 2100, CURRENT_DATE - 4, timezone('utc'::text, now() - INTERVAL '4 days')),
    ('a1111111-1111-1111-1111-111111111111', 'Atomic Habits', 60, 3600, CURRENT_DATE - 5, timezone('utc'::text, now() - INTERVAL '5 days')),
    ('a1111111-1111-1111-1111-111111111111', 'Before the Coffee Gets Cold', 45, 2700, CURRENT_DATE - 6, timezone('utc'::text, now() - INTERVAL '6 days')),

    -- Elena Rostova (Top Weekly Leader - 80 min today, heavy reading throughout week)
    ('b2222222-2222-2222-2222-222222222222', 'War and Peace', 80, 4800, CURRENT_DATE, timezone('utc'::text, now())),
    ('b2222222-2222-2222-2222-222222222222', 'War and Peace', 95, 5700, CURRENT_DATE - 1, timezone('utc'::text, now() - INTERVAL '1 day')),
    ('b2222222-2222-2222-2222-222222222222', 'The Brothers Karamazov', 110, 6600, CURRENT_DATE - 2, timezone('utc'::text, now() - INTERVAL '2 days')),
    ('b2222222-2222-2222-2222-222222222222', 'Anna Karenina', 75, 4500, CURRENT_DATE - 3, timezone('utc'::text, now() - INTERVAL '3 days')),
    ('b2222222-2222-2222-2222-222222222222', 'Crime and Punishment', 90, 5400, CURRENT_DATE - 4, timezone('utc'::text, now() - INTERVAL '4 days')),

    -- Marcus Vance (Rank 2 Weekly - Stoicism & History)
    ('c3333333-3333-3333-3333-333333333333', 'Letters from a Stoic', 60, 3600, CURRENT_DATE, timezone('utc'::text, now())),
    ('c3333333-3333-3333-3333-333333333333', 'The Daily Stoic', 45, 2700, CURRENT_DATE - 1, timezone('utc'::text, now() - INTERVAL '1 day')),
    ('c3333333-3333-3333-3333-333333333333', 'Discourses', 70, 4200, CURRENT_DATE - 2, timezone('utc'::text, now() - INTERVAL '2 days')),
    ('c3333333-3333-3333-3333-333333333333', 'SPQR: A History of Ancient Rome', 50, 3000, CURRENT_DATE - 3, timezone('utc'::text, now() - INTERVAL '3 days')),

    -- Sophia Chen (Fiction & Sci-Fi)
    ('d4444444-4444-4444-4444-444444444444', 'Exhalation', 35, 2100, CURRENT_DATE, timezone('utc'::text, now())),
    ('d4444444-4444-4444-4444-444444444444', 'Exhalation', 40, 2400, CURRENT_DATE - 1, timezone('utc'::text, now() - INTERVAL '1 day')),
    ('d4444444-4444-4444-4444-444444444444', 'Stories of Your Life and Others', 45, 2700, CURRENT_DATE - 2, timezone('utc'::text, now() - INTERVAL '2 days')),

    -- Lucas Gray (Novice Reader)
    ('e5555555-5555-5555-5555-555555555555', 'Thinking, Fast and Slow', 20, 1200, CURRENT_DATE, timezone('utc'::text, now())),
    ('e5555555-5555-5555-5555-555555555555', 'Thinking, Fast and Slow', 25, 1500, CURRENT_DATE - 1, timezone('utc'::text, now() - INTERVAL '1 day'));

-- Re-assert profile totals and streaks to ensure exact intended display
UPDATE public.profiles SET total_minutes_read = 1420, current_streak = 7, rank_tier = 'Avid Reader' WHERE id = 'a1111111-1111-1111-1111-111111111111';
UPDATE public.profiles SET total_minutes_read = 6480, current_streak = 24, rank_tier = 'Master of Tomes' WHERE id = 'b2222222-2222-2222-2222-222222222222';
UPDATE public.profiles SET total_minutes_read = 3850, current_streak = 14, rank_tier = 'Literary Scholar' WHERE id = 'c3333333-3333-3333-3333-333333333333';
UPDATE public.profiles SET total_minutes_read = 890, current_streak = 5, rank_tier = 'Bookworm' WHERE id = 'd4444444-4444-4444-4444-444444444444';
UPDATE public.profiles SET total_minutes_read = 210, current_streak = 3, rank_tier = 'Novice Reader' WHERE id = 'e5555555-5555-5555-5555-555555555555';

-- ------------------------------------------------------------------------------
-- 6. BOOKSHELF LIBRARY (Populates the Bookshelf tab)
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
-- 7. COMMUNITY POSTS (Populates the Discover Feed)
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
-- 8. SAVED POSTS (Commonplace Book Bookmarks for Alex Miller)
-- ------------------------------------------------------------------------------
INSERT INTO public.saved_posts (user_id, post_id, created_at)
VALUES
    ('a1111111-1111-1111-1111-111111111111', 'f2222222-2222-2222-2222-222222222222', timezone('utc'::text, now() - INTERVAL '4 hours')),
    ('a1111111-1111-1111-1111-111111111111', 'f3333333-3333-3333-3333-333333333333', timezone('utc'::text, now() - INTERVAL '1 day')),
    ('a1111111-1111-1111-1111-111111111111', 'f4444444-4444-4444-4444-444444444444', timezone('utc'::text, now() - INTERVAL '2 days'))
ON CONFLICT (user_id, post_id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 9. POST UPVOTES (Community likes)
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
-- 10. POST COMMENTS (Community discussions)
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
-- 11. VERIFICATION SUMMARY
-- ------------------------------------------------------------------------------
SELECT 
    'Seed completed successfully!' AS status,
    (SELECT COUNT(*) FROM auth.users WHERE id IN ('a1111111-1111-1111-1111-111111111111','b2222222-2222-2222-2222-222222222222','c3333333-3333-3333-3333-333333333333','d4444444-4444-4444-4444-444444444444','e5555555-5555-5555-5555-555555555555')) AS demo_users_count,
    (SELECT COUNT(*) FROM public.posts) AS total_posts,
    (SELECT COUNT(*) FROM public.bookshelf WHERE user_id = 'a1111111-1111-1111-1111-111111111111') AS demo_user_books,
    (SELECT COUNT(*) FROM public.reading_sessions WHERE user_id = 'a1111111-1111-1111-1111-111111111111') AS demo_user_sessions;
