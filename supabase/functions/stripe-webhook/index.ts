import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import Stripe from "https://esm.sh/stripe@14.14.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2023-10-16",
    httpClient: Stripe.createFetchHttpClient(),
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

serve(async (req) => {
    const signature = req.headers.get("Stripe-Signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SIGNATURE");

    if (!signature || !webhookSecret) {
        return new Response("Missing signature or secret", { status: 400 });
    }

    const body = await req.text();
    let event;

    try {
        event = await stripe.webhooks.constructEventAsync(
            body,
            signature,
            webhookSecret,
            undefined,
            cryptoProvider
        );
    } catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log(`Processing event: ${event.type}`);

    // 1. Log Event
    await supabaseClient.from("payment_events").insert({
        event_type: event.type,
        event_payload: event,
        // payment_id linked later if possible, or just raw log
    });

    try {
        switch (event.type) {
            case "checkout.session.completed":
                await handleCheckoutSessionCompleted(event.data.object, supabaseClient);
                break;
            case "payment_intent.succeeded":
                await handlePaymentIntentSucceeded(event.data.object, supabaseClient);
                break;
            case "payment_intent.payment_failed":
                await handlePaymentIntentFailed(event.data.object, supabaseClient);
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
    } catch (error) {
        console.error(`Error processing event ${event.type}:`, error);
        return new Response("Error processing event", { status: 500 });
    }

    return new Response(JSON.stringify({ received: true }), {
        headers: { "Content-Type": "application/json" },
    });
});

async function handleCheckoutSessionCompleted(session: any, supabase: any) {
    const bookingId = session.metadata?.booking_id;
    const paymentIntentId = session.payment_intent;

    if (!bookingId) {
        console.error("No booking_id in session metadata");
        return;
    }

    // Update Payment Record
    const { error: paymentError } = await supabase
        .from("payments")
        .update({
            stripe_payment_intent_id: paymentIntentId,
            payment_status: "succeeded",
            // stripe_response: session,
            updated_at: new Date().toISOString(),
        })
        .eq("stripe_session_id", session.id);

    if (paymentError) {
        console.error("Error updating payment:", paymentError);
    }

    // Update Booking Record
    const { error: bookingError } = await supabase
        .from("bookings")
        .update({
            booking_status: "confirmed",
            updated_at: new Date().toISOString(),
        })
        .eq("id", bookingId);

    if (bookingError) {
        console.error("Error updating booking:", bookingError);
    }
}

async function handlePaymentIntentSucceeded(paymentIntent: any, supabase: any) {
    // This might be redundant if we handle checkout.session.completed,
    // but useful if we use PaymentIntents directly cleanly.
    // checkout.session.completed is safer for Checkout Sessions.
    // We can just log it or ensure 'succeeded' state.
    console.log("Payment Intent Succeeded", paymentIntent.id);
}

async function handlePaymentIntentFailed(paymentIntent: any, supabase: any) {
    // Determine booking from payment intent? 
    // Usually via metadata if copied from session.
    // Checkout Sessions -> Payment Intent usually copies metadata.

    // Find payment by payment_intent_id OR update by session if we can link it
    // But initially we only stored session_id.

    const { error } = await supabase
        .from("payments")
        .update({
            payment_status: "failed",
            updated_at: new Date().toISOString()
        })
        .eq("stripe_payment_intent_id", paymentIntent.id);

    if (error) console.error("Error updating payment failure:", error);
}
