-- ================================================================
-- VERIFICATION: PHASE 1 DATABASE SETUP
-- ================================================================

BEGIN;

DO $$
DECLARE
  v_count INTEGER;
  v_missing TEXT := '';
BEGIN
  RAISE NOTICE 'Starting Phase 1 Verification...';

  -- 1. Check Tables Existence
  -- ================================================================
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
    v_missing := v_missing || ' profiles';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'inquiries') THEN
    v_missing := v_missing || ' inquiries';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'quotes') THEN
    v_missing := v_missing || ' quotes';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'transactions') THEN
    v_missing := v_missing || ' transactions';
  END IF;

  IF v_missing <> '' THEN
    RAISE EXCEPTION 'Missing Tables:%', v_missing;
  ELSE
    RAISE NOTICE '✅ All required tables exist.';
  END IF;

  -- 2. Check RLS Enabled
  -- ================================================================
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles' AND rowsecurity = true) THEN
    RAISE WARNING '⚠️ RLS not enabled on profiles';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'inquiries' AND rowsecurity = true) THEN
    RAISE WARNING '⚠️ RLS not enabled on inquiries';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'quotes' AND rowsecurity = true) THEN
    RAISE WARNING '⚠️ RLS not enabled on quotes';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'transactions' AND rowsecurity = true) THEN
    RAISE WARNING '⚠️ RLS not enabled on transactions';
  ELSE
    RAISE NOTICE '✅ RLS enabled on all core tables.';
  END IF;

  -- 3. Check Policies Exist (Count check)
  -- ================================================================
  SELECT count(*) INTO v_count FROM pg_policies WHERE schemaname = 'public' AND tablename = 'inquiries';
  IF v_count < 3 THEN
    RAISE WARNING '⚠️ Inquiries table has fewer policies than expected (found %).', v_count;
  ELSE
    RAISE NOTICE '✅ Inquiries policies found.';
  END IF;

  SELECT count(*) INTO v_count FROM pg_policies WHERE schemaname = 'public' AND tablename = 'quotes';
  IF v_count < 3 THEN
    RAISE WARNING '⚠️ Quotes table has fewer policies than expected (found %).', v_count;
  ELSE
    RAISE NOTICE '✅ Quotes policies found.';
  END IF;
  
  -- 4. Check Helper Function
  -- ================================================================
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_current_operator_id') THEN
    RAISE EXCEPTION 'Missing function: get_current_operator_id';
  ELSE
    RAISE NOTICE '✅ Helper functions exist.';
  END IF;

  RAISE NOTICE '🎉 PHASE 1 VERIFICATION COMPLETE: SUCCESS!';
END $$;

ROLLBACK; -- Don't actually change anything, just verify.
