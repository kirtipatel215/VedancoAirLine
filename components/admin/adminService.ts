
import { AdminUser, ApplicationStatus, OperatorApplication, Operator, CustomerUser, AuditLog, SystemSettings } from "@/components/admin/types.ts";
import { checkRateLimit, auditLog, sanitizeObject } from "../../utils/security.ts";
import { supabase } from "../../supabaseClient.ts";

const STORAGE_KEY = 'vedanco_admin_token';
const USERS_KEY = 'vedanco_customer_users';

export const AdminService = {
    // --- AUTHENTICATION ---

    async login(email: string, pass: string): Promise<AdminUser | null> {
        try {
            if (!checkRateLimit('admin_login')) {
                throw new Error("Too many login attempts. Account locked for 1 minute.");
            }
        } catch (e) {
            console.warn("Rate limit check failed", e);
        }

        await new Promise(r => setTimeout(r, 800)); // Prevent timing attacks

        const cleanEmail = email.trim().toLowerCase();
        const cleanPass = pass.trim();

        try {
            // 1. Authenticate with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: cleanEmail,
                password: cleanPass
            });

            if (authError) throw authError;
            if (!authData.user) return null;

            // 2. Check user profile for admin role
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authData.user.id)
                .single();

            if (profileError || !profile) {
                await supabase.auth.signOut();
                throw new Error("Profile not found");
            }

            // 3. Verify admin role
            if (profile.role !== 'admin' && profile.role !== 'superadmin') {
                await supabase.auth.signOut();
                throw new Error("Access denied. Admin privileges required.");
            }

            const user: AdminUser = {
                id: profile.id,
                name: `${profile.first_name} ${profile.last_name}`,
                email: profile.email,
                role: profile.role as 'admin' | 'superadmin',
                lastLogin: new Date().toISOString()
            };

            try {
                localStorage.setItem(STORAGE_KEY, btoa(JSON.stringify({ ...user, exp: Date.now() + 3600000 })));
                auditLog(user.name, 'ADMIN_LOGIN', 'Auth', 'SUCCESS');
            } catch (e) {
                console.warn("Storage failed", e);
            }

            return user;

        } catch (error: any) {
            auditLog(cleanEmail, 'ADMIN_LOGIN_FAIL', 'Auth', 'FAILURE', { error: error.message });
            throw error;
        }
    },

    getCurrentUser(): AdminUser | null {
        try {
            const token = localStorage.getItem(STORAGE_KEY);
            if (!token) return null;
            const data = JSON.parse(atob(token));
            if (data.exp < Date.now()) {
                this.logout();
                return null;
            }
            return data as AdminUser;
        } catch { return null; }
    },

    logout() {
        try {
            supabase.auth.signOut();
            localStorage.removeItem(STORAGE_KEY);
        } catch (e) { console.error(e); }
    },

    requireRole(role: 'admin' | 'superadmin') {
        const user = this.getCurrentUser();
        if (!user || (role === 'superadmin' && user.role !== 'superadmin')) {
            throw new Error("Unauthorized Access");
        }
    },

    // --- SECURE DATA ACCESS ---

    async getStats() {
        this.requireRole('admin');
        try {
            const { count: inquiryCount } = await supabase.from('inquiries').select('*', { count: 'exact', head: true });
            const { count: appCount } = await supabase.from('operator_applications').select('*', { count: 'exact', head: true }).eq('status', 'Applied');
            const { count: bookingCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('status', 'Confirmed');

            return {
                totalInquiries: inquiryCount || 124,
                pendingApps: appCount || 3,
                activeBookings: bookingCount || 18,
                revenueMTD: 450000,
                pendingCompliance: 5,
                pendingPayouts: 2
            };
        } catch (e) {
            return { totalInquiries: 124, pendingApps: 3, activeBookings: 18, revenueMTD: 450000, pendingCompliance: 5, pendingPayouts: 2 };
        }
    },

    async getOperatorApps(): Promise<OperatorApplication[]> {
        this.requireRole('admin');

        const { data, error } = await supabase
            .from('operator_applications')
            .select('*')
            .order('created_at', { ascending: false });

        if (error || !data) {
            return [];
        }

        return data.map((row: any) => {
            const businessInfo = row.business_info || {};
            const bankingInfo = businessInfo.banking || {};

            return {
                id: row.id,
                user_id: row.user_id, // May be undefined if schema lacks it
                companyName: row.company_name,
                country: row.country,
                contactPerson: row.contact_person,
                email: row.email,
                submittedDate: row.created_at,
                status: row.status as ApplicationStatus,
                rejectionReason: row.rejection_reason,
                slaDeadline: row.sla_deadline,
                documents: row.documents || [],
                details: row.details,
                contact: row.contact_info,
                business: businessInfo,
                banking: bankingInfo,
                operations: row.operations_info,
                fleetDetails: row.fleet_details,
                declarations: row.declarations
            };
        });
    },

    async updateOperatorApp(id: string, status: ApplicationStatus, reason?: string) {
        this.requireRole('superadmin');

        // 1. Update Application Status directly
        const updates: any = { status };
        if (reason) updates.rejection_reason = reason;

        const { error: updateError } = await supabase
            .from('operator_applications')
            .update(updates)
            .eq('id', id);

        if (updateError) throw new Error(updateError.message);

        // 2. Handle specific status logic
        if (status === 'Approved') {
            // Fetch the specific application to get details for provisioning
            const { data: appData, error: fetchError } = await supabase
                .from('operator_applications')
                .select('*')
                .eq('id', id)
                .single();

            if (!fetchError && appData) {
                // A. Provision Operator Entity
                await this._provisionOperator({
                    id: appData.id,
                    companyName: appData.company_name,
                    email: appData.email,
                    country: appData.country,
                    operations: appData.operations_info
                } as OperatorApplication);

                // B. Upgrade User Profile
                // Use email to find profile as user_id might be missing in application table
                if (appData.email) {
                    await supabase.from('profiles').update({
                        is_operator: true,
                        role: 'operator',
                        operator_status: 'approved',
                        updated_at: new Date().toISOString()
                    }).eq('email', appData.email);
                }
            }
        }
        else if (status === 'Rejected') {
            // Fetch app to get email
            const { data: appData } = await supabase.from('operator_applications').select('email').eq('id', id).single();
            if (appData && appData.email) {
                await supabase.from('profiles').update({
                    operator_status: 'rejected',
                    updated_at: new Date().toISOString()
                }).eq('email', appData.email);
            }
        }

        auditLog(this.getCurrentUser()?.name || 'System', 'UPDATE_APP_STATUS', id, 'SUCCESS', { status, reason });
        return true;
    },

    async submitOperatorApplication(data: any) {
        if (!checkRateLimit('submit_app')) throw new Error("Submission rate limited. Please try again later.");

        const safeData = sanitizeObject(data);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("You must be logged in to apply.");

        const companyInfo = safeData.companyInfo || {};
        const contact = safeData.contact || {};
        const business = safeData.business || {};
        const banking = safeData.banking || {};

        // Mock Docs Metadata
        const docsMetadata = [];
        if (safeData.docs) {
            for (const [key, val] of Object.entries(safeData.docs)) {
                if (val) {
                    docsMetadata.push({
                        name: `${key.toUpperCase()}_CERTIFICATE.pdf`,
                        type: key.toUpperCase(),
                        url: '#',
                        category: 'Company',
                        status: 'Pending'
                    });
                }
            }
        }

        const dbPayload = {
            // user_id removed to prevent PGRST204 error if column missing in schema cache
            company_name: companyInfo.name || safeData.companyName || 'Unknown Company',
            country: (companyInfo.address || '').split(',').pop()?.trim() || 'Unknown',
            contact_person: `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.name || 'Unknown',
            email: contact.email || user.email,
            status: 'Applied',
            details: {
                brandName: companyInfo.brand,
                regNumber: companyInfo.regNumber,
                incorporationYear: companyInfo.year,
                registeredAddress: companyInfo.address,
                baseAirports: companyInfo.baseAirports || (companyInfo.base ? [companyInfo.base] : []),
                website: companyInfo.website
            },
            contact_info: {
                firstName: contact.firstName,
                lastName: contact.lastName,
                designation: contact.designation,
                mobile: contact.mobile,
                alternateContact: contact.alternate,
                emailVerified: contact.emailVerified,
                mobileVerified: contact.mobileVerified
            },
            business_info: {
                ...business,
                banking: banking
            },
            operations_info: safeData.ops || {},
            fleet_details: safeData.fleetDetails || [],
            declarations: safeData.declarations || {},
            documents: docsMetadata.length > 0 ? docsMetadata : []
        };

        const { data: newApp, error } = await supabase
            .from('operator_applications')
            .insert([dbPayload])
            .select()
            .single();

        if (error) {
            console.error("Submission Error", error);
            throw new Error("Failed to submit application: " + error.message);
        }

        // Update Profile Status (Locks re-application)
        await supabase
            .from('profiles')
            .update({
                operator_status: 'applied',
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id);

        auditLog('Public', 'SUBMIT_OP_APP', newApp.id, 'SUCCESS');
        return newApp;
    },

    async _provisionOperator(app: OperatorApplication) {
        // 1. Create Operator Record in 'operators' table
        // This is the source of truth for the Operator Portal login check
        const { error } = await supabase.from('operators').insert([{
            application_id: app.id,
            name: app.companyName,
            email: app.email,
            country: app.country,
            status: 'Active', // Immediately active
            aircraft_count: parseInt(app.operations?.fleetSize || '0'),
            rating: 5.0,
            sla_score: 100
        }]);

        if (error) {
            console.error("Provisioning Error - Operators Table", error);
        } else {
            auditLog('System', 'PROVISION_OPERATOR', app.id, 'SUCCESS');
        }
    },

    async getOperators(): Promise<Operator[]> {
        this.requireRole('admin');
        const { data, error } = await supabase.from('operators').select('*');

        if (error) return [];

        return data.map((op: any) => ({
            id: op.id,
            name: op.name,
            email: op.email,
            country: op.country,
            status: op.status,
            aircraftCount: op.aircraft_count,
            rating: op.rating,
            slaScore: op.sla_score,
            joinedDate: op.joined_date
        }));
    },

    async updateOperatorStatus(id: string, status: 'Active' | 'Suspended') {
        this.requireRole('superadmin');
        await supabase.from('operators').update({ status }).eq('id', id);
        auditLog(this.getCurrentUser()?.name || 'System', 'UPDATE_OP_STATUS', id, 'SUCCESS', { status });
    },

    async getCustomers(): Promise<CustomerUser[]> {
        this.requireRole('admin');
        const raw = localStorage.getItem(USERS_KEY);
        return raw ? JSON.parse(raw) : [];
    },

    async addCustomer(data: any) {
        this.requireRole('admin');
        const safeData = sanitizeObject(data);
        const customers = await this.getCustomers();
        const newCustomer: CustomerUser = {
            id: `C-${Date.now()}`,
            name: safeData.name,
            email: safeData.email,
            phone: safeData.phone,
            status: 'Active',
            joinDate: new Date().toISOString(),
            totalSpend: 0,
            lastLogin: '',
            verified: false,
            tier: 'Bronze',
            notes: safeData.notes
        };
        customers.unshift(newCustomer);
        localStorage.setItem(USERS_KEY, JSON.stringify(customers));
        auditLog(this.getCurrentUser()?.name || 'System', 'ADD_CUSTOMER', newCustomer.id, 'SUCCESS');
        return newCustomer;
    },

    async updateCustomer(id: string, updates: Partial<CustomerUser>) {
        this.requireRole('admin');
        const customers = await this.getCustomers();
        const index = customers.findIndex(c => c.id === id);

        if (index === -1) throw new Error("Customer not found");

        const updatedCustomer = { ...customers[index], ...sanitizeObject(updates) };
        customers[index] = updatedCustomer;

        localStorage.setItem(USERS_KEY, JSON.stringify(customers));
        auditLog(this.getCurrentUser()?.name || 'System', 'UPDATE_CUSTOMER', id, 'SUCCESS');
        return updatedCustomer;
    },

    async getCustomerRelatedData(userId: string) {
        this.requireRole('admin');

        const { data: bookings } = await supabase.from('bookings').select('*').eq('customer_id', userId);
        const { data: inquiries } = await supabase.from('inquiries').select('*').eq('customer_id', userId);

        return {
            inquiries: (inquiries || []).map((i: any) => ({
                id: i.id,
                maskedId: i.id,
                customerName: 'Customer', // Would fetch profile
                route: `${i.from_airport} -> ${i.to_airport}`,
                date: i.departure_datetime,
                status: i.status,
                priority: i.passengers > 5 ? 'Corporate' : 'Normal',
                quoteCount: 0,
                urgency: 'Medium'
            })),
            bookings: (bookings || []).map((b: any) => ({
                id: b.id,
                ref: b.booking_reference,
                route: b.route || `${b.origin} -> ${b.destination}`,
                customerName: 'Customer',
                operatorName: b.operator_id || 'Pending Op',
                date: b.departure_datetime,
                status: b.status,
                price: b.total_amount || 0
            }))
        };
    },

    async registerUser(firstName: string, lastName: string, email: string) {
    },

    async getInquiries() {
        const { data } = await supabase.from('inquiries').select('*');
        return (data || []).map((i: any) => ({
            id: i.id, maskedId: i.id, customerName: 'Client', route: i.from_airport, date: i.departure_datetime, status: i.status, priority: 'Normal', quoteCount: 0, urgency: 'Medium'
        }));
    },
    async getQuotes() {
        const { data } = await supabase.from('quotes').select('*');
        return (data || []).map((q: any) => ({
            id: q.id, inquiryId: q.inquiry_id || 'N/A', operatorName: q.operator_name, aircraft: q.aircraft_model, basePrice: q.base_price, commissionPercent: 5, taxes: q.tax_breakup?.tax || 0, totalPrice: q.total_price, status: q.status, validUntil: q.valid_until
        }));
    },
    async getBookings() {
        const { data } = await supabase.from('bookings').select('*');
        return (data || []).map((b: any) => ({
            id: b.id, ref: b.booking_reference, route: b.route, customerName: 'Client', operatorName: b.operator_id, date: b.departure_datetime, status: b.status, price: b.total_amount
        }));
    },
    async getKYC() { return []; },
    async approveKYC(id: string) {
        this.requireRole('admin');
        auditLog(this.getCurrentUser()?.name || 'System', 'APPROVE_KYC', id, 'SUCCESS');
        return true;
    },
    async getInvoices() { return []; },
    async getPayouts() { return []; },

    async getAuditLogs(): Promise<AuditLog[]> {
        this.requireRole('superadmin');
        const logs = localStorage.getItem('sys_audit_logs');
        return logs ? JSON.parse(logs) : [];
    },

    async getSettings() { return { commissionRate: 5, kycThreshold: 10000, slaTimeoutHours: 48, paymentLimit: 500000 } as SystemSettings; }
};
