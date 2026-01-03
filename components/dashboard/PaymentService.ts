/**
 * ACID-COMPLIANT PAYMENT SERVICE (REBUILT)
 * 
 * Strict implementation using Rebuilt Database Schema
 */

import { supabase } from '../../supabaseClient';

export type PaymentStatus = 'not_started' | 'processing' | 'succeeded' | 'failed' | 'refunded';

export interface PaymentTransaction {
    id: string;
    quote_id: string;
    user_id: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    idempotency_key: string | null;
    created_at: string;
}

export class PaymentService {

    /**
     * Generate Idempotency Key (Stable: same user + quote = same key)
     */
    static generateIdempotencyKey(userId: string, quoteId: string): string {
        const raw = `payment-v2-${userId}-${quoteId}`; // v2 indicates rebuild
        return btoa(raw);
    }

    /**
     * Initiate Payment via Edge Function (Rebuilt Version)
     */
    static async createPaymentIntent(
        quoteId: string,
        idempotencyKey: string
    ): Promise<{ clientSecret: string; transactionId: string; error?: string }> {
        try {
            console.log("Initiating atomic payment (v2) for:", { quoteId });

            // Call Edge Function
            const { data, error } = await supabase.functions.invoke('create-payment-intent', {
                body: { quoteId, idempotencyKey },
            });

            if (error) throw new Error(error.message);
            if (data?.error) throw new Error(data.error);

            return {
                clientSecret: data.clientSecret,
                transactionId: data.transactionId
            };

        } catch (err: any) {
            console.error('Payment intent creation failed:', err);
            return { clientSecret: "", transactionId: "", error: err.message || "Payment service unavailable" };
        }
    }

    /**
     * Check if payment can be initiated
     */
    static async canInitiatePayment(quoteId: string): Promise<{ canProceed: boolean; reason: string | null }> {
        // Query latest transaction
        const { data: transactions } = await supabase
            .from('transactions')
            .select('*')
            .eq('quote_id', quoteId)
            .order('created_at', { ascending: false })
            .limit(1);

        if (transactions && transactions.length > 0) {
            const tx = transactions[0];
            if (tx.status === 'succeeded') return { canProceed: false, reason: 'Payment already completed' };
            // Note: We do NOT block 'processing' here, let the Edge Function handle idempotency check
            // logic: If 'processing', Edge Function returns existing transaction instead of creating new one.
        }

        return { canProceed: true, reason: null };
    }

    /**
     * Get Payment Status for UI
     */
    static async getPaymentStatus(quoteId: string): Promise<PaymentStatus> {
        const { data: transactions } = await supabase
            .from('transactions')
            .select('status')
            .eq('quote_id', quoteId)
            .order('created_at', { ascending: false })
            .limit(1);

        if (transactions && transactions.length > 0) {
            return transactions[0].status as PaymentStatus;
        }
        return 'not_started';
    }
}

export default PaymentService;
