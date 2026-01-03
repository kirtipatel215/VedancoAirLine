-- ================================================================
-- MIGRATION: FIX_RECURSION_AND_POLICIES
-- PURPOSE: Fix infinite recursion in RLS policies using SECURITY DEFINER functions
-- ================================================================

BEGIN;

-- 1. Create a secure function to look up operator ID
-- SECURITY DEFINER means it runs with permissions of the creator (postgres/admin)
-- bypassing RLS on the tables it queries.
CREATE OR REPLACE FUNCTION public.get_auth_operator_id()
RETURNS UUID AS $$
DECLARE
  v_operator_id UUID;
BEGIN
  -- Try to find by user_id first (direct link)
  SELECT id INTO v_operator_id
  FROM public.operators
  WHERE user_id = auth.uid();
  
  IF v_operator_id IS NOT NULL THEN
    RETURN v_operator_id;
  END IF;

  -- Fallback: Find by email (legacy/invite link)
  SELECT o.id INTO v_operator_id
  FROM public.operators o
  JOIN public.profiles p ON p.email = o.email
  WHERE p.id = auth.uid();

  RETURN v_operator_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop existing problematic policies on AIRCRAFT
DROP POLICY IF EXISTS "Operators can view their own aircraft" ON aircraft;
DROP POLICY IF EXISTS "Operators can insert their own aircraft" ON aircraft;
DROP POLICY IF EXISTS "Operators can update their own aircraft" ON aircraft;
DROP POLICY IF EXISTS "Operators can delete their own aircraft" ON aircraft;

-- 3. Create optimized policies using the function
CREATE POLICY "Operators can view their own aircraft"
  ON aircraft FOR SELECT
  USING (
    operator_id = get_auth_operator_id()
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Operators can insert their own aircraft"
  ON aircraft FOR INSERT
  WITH CHECK (
    operator_id = get_auth_operator_id()
  );

CREATE POLICY "Operators can update their own aircraft"
  ON aircraft FOR UPDATE
  USING (
    operator_id = get_auth_operator_id()
  );

CREATE POLICY "Operators can delete their own aircraft"
  ON aircraft FOR DELETE
  USING (
    operator_id = get_auth_operator_id()
  );

COMMIT;
