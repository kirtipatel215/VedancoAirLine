-- ================================================================
-- VEDANCO AIR - UNIFIED DATABASE SCHEMA
-- ================================================================
-- Complete production-ready database schema for Vedanco Air
-- Private Jet Charter Platform
-- 
-- Version: 2.0
-- Last Updated: 2025-12-30
-- 
-- USAGE: Run this file in Supabase SQL Editor to initialize database
-- ================================================================

-- ================================================================
-- EXTENSIONS
-- ================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ================================================================
-- CLEANUP (Use with caution - drops all existing tables)
-- ================================================================

DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.operator_documents CASCADE;
DROP TABLE IF EXISTS public.documents CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.quotes CASCADE;
DROP TABLE IF EXISTS public.aircraft CASCADE;
DROP TABLE IF EXISTS public.inquiries CASCADE;
DROP TABLE IF EXISTS public.operators CASCADE;
DROP TABLE IF EXISTS public.operator_applications CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop old admin table if exists
DROP TABLE IF EXISTS public.admins CASCADE;

-- ================================================================
-- TABLE 1: PROFILES
-- ================================================================
-- Extends auth.users with additional user information
-- Supports roles: customer, operator, admin, superadmin

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'operator', 'admin', 'superadmin')),
  phone_number TEXT,
  country TEXT,
  company TEXT,
  preferred_currency TEXT DEFAULT 'USD',
  home_airport TEXT,
  is_operator BOOLEAN DEFAULT FALSE,
  operator_status TEXT CHECK (operator_status IN ('pending', 'approved', 'rejected')),
  banned_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_operator ON profiles(id) WHERE is_operator = true;
CREATE INDEX idx_profiles_banned_until ON profiles(banned_until) WHERE banned_until IS NOT NULL;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Profiles viewable by everyone" 
  ON profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- ================================================================
-- TABLE 2: OPERATOR_APPLICATIONS
-- ================================================================
-- Operator onboarding applications

CREATE TABLE public.operator_applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  country TEXT,
  contact_person TEXT,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'Applied' CHECK (status IN ('Applied', 'Under Review', 'Approved', 'Rejected')),
  rejection_reason TEXT,
  sla_deadline TIMESTAMPTZ,
  details JSONB DEFAULT '{}'::jsonb,
  contact_info JSONB DEFAULT '{}'::jsonb,
  business_info JSONB DEFAULT '{}'::jsonb,
  operations_info JSONB DEFAULT '{}'::jsonb,
  fleet_details JSONB DEFAULT '[]'::jsonb,
  declarations JSONB DEFAULT '{}'::jsonb,
  documents JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_operator_applications_email ON operator_applications(email);
CREATE INDEX idx_operator_applications_status ON operator_applications(status);
CREATE INDEX idx_operator_applications_user_id ON operator_applications(user_id);

-- Enable RLS
ALTER TABLE public.operator_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can submit operator application" 
  ON operator_applications FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can view own applications" 
  ON operator_applications FOR SELECT 
  USING (
    auth.uid() = user_id
    OR email IN (SELECT email FROM profiles WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can update applications" 
  ON operator_applications FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- ================================================================
-- TABLE 3: OPERATORS
-- ================================================================
-- Active operator directory

CREATE TABLE public.operators (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  application_id UUID REFERENCES operator_applications(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  country TEXT,
  company_name TEXT,
  bank_account TEXT,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Active', 'Suspended', 'Pending', 'Inactive')),
  aircraft_count INTEGER DEFAULT 0,
  rating NUMERIC(3,1) DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
  sla_score NUMERIC DEFAULT 100,
  approval_date TIMESTAMPTZ,
  approved_by UUID REFERENCES profiles(id),
  joined_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT operators_identifier_check CHECK (email IS NOT NULL OR user_id IS NOT NULL)
);

-- Indexes
CREATE INDEX idx_operators_email ON operators(email);
CREATE INDEX idx_operators_user_id ON operators(user_id);
CREATE INDEX idx_operators_status ON operators(status);
CREATE INDEX idx_operators_active ON operators(status) WHERE status = 'Active';

-- Enable RLS
ALTER TABLE public.operators ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can view active operators" 
  ON operators FOR SELECT 
  USING (
    status = 'Active' 
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Operators can view their own record"
  ON operators FOR SELECT
  USING (
    email IN (SELECT email FROM profiles WHERE id = auth.uid())
    OR user_id = auth.uid()
  );

CREATE POLICY "Operators can update their own record"
  ON operators FOR UPDATE
  USING (
    email IN (SELECT email FROM profiles WHERE id = auth.uid())
    OR user_id = auth.uid()
  )
  WITH CHECK (
    -- Prevent operators from changing critical fields
    status = (SELECT status FROM operators o2 WHERE o2.id = operators.id)
    AND approval_date = (SELECT approval_date FROM operators o2 WHERE o2.id = operators.id)
  );

CREATE POLICY "Admins can manage operators" 
  ON operators FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- ================================================================
-- TABLE 4: AIRCRAFT
-- ================================================================
-- Operator fleet management

CREATE TABLE public.aircraft (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  operator_id UUID REFERENCES operators(id) ON DELETE CASCADE NOT NULL,
  registration TEXT NOT NULL,
  model TEXT NOT NULL,
  type TEXT CHECK (type IN ('Light', 'Midsize', 'Heavy', 'Ultra Long')),
  seats INTEGER NOT NULL,
  base TEXT NOT NULL,
  status TEXT CHECK (status IN ('Active', 'Maintenance')) DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_aircraft_operator_id ON aircraft(operator_id);
CREATE INDEX idx_aircraft_operator_status ON aircraft(operator_id, status);
CREATE INDEX idx_aircraft_registration ON aircraft(registration);

-- Enable RLS
ALTER TABLE public.aircraft ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Operators can view their own aircraft"
  ON aircraft FOR SELECT
  USING (
    operator_id IN (
      SELECT o.id FROM operators o
      JOIN profiles p ON p.email = o.email 
      WHERE p.id = auth.uid()
    )
    OR operator_id IN (
      SELECT id FROM operators WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Operators can insert their own aircraft"
  ON aircraft FOR INSERT
  WITH CHECK (
    operator_id IN (
      SELECT o.id FROM operators o
      JOIN profiles p ON p.email = o.email 
      WHERE p.id = auth.uid()
    )
    OR operator_id IN (
      SELECT id FROM operators WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Operators can update their own aircraft"
  ON aircraft FOR UPDATE
  USING (
    operator_id IN (
      SELECT o.id FROM operators o
      JOIN profiles p ON p.email = o.email 
      WHERE p.id = auth.uid()
    )
    OR operator_id IN (
      SELECT id FROM operators WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Operators can delete their own aircraft"
  ON aircraft FOR DELETE
  USING (
    operator_id IN (
      SELECT o.id FROM operators o
      JOIN profiles p ON p.email = o.email 
      WHERE p.id = auth.uid()
    )
    OR operator_id IN (
      SELECT id FROM operators WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all aircraft"
  ON aircraft FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- ================================================================
-- TABLE 5: INQUIRIES
-- ================================================================
-- Customer booking requests / marketplace

CREATE TABLE public.inquiries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  operator_id UUID REFERENCES operators(id) ON DELETE SET NULL,
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

-- Indexes
CREATE INDEX idx_inquiries_customer_id ON inquiries(customer_id);
CREATE INDEX idx_inquiries_operator_id ON inquiries(operator_id) WHERE operator_id IS NOT NULL;
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_status_created ON inquiries(status, created_at DESC);
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at DESC);

-- Enable RLS
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Customers can view own inquiries" 
  ON inquiries FOR SELECT 
  USING (auth.uid() = customer_id);

CREATE POLICY "Operators can view marketplace inquiries"
  ON inquiries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND is_operator = true
    )
  );

CREATE POLICY "Admins can view all inquiries"
  ON inquiries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Customers can insert inquiries" 
  ON inquiries FOR INSERT 
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update own inquiries" 
  ON inquiries FOR UPDATE 
  USING (auth.uid() = customer_id);

CREATE POLICY "Operators can update assigned inquiries"
  ON inquiries FOR UPDATE
  USING (
    operator_id IN (
      SELECT id FROM operators 
      WHERE user_id = auth.uid() 
      OR email IN (SELECT email FROM profiles WHERE id = auth.uid())
    )
  );

-- ================================================================
-- TABLE 6: QUOTES
-- ================================================================
-- Operator proposals for inquiries

CREATE TABLE public.quotes (
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
  specs JSONB DEFAULT '{}'::jsonb,
  tax_breakup JSONB DEFAULT '{}'::jsonb,
  valid_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_quotes_inquiry_id ON quotes(inquiry_id);
CREATE INDEX idx_quotes_operator_id ON quotes(operator_id);
CREATE INDEX idx_quotes_operator_status ON quotes(operator_id, status) WHERE operator_id IS NOT NULL;
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_created_at ON quotes(created_at DESC);

-- Enable RLS
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Customers can view quotes for their inquiries"
  ON quotes FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM inquiries 
      WHERE inquiries.id = quotes.inquiry_id 
      AND inquiries.customer_id = auth.uid()
    )
  );

CREATE POLICY "Operators can view their own quotes"
  ON quotes FOR SELECT
  USING (
    operator_id IN (
      SELECT id FROM operators 
      WHERE user_id = auth.uid() 
      OR email IN (SELECT email FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Operators can view all marketplace quotes"
  ON quotes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND is_operator = true
    )
  );

CREATE POLICY "Admins can view all quotes"
  ON quotes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Operators can insert quotes" 
  ON quotes FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND (is_operator = true OR role IN ('admin', 'superadmin'))
    )
  );

CREATE POLICY "Operators can update own quotes" 
  ON quotes FOR UPDATE 
  USING (
    operator_id IN (
      SELECT id FROM operators 
      WHERE user_id = auth.uid() 
      OR email IN (SELECT email FROM profiles WHERE id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Customers can update quote status"
  ON quotes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM inquiries 
      WHERE inquiries.id = quotes.inquiry_id 
      AND inquiries.customer_id = auth.uid()
    )
  );

-- ================================================================
-- TABLE 7: BOOKINGS
-- ================================================================
-- Confirmed reservations

CREATE TABLE public.bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  booking_reference TEXT UNIQUE NOT NULL,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Alias for customer_id
  operator_id UUID REFERENCES operators(id) ON DELETE SET NULL,
  route TEXT,
  origin TEXT,
  destination TEXT,
  departure_datetime TIMESTAMPTZ,
  aircraft_model TEXT,
  status TEXT DEFAULT 'Confirmed' CHECK (status IN ('Confirmed', 'In-Flight', 'Completed', 'Cancelled')),
  payment_status TEXT DEFAULT 'not_started' CHECK (payment_status IN ('not_started', 'processing', 'succeeded', 'failed')),
  total_amount NUMERIC,
  pax_count INTEGER,
  catering_preference TEXT,
  ground_transport TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_operator_id ON bookings(operator_id);
CREATE INDEX idx_bookings_operator_status ON bookings(operator_id, status) WHERE operator_id IS NOT NULL;
CREATE INDEX idx_bookings_reference ON bookings(booking_reference);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at DESC);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Customers can view own bookings" 
  ON bookings FOR SELECT 
  USING (
    auth.uid() = customer_id 
    OR auth.uid() = user_id
  );

CREATE POLICY "Operators can view their bookings"
  ON bookings FOR SELECT
  USING (
    operator_id IN (
      SELECT id FROM operators 
      WHERE user_id = auth.uid() 
      OR email IN (SELECT email FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Admins can view all bookings"
  ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Customers can insert own bookings" 
  ON bookings FOR INSERT 
  WITH CHECK (
    auth.uid() = customer_id 
    OR auth.uid() = user_id
  );

CREATE POLICY "Customers can update own bookings"
  ON bookings FOR UPDATE 
  USING (
    auth.uid() = customer_id 
    OR auth.uid() = user_id
  );

CREATE POLICY "Operators can update their bookings"
  ON bookings FOR UPDATE
  USING (
    operator_id IN (
      SELECT id FROM operators 
      WHERE user_id = auth.uid() 
      OR email IN (SELECT email FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Admins can update any booking"
  ON bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- ================================================================
-- TABLE 8: ORDERS
-- ================================================================
-- Purchase order records

CREATE TABLE public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_reference TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  order_type TEXT DEFAULT 'charter' CHECK (order_type IN ('charter', 'membership', 'service')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'completed', 'cancelled')),
  subtotal NUMERIC NOT NULL,
  tax_amount NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  special_requests TEXT,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  order_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_reference ON orders(order_reference);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Customers can view own orders" 
  ON orders FOR SELECT 
  USING (auth.uid() = customer_id);

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Customers can insert own orders" 
  ON orders FOR INSERT 
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update own orders"
  ON orders FOR UPDATE 
  USING (auth.uid() = customer_id);

CREATE POLICY "Admins can update any order"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- ================================================================
-- TABLE 9: TRANSACTIONS
-- ================================================================
-- Payment transaction records with ACID compliance

CREATE TABLE public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'processing', 'succeeded', 'failed', 'refunded')),
  description TEXT,
  payment_method TEXT,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  invoice_pdf_url TEXT,
  idempotency_key TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  gateway_reference TEXT,
  attempt_count INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_quote_id ON transactions(quote_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- Unique constraints for ACID compliance
CREATE UNIQUE INDEX idx_transactions_idempotency_unique
  ON transactions(idempotency_key) 
  WHERE idempotency_key IS NOT NULL;

CREATE UNIQUE INDEX idx_transactions_quote_succeeded_unique
  ON transactions(quote_id) 
  WHERE status = 'succeeded';

CREATE INDEX idx_transactions_idempotency 
  ON transactions(idempotency_key) 
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX idx_transactions_status_processing
  ON transactions(status)
  WHERE status = 'processing';

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own transactions" 
  ON transactions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions"
  ON transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Users can insert own transactions" 
  ON transactions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "System can update transactions"
  ON transactions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- ================================================================
-- TABLE 10: DOCUMENTS
-- ================================================================
-- Document storage metadata

CREATE TABLE public.documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  file_url TEXT,
  storage_path TEXT,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Verified', 'Rejected')),
  rejection_reason TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_status ON documents(status);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own documents" 
  ON documents FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all documents"
  ON documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Users can insert own documents" 
  ON documents FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update documents" 
  ON documents FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- ================================================================
-- TABLE 11: OPERATOR_DOCUMENTS
-- ================================================================
-- Operator compliance documents

CREATE TABLE public.operator_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  operator_id UUID REFERENCES operators(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT,
  file_size INTEGER,
  status TEXT CHECK (status IN ('Pending', 'Approved', 'Rejected')) DEFAULT 'Pending',
  expiry_date DATE,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id),
  rejection_reason TEXT
);

-- Indexes
CREATE INDEX idx_operator_documents_operator ON operator_documents(operator_id, status);
CREATE INDEX idx_operator_documents_expiry ON operator_documents(expiry_date) 
  WHERE expiry_date IS NOT NULL;

-- Enable RLS
ALTER TABLE public.operator_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Operators can view their own documents"
  ON operator_documents FOR SELECT
  USING (
    operator_id IN (
      SELECT o.id FROM operators o
      JOIN profiles p ON p.email = o.email 
      WHERE p.id = auth.uid()
    )
    OR operator_id IN (
      SELECT id FROM operators WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Operators can insert their own documents"
  ON operator_documents FOR INSERT
  WITH CHECK (
    operator_id IN (
      SELECT o.id FROM operators o
      JOIN profiles p ON p.email = o.email 
      WHERE p.id = auth.uid()
    )
    OR operator_id IN (
      SELECT id FROM operators WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Operators can update their own documents"
  ON operator_documents FOR UPDATE
  USING (
    operator_id IN (
      SELECT o.id FROM operators o
      JOIN profiles p ON p.email = o.email 
      WHERE p.id = auth.uid()
    )
    OR operator_id IN (
      SELECT id FROM operators WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all operator documents"
  ON operator_documents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- ================================================================
-- TABLE 12: AUDIT_LOGS
-- ================================================================
-- System activity tracking

CREATE TABLE public.audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  resource TEXT,
  status TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view audit logs" 
  ON audit_logs FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "System can insert audit logs" 
  ON audit_logs FOR INSERT 
  WITH CHECK (true);

-- ================================================================
-- TRIGGERS
-- ================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_operator_applications_updated_at 
  BEFORE UPDATE ON operator_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_operators_updated_at 
  BEFORE UPDATE ON operators
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aircraft_updated_at 
  BEFORE UPDATE ON aircraft
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inquiries_updated_at 
  BEFORE UPDATE ON inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at 
  BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at 
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at 
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================================================
-- PERMISSIONS
-- ================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- ================================================================
-- COMPLETION
-- ================================================================

SELECT 
  'Vedanco Air database schema created successfully!' as message,
  COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';
