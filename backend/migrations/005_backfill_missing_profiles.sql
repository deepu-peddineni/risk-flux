-- ============================================================
-- Risk-Flux — Backfill missing profiles for existing auth users
-- Run this in the Supabase SQL Editor if existing users get
-- "User profile not found" when logging in
-- ============================================================

INSERT INTO public.profiles (id, username, display_name, email, role)
SELECT
  au.id,
  COALESCE(au.raw_user_meta_data ->> 'username', split_part(au.email, '@', 1)),
  COALESCE(au.raw_user_meta_data ->> 'display_name', split_part(au.email, '@', 1)),
  au.email,
  'user'
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL;
