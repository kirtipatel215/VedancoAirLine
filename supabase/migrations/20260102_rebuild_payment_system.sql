-- ================================================================
-- MIGRATION: REBUILD_PAYMENT_SYSTEM
-- PURPOSE: Implement strict Stripe-based payment architecture.
-- WARNING: This migration drops existing bookings/payments tables to ensure schema compliance.
-- ================================================================

BEGIN;

-- 1. DROP EXISTING OBJECTS (To resolve conflicts and unnecessary items)
DROP TRIGGER IF EXISTS update_bookings_timestamp ON bookings;
DROP TRIGGER IF EXISTS update_payments_timestamp ON payments;
DROP TABLE IF EXISTS payment_events CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;

-- 2. CREATE BOOKINGS TABLE
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    booking_reference TEXT UNIQUE, -- Added for UI
    quote_id UUID, -- Added for compatibility
    flight_id UUID, -- Kept for strict Stripe logic if needed, or alias to quote_id
    total_amount NUMERIC NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    booking_status TEXT NOT NULL DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'cancelled')),
    flight_details JSONB DEFAULT '{}'::jsonb, -- Store snapshot of flight info (origin, dest, aircraft, etc.)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREATE PAYMENTS TABLE
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    stripe_session_id TEXT UNIQUE,
    stripe_payment_intent_id TEXT UNIQUE,
    amount NUMERIC NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    payment_status TEXT NOT NULL DEFAULT 'initiated' CHECK (payment_status IN ('initiated', 'pending', 'succeeded', 'failed', 'cancelled')),
    payment_method TEXT,
    stripe_response JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CREATE PAYMENT_EVENTS TABLE (Audit Log)
CREATE TABLE payment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_payload JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. INDEXES
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(booking_status);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_session ON payments(stripe_session_id);
CREATE INDEX idx_payments_intent ON payments(stripe_payment_intent_id);

-- 6. ROW LEVEL SECURITY (RLS)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;

-- 6.1 Bookings Policies
CREATE POLICY "Users can view own bookings" ON bookings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role manages bookings" ON bookings
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Users can create own bookings" ON bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings" ON bookings
    FOR UPDATE USING (auth.uid() = user_id);

-- 6.2 Payments Policies
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role manages payments" ON payments
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 6.3 Payment Events Policies (Admin/System only)
CREATE POLICY "Service role manages events" ON payment_events
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 7. TRIGGERS
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bookings_timestamp
    BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_payments_timestamp
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMIT;
