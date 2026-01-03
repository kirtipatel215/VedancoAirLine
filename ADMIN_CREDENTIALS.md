# 🔐 Vedanco Air - Admin Access

## Default Admin Credentials

```
Email:    admin@vedanco.com
Password: VedancoAdmin2025!
Role:     superadmin
```

⚠️ **IMPORTANT**: Change this password immediately after first login!

## Admin Panel Access

### Local Development
```
URL: http://localhost:5173/admin
```

### Production
```
URL: https://your-domain.com/admin
```

## Setup Instructions

### Step 1: Create Admin User in Supabase

1. Open **Supabase Dashboard** → **Authentication** → **Users**
2. Click **"Add user"** → **"Create new user"**
3. Enter the following:
   - **Email**: `admin@vedanco.com`
   - **Password**: `VedancoAdmin2025!`
   - ✅ Check **"Auto Confirm User"**
4. Click **"Create user"**

### Step 2: Promote to Admin Role

Run this in **Supabase SQL Editor**:

```sql
UPDATE public.profiles 
SET 
  role = 'superadmin',
  first_name = 'System',
  last_name = 'Administrator'
WHERE email = 'admin@vedanco.com';
```

Or use the prepared script:
```bash
# Run in Supabase SQL Editor
database/seed/create_admin_user.sql
```

### Step 3: Verify Setup

```sql
SELECT id, email, role, first_name, last_name
FROM public.profiles
WHERE email = 'admin@vedanco.com';
```

Expected result:
- **role**: `superadmin`
- **first_name**: `System`
- **last_name**: `Administrator`

### Step 4: Login

1. Go to your application
2. Click **"Login"** or go to `/login`
3. Enter credentials:
   - Email: `admin@vedanco.com`
   - Password: `VedancoAdmin2025!`
4. You should be redirected to the admin dashboard

## Admin Capabilities

### ✅ What Admins Can Do

- **Users**: View all users, update profiles, ban/unban users
- **Operators**: Approve/reject applications, manage operator status
- **Inquiries**: View all customer inquiries
- **Quotes**: View all operator quotes
- **Bookings**: View and manage all bookings
- **Transactions**: View payment history
- **Audit Logs**: Review system activity
- **Settings**: Configure system parameters

### 📊 Admin Dashboard Features

- Real-time statistics and metrics
- User management panel
- Operator application review
- Financial reports
- System health monitoring
- Audit trail viewer

## Security Best Practices

### 🔒 Immediate Actions
1. ✅ Change default password
2. ✅ Enable 2FA (if available)
3. ✅ Review audit logs regularly
4. ✅ Create individual admin accounts (don't share)

### 🛡️ Ongoing Security
- Rotate passwords every 90 days
- Use strong, unique passwords
- Never share credentials
- Monitor admin activity via audit logs
- Review user permissions quarterly

## Creating Additional Admin Users

### For Regular Admins
```sql
-- 1. Create user in Supabase Dashboard first
-- 2. Then run:
UPDATE public.profiles 
SET role = 'admin'
WHERE email = 'new.admin@vedanco.com';
```

### For Super Admins
```sql
-- 1. Create user in Supabase Dashboard first
-- 2. Then run:
UPDATE public.profiles 
SET role = 'superadmin'
WHERE email = 'new.superadmin@vedanco.com';
```

## Role Differences

| Capability | Admin | Superadmin |
|------------|-------|------------|
| View all data | ✅ | ✅ |
| Manage users | ✅ | ✅ |
| Approve operators | ✅ | ✅ |
| View audit logs | ✅ | ✅ |
| System settings | ❌ | ✅ |
| Delete records | ❌ | ✅ |
| Manage other admins | ❌ | ✅ |

## Troubleshooting

### Cannot Login
**Check:**
1. User exists in Supabase Auth
2. Email is confirmed
3. Role is set to `admin` or `superadmin`
4. User is not banned

**Fix:**
```sql
-- Check status
SELECT id, email, role, banned_until 
FROM public.profiles 
WHERE email = 'admin@vedanco.com';

-- If banned, unban:
UPDATE public.profiles 
SET banned_until = NULL 
WHERE email = 'admin@vedanco.com';
```

### Access Denied Errors
**Check:**
```sql
-- Verify role
SELECT role FROM public.profiles 
WHERE id = auth.uid();
```

Should return `admin` or `superadmin`.

### Reset Password
1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Find the user
3. Click **"..."** → **"Reset Password"**
4. Follow the email instructions

## Support

For admin access issues:
1. Check deployment guide: `database/docs/deployment_guide.md`
2. Review RLS policies in schema
3. Check Supabase logs
4. Contact development team

---

**⚠️ SECURITY WARNING**  
This file contains sensitive credentials. In production:
- Never commit to version control
- Store in secure password manager
- Use environment variables
- Enable audit logging

**Document Version**: 1.0  
**Last Updated**: 2025-12-30
