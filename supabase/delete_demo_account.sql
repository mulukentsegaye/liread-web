-- ==============================================================================
-- Liread - Delete Demo Account & Clean Up Database
-- ==============================================================================
-- Run this script in your Supabase SQL Editor whenever you want to remove the
-- demo account and all its associated data completely from your database.
-- Your real user data remains 100% untouched.
-- ==============================================================================

DELETE FROM public.post_comments WHERE user_id = 'a1111111-1111-1111-1111-111111111111';
DELETE FROM public.saved_posts WHERE user_id = 'a1111111-1111-1111-1111-111111111111';
DELETE FROM public.post_upvotes WHERE user_id = 'a1111111-1111-1111-1111-111111111111';
DELETE FROM public.reading_sessions WHERE user_id = 'a1111111-1111-1111-1111-111111111111';
DELETE FROM public.bookshelf WHERE user_id = 'a1111111-1111-1111-1111-111111111111';
DELETE FROM public.posts WHERE user_id = 'a1111111-1111-1111-1111-111111111111';
DELETE FROM public.profiles WHERE id = 'a1111111-1111-1111-1111-111111111111' OR username = 'julian_reed' OR username = 'alex_miller' OR username = 'demoreader';
DELETE FROM auth.identities WHERE user_id = 'a1111111-1111-1111-1111-111111111111';
DELETE FROM auth.users WHERE email = 'demo@liread.com' OR id = 'a1111111-1111-1111-1111-111111111111';

SELECT 'Demo account and all associated data successfully removed from database.' AS result;
