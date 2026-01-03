-- ================================================================
-- QUICK FIX: Profile Not Found Error
-- ================================================================
-- Run this in Supabase SQL Editor to fix profile errors
-- ================================================================

-- Step 1: Check if profiles table exists
SELECT COUNT(*) as profile_count 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'profiles';
-- If returns 0, you need to deploy the schema first!

-- Step 2: Check if your user has a profile
SELECT * FROM public.profiles 
WHERE id = auth.uid();
-- If returns nothing, your profile is missing

-- Step 3: Create missing profiles for all users
INSERT INTO public.profiles (id, email, first_name, last_name, role)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'first_name', ''),
  COALESCE(u.raw_user_meta_data->>'last_name', ''),
  COALESCE(u.raw_user_meta_data->>'role', 'customer')
FROM auth.users u
WHERE u.id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- Step 4: Verify the fix
SELECT 
  id,
  email,
  role,
  first_name,
  last_name,
  created_at
FROM public.profiles
ORDER BY created_at DESC;

-- ================================================================
-- If you still get errors, the schema is not deployed
-- ================================================================

-- Check which tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Expected: 12 tables
-- If you see fewer, run database/schema/00_master_schema.sql

SELECT '✅ Profile fix complete! Refresh your app.' as status;
