-- ================================================================
-- FIX: Infinite Recursion in Operators RLS Policy
-- ================================================================
-- This fixes the "infinite recursion detected in policy for relation operators" error
-- Run this in Supabase SQL Editor
-- ================================================================

-- Step 1: Drop the problematic policies
DROP POLICY IF EXISTS "Operators can view their own record" ON operators;
DROP POLICY IF EXISTS "Operators can update their own record" ON operators;
DROP POLICY IF EXISTS "Operators can insert their own aircraft" ON aircraft;
DROP POLICY IF EXISTS "Operators can update their own aircraft" ON aircraft;
DROP POLICY IF EXISTS "Operators can delete their own aircraft" ON aircraft;
DROP POLICY IF EXISTS "Operators can view their own aircraft" ON aircraft;

-- Step 2: Create simplified, non-recursive policies for operators
CREATE POLICY "Operators can view their own record"
  ON operators FOR SELECT
  USING (
    user_id = auth.uid()
    OR email IN (SELECT email FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Operators can update their own record"
  ON operators FOR UPDATE
  USING (
    user_id = auth.uid()
    OR email IN (SELECT email FROM profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    -- Prevent operators from changing critical fields
    status = (SELECT o2.status FROM operators o2 WHERE o2.id = operators.id)
  );

-- Step 3: Create simplified, non-recursive policies for aircraft
-- Use a simpler approach: just check user_id directly with a subquery
CREATE POLICY "Operators can view their own aircraft"
  ON aircraft FOR SELECT
  USING (
    operator_id IN (
      SELECT id FROM operators WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Operators can insert their own aircraft"
  ON aircraft FOR INSERT
  WITH CHECK (
    operator_id IN (
      SELECT id FROM operators WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Operators can update their own aircraft"
  ON aircraft FOR UPDATE
  USING (
    operator_id IN (
      SELECT id FROM operators WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Operators can delete their own aircraft"
  ON aircraft FOR DELETE
  USING (
    operator_id IN (
      SELECT id FROM operators WHERE user_id = auth.uid()
    )
  );

-- Step 4: Verify the fix
SELECT 
  tablename, 
  policyname, 
  cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('operators', 'aircraft')
ORDER BY tablename, policyname;

SELECT '✅ RLS policies fixed! Try adding aircraft again.' as status;
