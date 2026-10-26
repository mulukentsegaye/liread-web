-- ==============================================================================
-- Liread: Only Create Profiles After Email Verification
-- Run this in your Supabase Project -> SQL Editor -> Run
-- ==============================================================================

-- 1. Clean up any unverified profiles currently residing in public.profiles.
-- (This immediately frees up usernames like @yab2 that were created under unconfirmed emails)
DELETE FROM public.profiles 
WHERE id IN (
    SELECT id FROM auth.users 
    WHERE email_confirmed_at IS NULL AND confirmed_at IS NULL
);

-- Also remove the specific unverified typo account if present
DELETE FROM auth.users 
WHERE email = 'babediamond216@gmail.com' 
  AND email_confirmed_at IS NULL;

-- 2. Update the handle_new_user function to verify confirmation first!
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    base_username TEXT;
    final_username TEXT;
    is_confirmed BOOLEAN;
BEGIN
    -- CRITICAL: Only proceed if email is confirmed!
    -- This prevents unverified signups or typo emails from claiming usernames in public.profiles.
    is_confirmed := (NEW.email_confirmed_at IS NOT NULL) OR (NEW.confirmed_at IS NOT NULL);

    IF NOT is_confirmed THEN
        RETURN NEW;
    END IF;

    -- Extract username from metadata or fallback
    base_username := LOWER(TRIM(COALESCE(NEW.raw_user_meta_data->>'username', 'reader_' || substr(NEW.id::text, 1, 8))));
    base_username := REGEXP_REPLACE(base_username, '^@', '');
    IF base_username = '' THEN
        base_username := 'reader_' || substr(NEW.id::text, 1, 8);
    END IF;

    final_username := base_username;

    -- If another user already confirmed with this username, disambiguate with unique suffix
    IF EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username AND id <> NEW.id) THEN
        final_username := final_username || '_' || substr(NEW.id::text, 1, 4);
    END IF;

    -- Insert or update verified user's profile
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
        final_username,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Avid Reader'),
        NEW.raw_user_meta_data->>'avatar_url',
        'Novice Reader',
        60
    )
    ON CONFLICT (id) DO UPDATE SET
        username = CASE 
            WHEN public.profiles.username IS NULL OR public.profiles.username = '' THEN EXCLUDED.username 
            ELSE public.profiles.username 
        END,
        full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Ensure trigger on user creation (handles pre-confirmed users / OAuth)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Trigger on email confirmation (handles standard email signups when user clicks verify)
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
    AFTER UPDATE OF email_confirmed_at, confirmed_at ON auth.users
    FOR EACH ROW 
    WHEN (
        (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL) OR
        (OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL)
    )
    EXECUTE FUNCTION public.handle_new_user();
