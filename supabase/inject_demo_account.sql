-- ==============================================================================
-- Liread - Inject Rich Demo Account for Product Showcase & Screenshots
-- ==============================================================================
-- Credentials:
--   Email:    demo@liread.com
--   Password: test1234
--
-- How to run:
--   1. Open Supabase Dashboard -> SQL Editor
--   2. Click "+" to create a NEW clean query (or Ctrl+A -> Backspace to clear)
--   3. Paste this script and click "Run"
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. CLEANUP PREVIOUS DEMO DATA (Safe rerun)
DELETE FROM public.post_comments WHERE user_id = 'a1111111-1111-1111-1111-111111111111';
DELETE FROM public.saved_posts WHERE user_id = 'a1111111-1111-1111-1111-111111111111';
DELETE FROM public.post_upvotes WHERE user_id = 'a1111111-1111-1111-1111-111111111111';
DELETE FROM public.reading_sessions WHERE user_id = 'a1111111-1111-1111-1111-111111111111';
DELETE FROM public.bookshelf WHERE user_id = 'a1111111-1111-1111-1111-111111111111';
DELETE FROM public.posts WHERE user_id = 'a1111111-1111-1111-1111-111111111111';
DELETE FROM public.profiles WHERE id = 'a1111111-1111-1111-1111-111111111111' OR username = 'julian_reed' OR username = 'alex_miller' OR username = 'demoreader';
DELETE FROM auth.identities WHERE user_id = 'a1111111-1111-1111-1111-111111111111';
DELETE FROM auth.users WHERE email = 'demo@liread.com' OR id = 'a1111111-1111-1111-1111-111111111111';

-- 2. CREATE AUTH USER IN auth.users (Password: test1234, pre-confirmed)
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
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'a1111111-1111-1111-1111-111111111111',
    'authenticated',
    'authenticated',
    'demo@liread.com',
    crypt('test1234', gen_salt('bf')),
    timezone('utc'::text, now()),
    '{"provider":"email","providers":["email"]}',
    '{"username":"julian_reed","full_name":"Julian Reed","avatar_url":"https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80"}',
    timezone('utc'::text, now() - INTERVAL '30 days'),
    timezone('utc'::text, now()),
    '',
    '',
    '',
    ''
);

-- Ensure all internal auth token/string columns are non-null empty strings
-- (GoTrue Go scanner throws HTTP 500 "Database error querying schema" if any token column is NULL)
DO $$
DECLARE
    col text;
    token_cols text[] := ARRAY[
        'confirmation_token', 
        'recovery_token', 
        'email_change_token_new', 
        'email_change_token_current', 
        'email_change', 
        'phone_change', 
        'phone_change_token', 
        'reauthentication_token'
    ];
BEGIN
    FOREACH col IN ARRAY token_cols LOOP
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'auth' AND table_name = 'users' AND column_name = col
        ) THEN
            EXECUTE format('UPDATE auth.users SET %I = '''' WHERE id = ''a1111111-1111-1111-1111-111111111111'' AND %I IS NULL', col, col);
        END IF;
    END LOOP;

    -- Also guarantee confirmed_at timestamp is set if present in schema
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'auth' AND table_name = 'users' AND column_name = 'confirmed_at'
    ) THEN
        UPDATE auth.users 
        SET confirmed_at = timezone('utc'::text, now()) 
        WHERE id = 'a1111111-1111-1111-1111-111111111111' AND confirmed_at IS NULL;
    END IF;
END $$;

-- 3. LINK IDENTITY IN auth.identities
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'auth' AND table_name = 'identities' AND column_name = 'provider_id'
    ) THEN
        INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
        VALUES (
            'a1111111-1111-1111-1111-111111111111',
            'a1111111-1111-1111-1111-111111111111',
            jsonb_build_object('sub', 'a1111111-1111-1111-1111-111111111111', 'email', 'demo@liread.com'),
            'email',
            'a1111111-1111-1111-1111-111111111111',
            timezone('utc'::text, now()),
            timezone('utc'::text, now()),
            timezone('utc'::text, now())
        )
        ON CONFLICT (id) DO NOTHING;
    ELSE
        INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
        VALUES (
            'a1111111-1111-1111-1111-111111111111',
            'a1111111-1111-1111-1111-111111111111',
            jsonb_build_object('sub', 'a1111111-1111-1111-1111-111111111111', 'email', 'demo@liread.com'),
            'email',
            timezone('utc'::text, now()),
            timezone('utc'::text, now()),
            timezone('utc'::text, now())
        )
        ON CONFLICT (id) DO NOTHING;
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Skipping auth.identities insert: %', SQLERRM;
END $$;

-- 4. INSERT / UPSERT RICH PROFILE IN public.profiles
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
VALUES (
    'a1111111-1111-1111-1111-111111111111',
    'julian_reed',
    'Julian Reed',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
    'Avid reader exploring philosophy, craft & slow living.',
    385,
    7,
    CURRENT_DATE,
    'Avid Reader',
    60,
    timezone('utc'::text, now() - INTERVAL '30 days'),
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

-- 5. FULL WEEK READING SESSIONS (Powers 7-Day Chart, Today's Goal Gauge & Streak)
INSERT INTO public.reading_sessions (
    id,
    user_id,
    book_title,
    duration_minutes,
    duration_seconds,
    session_date,
    created_at
)
VALUES
    -- Today (Sunday): 45 mins (75% of 60m goal)
    ('a0000001-0000-0000-0000-000000000001', 'a1111111-1111-1111-1111-111111111111', 'The Creative Act: A Way of Being', 45, 2700, CURRENT_DATE, timezone('utc'::text, now())),
    -- Saturday: 55 mins
    ('a0000001-0000-0000-0000-000000000002', 'a1111111-1111-1111-1111-111111111111', 'The Creative Act: A Way of Being', 55, 3300, CURRENT_DATE - 1, timezone('utc'::text, now() - INTERVAL '1 day')),
    -- Friday: 70 mins
    ('a0000001-0000-0000-0000-000000000003', 'a1111111-1111-1111-1111-111111111111', 'Meditations', 70, 4200, CURRENT_DATE - 2, timezone('utc'::text, now() - INTERVAL '2 days')),
    -- Thursday: 50 mins
    ('a0000001-0000-0000-0000-000000000004', 'a1111111-1111-1111-1111-111111111111', 'Meditations', 50, 3000, CURRENT_DATE - 3, timezone('utc'::text, now() - INTERVAL '3 days')),
    -- Wednesday: 40 mins
    ('a0000001-0000-0000-0000-000000000005', 'a1111111-1111-1111-1111-111111111111', 'Atomic Habits', 40, 2400, CURRENT_DATE - 4, timezone('utc'::text, now() - INTERVAL '4 days')),
    -- Tuesday: 65 mins
    ('a0000001-0000-0000-0000-000000000006', 'a1111111-1111-1111-1111-111111111111', 'Atomic Habits', 65, 3900, CURRENT_DATE - 5, timezone('utc'::text, now() - INTERVAL '5 days')),
    -- Monday: 60 mins
    ('a0000001-0000-0000-0000-000000000007', 'a1111111-1111-1111-1111-111111111111', 'Before the Coffee Gets Cold', 60, 3600, CURRENT_DATE - 6, timezone('utc'::text, now() - INTERVAL '6 days'))
ON CONFLICT (id) DO NOTHING;

-- Ensure profile totals are perfectly synchronized
UPDATE public.profiles
SET total_minutes_read = 385,
    current_streak = 7,
    daily_goal_minutes = 60,
    rank_tier = 'Avid Reader',
    last_read_date = CURRENT_DATE
WHERE id = 'a1111111-1111-1111-1111-111111111111';

-- 6. BOOKSHELF LIBRARY ITEMS (Populates the My Bookshelf view)
INSERT INTO public.bookshelf (
    id,
    user_id,
    title,
    author,
    cover_image_url,
    status,
    progress_percentage,
    rating,
    created_at
)
VALUES
    (
        'b0000001-0000-0000-0000-000000000001',
        'a1111111-1111-1111-1111-111111111111',
        'The Creative Act: A Way of Being',
        'Rick Rubin',
        'https://covers.openlibrary.org/b/id/13316390-L.jpg',
        'currently_reading',
        68,
        5.0,
        timezone('utc'::text, now() - INTERVAL '12 days')
    ),
    (
        'b0000001-0000-0000-0000-000000000002',
        'a1111111-1111-1111-1111-111111111111',
        'Meditations',
        'Marcus Aurelius',
        'https://covers.openlibrary.org/b/isbn/9780812968255-L.jpg',
        'currently_reading',
        42,
        4.8,
        timezone('utc'::text, now() - INTERVAL '8 days')
    ),
    (
        'b0000001-0000-0000-0000-000000000003',
        'a1111111-1111-1111-1111-111111111111',
        'Atomic Habits',
        'James Clear',
        'https://covers.openlibrary.org/b/id/12539702-L.jpg',
        'finished',
        100,
        5.0,
        timezone('utc'::text, now() - INTERVAL '20 days')
    ),
    (
        'b0000001-0000-0000-0000-000000000004',
        'a1111111-1111-1111-1111-111111111111',
        'Before the Coffee Gets Cold',
        'Toshikazu Kawaguchi',
        'https://covers.openlibrary.org/b/id/10313327-L.jpg',
        'finished',
        100,
        4.5,
        timezone('utc'::text, now() - INTERVAL '15 days')
    ),
    (
        'b0000001-0000-0000-0000-000000000005',
        'a1111111-1111-1111-1111-111111111111',
        'Klara and the Sun',
        'Kazuo Ishiguro',
        'https://covers.openlibrary.org/b/id/10542385-L.jpg',
        'want_to_read',
        0,
        NULL,
        timezone('utc'::text, now() - INTERVAL '5 days')
    ),
    (
        'b0000001-0000-0000-0000-000000000006',
        'a1111111-1111-1111-1111-111111111111',
        'Deep Work',
        'Cal Newport',
        'https://covers.openlibrary.org/b/id/8314144-L.jpg',
        'want_to_read',
        0,
        NULL,
        timezone('utc'::text, now() - INTERVAL '2 days')
    )
ON CONFLICT (id) DO NOTHING;

-- 7. COMMUNITY POSTS (Shared Passages & Quotes on Community Feed)
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
        'c0000001-0000-0000-0000-000000000001',
        'a1111111-1111-1111-1111-111111111111',
        'The Creative Act: A Way of Being',
        'Rick Rubin',
        'https://covers.openlibrary.org/b/id/13316390-L.jpg',
        'The object of art is not to make art; it is to be in that wonderful state which makes art inevitable.',
        'A masterclass in stripping away self-doubt and seeing the world through childlike curiosity.',
        42,
        5.0,
        'Creativity',
        'passage',
        42,
        6,
        timezone('utc'::text, now() - INTERVAL '1 day')
    ),
    (
        'c0000001-0000-0000-0000-000000000002',
        'a1111111-1111-1111-1111-111111111111',
        'Atomic Habits',
        'James Clear',
        'https://covers.openlibrary.org/b/id/12539702-L.jpg',
        'You do not rise to the level of your goals. You fall to the level of your systems.',
        'Completely changed how I approach my morning deep reading routine. Small, atomic increments win.',
        27,
        5.0,
        'Focus',
        'passage',
        38,
        4,
        timezone('utc'::text, now() - INTERVAL '3 days')
    ),
    (
        'c0000001-0000-0000-0000-000000000003',
        'a1111111-1111-1111-1111-111111111111',
        'Before the Coffee Gets Cold',
        'Toshikazu Kawaguchi',
        'https://covers.openlibrary.org/b/id/10313327-L.jpg',
        'Water flows from high places to low places. That is the nature of gravity. Emotions also seem to act according to gravity.',
        'Warm, melancholy, and wonderfully reflective. Best enjoyed with a hot cup of pour-over.',
        92,
        4.5,
        'Fiction',
        'finished_book',
        27,
        3,
        timezone('utc'::text, now() - INTERVAL '5 days')
    )
ON CONFLICT (id) DO NOTHING;

-- 8. SAVED POSTS (Populates the Saved Passages tab)
INSERT INTO public.saved_posts (
    id,
    user_id,
    post_id,
    created_at
)
VALUES
    ('d0000001-0000-0000-0000-000000000001', 'a1111111-1111-1111-1111-111111111111', 'c0000001-0000-0000-0000-000000000001', timezone('utc'::text, now() - INTERVAL '1 day')),
    ('d0000001-0000-0000-0000-000000000002', 'a1111111-1111-1111-1111-111111111111', 'c0000001-0000-0000-0000-000000000002', timezone('utc'::text, now() - INTERVAL '3 days'))
ON CONFLICT (id) DO NOTHING;

SELECT 
    'Demo account successfully injected!' AS status,
    'demo@liread.com' AS email,
    'test1234' AS password,
    'Julian Reed' AS full_name,
    '385 minutes (7-day streak)' AS reading_stats;
