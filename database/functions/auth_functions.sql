-- ================================================================
-- AUTHENTICATION & SESSION MANAGEMENT FUNCTIONS
-- ================================================================
-- Helper functions for authentication system
-- ================================================================

-- ================================================================
-- FUNCTION: Revoke all sessions for a user
-- ================================================================

CREATE OR REPLACE FUNCTION revoke_user_sessions(p_user_id UUID)
RETURNS void AS $$
BEGIN
  -- Delete all auth sessions for this user
  DELETE FROM auth.sessions WHERE user_id = p_user_id;
  
  -- Ban user temporarily (1 hour) to force re-login
  UPDATE profiles 
  SET banned_until = NOW() + INTERVAL '1 hour'
  WHERE id = p_user_id;
  
  -- Audit log
  INSERT INTO audit_logs (actor, action, resource, status, metadata)
  VALUES (
    'ADMIN',
    'SESSION_REVOKED',
    p_user_id::TEXT,
    'SUCCESS',
    jsonb_build_object(
      'revoked_at', NOW(),
      'ban_until', NOW() + INTERVAL '1 hour'
    )
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log error
    INSERT INTO audit_logs (actor, action, resource, status, metadata)
    VALUES (
      'SYSTEM',
      'SESSION_REVOKE_FAILED',
      p_user_id::TEXT,
      'FAILURE',
      jsonb_build_object('error', SQLERRM)
    );
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- FUNCTION: Check if user session is valid
-- ================================================================

CREATE OR REPLACE FUNCTION is_session_valid(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_banned_until TIMESTAMPTZ;
BEGIN
  -- Check if user is banned
  SELECT banned_until INTO v_banned_until
  FROM profiles
  WHERE id = p_user_id;
  
  -- If banned_until is in the future, session is invalid
  IF v_banned_until IS NOT NULL AND v_banned_until > NOW() THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- FUNCTION: Unban user
-- ================================================================

CREATE OR REPLACE FUNCTION unban_user(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET banned_until = NULL
  WHERE id = p_user_id;
  
  -- Audit log
  INSERT INTO audit_logs (actor, action, resource, status, metadata)
  VALUES (
    'ADMIN',
    'USER_UNBANNED',
    p_user_id::TEXT,
    'SUCCESS',
    jsonb_build_object('unbanned_at', NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- FUNCTION: Get active sessions count for user
-- ================================================================

CREATE OR REPLACE FUNCTION get_user_session_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM auth.sessions
  WHERE user_id = p_user_id
  AND NOT revoked
  AND expires_at > NOW();
  
  RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- FUNCTION: Log authentication event
-- ================================================================

CREATE OR REPLACE FUNCTION log_auth_event(
  p_event_type TEXT,
  p_user_id UUID,
  p_success BOOLEAN,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS void AS $$
BEGIN
  INSERT INTO audit_logs (actor, action, resource, status, metadata)
  VALUES (
    COALESCE(p_user_id::TEXT, 'ANONYMOUS'),
    p_event_type,
    COALESCE(p_user_id::TEXT, 'AUTH_SYSTEM'),
    CASE WHEN p_success THEN 'SUCCESS' ELSE 'FAILURE' END,
    p_metadata
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- GRANT PERMISSIONS
-- ================================================================

GRANT EXECUTE ON FUNCTION revoke_user_sessions TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION is_session_valid TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION unban_user TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION get_user_session_count TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION log_auth_event TO authenticated, service_role;

SELECT 'Authentication functions created successfully!' as status;
