-- ================================================================
-- MIGRATION: INIT_PAYMENT_SYSTEM
-- ================================================================
-- PURPOSE: Create a clean, immutable ledger for payments and bookings.
-- ================================================================

-- 1. BOOKINGS TABLE (Core Record)
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_reference TEXT UNIQUE NOT NULL,
    quote_id UUID REFERENCES quotes(id),
    customer_id UUID REFERENCES auth.users(id),
    operator_id UUID,
    flight_details JSONB, -- Snapshot of flight info
    status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, cancelled
    payment_status TEXT NOT NULL DEFAULT 'unpaid', -- unpaid, processing, paid, failed, refunded
    total_amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'USD',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PAYMENTS TABLE (Transaction Record)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id),
    user_id UUID REFERENCES auth.users(id),
    amount NUMERIC NOT NULL,
    currency TEXT DEFAULT 'USD',
    payment_method TEXT DEFAULT 'mock_gateway',
    status TEXT NOT NULL DEFAULT 'initiated', -- initiated, success, failed
    transaction_reference TEXT, -- External ID (e.g., from PayPal or Mock Gateway)
    gateway_response JSONB, -- Full response payload for debugging
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PAYMENT LOGS (Immutable History for Audit)
CREATE TABLE IF NOT EXISTS payment_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID REFERENCES payments(id),
    previous_status TEXT,
    new_status TEXT,
    actor TEXT DEFAULT 'system', -- 'user', 'system', 'admin'
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. INDEXES
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);

-- 5. RLS POLICIES
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;

-- Bookings Policies
CREATE POLICY "Users can view own bookings" ON bookings
    FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Service role manages bookings" ON bookings
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Payments Policies
CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role manages payments" ON payments
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Logs Policies (Admin/System Only)
CREATE POLICY "Service role manages logs" ON payment_logs
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 6. TRIGGERS (Auto-update updated_at)
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
