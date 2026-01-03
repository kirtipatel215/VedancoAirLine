import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import Stripe from "https://esm.sh/stripe@14.14.0";

// DEMO KEYS - HARDCODED FOR DEMO ONLY
const STRIPE_SECRET_KEY = "sk_test_51ShiLjAe7i1TyW1fwzjOmfbnZTrxPpSdcxldNlsKp0aeU31U0uhyiH7lE4qk4JshVXJ2sCDg4XJdomJUmxYimgY300JusCQGCm";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16",
    httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-application-name",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // Use Service Role to bypass RLS for updates
        const supabaseAdmin = createClient(
            SUPABASE_URL,
            SUPABASE_SERVICE_ROLE_KEY
        );

        const { session_id } = await req.json();

        if (!session_id) {
            throw new Error("Missing session_id");
        }

        console.log(`Verifying session: ${session_id}`);

        // 1. Retrieve Session from Stripe
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (!session) {
            throw new Error("Session not found in Stripe");
        }

        console.log(`Stripe Status: ${session.payment_status}`);

        // 2. Check Payment Status
        if (session.payment_status === 'paid') {
            const booking_id = session.metadata?.booking_id;

            if (!booking_id) {
                throw new Error("No booking_id in session metadata");
            }

            // 3. Update Payments Table
            const { error: payError } = await supabaseAdmin
                .from('payments')
                .update({
                    payment_status: 'succeeded',
                    stripe_payment_intent_id: session.payment_intent as string,
                    stripe_response: session as any
                })
                .eq('stripe_session_id', session_id);

            if (payError) console.error("Payment update error:", payError);

            // 4. Update Bookings Table
            const { error: bookError } = await supabaseAdmin
                .from('bookings')
                .update({
                    booking_status: 'confirmed'
                })
                .eq('id', booking_id);

            if (bookError) console.error("Booking update error:", bookError);

            return new Response(
                JSON.stringify({
                    verified: true,
                    status: 'paid',
                    booking_id
                }),
                {
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                    status: 200,
                }
            );
        } else {
            return new Response(
                JSON.stringify({
                    verified: false,
                    status: session.payment_status
                }),
                {
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                    status: 200,
                }
            );
        }

    } catch (error) {
        console.error("Verify error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
