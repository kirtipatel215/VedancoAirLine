

import { Booking, Inquiry, PaginationMeta, Quote, UserProfile, Transaction, CheckoutDTO, VerificationData } from "./types";
import { auditLog } from "../../utils/security.ts";
import { supabase, supabaseUrl, supabaseAnonKey } from "../../supabaseClient.ts";
import ACIDPaymentService from './PaymentService';


// --- DATA ACCESS LAYER (SUPABASE REPOSITORY) ---

class TransactionRepository {
    async create(data: Partial<Transaction>): Promise<Transaction> {
        // Note: Payment creation is now handled by the 'initiate-payment' Edge Function.
        // This method is kept for compatibility but throws an error to enforce new flow.
        throw new Error("Direct transaction creation is deprecated. Use initiate-payment Edge Function.");
    }

    async findById(id: string): Promise<Transaction | undefined> {
        const { data, error } = await supabase
            .from('payments')
            .select('*, bookings(*)')
            .eq('id', id)
            .single();

        if (error) return undefined;
        return this.mapToModel(data);
    }

    async update(id: string, updates: Partial<Transaction>): Promise<void> {
        // Limited updates allowed from client side if any
        const dbUpdates: any = {};
        if (updates.status) dbUpdates.status = updates.status === 'succeeded' ? 'success' : updates.status;

        if (Object.keys(dbUpdates).length > 0) {
            await supabase.from('payments').update(dbUpdates).eq('id', id);
        }
    }

    async findPaginated(page: number, limit: number): Promise<{ data: Transaction[], total: number }> {
        const start = (page - 1) * limit;
        const end = start + limit - 1;

        const { data, count, error } = await supabase
            .from('payments')
            .select('*, bookings(*)', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(start, end);

        if (error) {
            console.error("Error fetching payments:", error);
            return { data: [], total: 0 };
        }

        return {
            data: (data || []).map(this.mapToModel),
            total: count || 0
        };
    }

    private mapToModel(dbRow: any): Transaction {
        // Map new DB status to frontend types if necessary, or just pass through
        // DB: initiated, success, failed
        // Frontend likely expects: succeeded, processing, failed? 
        // Let's normalize to 'succeeded' for compatibility with existing UI code
        let status: any = dbRow.status;
        if (dbRow.status === 'success') status = 'succeeded';
        if (dbRow.status === 'initiated') status = 'processing';

        // Derive description from booking details if available
        let description = 'Flight Booking';
        if (dbRow.bookings && dbRow.bookings.flight_details) {
            const fd = dbRow.bookings.flight_details;
            // distinct description if possible, e.g. "Flight to London"
            // Assuming flight_details might have destination info
            // For now, generic fallback or utilize available fields
            if (fd.destination_city) {
                description = `Flight to ${fd.destination_city}`;
            } else if (dbRow.bookings.booking_reference) {
                description = `Booking ${dbRow.bookings.booking_reference}`;
            }
        }

        return {
            id: dbRow.id,
            amount: dbRow.amount,
            currency: dbRow.currency,
            status: status,
            payment_method: dbRow.payment_method,
            invoice_pdf_url: null, // Not yet implemented in new system
            created_at: dbRow.created_at,
            quoteId: dbRow.bookings?.quote_id, // valid join
            description: description,
            userId: dbRow.user_id,
            transactionReference: dbRow.transaction_reference
        };
    }
}

// --- DOMAIN SERVICE LAYER ---
class PaymentService {
    private repo: TransactionRepository;

    constructor() {
        this.repo = new TransactionRepository();
    }

    // BUSINESS RULE: Payments must be 100% of project amount
    async createCheckoutSession(dto: CheckoutDTO): Promise<{ url: string, transactionId: string }> {
        // Obsolete: Use SecureApiService.initiateCheckout instead which calls the backend Edge Function
        throw new Error("Use SecureApiService.initiateCheckout()");
    }

    async handleWebhookSimulation(transactionId: string): Promise<Transaction> {
        // Deprecated: Stripe Simulation removed.
        const transaction = await this.repo.findById(transactionId);
        return transaction!;
    }

    async getHistory(page: number, limit: number) {
        return this.repo.findPaginated(page, limit);
    }
}

// --- CONTROLLER EXPORTS ---
const paymentService = new PaymentService();

export const SecureApiService = {
    // --- PAYMENTS CONTROLLER ---
    async initiateCheckout(quoteId: string, userId?: string) {
        console.log("🚀 Initiating Stripe Checkout Session...");
        // 0. Ensure Valid Session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
            console.error("Session Error:", sessionError);
            throw new Error("User not authenticated - No active session");
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User context missing");

        // 1. Create Booking Record first (Pending)
        const booking = await this.acceptOffer(quoteId);

        if (!booking || !booking.id) {
            throw new Error("Failed to create booking record");
        }

        // 2. Call Edge Function with Explicit Auth
        const origin = window.location.origin;
        console.log("Calling Edge Function with Token:", session.access_token.substring(0, 10) + "...");

        const { data, error } = await supabase.functions.invoke('create-checkout-session', {
            body: {
                booking_id: booking.id,
                success_url: `${origin}/dashboard/quotes?session_id={CHECKOUT_SESSION_ID}&action=verify_payment`,
                cancel_url: `${origin}/dashboard/quotes?status=cancelled`
            },
            headers: {
                Authorization: `Bearer ${session.access_token}`
            }
        });

        if (error) {
            console.error('Stripe Checkout system error:', error);
            throw new Error(error.message || 'Failed to connect to payment service');
        }

        if (data && data.ok === false) {
            console.error('Stripe Checkout logic error:', data.error);
            throw new Error("Payment Error: " + data.error);
        }

        if (!data?.url) {
            throw new Error("No redirect URL returned from Stripe");
        }

        return {
            transactionId: booking.id,
            redirectUrl: data.url,
            status: 'processing'
        };
    },

    async verifyPaymentSession(sessionId: string) {
        console.log("Verifying payment session:", sessionId);
        const { data, error } = await supabase.functions.invoke('verify-payment', {
            body: { session_id: sessionId }
        });

        if (error) {
            console.error("Verification failed:", error);
            throw new Error(error.message);
        }

        return data; // { verified: true, status: 'paid', booking_id: ... }
    },

    async finalizePayment(transactionId: string, status: 'succeeded' | 'failed', stripeId?: string) {
        // Deprecated
    },

    async verifyTransaction(transactionId: string) {
        // Legacy local verification
        const { data: transaction, error } = await supabase
            .from('payments')
            .select('*')
            .eq('id', transactionId)
            .single();

        if (error || !transaction) {
            return { verified: false, status: 'failed' };
        }

        return {
            verified: transaction.payment_status === 'succeeded',
            status: transaction.payment_status,
            transaction: transaction
        };
    },

    async getInvoice(transactionId: string) {
        const { data, error } = await supabase.functions.invoke('get-invoice', {
            body: { transactionId },
        });

        if (error) {
            console.error('Invoice retrieval error:', error);
            throw new Error(error.message || 'Failed to get invoice');
        }

        return data;
    },

    async getPayments(page: number = 1) {
        const { data, total } = await paymentService.getHistory(page, 10);
        return {
            data,
            pagination: {
                currentPage: page,
                limit: 10,
                totalRecords: total,
                totalPages: Math.ceil(total / 10),
                hasNext: page < Math.ceil(total / 10),
                hasPrev: page > 1
            }
        };
    },

    // --- FETCHERS USING SUPABASE ---

    paginateArray<T>(array: T[], page: number, limit: number): { data: T[], pagination: PaginationMeta } {
        const total = array.length;
        const start = (page - 1) * limit;
        const end = start + limit;
        const data = array.slice(start, end);

        return {
            data,
            pagination: {
                currentPage: page,
                limit,
                totalRecords: total,
                totalPages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        };
    },

    async getInquiries() {
        // SECURITY FIX: Do NOT filter by customer_id manually here if RLS is enabled.
        // The RLS policy on the database will ensure:
        // 1. Customers only see their own rows.
        // 2. Operators see ALL rows (for the marketplace).
        const { data } = await supabase
            .from('inquiries')
            .select('*')
            .order('created_at', { ascending: false });
        return data || [];
    },

    async getQuotes(page: number = 1, limit: number = 10, filters: { status?: string, search?: string, tab?: 'active' | 'history' } = {}) {
        console.log('🔍 getQuotes: Fetching paginated quotes...', { page, limit, filters });
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { data: [], pagination: { currentPage: 1, limit, totalRecords: 0, totalPages: 0, hasNext: false, hasPrev: false } };

        try {
            // Start building the query
            // We need to filter quotes that belong to inquiries made by this user.
            // Using !inner join to ensure we only get quotes for this user's inquiries.
            let query = supabase
                .from('quotes')
                .select('*, inquiries!inner(customer_id)', { count: 'exact' })
                .eq('inquiries.customer_id', user.id);

            // 1. Tab Filter
            if (filters.tab === 'history') {
                // History: Expired, Rejected, Booked
                query = query.in('status', ['Expired', 'Rejected', 'Booked']);
            } else {
                // Active: Pending, Accepted (and default/others if any, excluding history ones)
                // It's safer to explicitly exclude history statuses to define 'Active'
                query = query.not('status', 'in', '("Expired","Rejected","Booked")');
            }

            // 2. Status Filter
            if (filters.status && filters.status !== 'All') {
                query = query.eq('status', filters.status);
            }

            // 3. Search Query
            if (filters.search) {
                // Search in aircraft_model, operator_name, or ID
                // Note: Supabase 'or' syntax with foreign tables can be tricky.
                // Simple ILIKE on columns in 'quotes' table:
                const searchTerm = `%${filters.search}%`;
                query = query.or(`aircraft_model.ilike.${searchTerm},operator_name.ilike.${searchTerm},id.ilike.${searchTerm}`);
            }

            // 4. Sorting
            // Requirement: Pending first in Active tab.
            // "Pending" > "Accepted" alphabetically? P > A. So Descending puts P first.
            // However, we also want newest first usually.
            // Let's implement specific sorting for Active tab.
            if (filters.tab === 'active' || !filters.tab) {
                query = query.order('status', { ascending: false }); // Pending (P) -> Accepted (A)
                query = query.order('created_at', { ascending: false });
            } else {
                query = query.order('created_at', { ascending: false });
            }

            // 5. Pagination
            const start = (page - 1) * limit;
            const end = start + limit - 1;
            query = query.range(start, end);

            const { data, count, error } = await query;

            if (error) {
                console.error('❌ getQuotes: Database error:', error);
                throw error;
            }

            console.log(`✅ getQuotes: Found ${data?.length} quotes (Total: ${count})`);

            const mappedData = (data || []).map(q => {
                // Parse specs if it's a string
                const specs = typeof q.specs === 'string' ? JSON.parse(q.specs) : (q.specs || {});

                // Parse or construct tax_breakup
                let tax_breakup;
                if (typeof q.tax_breakup === 'string') {
                    tax_breakup = JSON.parse(q.tax_breakup);
                } else if (q.tax_breakup) {
                    tax_breakup = q.tax_breakup;
                } else {
                    // Calculate from base_price if not present
                    const base = q.base_price || (q.total_price ? q.total_price / 1.15 : 0);
                    tax_breakup = {
                        base: Math.floor(base),
                        tax: Math.floor((q.total_price || 0) - base),
                        fees: 0,
                        deposit: 0
                    };
                }

                return {
                    id: q.id,
                    inquiry_id: q.inquiry_id,
                    quote_request_id: q.inquiry_id,
                    operator_id: q.operator_id,
                    aircraft_id: q.operator_id,
                    aircraft_model: q.aircraft_model || 'Private Jet',
                    operator_name: q.operator_name || 'Vedanco Partner',
                    operator_rating: 5.0,
                    base_price: q.base_price || Math.floor((q.total_price || 0) / 1.15),
                    total_price: q.total_price || 0,
                    currency: q.currency || 'USD',
                    status: q.status || 'Pending',
                    valid_until: q.valid_until,
                    created_at: q.created_at,
                    terms: ['Standard charter terms apply', 'Payment due upon booking', 'Cancellation policy applies'],
                    image: q.image || 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=800&q=80',
                    specs: {
                        seats: specs.seats || 8,
                        range: specs.range || '3,500 nm',
                        speed: specs.speed || 'Mach 0.80',
                        type: specs.type || 'Heavy Jet',
                        ...specs
                    },
                    tax_breakup,
                    features: q.features || []
                };
            });

            return {
                data: mappedData,
                pagination: {
                    currentPage: page,
                    limit,
                    totalRecords: count || 0,
                    totalPages: Math.ceil((count || 0) / limit),
                    hasNext: page < Math.ceil((count || 0) / limit),
                    hasPrev: page > 1
                }
            };

        } catch (err) {
            console.error('getQuotes failed:', err);
            return { data: [], pagination: { currentPage: 1, limit, totalRecords: 0, totalPages: 0, hasNext: false, hasPrev: false } };
        }
    },

    async getBookings() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        // RLS handles visibility
        const { data } = await supabase
            .from('bookings')
            .select('*')
            .order('created_at', { ascending: false });

        // Map flight_details back to top level for UI compatibility if needed
        return (data || []).map(b => ({
            ...b,
            ...b.flight_details, // Flatten details for UI
            status: b.booking_status // Map booking_status to status
        }));
    },

    async createInquiry(rawData: any) {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) throw new Error("Must be logged in");

        const { error } = await supabase.from('inquiries').insert([{
            customer_id: user.id,
            from_airport: rawData.from,
            to_airport: rawData.to,
            departure_datetime: rawData.date || null,
            return_datetime: (rawData.route_type === 'Round Trip' && rawData.returnDate) ? rawData.returnDate : null,
            passengers: parseInt(rawData.passengers) || 1,
            purpose: rawData.purpose,
            status: 'New',
            route_type: rawData.route_type || 'One Way',
            luggage: rawData.luggage || null,
            notes: rawData.notes ? [rawData.notes] : [] // Convert note string to array if needed by Schema, or keep as string if Schema allows. Typically notes is text[] or text.
            // Checking type definition: notes?: string[]; so it expects an array of strings.
        }]);

        if (error) throw new Error(error.message);
        auditLog('Customer', 'CREATE_INQUIRY', 'Supabase', 'SUCCESS');
        return true;
    },

    // MARKETPLACE TRANSACTION: Select Offer -> Create Booking -> (Later) Payment
    async acceptOffer(quoteId: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Unauthorized");

        // 1. Fetch Quote
        const { data: quote, error: qError } = await supabase.from('quotes').select('*').eq('id', quoteId).single();
        if (qError || !quote) throw new Error("Quote not found");

        // 2. Reject other quotes for the same inquiry
        if (quote.inquiry_id) {
            await supabase.from('quotes')
                .update({ status: 'Rejected' })
                .eq('inquiry_id', quote.inquiry_id)
                .neq('id', quoteId);

            // 3. Update Inquiry Status
            await supabase.from('inquiries')
                .update({ status: 'Booked' })
                .eq('id', quote.inquiry_id);
        }

        // 4. Set Selected Quote to Accepted
        await supabase.from('quotes').update({ status: 'Accepted' }).eq('id', quoteId);

        // 5. Create Booking Record (Status: Confirmed, Payment: Pending)
        const bookingRef = "BKG-" + (Math.floor(Math.random() * 90000) + 10000);
        const { data: booking, error: bError } = await supabase.from('bookings').insert([{
            booking_reference: bookingRef,
            quote_id: quote.id,
            flight_id: quote.id, // Mapping quote_id to flight_id
            user_id: user.id, // Using user_id as per new schema
            total_amount: quote.total_price,
            currency: quote.currency || 'USD',
            booking_status: 'pending',
            flight_details: {
                operator_id: quote.operator_id,
                route: 'Charter',
                origin: 'Origin', // Should link to inquiry for real data
                destination: 'Dest',
                departure_datetime: new Date().toISOString(),
                aircraft_model: quote.aircraft_model,
                pax_count: 1
            }
        }]).select().single();

        if (bError) throw new Error("Booking creation failed: " + bError.message);

        auditLog('Customer', 'ACCEPT_OFFER', quoteId, 'SUCCESS');
        return booking;
    },

    async confirmBookingPayment(quoteId: string) {
        // Find bookings linked to this quote and update to Paid
        const { data: bookings } = await supabase.from('bookings').select('id').eq('quote_id', quoteId);

        if (bookings && bookings.length > 0) {
            await supabase.from('bookings')
                .update({ payment_status: 'Paid', status: 'Confirmed' })
                .in('id', bookings.map(b => b.id));
        }
    },

    async getProfile() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (!profile) return null;

        return {
            id: profile.id,
            first_name: profile.first_name,
            last_name: profile.last_name,
            email: user.email || '',
            phone_number: profile.phone_number,
            country: profile.country || 'Unknown',
            preferred_currency: profile.preferred_currency || 'USD',
            role: profile.role || 'customer',
            isOperator: profile.is_operator || false,
            operator_status: profile.operator_status || 'none',
            email_verified: true,
            phone_verified: true,
            created_at: profile.created_at,
            company: profile.company,
            homeAirport: profile.home_airport
        } as UserProfile;
    },

    async updateProfile(data: UserProfile) {
        const { error } = await supabase
            .from('profiles')
            .update({
                first_name: data.first_name,
                last_name: data.last_name,
                phone_number: data.phone_number,
                country: data.country,
                company: data.company,
                preferred_currency: data.preferred_currency,
                home_airport: data.homeAirport
            })
            .eq('id', data.id);

        if (error) throw new Error(error.message);
        return true;
    },

    // Legacy Mocks required for other UI components (Documents/KYC)
    async getDocuments() { return []; },
    async uploadDocument(file: File, docType: string) { return { id: 'doc-1', name: file.name, type: docType, status: 'Pending', size: '1MB', date: new Date().toLocaleDateString() }; },
    async deleteDocument(id: string) { return true; },
    async getVerificationData() { return { status: 'Pending', passengers: [], documents: [], declarations: { sourceOfFunds: false, travelPurpose: false, amlConsent: false } } as VerificationData; },
    async submitVerification(data: VerificationData) { return true; },
    async updateBookingService(id: string, type: 'catering' | 'transport', value: string) { return true; }
};

// --- EXPORT MOCKS FOR COMPATIBILITY ---
export const DB_INQUIRIES: Inquiry[] = [];
export const DB_QUOTES: Quote[] = [];
export const DB_BOOKINGS: Booking[] = [];
export const DB_PAYMENTS: Transaction[] = [];
