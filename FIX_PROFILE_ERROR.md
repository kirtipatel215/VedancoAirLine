# 🔧 QUICK FIX: Profile Not Found Error

## Problem
You're seeing: **"Profile Error: Your profile could not be found"**

## Cause
The new database schema hasn't been deployed to Supabase yet, or profiles weren't created for existing users.

## Solution

### Option 1: Deploy New Schema (RECOMMENDED)

1. **Open Supabase Dashboard** → **SQL Editor**

2. **Run the master schema:**
   - Open: `database/schema/00_master_schema.sql`
   - Copy all contents
   - Paste in SQL Editor
   - Click **Run**

3. **Run helper functions:**
   - Open: `database/functions/auth_functions.sql`
   - Copy and run in SQL Editor
   - Repeat for `payment_functions.sql`
   - Repeat for `operator_functions.sql`

4. **Refresh your app** - Profile should work now!

---

### Option 2: Quick Fix (If Schema Already Deployed)

Run this in **Supabase SQL Editor**:

```sql
-- Create missing profiles for all users
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
```

Or use the prepared script: `database/seed/fix_missing_profiles.sql`

---

### Option 3: Manual Profile Creation

If you just need to create one profile:

```sql
-- Replace the UUID and email with your actual user ID and email
INSERT INTO public.profiles (id, email, role, first_name, last_name)
VALUES (
  'YOUR_USER_ID_HERE'::uuid,
  'your.email@example.com',
  'customer',
  'Your',
  'Name'
);
```

---

## Verify Fix

Run this to check:

```sql
SELECT * FROM public.profiles WHERE id = auth.uid();
```

Should return your profile data.

---

## Next Steps

1. ✅ Deploy schema (Option 1)
2. ✅ Refresh your browser
3. ✅ Try logging in again
4. ✅ Profile should work!

---

## Still Having Issues?

### Check if schema is deployed:
```sql
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'profiles';
```

- Returns **1** = Schema deployed ✅
- Returns **0** = Need to deploy schema ❌

### Check if trigger exists:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

- Returns data = Trigger exists ✅
- Returns nothing = Need to deploy schema ❌

---

**Quick deployment:** Run `database/schema/00_master_schema.sql` in Supabase SQL Editor
