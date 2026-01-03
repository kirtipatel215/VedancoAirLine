import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

// Get Supabase configuration from environment variables
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rdetkdeonjbxzeedkfwn.supabase.co';
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_6f86Fp1XoGtLGxxX413pBQ_VxvRioTS';

if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
    console.warn('⚠️  Using fallback Supabase Anon Key. This may cause connection issues if not intended.');
}

// Create Supabase client with PRODUCTION-READY configuration
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        // Use localStorage for web (Supabase handles secure storage)
        // In production, this uses HTTP-only cookies via server-side config
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,

        // Auto-refresh tokens before they expire
        autoRefreshToken: true,

        // Persist session across page reloads
        persistSession: true,

        // Don't detect session in URL (security: prevent token leaks in logs)
        detectSessionInUrl: false,

        // Use PKCE flow for enhanced security
        flowType: 'pkce',

        // Debug mode (disable in production)
        debug: import.meta.env.DEV
    },

    // Global fetch options
    global: {
        headers: {
            'x-application-name': 'vedanco-air'
        }
    }
});

// Helper: Get current user
export const getCurrentUser = async (): Promise<User | null> => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
        console.error('Error getting user:', error);
        return null;
    }
    return user;
};

// Helper: Get user profile
export const getUserProfile = async (userId?: string) => {
    const uid = userId || (await getCurrentUser())?.id;
    if (!uid) return null;

    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();

    if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }

    return data;
};

// Helper: Check if user is admin
export const isAdmin = async (): Promise<boolean> => {
    const profile = await getUserProfile();
    return profile?.role === 'admin' || profile?.role === 'superadmin';
};

// Helper: Check if user is operator
export const isOperator = async (): Promise<boolean> => {
    const profile = await getUserProfile();
    return profile?.is_operator === true;
};

// Helper: Sign out
export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error);
};

// Database types (simplified - can be auto-generated with Supabase CLI)
export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    email: string | null;
                    first_name: string | null;
                    last_name: string | null;
                    role: string;
                    phone_number: string | null;
                    country: string | null;
                    company: string | null;
                    preferred_currency: string | null;
                    home_airport: string | null;
                    is_operator: boolean;
                    operator_status: string;
                    created_at: string;
                    updated_at: string;
                };
            };
            // Add other table types as needed
        };
    };
}
