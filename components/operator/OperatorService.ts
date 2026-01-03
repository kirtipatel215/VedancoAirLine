/**
 * Operator Service Layer
 * 
 * Production-grade service for operator dashboard operations.
 * ALL methods validate operator ownership and use database-first architecture.
 * 
 * CRITICAL RULES:
 * - No mock data
 * - All methods validate operator via OperatorGuards
 * - Proper error handling with meaningful messages
 * - Database is single source of truth
 */

import { OperatorUser, OpInquiry, OpQuote, OpAircraft, OpFlight, OpPayout, OpDocument } from "./types";
import { checkRateLimit, auditLog, sanitizeObject } from "../../utils/security.ts";
import { supabase } from "../../supabaseClient.ts";
import {
    requireOperator,
    getCurrentOperator,
    validateOperatorOwnership,
    logOperatorAction,
    OperatorNotFoundError,
    OperatorNotApprovedError,
    UnauthorizedAccessError
} from "./OperatorGuards.ts";

// ==================== Error Classes ====================

export class DataFetchError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'DataFetchError';
    }
}

export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

// ==================== Main Service ====================

export const OperatorService = {

    // ==================== Authentication ====================

    /**
     * Operator login with comprehensive validation
     */
    async login(email: string, pass: string): Promise<OperatorUser | null> {
        if (!checkRateLimit('op_login')) {
            throw new Error("Rate limit exceeded. Please try again in a few minutes.");
        }

        try {
            // 1. Authenticate with Supabase
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: email.trim().toLowerCase(),
                password: pass.trim()
            });

            if (authError) throw authError;
            if (!authData.user) return null;

            // 2. Check profile for operator role
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authData.user.id)
                .single();

            if (profileError || !profile) {
                await supabase.auth.signOut();
                throw new Error("Profile not found");
            }

            // 3. Validate operator status
            if (!profile.is_operator) {
                await supabase.auth.signOut();
                throw new UnauthorizedAccessError("This email is not registered as an operator");
            }

            if (profile.operator_status !== 'approved') {
                await supabase.auth.signOut();
                const status = profile.operator_status || 'not submitted';
                throw new OperatorNotApprovedError(status);
            }

            // 4. Get operator record
            const { data: operator, error: opError } = await supabase
                .from('operators')
                .select('*')
                .eq('email', email.trim().toLowerCase())
                .eq('status', 'Active')
                .single();

            if (opError || !operator) {
                await supabase.auth.signOut();
                throw new OperatorNotFoundError("Operator account not found or inactive");
            }

            // 5. Construct operator user object
            const userObj: OperatorUser = {
                id: operator.id,
                companyName: operator.company_name || operator.name,
                email: operator.email,
                verified: true,
                rating: operator.rating || 5.0,
                balance: 0, // TODO: Calculate from bookings/payouts
                currency: 'USD',
                bankAccount: operator.bank_account
            };

            auditLog('Operator', 'LOGIN_SUCCESS', operator.id, 'SUCCESS');
            logOperatorAction(operator.id, 'login', { email });

            return userObj;

        } catch (err: any) {
            auditLog(email, 'OPERATOR_LOGIN_FAIL', 'Auth', 'FAILURE', { error: err.message });
            throw err;
        }
    },

    /**
     * Check operator status (for session validation)
     */
    async checkOperatorStatus(email: string): Promise<OperatorUser | null> {
        const { data: operator, error } = await supabase
            .from('operators')
            .select('*')
            .eq('email', email.trim().toLowerCase())
            .eq('status', 'Active')
            .single();

        if (error || !operator) return null;

        return {
            id: operator.id,
            companyName: operator.company_name || operator.name,
            email: operator.email,
            verified: true,
            rating: operator.rating || 5.0,
            balance: 0,
            currency: 'USD',
            bankAccount: operator.bank_account
        };
    },

    // ==================== Dashboard Data ====================

    /**
     * Get dashboard statistics
     */
    async getStats() {
        const { operator } = await requireOperator();

        const [requestsData, quotesData, flightsData, payoutsData] = await Promise.all([
            supabase.from('inquiries').select('id', { count: 'exact', head: true }).in('status', ['New', 'Open']),
            supabase.from('quotes').select('id', { count: 'exact', head: true }).eq('operator_id', operator.id).eq('status', 'Pending'),
            supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('operator_id', operator.id).in('status', ['Confirmed', 'In-Flight']),
            supabase.from('bookings').select('total_amount').eq('operator_id', operator.id).eq('payment_status', 'Pending')
        ]);

        const pendingPayout = (payoutsData.data || []).reduce((sum, b: any) => sum + (b.total_amount || 0), 0);

        return {
            newRequests: requestsData.count || 0,
            submittedQuotes: quotesData.count || 0,
            upcomingFlights: flightsData.count || 0,
            earningsPending: Math.floor(pendingPayout * 0.85) // 85% after platform fee
        };
    },

    /**
     * Get marketplace requests (inquiries available for quoting)
     */
    async getRequests(): Promise<OpInquiry[]> {
        const { operator } = await requireOperator();

        // Get inquiries that:
        // 1. Are "New" or "Open" (available for quoting)
        // 2. Haven't been quoted by THIS operator yet
        const { data: quotedIds } = await supabase
            .from('quotes')
            .select('inquiry_id')
            .eq('operator_id', operator.id);

        const alreadyQuoted = (quotedIds || []).map((q: any) => q.inquiry_id);

        const { data: inquiries, error } = await supabase
            .from('inquiries')
            .select('*')
            .in('status', ['New', 'Open']) // Include both New and Open statuses
            .not('id', 'in', alreadyQuoted.length > 0 ? `(${alreadyQuoted.join(',')})` : '()')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw new DataFetchError(`Failed to fetch requests: ${error.message}`);
        if (!inquiries) return [];

        return inquiries.map((i: any) => ({
            id: i.id,
            maskedId: i.id.substring(0, 8).toUpperCase(),
            route: `${i.from_airport} → ${i.to_airport}`,
            origin: i.from_airport,
            destination: i.to_airport,
            date: i.departure_datetime,
            returnDate: i.return_datetime,
            pax: i.passengers,
            aircraftType: i.aircraft_preference || 'Any',
            urgency: 'Standard',
            slaTimeRemaining: new Date(Date.now() + 86400000).toISOString(), // 24h to quote
            status: i.status, // Use actual status from database
            tripType: i.route_type,
            notes: i.notes || '',
            luggage: i.luggage || 'Standard'
        }));
    },

    /**
     * Submit a quote for an inquiry
     */
    async submitQuote(inquiryId: string, aircraftId: string, price: number, user: OperatorUser) {
        if (!checkRateLimit('submit_quote')) {
            throw new Error("Too many submissions. Please wait a moment.");
        }

        const { operator } = await requireOperator();

        // Validate aircraft belongs to this operator
        const { data: aircraft, error: acError } = await supabase
            .from('aircraft')
            .select('*')
            .eq('id', aircraftId)
            .eq('operator_id', operator.id)
            .single();

        if (acError || !aircraft) {
            throw new ValidationError("Aircraft not found or does not belong to you");
        }

        // Check if already quoted
        const { data: existing } = await supabase
            .from('quotes')
            .select('id')
            .eq('inquiry_id', inquiryId)
            .eq('operator_id', operator.id)
            .single();

        if (existing) {
            throw new ValidationError("You have already submitted a quote for this inquiry");
        }

        // Create quote
        const quotePayload = {
            inquiry_id: inquiryId,
            operator_id: operator.id,
            aircraft_model: `${aircraft.registration} (${aircraft.model})`,
            operator_name: operator.company_name || operator.name,
            base_price: price,
            total_price: Math.floor(price * 1.15), // 15% platform fee
            currency: 'USD',
            tax_breakup: {
                base: price,
                platformFee: price * 0.15
            },
            valid_until: new Date(Date.now() + 172800000).toISOString(), // 48h validity
            status: 'Pending',
            specs: {
                seats: aircraft.seats,
                type: aircraft.type,
                registration: aircraft.registration
            },
            created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('quotes')
            .insert([quotePayload])
            .select()
            .single();

        if (error) {
            throw new DataFetchError(`Failed to submit quote: ${error.message}`);
        }

        logOperatorAction(operator.id, 'quote_submitted', { inquiryId, price, aircraftId });
        auditLog('Operator', 'SUBMIT_QUOTE', inquiryId, 'SUCCESS');

        return data;
    },

    /**
     * Get operator's submitted quotes
     */
    async getQuotes(): Promise<OpQuote[]> {
        const { operator } = await requireOperator();

        const { data: quotes, error } = await supabase
            .from('quotes')
            .select(`
        *,
        inquiry:inquiries(*)
      `)
            .eq('operator_id', operator.id)
            .order('created_at', { ascending: false });

        if (error) throw new DataFetchError(`Failed to fetch quotes: ${error.message}`);
        if (!quotes) return [];

        return quotes.map((q: any) => ({
            id: q.id,
            inquiryId: q.inquiry_id,
            route: q.inquiry ? `${q.inquiry.from_airport} → ${q.inquiry.to_airport}` : 'N/A',
            aircraftId: q.aircraft_model,
            price: q.total_price,
            status: q.status,
            submittedAt: q.created_at,
            inquiryDetails: q.inquiry ? {
                date: q.inquiry.departure_datetime,
                returnDate: q.inquiry.return_datetime,
                pax: q.inquiry.passengers,
                luggage: q.inquiry.luggage || 'Standard',
                pets: 0,
                purpose: q.inquiry.purpose || '',
                notes: q.inquiry.notes || ''
            } : undefined
        }));
    },

    /**
     * Withdraw a submitted quote
     */
    async withdrawQuote(id: string) {
        const { operator } = await requireOperator();

        // Validate ownership
        const { data: quote, error: fetchError } = await supabase
            .from('quotes')
            .select('operator_id')
            .eq('id', id)
            .single();

        if (fetchError || !quote) {
            throw new DataFetchError("Quote not found");
        }

        if (quote.operator_id !== operator.id) {
            throw new UnauthorizedAccessError("This quote does not belong to you");
        }

        const { error } = await supabase
            .from('quotes')
            .update({ status: 'Withdrawn' })
            .eq('id', id);

        if (error) throw new DataFetchError(`Failed to withdraw quote: ${error.message}`);

        logOperatorAction(operator.id, 'quote_withdrawn', { quoteId: id });
        return true;
    },

    // ==================== Fleet Management ====================

    /**
     * Get operator's aircraft fleet
     */
    async getAircraft(): Promise<OpAircraft[]> {
        const { operator } = await requireOperator();

        const { data, error } = await supabase
            .from('aircraft')
            .select('*')
            .eq('operator_id', operator.id)
            .order('created_at', { ascending: false });

        if (error) {
            if (error.code === '42501') {
                throw new DataFetchError(
                    "Permission denied. Please ensure RLS policies are applied (run 20251230_aircraft_complete.sql)"
                );
            }
            throw new DataFetchError(`Failed to fetch aircraft: ${error.message}`);
        }

        return (data || []).map((a: any) => ({
            id: a.id,
            registration: a.registration,
            model: a.model,
            type: a.type,
            seats: a.seats,
            base: a.base,
            status: a.status
        }));
    },

    /**
     * Add new aircraft to fleet
     */
    async addAircraft(aircraft: Omit<OpAircraft, 'id'>) {
        const { operator } = await requireOperator();

        const { error } = await supabase
            .from('aircraft')
            .insert([{
                ...aircraft,
                operator_id: operator.id,
                created_at: new Date().toISOString()
            }]);

        if (error) {
            throw new DataFetchError(`Failed to add aircraft: ${error.message}`);
        }

        logOperatorAction(operator.id, 'aircraft_added', { registration: aircraft.registration });
        auditLog('Operator', 'ADD_AIRCRAFT', aircraft.registration, 'SUCCESS');
        return true;
    },

    /**
     * Update aircraft status
     */
    async updateAircraftStatus(id: string, status: string) {
        const { operator } = await requireOperator();

        // Validate ownership
        const { data: aircraft, error: fetchError } = await supabase
            .from('aircraft')
            .select('operator_id')
            .eq('id', id)
            .single();

        if (fetchError || !aircraft || aircraft.operator_id !== operator.id) {
            throw new UnauthorizedAccessError("Aircraft not found or does not belong to you");
        }

        const { error } = await supabase
            .from('aircraft')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw new DataFetchError(`Failed to update status: ${error.message}`);

        logOperatorAction(operator.id, 'aircraft_status_updated', { aircraftId: id, newStatus: status });
        return true;
    },

    // ==================== Bookings & Flights ====================

    /**
     * Get bookings assigned to this operator
     */
    async getFlights(): Promise<OpFlight[]> {
        const { operator } = await requireOperator();

        // Use Secure RPC to get bookings with conditional contact info
        const { data: bookings, error } = await supabase.rpc('get_operator_bookings_secure');

        if (error) {
            // Fallback for dev if RPC missing, though production should have it
            console.error("RPC Error, falling back to basic query:", error);
            const { data: basicBookings, error: basicError } = await supabase
                .from('bookings')
                .select('*')
                .eq('operator_id', operator.id)
                .in('status', ['Confirmed', 'In-Flight', 'Completed', 'Cancelled'])
                .order('departure_datetime', { ascending: true });

            if (basicError) throw new DataFetchError(`Failed to fetch flights: ${basicError.message}`);
            return (basicBookings || []).map((b: any) => ({
                id: b.id,
                bookingRef: b.booking_reference || b.id.substring(0, 8).toUpperCase(),
                route: `${b.from_airport || 'Origin'} → ${b.to_airport || 'Dest'}`,
                date: b.departure_datetime,
                aircraft: b.aircraft_model || 'TBD',
                status: b.status,
                paxManifest: b.passengers || 0,
                // Fallback basic data
                paymentStatus: b.payment_status,
                customerName: null,
                customerPhone: null,
                paymentMethod: null
            }));
        }

        if (!bookings) return [];

        return bookings.map((b: any) => ({
            id: b.booking_id,
            bookingRef: b.booking_ref,
            route: b.route,
            date: b.departure_date,
            aircraft: b.aircraft_model,
            status: b.status,
            paxManifest: b.pax_count || 0,
            // Secure fields from RPC
            paymentStatus: b.payment_status,
            customerName: b.customer_name,
            customerPhone: b.customer_phone,
            customerEmail: b.customer_email,
            paymentMethod: b.payment_method,
            totalAmount: b.total_amount
        }));
    },

    /**
     * Update flight status
     */
    async updateFlightStatus(id: string, status: string) {
        const { operator } = await requireOperator();

        // Validate ownership
        const { data: booking, error: fetchError } = await supabase
            .from('bookings')
            .select('operator_id')
            .eq('id', id)
            .single();

        if (fetchError || !booking || booking.operator_id !== operator.id) {
            throw new UnauthorizedAccessError("Booking not found or does not belong to you");
        }

        const { error } = await supabase
            .from('bookings')
            .update({ status })
            .eq('id', id);

        if (error) throw new DataFetchError(`Failed to update flight status: ${error.message}`);

        logOperatorAction(operator.id, 'flight_status_updated', { bookingId: id, newStatus: status });
        return true;
    },

    // ==================== Finance ====================

    /**
     * Get payouts for this operator
     */
    async getPayouts(): Promise<OpPayout[]> {
        const { operator } = await requireOperator();

        // Get completed bookings with payment info
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('operator_id', operator.id)
            .eq('status', 'Completed')
            .order('completed_at', { ascending: false });

        if (error) throw new DataFetchError(`Failed to fetch payouts: ${error.message}`);
        if (!bookings) return [];

        return bookings.map((b: any) => ({
            id: b.id,
            ref: b.reference_number || b.id.substring(0, 8).toUpperCase(),
            amount: Math.floor((b.total_amount || 0) * 0.85), // 85% after 15% platform fee
            date: b.completed_at || b.created_at,
            status: b.payment_status === 'Paid' ? 'Paid' : 'Pending'
        }));
    },

    // ==================== Documents ====================

    /**
     * Get operator documents
     */
    async getDocuments(): Promise<OpDocument[]> {
        const { operator } = await requireOperator();

        const { data: docs, error } = await supabase
            .from('operator_documents')
            .select('*')
            .eq('operator_id', operator.id)
            .order('uploaded_at', { ascending: false });

        if (error) throw new DataFetchError(`Failed to fetch documents: ${error.message}`);
        if (!docs) return [];

        return docs.map((d: any) => ({
            id: d.id,
            name: d.file_name,
            type: d.document_type,
            expiry: d.expiry_date,
            status: d.status,
            reason: d.rejection_reason
        }));
    },

    /**
     * Upload document
     */
    async uploadDocument(file: File, type: string, expiryDate?: string) {
        const { operator } = await requireOperator();

        // TODO: Implement actual file upload to Supabase Storage
        // For now, just create the record
        const { error } = await supabase
            .from('operator_documents')
            .insert([{
                operator_id: operator.id,
                document_type: type,
                file_name: file.name,
                file_size: file.size,
                expiry_date: expiryDate,
                status: 'Pending',
                uploaded_at: new Date().toISOString()
            }]);

        if (error) throw new DataFetchError(`Failed to upload document: ${error.message}`);

        logOperatorAction(operator.id, 'document_uploaded', { type, fileName: file.name });
        return true;
    },

    // ==================== Settings ====================

    /**
     * Get customers who have booked with this operator
     */
    async getCustomers() {
        const { operator } = await requireOperator();

        const { data: bookings, error } = await supabase
            .from('bookings')
            .select(`
        id,
        total_amount,
        created_at,
        customer:profiles!bookings_user_id_fkey (
          id,
          first_name,
          last_name,
          email,
          phone_number
        )
      `)
            .eq('operator_id', operator.id);

        if (error) throw new DataFetchError(`Failed to fetch customers: ${error.message}`);
        if (!bookings || bookings.length === 0) return [];

        // Aggregate by customer
        const customerMap = new Map();

        bookings.forEach((b: any) => {
            if (!b.customer) return;

            const cid = b.customer.id;
            if (!customerMap.has(cid)) {
                customerMap.set(cid, {
                    id: cid,
                    name: `${b.customer.first_name || ''} ${b.customer.last_name || ''}`.trim() || 'Unknown',
                    email: b.customer.email,
                    phone: b.customer.phone_number || '-',
                    status: 'Active',
                    totalSpent: 0,
                    lastBooking: b.created_at,
                    bookingsCount: 0,
                    tier: 'Silver',
                    avatar: `${b.customer.first_name?.[0] || 'U'}${b.customer.last_name?.[0] || 'K'}`
                });
            }

            const c = customerMap.get(cid);
            c.totalSpent += b.total_amount || 0;
            c.bookingsCount += 1;
            if (new Date(b.created_at) > new Date(c.lastBooking)) {
                c.lastBooking = b.created_at;
            }

            // Determine tier
            if (c.totalSpent > 100000) c.tier = 'Platinum';
            else if (c.totalSpent > 50000) c.tier = 'Gold';
        });

        return Array.from(customerMap.values());
    },

    /**
     * Update operator settings
     */
    async updateSettings(data: { companyName: string, email: string, account: string }) {
        const { operator } = await requireOperator();

        const { error } = await supabase
            .from('operators')
            .update({
                company_name: data.companyName,
                name: data.companyName, // Keep both for compatibility
                bank_account: data.account,
                updated_at: new Date().toISOString()
            })
            .eq('id', operator.id);

        if (error) throw new DataFetchError(`Failed to update settings: ${error.message}`);

        logOperatorAction(operator.id, 'settings_updated', { fields: Object.keys(data) });
        return true;
    }
};
