# Database Deployment Guide

## Prerequisites

- Access to Supabase Project Dashboard
- Supabase Project URL and anon key
- Admin access to SQL Editor

## Deployment Steps

### Step 1: Backup Existing Data (if applicable)

If you have existing data, export it first:

```bash
# Using Supabase CLI (if installed)
supabase db dump -f backup_$(date +%Y%m%d).sql

# Or use Supabase Dashboard → Database → Backups
```

### Step 2: Deploy Master Schema

1. Open **Supabase Dashboard** → **SQL Editor**
2. Click **New Query**
3. Copy the contents of `database/schema/00_master_schema.sql`
4. Paste into the SQL Editor
5. Click **Run** (or press Cmd/Ctrl + Enter)

**Expected Output:**
```
Vedanco Air database schema created successfully!
table_count: 12
```

### Step 3: Deploy Helper Functions

Deploy each function file in order:

#### Auth Functions
1. Open new query in SQL Editor
2. Copy contents of `database/functions/auth_functions.sql`
3. Run the query

**Expected Output:** `Authentication functions created successfully!`

#### Payment Functions
1. Open new query in SQL Editor
2. Copy contents of `database/functions/payment_functions.sql`
3. Run the query

**Expected Output:** `Payment functions created successfully!`

#### Operator Functions
1. Open new query in SQL Editor  
2. Copy contents of `database/functions/operator_functions.sql`
3. Run the query

**Expected Output:** `Operator functions created successfully!`

### Step 4: Verify Deployment

Run this verification query:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Expected: 12 tables
-- aircraft, audit_logs, bookings, documents, inquiries, 
-- operator_applications, operator_documents, operators, 
-- orders, profiles, quotes, transactions
```

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Expected: All tables should have rowsecurity = true
```

```sql
-- Check functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- Expected: All helper functions listed
```

### Step 5: Create Admin User

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter email: `admin@vedanco.com`
4. Set password
5. Check **Auto Confirm User**
6. Click **Create user**

7. Update the user's role:

```sql
UPDATE profiles 
SET role = 'superadmin' 
WHERE email = 'admin@vedanco.com';
```

### Step 6: Optional - Add Seed Data

If you want test data:

```sql
-- Create a test customer
-- (User must be created via Supabase Auth first)

-- Create a test operator application
INSERT INTO operator_applications (
  company_name, 
  email, 
  country, 
  contact_person
) VALUES (
  'Test Airways', 
  'operator@test.com', 
  'United States',
  'John Doe'
);
```

## Post-Deployment Configuration

### Configure Storage Bucket (for documents)

1. Go to **Supabase Dashboard** → **Storage**
2. Create a new bucket named `documents`
3. Set **Public bucket** to `false`
4. Add storage policies:

```sql
-- Users can upload own documents
CREATE POLICY "Users can upload own documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can view own documents
CREATE POLICY "Users can view own documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

### Update Environment Variables

Update your `.env.local` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Test Connection

Run the connection test:

```bash
npm run test:connection
```

Or manually test:

```typescript
import { supabase } from './supabaseClient';

const { data, error } = await supabase
  .from('profiles')
  .select('count');

console.log('Connected:', !error);
```

## Rollback Procedure

If deployment fails:

1. **Restore from backup:**
```sql
-- Drop all public tables
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Restore from backup file
-- (Use Supabase Dashboard → Database → Restore)
```

2. **Redeploy from known good state**

## Troubleshooting

### Issue: "relation already exists"

**Solution:** The schema file includes `DROP TABLE IF EXISTS`. If you get this error, manually drop the problematic table:

```sql
DROP TABLE IF EXISTS [table_name] CASCADE;
```

### Issue: RLS policies blocking access

**Solution:** Check your user's role:

```sql
SELECT id, email, role, is_operator 
FROM profiles 
WHERE email = 'your_email@example.com';
```

### Issue: Foreign key constraint errors

**Solution:** Ensure you're inserting data in the correct order:
1. profiles (created automatically on auth signup)
2. operators
3. aircraft, inquiries, etc.

### Issue: Functions not executing

**Solution:** Check function permissions:

```sql
-- Grant execute permissions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
```

## Monitoring

### Check Database Health

```sql
-- Table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Check Recent Activity

```sql
SELECT * FROM audit_logs 
ORDER BY created_at DESC 
LIMIT 100;
```

### Check Failed Transactions

```sql
SELECT * FROM transactions 
WHERE status = 'failed' 
ORDER BY created_at DESC;
```

## Next Steps

After successful deployment:

1. ✅ Test customer signup and login
2. ✅ Test operator dashboard access
3. ✅ Create a test inquiry
4. ✅ Submit a test quote
5. ✅ Test payment flow (with test mode)
6. ✅ Verify RLS policies work correctly

## Support

For deployment issues:
- Review Supabase logs: Dashboard → Logs → Database
- Check PostgreSQL error messages
- Verify network connectivity
- Contact development team

---

**Deployment Version**: 2.0  
**Last Updated**: 2025-12-30
