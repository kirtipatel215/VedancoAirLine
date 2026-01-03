-- Allow users to create their own payment records
-- Required for create-checkout-session Edge Function which runs as the authenticated user

CREATE POLICY "Users can create own payments" ON payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);
