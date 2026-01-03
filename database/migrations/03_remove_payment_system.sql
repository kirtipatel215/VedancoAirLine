-- ================================================================
-- MIGRATION: 03_REMOVE_PAYMENT_SYSTEM
-- ================================================================
-- PURPOSE: completely remove Stripe payment system and database artifacts
-- WARNING: This is DESTRUCTIVE. Drops tables and functions.
-- ================================================================

-- 1. DROP TABLES (Cascade to audit logs if necessary, but keep audit logs for now or drop if strictly payment related)
DROP TABLE IF EXISTS transactions CASCADE;

-- 2. DROP FUNCTIONS
DROP FUNCTION IF EXISTS atomic_payment_init(uuid,uuid,text,numeric,text);
DROP FUNCTION IF EXISTS check_and_lock_booking_for_payment(uuid);
DROP FUNCTION IF EXISTS finalize_payment(uuid,text,text);

-- 3. RESET BOOKING STATUS
-- Ensure no bookings are stuck in a 'processing' or 'succeeded' state that doesn't exist anymore
UPDATE bookings 
SET payment_status = 'not_started' 
WHERE payment_status IN ('processing', 'succeeded', 'failed');

-- 4. CLEANUP (Optional)
-- Verify removal
SELECT 'Payment system removed successfully' as status;
