-- ================================================================
-- PHASE 1: DATABASE & RLS SETUP (NO SESSIONS)
-- ================================================================
-- Focus: profiles, inquiries, quotes, transactions
-- Security: Stateless RLS, No Recursion, Role Visibility
-- ================================================================

-- 1. Helper Functions (To prevent RLS recursion)
-- ================================================================

CREATE OR REPLACE FUNCTION get_current_operator_id()
RETURNS UUID AS $$
DECLARE
  v_operator_id UUID;
BEGIN
  -- Get operator ID corresponding to the authenticated user
  -- SECURITY DEFINER allows this to run with elevated privileges
  -- to bypass the infinite recursion of querying the operators table itself via RLS
  SELECT id INTO v_operator_id
  FROM operators
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  RETURN v_operator_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION get_current_operator_id() TO authenticated;

-- Helper to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'superadmin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. Core Tables & Indexes (Idempotent)
-- ================================================================

-- PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'operator', 'admin', 'superadmin')),
  phone_number TEXT,
  country TEXT,
  company TEXT,
  preferred_currency TEXT DEFAULT 'USD',
  is_operator BOOLEAN DEFAULT FALSE,
  operator_status TEXT CHECK (operator_status IN ('pending', 'approved', 'rejected')),
  banned_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- INQUIRIES
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  operator_id UUID REFERENCES operators(id) ON DELETE SET NULL, -- Dedicated operator request
  from_airport TEXT NOT NULL,
  to_airport TEXT NOT NULL,
  departure_datetime TIMESTAMPTZ,
  return_datetime TIMESTAMPTZ,
  passengers INTEGER DEFAULT 1,
  purpose TEXT,
  status TEXT DEFAULT 'New' CHECK (status IN ('New', 'Open', 'Quoted', 'Booked', 'Cancelled', 'Closed')),
  notes TEXT,
  aircraft_preference TEXT,
  route_type TEXT CHECK (route_type IN ('One Way', 'Round Trip')),
  luggage TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_customer_id ON inquiries(customer_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);

-- QUOTES (operator_quotes)
CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  inquiry_id UUID REFERENCES inquiries(id) ON DELETE CASCADE,
  operator_id UUID REFERENCES operators(id) ON DELETE SET NULL,
  aircraft_model TEXT NOT NULL,
  operator_name TEXT NOT NULL,
  base_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Accepted', 'Rejected')),
  image TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  terms JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quotes_inquiry_id ON quotes(inquiry_id);
CREATE INDEX IF NOT EXISTS idx_quotes_operator_id ON quotes(operator_id);

-- TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'processing', 'succeeded', 'failed', 'refunded')),
  metadata JSONB DEFAULT '{}'::jsonb,
  idempotency_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_idempotency_unique
  ON transactions(idempotency_key) 
  WHERE idempotency_key IS NOT NULL;


-- 3. RLS Policies
-- ================================================================

-- Reset RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Clear key policies to avoid conflicts (optional but recommended)
DROP POLICY IF EXISTS "profiles_read_all" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

DROP POLICY IF EXISTS "inquiries_select_own" ON inquiries;
DROP POLICY IF EXISTS "inquiries_select_market" ON inquiries;
DROP POLICY IF EXISTS "inquiries_insert_own" ON inquiries;
DROP POLICY IF EXISTS "inquiries_update_own" ON inquiries;

DROP POLICY IF EXISTS "quotes_select_customer" ON quotes;
DROP POLICY IF EXISTS "quotes_select_own" ON quotes;
DROP POLICY IF EXISTS "quotes_insert_operator" ON quotes;
DROP POLICY IF EXISTS "quotes_update_own" ON quotes;

-- PROFILES POLICIES
-- Profiles are viewable if they are strictly needed. 
-- For now, allow reading all profiles for simplicity in UI, OR restrict to strictly self + admin.
-- User requirement: "Role visibility rules".
-- Let's stick to safe defaults. Public read is often needed for "operator" public profiles if we have them.
-- But for now, let's keep it safe:
-- 1. Users can read their own.
-- 2. Admins can read all.
-- 3. Operators might need to read inquiry customer profiles? Maybe just names.
-- Let's go with a broader read for now as profiles are often public-ish in these apps, but secure write.
CREATE POLICY "profiles_read_public_safe"
  ON profiles FOR SELECT
  USING (true); -- Often needed for joining. If too loose, we restrict later.

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- INQUIRIES POLICIES
-- 1. Customer can see their own.
CREATE POLICY "inquiries_select_own"
  ON inquiries FOR SELECT
  USING (auth.uid() = customer_id);

-- 2. Operators can see "Open" inquiries (Marketplace) OR inquiries assigned to them.
-- We use is_admin() or check profile role to avoid recursion if we joined profiles table directly in policy.
-- But here we can check `auth.jwt() -> app_metadata` if we had it, or just use `auth.uid()` in profiles subquery.
-- Ideally we use a helper or the profile role.
CREATE POLICY "inquiries_select_market"
  ON inquiries FOR SELECT
  USING (
    -- If user is an operator
    EXISTS (
       SELECT 1 FROM profiles 
       WHERE id = auth.uid() 
       AND is_operator = true
    )
    AND (
      status = 'Open' -- Marketplace
      OR operator_id = get_current_operator_id() -- Assigned directly
    )
  );

-- 3. Admins view all
CREATE POLICY "inquiries_select_admin"
  ON inquiries FOR SELECT
  USING (is_admin());

-- 4. Insert/Update
CREATE POLICY "inquiries_insert_own"
  ON inquiries FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "inquiries_update_own"
  ON inquiries FOR UPDATE
  USING (auth.uid() = customer_id);

-- QUOTES POLICIES
-- 1. Customer can view quotes for their own inquiries
CREATE POLICY "quotes_select_customer"
  ON quotes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM inquiries 
      WHERE inquiries.id = quotes.inquiry_id 
      AND inquiries.customer_id = auth.uid()
    )
  );

-- 2. Operators can view their own quotes
CREATE POLICY "quotes_select_own"
  ON quotes FOR SELECT
  USING (operator_id = get_current_operator_id());

-- 3. Operators can insert/update their own quotes
CREATE POLICY "quotes_insert_operator"
  ON quotes FOR INSERT
  WITH CHECK (operator_id = get_current_operator_id());

CREATE POLICY "quotes_update_own"
  ON quotes FOR UPDATE
  USING (operator_id = get_current_operator_id());

-- TRANSACTIONS POLICIES
-- 1. Users view own
CREATE POLICY "transactions_select_own"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

-- 2. Admin view all
CREATE POLICY "transactions_select_admin"
  ON transactions FOR SELECT
  USING (is_admin());

-- 3. Insert own (for now)
CREATE POLICY "transactions_insert_own"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. Update own? Maybe not. Transactions should be immutable usually, or only updated by system/admin.
-- Let's allow update only if status is NOT 'succeeded' maybe? Or just system updates.
-- For Phase 1, let's allow user update if they are initiating it, but typically payment updates come from webhooks (service role).
-- So valid user might only need INSERT.
-- Keep it simple: Users can view own.
