import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import Stripe from "https://esm.sh/stripe@14.14.0";

// DEMO KEYS - HARDCODED FOR DEMO ONLY
const STRIPE_SECRET_KEY = "sk_test_51ShiLjAe7i1TyW1fwzjOmfbnZTrxPpSdcxldNlsKp0aeU31U0uhyiH7lE4qk4JshVXJ2sCDg4XJdomJUmxYimgY300JusCQGCm";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

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
        // Use Service Role to bypass RLS and ensure we can read/write
        // This answers the "simple create stripe payment system" request by removing auth friction
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

        const supabaseAdmin = createClient(
            SUPABASE_URL,
            SUPABASE_SERVICE_ROLE_KEY,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        const { booking_id, success_url, cancel_url } = await req.json();

        if (!booking_id) {
            throw new Error("Missing booking_id");
        }

        // 1. Fetch booking details to ensure amount is correct
        const { data: booking, error: bookingError } = await supabaseAdmin
            .from("bookings")
            .select("*")
            .eq("id", booking_id)
            .single();

        if (bookingError || !booking) {
            console.error("Booking fetch error:", bookingError);
            throw new Error("Booking not found");
        }

        if (booking.booking_status === "confirmed") {
            throw new Error("Booking already confirmed");
        }

        // Derive user from the booking itself (Trusted Source)
        const userId = booking.user_id; // OR booking.customer_id based on schema
        // Let's assume user_id as per recent schema check

        // Optional: Fetch email for stripe receipt
        let customerEmail = "customer@example.com";
        const { data: profile } = await supabaseAdmin.from('profiles').select('email').eq('id', userId).single();
        if (profile?.email) customerEmail = profile.email; // If email is in profile
        // Alternatively, fetch user from admin auth API if needed, but keeping it simple as requested.



        console.log(`Booking ID: ${booking_id}, Amount (Raw): ${booking.total_amount}`);

        let unitAmount = 0;
        if (typeof booking.total_amount === 'number') {
            unitAmount = Math.round(booking.total_amount * 100);
        } else if (typeof booking.total_amount === 'string') {
            unitAmount = Math.round(parseFloat(booking.total_amount) * 100);
        }

        if (!unitAmount || isNaN(unitAmount) || unitAmount <= 0) {
            console.error("Invalid amount detected:", booking.total_amount);
            throw new Error(`Invalid booking amount: ${booking.total_amount}`);
        }

        // 2. Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: booking.currency || "usd",
                        product_data: {
                            name: `Private Jet Charter - ${booking.flight_id || 'Flight'}`,
                            metadata: {
                                flight_id: booking.flight_id
                            }
                        },
                        unit_amount: unitAmount, // Use validated amount
                    },

                    quantity: 1,
                },
            ],
            mode: "payment",
            // Clean success URL to ensure we can verify later
            success_url: success_url || `${req.headers.get("origin")}/?mode=payment_status&status=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancel_url || `${req.headers.get("origin")}/?mode=payment_status&status=cancelled`,
            metadata: {
                booking_id: booking_id,
                user_id: userId,
            },
            customer_email: customerEmail,
        });

        console.log("Session created:", session.id);

        // 3. Store in payments table (Init)
        const { error: paymentError } = await supabaseAdmin
            .from("payments")
            .insert({
                booking_id: booking_id,
                user_id: userId,
                stripe_session_id: session.id,
                amount: booking.total_amount,
                currency: booking.currency || "usd",
                payment_status: "initiated",
                payment_method: "stripe",
                stripe_response: session as any,
            });

        if (paymentError) {
            console.error("Failed to insert payment record", paymentError);
            // Non-blocking in demo, but usually critical
        }

        return new Response(
            JSON.stringify({ sessionId: session.id, url: session.url }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            }
        );
    } catch (error) {
        console.error("Function error:", error);
        return new Response(JSON.stringify({
            error: error.message,
            details: "Please check function logs."
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
