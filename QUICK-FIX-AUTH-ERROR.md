# 🔧 Quick Fix Guide: Authentication Service Error

## The Problem

You're seeing "Authentication Service Unavailable" because **the admin user doesn't exist yet** in your Supabase database.

## The Solution (3 Steps - Takes 2 minutes)

### Step 1: Create Admin User in Supabase

1. **Open Supabase Dashboard**: https://app.supabase.com
2. Select your project: `rdetkdeonjbxzeedkfwn`
3. Go to: **Authentication → Users** (in left sidebar)
4. Click the **"Add user"** button
5. Fill in the form:
   ```
   Email: admin@vedanco.com
   Password: admin123
   ✅ Check "Auto Confirm User"
   ```
6. Click **"Create user"**

### Step 2: Set Admin Role

1. In Supabase Dashboard, go to: **SQL Editor**
2. Click **"New query"**
3. Paste this SQL:
   ```sql
   UPDATE profiles 
   SET role = 'superadmin' 
   WHERE email = 'admin@vedanco.com';
   ```
4. Click **"Run"**
5. You should see: "Success. 1 row affected."

### Step 3: Test Login  

1. Go to your app: http://localhost:3000
2. Navigate to admin login
3. Login with:
   - Email: `admin@vedanco.com`
   - Password: `admin123`

## ✅ What Was Fixed

1. **Improved error messages** - You'll now see specific errors instead of generic "Service Unavailable"
2. **Created setup documentation** - See [`implementation_plan.md`](file:///Users/kirtipatel/.gemini/antigravity/brain/f24237db-7481-4edf-8a23-5dc098daacba/implementation_plan.md) for details
3. **Created SQL helpers** - See [`setup-admin-user.sql`](file:///Users/kirtipatel/Downloads/vedanco-air/setup-admin-user.sql) for verification queries

## 🔍 Troubleshooting

If you still see errors after creating the admin user:

1. **Clear browser cache**: Hard refresh (Cmd+Shift+R on Mac)
2. **Check error message**: Now you'll see specific errors like:
   - "Invalid email or password" = Wrong credentials
   - "Profile Error" = User created but profile missing
   - "Access Denied: Admin privileges required" = User exists but not admin
3. **Verify in database**: Run the queries in `setup-admin-user.sql`

## ⚠️ Important Note

Your Supabase anon key looks unusual:
```
VITE_SUPABASE_ANON_KEY=sb_publishable_6f86Fp1XoGtLGxxX413pBQ_VxvRioTS
```

Standard Supabase keys start with `eyJ...`. Verify this key in:
**Supabase Dashboard → Settings → API → `anon` `public` key**

If it's different, update your `.env` file with the correct key.
