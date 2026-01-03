
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

        const { transactionId, status, gatewayResponse } = await req.json()

        console.log(`Processing payment: ${transactionId}, Status: ${status}`)

        if (!transactionId || !['success', 'failed'].includes(status)) {
            throw new Error('Invalid input')
        }

        // 1. Update Payment Status
        const { data: payment, error: updateError } = await supabaseClient
            .from('payments')
            .update({
                status: status,
                gateway_response: gatewayResponse,
                updated_at: new Date().toISOString()
            })
            .eq('id', transactionId)
            .select()
            .single()

        if (updateError || !payment) {
            console.error("Payment update error:", updateError);
            throw new Error('Payment update failed')
        }

        // 2. Log Action
        await supabaseClient.from('payment_logs').insert({
            payment_id: transactionId,
            new_status: status,
            actor: 'system',
            metadata: gatewayResponse
        })

        // 3. Update Booking if Success
        if (status === 'success') {
            await supabaseClient
                .from('bookings')
                .update({
                    payment_status: 'paid',
                    status: 'confirmed',
                    updated_at: new Date().toISOString()
                })
                .eq('id', payment.booking_id)

            console.log(`Booking confirmed for payment: ${transactionId}`);
        } else {
            await supabaseClient
                .from('bookings')
                .update({
                    payment_status: 'failed',
                    updated_at: new Date().toISOString()
                })
                .eq('id', payment.booking_id)

            console.log(`Booking failed for payment: ${transactionId}`);
        }

        return new Response(
            JSON.stringify({ success: true, paymentId: payment.id }),
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
