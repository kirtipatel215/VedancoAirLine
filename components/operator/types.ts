
export interface OperatorUser {
    id: string;
    companyName: string;
    email: string;
    verified: boolean;
    rating: number;
    balance: number;
    currency: string;
    bankAccount?: string;
}

export interface OpInquiry {
    id: string;
    maskedId: string;
    route: string;
    origin: string;
    destination: string;
    date: string;
    returnDate?: string;
    pax: number;
    aircraftType: string;
    urgency: 'Standard' | 'Medical' | 'VIP';
    slaTimeRemaining: string; // ISO string for countdown
    status: 'Open' | 'Quoted' | 'Expired';
    // Detailed Fields
    customerName?: string;
    customerTier?: string;
    tripType?: string;
    purpose?: string;
    luggage?: string;
    pets?: number;
    notes?: string;
}

export interface OpQuote {
    id: string;
    inquiryId: string;
    route: string;
    aircraftId: string;
    price: number;
    status: 'Submitted' | 'Accepted' | 'Rejected' | 'Expired';
    submittedAt: string;
    // Enhanced Fields
    clientDetails?: {
        name: string;
        email: string;
        phone: string;
        type: string;
    };
    inquiryDetails?: { // Was tripDetails, changed to match usage in OpQuotes.tsx
        date: string;
        returnDate?: string;
        pax: number;
        luggage: string;
        pets: number;
        purpose: string;
        notes: string;
    };
}

export interface OpAircraft {
    id: string;
    registration: string;
    model: string;
    type: 'Light' | 'Midsize' | 'Heavy' | 'Ultra Long';
    seats: number;
    base: string;
    status: 'Active' | 'Maintenance';
}

export interface OpFlight {
    id: string;
    bookingRef: string;
    route: string;
    date: string;
    aircraft: string;
    status: 'Confirmed' | 'In-Flight' | 'Completed' | 'Cancelled';
    paxManifest: number;
    // New Fields
    paymentStatus?: 'succeeded' | 'processing' | 'failed' | 'not_started';
    customerName?: string | null;
    customerPhone?: string | null;
    customerEmail?: string | null;
    paymentMethod?: string | null;
    totalAmount?: number;
}

export interface OpPayout {
    id: string;
    ref: string;
    amount: number;
    date: string;
    status: 'Pending' | 'Processing' | 'Paid';
}

export interface OpDocument {
    id: string;
    name: string;
    type: 'AOC' | 'Insurance' | 'Registration' | 'Pilot License';
    expiry: string;
    status: 'Approved' | 'Pending' | 'Rejected';
    reason?: string;
}
