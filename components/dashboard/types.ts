
export type DashboardView = 'overview' | 'inquiries' | 'quotes' | 'bookings' | 'payments' | 'documents' | 'kyc' | 'support' | 'profile' | 'partner';

// --- DOMAIN: PAYMENT & TRANSACTIONS ---

export type TransactionStatus = 'pending' | 'succeeded' | 'failed';

// Strict Transaction Model per requirements
export interface Transaction {
    id: string;

    amount: number; // In cents
    currency: string;
    status: TransactionStatus;
    payment_method: string;
    invoice_id?: string;
    invoice_pdf_url?: string;
    created_at: string;

    // UI Helpers (Joined Data)
    quoteId?: string;
    quote_id?: string; // DB mapping
    userId?: string;
    user_id?: string; // DB mapping
    description?: string;
    transactionReference?: string;
}

// DTOs
export interface CheckoutDTO {
    quoteId: string;
    userId?: string;
}

export interface WebhookDTO {
    type: string;
    payload: any;
    signature: string;
}

// --- EXISTING TYPES ---

// 1. User (Customer)
export interface UserProfile {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    country: string;
    preferred_currency: string;
    email_verified: boolean;
    phone_verified: boolean;
    role: 'customer' | 'admin' | 'operator' | 'superadmin';
    created_at: string;

    // UI Helpers
    company?: string;
    position?: string;
    homeAirport?: string;
    dietaryPreferences?: string;
    notifications?: {
        email: boolean;
        sms: boolean;
        whatsapp: boolean;
    };
    memberId?: string;
    isOperator?: boolean;
    is_operator?: boolean;
    operator_status?: 'none' | 'applied' | 'approved' | 'rejected';
}

// 2. Flight Request (Inquiry)
export type InquiryStatus = 'New' | 'In Progress' | 'Quoted' | 'Booked' | 'Closed';

export interface Inquiry {
    id: string;
    customer_id: string;
    route_type: 'One Way' | 'Round Trip' | 'Multi City';
    from_airport: string;
    to_airport: string;
    departure_datetime: string;
    return_datetime?: string;
    passengers: number;
    purpose: string;
    status: InquiryStatus;
    created_at: string;
    luggage?: string;
    aircraft_preference?: string;
    notes?: string[];
    customerName?: string;
    email?: string;
    phone?: string;
}

// 6. Customer Quote (Commercial Contract)
export type QuoteStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Expired' | 'Booked';

export interface Quote {
    id: string;
    quote_request_id: string;
    inquiry_id?: string; // DB Mapping
    operator_id: string;
    aircraft_id: string;

    aircraft_model: string;
    operator_name: string;
    operator_rating: number;
    image: string;

    base_price: number;
    total_price: number; // Full Amount
    currency: string;
    tax_breakup: {
        base: number;
        tax: number;
        fees: number;
        deposit: number; // Kept for legacy display, but payment enforces total_price
    };
    valid_until: string;
    status: QuoteStatus;

    specs: {
        seats: number;
        speed: string;
        range: string;
        cabinHeight: string;
        baggage: string;
    };
    features: string[];
    terms: string[];
}

// 8. Booking
export type BookingStatus = 'Confirmed' | 'Scheduled' | 'In-Flight' | 'Completed' | 'Cancelled';

export interface Booking {
    id: string;
    booking_reference: string;
    quote_id: string;
    customer_id: string;
    operator_id: string;
    aircraft_id: string;

    route: string;
    origin: string;
    destination: string;
    departure_datetime: string;
    arrival_datetime: string;
    duration: string;

    aircraft_model: string;
    tail_number: string;

    status: BookingStatus;
    payment_status: 'Paid' | 'Partial' | 'Unpaid';

    pax_count: number;
    total_amount: number;

    catering_notes?: string;
    transport_notes?: string;
}

export interface PaginationMeta {
    currentPage: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface Document {
    id: string;
    name: string;
    type: 'Passport' | 'Visa' | 'Aadhar' | 'Invoice' | 'Ticket' | 'Contract' | 'Other';
    date: string;
    size: string;
    status: 'Verified' | 'Pending' | 'Rejected';
    url?: string;
}

export interface PassengerDetail {
    fullName: string;
    nationality: string;
    dob: string;
    passportNumber: string;
}

export interface VerificationData {
    status: 'Pending' | 'In Review' | 'Correction Required' | 'Approved';
    adminComments?: string;
    passengers: PassengerDetail[];
    documents: { type: string; name: string; status: 'uploaded' | 'pending' }[];
    declarations: { sourceOfFunds: boolean; travelPurpose: boolean; amlConsent: boolean };
}
