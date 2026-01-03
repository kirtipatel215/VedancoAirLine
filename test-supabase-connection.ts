import { supabase } from './supabaseClient';

async function testSupabaseConnection() {
    console.log('🔍 Testing Supabase Connection...\n');

    // Test 1: Check Supabase URL and Key
    console.log('📋 Configuration:');
    console.log('URL:', import.meta.env.VITE_SUPABASE_URL || 'Using fallback');
    console.log('Key format:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing');
    console.log('');

    // Test 2: Test connection by querying a table
    console.log('🔗 Testing Database Connection...');
    try {
        const { data, error } = await supabase.from('profiles').select('count');
        if (error) {
            console.error('❌ Database connection failed:', error.message);
            console.error('Error details:', error);
        } else {
            console.log('✅ Database connection successful');
        }
    } catch (err: any) {
        console.error('❌ Connection test failed:', err.message);
    }
    console.log('');

    // Test 3: Check current session
    console.log('🔐 Checking Auth Session...');
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
            console.error('❌ Session check failed:', error.message);
        } else if (session) {
            console.log('✅ Active session found for:', session.user.email);
        } else {
            console.log('ℹ️  No active session (not logged in)');
        }
    } catch (err: any) {
        console.error('❌ Session check failed:', err.message);
    }
    console.log('');

    // Test 4: Try to sign in with demo credentials
    console.log('🧪 Testing Admin Login...');
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: 'admin@vedanco.com',
            password: 'admin123'
        });

        if (error) {
            console.error('❌ Login failed:', error.message);
            console.error('Error code:', error.status);

            if (error.message.includes('Invalid login credentials')) {
                console.log('💡 Suggestion: Admin user may not exist in database');
            }
        } else if (data.user) {
            console.log('✅ Login successful!');
            console.log('User ID:', data.user.id);
            console.log('Email:', data.user.email);

            // Check user profile
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();

            if (profileError) {
                console.error('❌ Profile fetch failed:', profileError.message);
            } else if (profile) {
                console.log('✅ Profile found');
                console.log('Role:', profile.role);
                console.log('Is Admin:', profile.role === 'admin' || profile.role === 'superadmin');
            }

            // Sign out
            await supabase.auth.signOut();
        }
    } catch (err: any) {
        console.error('❌ Login test failed:', err.message);
    }
    console.log('');

    console.log('✨ Diagnosis complete!');
}

// Run the test
testSupabaseConnection().catch(console.error);
