-- ================================================================
-- PHASE 2: SECURE OPERATOR BOOKINGS RPC
-- ================================================================
-- Purpose: Allow operators to fetch their bookings securely.
-- Privacy Rule: Customer contact info (Name, Phone, Email) is NULL
-- unless booking.payment_status = 'succeeded'.
-- ================================================================

CREATE OR REPLACE FUNCTION get_operator_bookings_secure()
RETURNS TABLE (
  booking_id UUID,
  booking_ref TEXT,
  route TEXT,
  departure_date TIMESTAMPTZ,
  aircraft_model TEXT,
  pax_count INTEGER,
  status TEXT,
  payment_status TEXT,
  total_amount NUMERIC,
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  payment_method TEXT
) AS $$
DECLARE
  v_operator_id UUID;
BEGIN
  -- 1. Get the current operator ID securely
  -- We reuse the helper function from Phase 1
  SELECT get_current_operator_id() INTO v_operator_id;

  IF v_operator_id IS NULL THEN
    RETURN; -- Return empty if not an operator
  END IF;

  -- 2. Return the joined data with conditional logic
  RETURN QUERY
  SELECT 
    b.id as booking_id,
    b.booking_reference as booking_ref,
    b.route,
    b.departure_datetime as departure_date,
    b.aircraft_model,
    b.pax_count,
    b.status,
    b.payment_status,
    b.total_amount,
    -- Conditional Contact Info
    CASE 
      WHEN b.payment_status = 'succeeded' THEN (p.first_name || ' ' || p.last_name)
      ELSE NULL 
    END as customer_name,
    CASE 
      WHEN b.payment_status = 'succeeded' THEN p.phone_number
      ELSE NULL 
    END as customer_phone,
    CASE 
      WHEN b.payment_status = 'succeeded' THEN p.email
      ELSE NULL 
    END as customer_email,
    -- Payment Method (Mock or Real) from latest successful transaction or null
    (
      SELECT t.payment_method 
      FROM transactions t 
      WHERE t.quote_id = b.quote_id 
      AND t.status = 'succeeded' 
      ORDER BY t.created_at DESC 
      LIMIT 1
    ) as payment_method

  FROM bookings b
  LEFT JOIN profiles p ON b.customer_id = p.id
  WHERE b.operator_id = v_operator_id
  ORDER BY b.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to authenticated users (Operators will be filtered inside)
GRANT EXECUTE ON FUNCTION get_operator_bookings_secure() TO authenticated;
