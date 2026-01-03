
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { quoteId, userId } = await req.json()

        console.log(`Initiating payment for Quote: ${quoteId}, User: ${userId}`)

        // 1. Validate Quote
        const { data: quote, error: quoteError } = await supabaseClient
            .from('quotes')
            .select('*')
            .eq('id', quoteId)
            .single()

        if (quoteError || !quote) {
            console.error("Quote error:", quoteError);
            throw new Error('Quote not found')
        }

        // 2. Create Booking (Pending)
        const bookingRef = "BKG-" + Math.floor(Math.random() * 1000000)
        const { data: booking, error: bookingError } = await supabaseClient
            .from('bookings')
            .insert({
                booking_reference: bookingRef,
                quote_id: quoteId,
                customer_id: userId,
                operator_id: quote.operator_id,
                total_amount: quote.total_price,
                currency: quote.currency || 'USD',
                status: 'pending',
                payment_status: 'unpaid',
                flight_details: quote
            })
            .select()
            .single()

        if (bookingError) {
            console.error("Booking error:", bookingError);
            throw new Error('Failed to create booking: ' + bookingError.message)
        }

        // 3. Create Payment (Initiated)
        const { data: payment, error: paymentError } = await supabaseClient
            .from('payments')
            .insert({
                booking_id: booking.id,
                user_id: userId,
                amount: quote.total_price,
                currency: quote.currency || 'USD',
                status: 'initiated',
                payment_method: 'mock_gateway'
            })
            .select()
            .single()

        if (paymentError) {
            console.error("Payment error:", paymentError);
            throw new Error('Failed to create payment: ' + paymentError.message)
        }

        console.log(`Payment initiated: ${payment.id}`);

        return new Response(
            JSON.stringify({
                transactionId: payment.id,
                bookingId: booking.id,
                redirectUrl: `/payment/mock-gateway?transactionId=${payment.id}&amount=${quote.total_price}&currency=${quote.currency}`
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error: any) {
        console.error("Function error:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
