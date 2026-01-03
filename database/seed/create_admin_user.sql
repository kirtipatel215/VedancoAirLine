-- ================================================================
-- CREATE ADMIN USER FOR VEDANCO AIR
-- ================================================================
-- This script promotes an existing user to admin role
-- 
-- IMPORTANT: You MUST first create the user via Supabase Dashboard
-- because passwords are hashed and managed by Supabase Auth
-- ================================================================

-- ================================================================
-- STEP 1: Create user in Supabase Dashboard
-- ================================================================
-- 1. Go to: Supabase Dashboard → Authentication → Users
-- 2. Click "Add user" → "Create new user"
-- 3. Enter details:
--    Email: admin@vedanco.com
--    Password: VedancoAdmin2025!
--    Check: "Auto Confirm User"
-- 4. Click "Create user"
-- 5. Then run this SQL script below

-- ================================================================
-- STEP 2: Promote user to superadmin
-- ================================================================

-- Update the user's profile to superadmin role
UPDATE public.profiles 
SET 
  role = 'superadmin',
  first_name = 'System',
  last_name = 'Administrator',
  is_operator = false,
  operator_status = NULL
WHERE email = 'admin@vedanco.com';

-- Verify the update
SELECT 
  id,
  email,
  role,
  first_name,
  last_name,
  created_at
FROM public.profiles
WHERE email = 'admin@vedanco.com';

-- ================================================================
-- OPTIONAL: Create additional admin users
-- ================================================================

-- For each additional admin:
-- 1. Create user in Supabase Dashboard (as above)
-- 2. Run this query with their email:

-- UPDATE public.profiles 
-- SET 
--   role = 'admin',  -- or 'superadmin'
--   first_name = 'Admin',
--   last_name = 'User'
-- WHERE email = 'another.admin@vedanco.com';

-- ================================================================
-- ADMIN CREDENTIALS
-- ================================================================

/*
DEFAULT ADMIN ACCOUNT:
=====================
Email: admin@vedanco.com
Password: VedancoAdmin2025!
Role: superadmin

IMPORTANT SECURITY NOTES:
========================
1. Change this password immediately after first login
2. Never commit actual passwords to version control
3. Use strong, unique passwords for production
4. Enable 2FA if available
5. Rotate passwords regularly

ADMIN CAPABILITIES:
==================
✅ View all users, inquiries, quotes, bookings
✅ Approve/reject operator applications
✅ Manage operators (suspend/activate)
✅ View audit logs
✅ Update user profiles
✅ Access all dashboards
✅ Manage system settings

*/

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================

-- Check all admin users
SELECT 
  id,
  email,
  role,
  first_name || ' ' || last_name as full_name,
  is_operator,
  created_at
FROM public.profiles
WHERE role IN ('admin', 'superadmin')
ORDER BY created_at;

-- Check recent audit logs
SELECT 
  actor,
  action,
  resource,
  status,
  created_at
FROM public.audit_logs
ORDER BY created_at DESC
LIMIT 10;

-- ================================================================
-- TROUBLESHOOTING
-- ================================================================

-- If user can't login:
-- 1. Check if email is confirmed in Supabase Auth dashboard
-- 2. Verify role is set correctly (run query above)
-- 3. Check if user is banned:
SELECT id, email, banned_until 
FROM public.profiles 
WHERE email = 'admin@vedanco.com';

-- If banned, unban:
-- UPDATE public.profiles SET banned_until = NULL WHERE email = 'admin@vedanco.com';

-- ================================================================
-- COMPLETE!
-- ================================================================

SELECT 'Admin user setup complete!' as status;
