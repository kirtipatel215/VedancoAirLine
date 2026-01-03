-- ================================================================
-- VEDANCO AIR - INITIAL DEPLOYMENT MIGRATION
-- ================================================================
-- Single file for complete database deployment
-- Run this file to initialize a fresh Vedanco Air database
-- ================================================================

-- Step 1: Deploy master schema
\i database/schema/00_master_schema.sql

-- Step 2: Deploy authentication functions
\i database/functions/auth_functions.sql

-- Step 3: Deploy payment functions
\i database/functions/payment_functions.sql

-- Step 4: Deploy operator functions
\i database/functions/operator_functions.sql

-- ================================================================
-- VERIFICATION
-- ================================================================

DO $$
DECLARE
  v_table_count INTEGER;
  v_function_count INTEGER;
BEGIN
  -- Count tables
  SELECT COUNT(*) INTO v_table_count
  FROM information_schema.tables
  WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
  
  -- Count functions
  SELECT COUNT(*) INTO v_function_count
  FROM information_schema.routines
  WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';
  
  -- Report
  RAISE NOTICE '========================================';
  RAISE NOTICE 'DEPLOYMENT COMPLETE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tables created: %', v_table_count;
  RAISE NOTICE 'Functions created: %', v_function_count;
  RAISE NOTICE '========================================';
  
  -- Verify expected counts
  IF v_table_count < 12 THEN
    RAISE EXCEPTION 'Expected 12 tables, found %', v_table_count;
  END IF;
  
  IF v_function_count < 8 THEN
    RAISE WARNING 'Expected at least 8 functions, found %', v_function_count;
  END IF;
  
  RAISE NOTICE 'All checks passed! Database ready to use.';
END $$;
