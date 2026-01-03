-- ================================================================
-- PAYMENT PROCESSING FUNCTIONS
-- ================================================================
-- ACID-compliant payment functions with idempotency and locking
-- ================================================================

-- ================================================================
-- FUNCTION: Check and lock booking for payment
-- ================================================================

CREATE OR REPLACE FUNCTION check_and_lock_booking_for_payment(
  p_quote_id UUID
)
RETURNS TABLE(
  can_proceed BOOLEAN,
  current_status TEXT,
  booking_id UUID,
  amount NUMERIC
) AS $$
DECLARE
  v_booking_id UUID;
  v_status TEXT;
  v_amount NUMERIC;
BEGIN
  -- Lock the booking row (NOWAIT = fail fast if already locked)
  SELECT id, payment_status, total_amount 
  INTO v_booking_id, v_status, v_amount
  FROM bookings
  WHERE quote_id = p_quote_id
  FOR UPDATE NOWAIT;
  
  -- If no booking found, cannot proceed
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'not_found'::TEXT, NULL::UUID, NULL::NUMERIC;
    RETURN;
  END IF;
  
  -- Check if payment can proceed based on current status
  IF v_status = 'succeeded' THEN
    -- Payment already completed - cannot proceed
    RETURN QUERY SELECT FALSE, v_status, v_booking_id, v_amount;
  ELSIF v_status = 'processing' THEN
    -- Payment in progress - cannot proceed
    RETURN QUERY SELECT FALSE, v_status, v_booking_id, v_amount;
  ELSE
    -- Payment can proceed (not_started or failed)
    RETURN QUERY SELECT TRUE, v_status, v_booking_id, v_amount;
  END IF;
  
EXCEPTION
  WHEN lock_not_available THEN
    -- Another transaction is holding the lock
    RETURN QUERY SELECT FALSE, 'locked'::TEXT, NULL::UUID, NULL::NUMERIC;
  WHEN OTHERS THEN
    -- Other errors
    RAISE;
    RAISE;
.
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- FUNCTION: Atomic payment initialization
-- ================================================================

CREATE OR REPLACE FUNCTION atomic_payment_init(
  p_quote_id UUID,
  p_user_id UUID,
  p_idempotency_key TEXT,
  p_amount NUMERIC,
  p_currency TEXT DEFAULT 'USD'
)
RETURNS TABLE(
  success BOOLEAN,
  transaction_id UUID,
  message TEXT,
  payment_status TEXT,
  amount NUMERIC,
  currency TEXT
) AS $$
DECLARE
  v_booking_id UUID;
  v_current_status TEXT;
  v_can_proceed BOOLEAN;
  v_existing_tx UUID;
  v_new_tx_id UUID;
  v_db_amount NUMERIC;
  v_existing_amount NUMERIC;
  v_existing_currency TEXT;
BEGIN
  -- Step 1: Check for existing transaction with same idempotency key
  SELECT id, status, amount, currency INTO v_existing_tx, v_current_status, v_existing_amount, v_existing_currency
  FROM transactions
  WHERE idempotency_key = p_idempotency_key;
  
  IF FOUND THEN
    -- Idempotent response - return existing transaction
    RETURN QUERY SELECT 
      TRUE,
      v_existing_tx,
      'Transaction already exists'::TEXT,
      v_current_status,
      v_existing_amount,
      v_existing_currency;
    RETURN;
  END IF;
  
  -- Step 2: Lock booking and check if payment can proceed
  SELECT can_proceed, current_status, booking_id, amount
  INTO v_can_proceed, v_current_status, v_booking_id, v_db_amount
  FROM check_and_lock_booking_for_payment(p_quote_id);
  
  IF NOT v_can_proceed THEN
    -- Cannot proceed - return error
    RETURN QUERY SELECT 
      FALSE,
      NULL::UUID,
      format('Payment cannot proceed. Status: %s', v_current_status)::TEXT,
      v_current_status,
      NULL::NUMERIC,
      NULL::TEXT;
    RETURN;
  END IF;
  
  -- Step 3: Create transaction record
  INSERT INTO transactions (
    quote_id,
    user_id,
    amount,
    currency,
    status,
    idempotency_key,
    attempt_count,
    last_attempt_at,
    metadata
  ) VALUES (
    p_quote_id,
    p_user_id,
    v_db_amount, -- Use DB amount from Booking
    p_currency,
    'processing',
    p_idempotency_key,
    1,
    NOW(),
    jsonb_build_object('booking_id', v_booking_id)
  )
  RETURNING id INTO v_new_tx_id;
  
  -- Step 4: Update booking status to processing
  UPDATE bookings
  SET payment_status = 'processing'
  WHERE id = v_booking_id;
  
  -- Step 5: Log to audit trail
  INSERT INTO audit_logs (actor, action, resource, status, metadata)
  VALUES (
    p_user_id::TEXT,
    'PAYMENT_INITIATED',
    v_new_tx_id::TEXT,
    'SUCCESS',
    jsonb_build_object(
      'quote_id', p_quote_id,
      'amount', p_amount,
      'idempotency_key', p_idempotency_key
    )
  );
  
  -- Return success
  RETURN QUERY SELECT 
    TRUE,
    v_new_tx_id,
    'Payment initiated successfully'::TEXT,
    'processing'::TEXT,
    v_db_amount,
    p_currency;
    
EXCEPTION
  WHEN OTHERS THEN
    -- Log error and re-raise
    INSERT INTO audit_logs (actor, action, resource, status, metadata)
    VALUES (
      p_user_id::TEXT,
      'PAYMENT_INIT_FAILED',
      p_quote_id::TEXT,
      'FAILURE',
      jsonb_build_object('error', SQLERRM)
    );
    RAISE;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- FUNCTION: Finalize payment
-- ================================================================

CREATE OR REPLACE FUNCTION finalize_payment(
  p_transaction_id UUID,
  p_new_status TEXT,
  p_gateway_reference TEXT DEFAULT NULL
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  v_current_status TEXT;
  v_quote_id UUID;
  v_booking_id UUID;
BEGIN
  -- Step 1: Lock and fetch transaction
  SELECT status, quote_id INTO v_current_status, v_quote_id
  FROM transactions
  WHERE id = p_transaction_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Transaction not found'::TEXT;
    RETURN;
  END IF;
  
  -- Step 2: Validate state transition
  IF v_current_status = 'succeeded' THEN
    -- Already succeeded - idempotent response
    RETURN QUERY SELECT TRUE, 'Payment already completed'::TEXT;
    RETURN;
  END IF;
  
  IF v_current_status != 'processing' AND p_new_status = 'succeeded' THEN
    -- Invalid transition
    RETURN QUERY SELECT 
      FALSE, 
      format('Invalid state transition from %s to %s', v_current_status, p_new_status)::TEXT;
    RETURN;
  END IF;
  
  -- Step 3: Update transaction
  UPDATE transactions
  SET 
    status = p_new_status,
    gateway_reference = COALESCE(p_gateway_reference, gateway_reference),
    completed_at = CASE WHEN p_new_status IN ('succeeded', 'failed') THEN NOW() ELSE completed_at END
  WHERE id = p_transaction_id;
  
  -- Step 4: Update booking payment status
  SELECT id INTO v_booking_id
  FROM bookings
  WHERE quote_id = v_quote_id
  FOR UPDATE;
  
  IF FOUND THEN
    UPDATE bookings
    SET payment_status = p_new_status
    WHERE id = v_booking_id;
  END IF;
  
  -- Step 5: Log audit trail
  INSERT INTO audit_logs (actor, action, resource, status, metadata)
  VALUES (
    'SYSTEM',
    'PAYMENT_FINALIZED',
    p_transaction_id::TEXT,
    'SUCCESS',
    jsonb_build_object(
      'new_status', p_new_status,
      'gateway_reference', p_gateway_reference
    )
  );
  
  RETURN QUERY SELECT TRUE, format('Payment finalized: %s', p_new_status)::TEXT;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- GRANT PERMISSIONS
-- ================================================================

GRANT EXECUTE ON FUNCTION check_and_lock_booking_for_payment TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION atomic_payment_init TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION finalize_payment TO authenticated, service_role;

SELECT 'Payment functions created successfully!' as status;
