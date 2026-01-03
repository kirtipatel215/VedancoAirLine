-- ================================================================
-- FINAL FIX: Complete RLS Policy Rebuild (No Recursion)
-- ================================================================
-- This completely rebuilds RLS policies to eliminate infinite recursion
-- Run this ENTIRE script in Supabase SQL Editor
-- ================================================================

-- ================================================================
-- STEP 1: Disable RLS temporarily to clean up
-- ================================================================
ALTER TABLE operators DISABLE ROW LEVEL SECURITY;
ALTER TABLE aircraft DISABLE ROW LEVEL SECURITY;

-- ================================================================
-- STEP 2: Drop ALL existing policies
-- ================================================================
DROP POLICY IF EXISTS "Public can view active operators" ON operators;
DROP POLICY IF EXISTS "Operators can view their own record" ON operators;
DROP POLICY IF EXISTS "Operators can update their own record" ON operators;
DROP POLICY IF EXISTS "Admins can manage operators" ON operators;

DROP POLICY IF EXISTS "Operators can view their own aircraft" ON aircraft;
DROP POLICY IF EXISTS "Operators can insert their own aircraft" ON aircraft;
DROP POLICY IF EXISTS "Operators can update their own aircraft" ON aircraft;
DROP POLICY IF EXISTS "Operators can delete their own aircraft" ON aircraft;
DROP POLICY IF EXISTS "Admins can manage all aircraft" ON aircraft;

-- ================================================================
-- STEP 3: Create helper function to get operator_id (SECURITY DEFINER)
-- ================================================================
-- This function bypasses RLS to avoid recursion
CREATE OR REPLACE FUNCTION get_current_operator_id()
RETURNS UUID AS $$
DECLARE
  v_operator_id UUID;
BEGIN
  -- Get operator ID directly using auth.uid()
  SELECT id INTO v_operator_id
  FROM operators
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  RETURN v_operator_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_current_operator_id() TO authenticated;

-- ================================================================
-- STEP 4: Recreate OPERATORS policies (simplified, no recursion)
-- ================================================================
ALTER TABLE operators ENABLE ROW LEVEL SECURITY;

-- Public can view active operators
CREATE POLICY "operators_select_public"
  ON operators FOR SELECT
  USING (
    status = 'Active' 
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- Operators can view their own record (using user_id only)
CREATE POLICY "operators_select_own"
  ON operators FOR SELECT
  USING (user_id = auth.uid());

-- Operators can update their own record (using user_id only)
CREATE POLICY "operators_update_own"
  ON operators FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins can do everything
CREATE POLICY "operators_all_admin"
  ON operators FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- ================================================================
-- STEP 5: Recreate AIRCRAFT policies (using helper function)
-- ================================================================
ALTER TABLE aircraft ENABLE ROW LEVEL SECURITY;

-- Operators can SELECT their own aircraft
CREATE POLICY "aircraft_select_own"
  ON aircraft FOR SELECT
  USING (operator_id = get_current_operator_id());

-- Operators can INSERT their own aircraft
CREATE POLICY "aircraft_insert_own"
  ON aircraft FOR INSERT
  WITH CHECK (operator_id = get_current_operator_id());

-- Operators can UPDATE their own aircraft
CREATE POLICY "aircraft_update_own"
  ON aircraft FOR UPDATE
  USING (operator_id = get_current_operator_id())
  WITH CHECK (operator_id = get_current_operator_id());

-- Operators can DELETE their own aircraft
CREATE POLICY "aircraft_delete_own"
  ON aircraft FOR DELETE
  USING (operator_id = get_current_operator_id());

-- Admins can do everything
CREATE POLICY "aircraft_all_admin"
  ON aircraft FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- ================================================================
-- STEP 6: Update operator_documents policies similarly
-- ================================================================
ALTER TABLE operator_documents DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Operators can view their own documents" ON operator_documents;
DROP POLICY IF EXISTS "Operators can insert their own documents" ON operator_documents;
DROP POLICY IF EXISTS "Operators can update their own documents" ON operator_documents;
DROP POLICY IF EXISTS "Admins can manage all operator documents" ON operator_documents;

ALTER TABLE operator_documents ENABLE ROW LEVEL SECURITY;

-- Use the helper function for operator_documents too
CREATE POLICY "operator_docs_select_own"
  ON operator_documents FOR SELECT
  USING (operator_id = get_current_operator_id());

CREATE POLICY "operator_docs_insert_own"
  ON operator_documents FOR INSERT
  WITH CHECK (operator_id = get_current_operator_id());

CREATE POLICY "operator_docs_update_own"
  ON operator_documents FOR UPDATE
  USING (operator_id = get_current_operator_id());

CREATE POLICY "operator_docs_all_admin"
  ON operator_documents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

-- ================================================================
-- STEP 7: Verification
-- ================================================================
SELECT 
  '✅ RLS Policies Rebuilt Successfully!' as status,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('operators', 'aircraft', 'operator_documents');

-- List all policies
SELECT 
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN 'USING clause exists'
    ELSE 'No USING clause'
  END as has_using,
  CASE 
    WHEN with_check IS NOT NULL THEN 'WITH CHECK exists'
    ELSE 'No WITH CHECK'
  END as has_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('operators', 'aircraft', 'operator_documents')
ORDER BY tablename, policyname;

-- ================================================================
-- Test the helper function
-- ================================================================
SELECT 
  'Testing helper function...' as test,
  get_current_operator_id() as current_operator_id;

SELECT '🎉 COMPLETE! Try adding aircraft again - it should work now!' as final_message;
