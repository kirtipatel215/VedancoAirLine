
export type AdminRole = 'admin' | 'superadmin';

export interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: AdminRole;
    lastLogin: string;
}

export interface AuditLog {
    id: string;
    action: string;
    entity: string;
    entityId: string;
    adminName: string;
    timestamp: string;
    details: string;
}

export type ApplicationStatus = 'Applied' | 'Under Review' | 'Verified' | 'Approved' | 'Rejected';
export type OperatorStatus = 'Active' | 'Suspended' | 'Under Review';

export interface OperatorApplication {
    id: string;
    user_id?: string; // Foreign Key to profiles
    companyName: string;
    country: string;
    contactPerson: string;
    email: string;
    submittedDate: string;
    status: ApplicationStatus;
    rejectionReason?: string;
    slaDeadline: string; // ISO String for 48h timer

    // Documents flattened for table view
    documents: { name: string; type: string; url: string; category: 'Company' | 'Aircraft' | 'Pilot' | 'Finance'; status: 'Pending' | 'Verified' | 'Rejected' }[];

    // Enhanced Fields matching DB schema
    details?: {
        brandName: string;
        regNumber: string;
        incorporationYear: string;
        registeredAddress: string;
        baseAirports: string[];
        website?: string;
    };
    contact?: {
        firstName: string;
        lastName: string;
        designation: string;
        mobile: string;
        alternateContact?: string;
        emailVerified: boolean;
        mobileVerified: boolean;
        isProfileDataModified: boolean;
    };
    business?: {
        taxId: string;
        billingAddress: string;
        currency: string;
        bankCountry: string;
    };
    banking?: {
        bankName: string;
        accountHolder: string;
        accountNumber: string; // Masked in UI
        ifscSwift: string;
        currency: string;
        country: string;
    };
    operations?: {
        fleetSize: string;
        categories: string[];
        regions: string[];
        responseTime: string;
        medicalCapability: boolean;
        internationalCapability: boolean;
    };
    fleetDetails?: {
        reg: string;
        model: string;
        base: string;
        docs: { name: string; type: string; status: 'Pending' | 'Uploaded' }[];
    }[];
    declarations?: {
        accurate: boolean;
        terms: boolean;
        auditConsent: boolean;
    };
}

export interface Operator {
    id: string;
    name: string;
    email: string;
    country: string;
    status: OperatorStatus;
    aircraftCount: number;
    rating: number;
    slaScore: number;
    joinedDate: string;
}

export interface CustomerUser {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: 'Active' | 'Suspended';
    joinDate: string;
    totalSpend: number;
    lastLogin: string;
    verified: boolean;
    tier: 'Bronze' | 'Silver' | 'Gold';
    notes?: string;

    // New fields for operator application tracking
    is_operator?: boolean;
    operator_status?: 'none' | 'applied' | 'approved' | 'rejected';
}

export interface AdminInquiryView {
    id: string;
    maskedId: string;
    customerName: string;
    customerEmail?: string; // Secondary text
    route: string;
    origin?: string;
    destination?: string;
    date: string; // Travel Date
    pax: number;
    status: string;
    priority: 'Normal' | 'VIP' | 'Medical' | 'Corporate';
    assignedOperatorId?: string;
    quoteCount: number;
    urgency: 'Low' | 'Medium' | 'High' | 'Critical';
    aircraftPreference?: string;
    budget?: string;
    tripType?: 'One Way' | 'Round Trip' | 'Multi-leg';
    created_at: string; // For sorting
}

export interface AdminQuoteView {
    id: string;
    inquiryId: string;
    operatorName: string;
    aircraft: string;
    basePrice: number;
    commissionPercent: number;
    taxes: number;
    totalPrice: number;
    status: 'Draft' | 'Sent' | 'Accepted' | 'Declined' | 'Expired';
    validUntil: string;
}

export interface AdminBooking {
    id: string;
    ref: string;
    route: string;
    customerName: string;
    operatorName: string;
    date: string;
    status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled';
    price: number;
}

export interface KYCCase {
    id: string;
    bookingId: string;
    customerName: string;
    riskScore: 'Low' | 'Medium' | 'High';
    status: 'Pending' | 'Approved' | 'Correction Required';
    documents: string[];
}

export interface Invoice {
    id: string;
    number: string;
    bookingRef: string;
    type: 'Customer' | 'Operator';
    amount: number;
    tax: number;
    status: 'Paid' | 'Unpaid' | 'Overdue';
    date: string;
}

export interface Payout {
    id: string;
    operatorName: string;
    amount: number;
    currency: string;
    status: 'Pending' | 'Processing' | 'Settled';
    dateInitiated: string;
}

export interface SystemSettings {
    commissionRate: number;
    kycThreshold: number;
    slaTimeoutHours: number;
    paymentLimit: number;
}
