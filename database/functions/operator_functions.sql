-- ================================================================
-- OPERATOR UTILITY FUNCTIONS
-- ================================================================
-- Helper functions for operator management
-- ================================================================

-- ================================================================
-- FUNCTION: Get operator ID from user ID
-- ================================================================

CREATE OR REPLACE FUNCTION get_operator_id_from_user(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
  v_operator_id UUID;
  v_email TEXT;
BEGIN
  -- Get user email
  SELECT email INTO v_email FROM profiles WHERE id = p_user_id;
  
  -- Find operator by user_id or email
  SELECT id INTO v_operator_id
  FROM operators
  WHERE user_id = p_user_id OR email = v_email
  LIMIT 1;
  
  RETURN v_operator_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- FUNCTION: Approve operator application
-- ================================================================

CREATE OR REPLACE FUNCTION approve_operator_application(
  p_application_id UUID,
  p_approved_by UUID
)
RETURNS TABLE(
  success BOOLEAN,
  operator_id UUID,
  message TEXT
) AS $$
DECLARE
  v_application RECORD;
  v_new_operator_id UUID;
  v_user_id UUID;
BEGIN
  -- Lock and fetch application
  SELECT * INTO v_application
  FROM operator_applications
  WHERE id = p_application_id
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'Application not found'::TEXT;
    RETURN;
  END IF;
  
  IF v_application.status = 'Approved' THEN
    -- Already approved
    SELECT id INTO v_new_operator_id FROM operators WHERE application_id = p_application_id;
    RETURN QUERY SELECT TRUE, v_new_operator_id, 'Application already approved'::TEXT;
    RETURN;
  END IF;
  
  -- Update application status
  UPDATE operator_applications
  SET status = 'Approved'
  WHERE id = p_application_id;
  
  -- Get or create user_id for this email
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_application.email;
  
  -- Create operator record
  INSERT INTO operators (
    application_id,
    user_id,
    name,
    email,
    country,
    company_name,
    status,
    approval_date,
    approved_by
  ) VALUES (
    p_application_id,
    v_user_id,
    v_application.company_name,
    v_application.email,
    v_application.country,
    v_application.company_name,
    'Active',
    NOW(),
    p_approved_by
  )
  RETURNING id INTO v_new_operator_id;
  
  -- Update profile if user exists
  IF v_user_id IS NOT NULL THEN
    UPDATE profiles
    SET 
      is_operator = true,
      operator_status = 'approved',
      role = 'operator'
    WHERE id = v_user_id;
  END IF;
  
  -- Log audit
  INSERT INTO audit_logs (actor, action, resource, status, metadata)
  VALUES (
    p_approved_by::TEXT,
    'OPERATOR_APPROVED',
    v_new_operator_id::TEXT,
    'SUCCESS',
    jsonb_build_object(
      'application_id', p_application_id,
      'operator_email', v_application.email
    )
  );
  
  RETURN QUERY SELECT TRUE, v_new_operator_id, 'Operator approved successfully'::TEXT;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log error
    INSERT INTO audit_logs (actor, action, resource, status, metadata)
    VALUES (
      p_approved_by::TEXT,
      'OPERATOR_APPROVAL_FAILED',
      p_application_id::TEXT,
      'FAILURE',
      jsonb_build_object('error', SQLERRM)
    );
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- FUNCTION: Reject operator application
-- ================================================================

CREATE OR REPLACE FUNCTION reject_operator_application(
  p_application_id UUID,
  p_rejection_reason TEXT,
  p_rejected_by UUID
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT
) AS $$
BEGIN
  -- Update application
  UPDATE operator_applications
  SET 
    status = 'Rejected',
    rejection_reason = p_rejection_reason
  WHERE id = p_application_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Application not found'::TEXT;
    RETURN;
  END IF;
  
  -- Update profile if linked
  UPDATE profiles
  SET operator_status = 'rejected'
  WHERE id IN (
    SELECT user_id FROM operator_applications WHERE id = p_application_id
  );
  
  -- Log audit
  INSERT INTO audit_logs (actor, action, resource, status, metadata)
  VALUES (
    p_rejected_by::TEXT,
    'OPERATOR_REJECTED',
    p_application_id::TEXT,
    'SUCCESS',
    jsonb_build_object('reason', p_rejection_reason)
  );
  
  RETURN QUERY SELECT TRUE, 'Application rejected'::TEXT;
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- FUNCTION: Update operator aircraft count
-- ================================================================

CREATE OR REPLACE FUNCTION update_operator_aircraft_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE operators
    SET aircraft_count = aircraft_count + 1
    WHERE id = NEW.operator_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE operators
    SET aircraft_count = GREATEST(0, aircraft_count - 1)
    WHERE id = OLD.operator_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for aircraft count
DROP TRIGGER IF EXISTS update_aircraft_count ON aircraft;
CREATE TRIGGER update_aircraft_count
  AFTER INSERT OR DELETE ON aircraft
  FOR EACH ROW
  EXECUTE FUNCTION update_operator_aircraft_count();

-- ================================================================
-- GRANT PERMISSIONS
-- ================================================================

GRANT EXECUTE ON FUNCTION get_operator_id_from_user TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION approve_operator_application TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION reject_operator_application TO authenticated, service_role;

SELECT 'Operator functions created successfully!' as status;
