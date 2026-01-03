
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { EntryLoader } from './components/ui/EntryLoader.tsx';
import { AuthModal } from './components/AuthComponents.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { Home } from './Home.tsx';
import { AdminLogin } from './components/admin/AdminLogin.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';
import { OperatorLogin } from './components/operator/OperatorLogin.tsx';
import { OperatorDashboard } from './components/operator/OperatorDashboard.tsx';
import { OperatorService } from './components/operator/OperatorService.ts';
import { MockGateway } from './components/payment/MockGateway.tsx';
import { PaymentStatus } from './components/payment/PaymentStatus.tsx';
import { supabase, getUserProfile, signOut as supabaseSignOut } from './supabaseClient.ts';

export default function App() {
    // --- Global State ---
    const [loading, setLoading] = useState(true);

    // --- Routing State ---
    const [appMode, setAppMode] = useState<'customer' | 'admin' | 'operator' | 'gateway' | 'payment_status'>('customer');
    const [paymentParams, setPaymentParams] = useState<any>(null);

    // --- Customer User State ---
    const [user, setUser] = useState<any>(null);
    const [authOpen, setAuthOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // --- Admin/Op User State ---
    const [adminUser, setAdminUser] = useState<any>(null);
    const [operatorUser, setOperatorUser] = useState<any>(null);

    // --- Customer Navigation State ---
    const [viewingDashboard, setViewingDashboard] = useState(false);
    const [dashboardInitialView, setDashboardInitialView] = useState<string>('overview'); // Track initial view
    const [viewingPolicy, setViewingPolicy] = useState<string | null>(null);
    const [navAction, setNavAction] = useState<{ type: string; target: string; timestamp: number } | null>(null);

    // Removed old timeout effect, state is now controlled by EntryLoader onComplete

    // ... (keeping scroll handler) ...
    useEffect(() => {
        // Query Param Routing for Payment Flow
        const params = new URLSearchParams(window.location.search);
        const mode = params.get('mode');

        if (mode === 'payment' && params.get('step') === 'gateway') {
            setPaymentParams({
                transactionId: params.get('transactionId'),
                amount: parseFloat(params.get('amount') || '0'),
                currency: params.get('currency') || 'USD'
            });
            setAppMode('gateway');
        } else if (mode === 'payment_status') {
            setPaymentParams({
                status: params.get('status'),
                transactionId: params.get('transactionId')
            });
            setAppMode('payment_status');
        }

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // --- Auth Persistence Effect ---
    useEffect(() => {
        const restoreSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                console.log("Restoring session for:", session.user.email);

                // Fetch profile details
                const profile = await getUserProfile(session.user.id);

                // Check operator status to ensure correct permissions 
                // (Note: user.email might be undefined in type, check with '||')
                const email = session.user.email || '';
                const isOp = await OperatorService.checkOperatorStatus(email);

                const userData = {
                    id: session.user.id,
                    email: email,
                    name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : email,
                    role: profile?.role || 'customer',
                    isOperator: !!isOp
                };

                setUser(userData);
            }
        };

        restoreSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_OUT') {
                setUser(null);
                setViewingDashboard(false);
                setOperatorUser(null);
                setAdminUser(null);
                setAppMode('customer');
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // --- Handlers ---

    // ... (keeping admin/op handlers) ...
    const handleAdminAccess = (userData?: any) => {
        setAuthOpen(false);

        const targetUser = userData || user;

        if (targetUser && targetUser.role && (targetUser.role === 'admin' || targetUser.role === 'superadmin')) {
            setAdminUser(targetUser);
        }

        setAppMode('admin');
    };

    const handleOperatorAccess = async () => {
        // Guard: If logged in as customer, restrict access if not an operator
        if (user) {
            if (user.isOperator) {
                // Determine if we need to fetch full operator object?
                // checkOperatorStatus returns the object, we can re-fetch to be safe or just switch if we had it.
                // But handleLoginSuccess only set boolean.
                const opData = await OperatorService.checkOperatorStatus(user.email);
                if (opData) {
                    setOperatorUser(opData);
                    setAppMode('operator');
                }
            } else {
                // Not an operator - do nothing (UI should also hide this)
                // Optionally could show an alert, but "complete disable" implies silent block
                console.warn("Unauthorized access attempt to Operator Portal");
            }
        } else {
            // Public access (login screen)
            setAuthOpen(false);
            setAppMode('operator');
        }
    };

    const handleExitPortal = () => {
        setAdminUser(null);
        setOperatorUser(null);
        setAppMode('customer');
    };

    const handleLoginSuccess = async (userData: any) => {
        const isOp = await OperatorService.checkOperatorStatus(userData.email);

        setUser({
            ...userData,
            isOperator: !!isOp
        });
        setAuthOpen(false);
    };

    const handleSwitchToOperator = async () => {
        if (!user) return;
        const opData = await OperatorService.checkOperatorStatus(user.email);
        if (opData) {
            setOperatorUser(opData);
            setAppMode('operator');
            setViewingDashboard(false);
        }
    };

    const handleSignOut = async () => {
        await supabaseSignOut();
        setUser(null);
        setViewingDashboard(false);
        setOperatorUser(null);
        setAdminUser(null);
        setAppMode('customer');
    };

    const scrollToSection = (id: string) => {
        setViewingDashboard(false);
        setViewingPolicy(null);
        setNavAction({ type: 'scroll', target: id, timestamp: Date.now() });
        setMobileMenuOpen(false);
    };

    const openView = (view: string) => {
        setViewingDashboard(false);
        setViewingPolicy(null);
        setNavAction({ type: 'view', target: view, timestamp: Date.now() });
        setMobileMenuOpen(false);
    };

    const openDashboardTo = (view: string = 'overview') => {
        setDashboardInitialView(view);
        setViewingDashboard(true);
    };

    // --- Render Logic ---

    if (loading) return <EntryLoader onComplete={() => setLoading(false)} />;

    if (appMode === 'admin') {
        if (adminUser) {
            return <AdminDashboard user={adminUser} onLogout={handleExitPortal} />;
        }
        return <AdminLogin onLogin={setAdminUser} onBack={handleExitPortal} />;
    }

    if (appMode === 'operator') {
        if (operatorUser) {
            return <OperatorDashboard user={operatorUser} onLogout={handleExitPortal} />;
        }
        return <OperatorLogin onLogin={setOperatorUser} onBack={handleExitPortal} />;
    }

    if (appMode === 'gateway' && paymentParams) {
        return (
            <MockGateway
                transactionId={paymentParams.transactionId}
                amount={paymentParams.amount}
                currency={paymentParams.currency}
                onComplete={(status) => {
                    // Navigate to status page by changing URL (to clean params) or just state
                    window.location.href = `/?mode=payment_status&status=${status}&transactionId=${paymentParams.transactionId}`;
                }}
            />
        );
    }

    if (appMode === 'payment_status' && paymentParams) {
        return (
            <PaymentStatus
                status={paymentParams.status}
                transactionId={paymentParams.transactionId}
                onContinue={() => {
                    window.location.href = '/'; // Reset to home
                }}
            />
        );
    }

    // Customer Dashboard
    if (viewingDashboard && user) {
        return (
            <Dashboard
                user={user}
                initialView={dashboardInitialView}
                onLogout={handleSignOut}
                onBack={() => setViewingDashboard(false)}
                onSwitchToOperator={handleSwitchToOperator}
            />
        );
    }

    // Customer Landing Page
    return (
        <div className="min-h-screen bg-gray-50 font-sans text-charcoal-900 selection:bg-gold-500 selection:text-white">
            <Navbar
                isScrolled={isScrolled}
                mobileMenuOpen={mobileMenuOpen}
                setMobileMenuOpen={setMobileMenuOpen}
                onFleetClick={() => scrollToSection('fleet-section')}
                onMembershipClick={() => openView('membership')}
                onServicesClick={() => scrollToSection('services-section')}
                onDestinationsClick={() => scrollToSection('destinations-section')}
                onSignInClick={() => setAuthOpen(true)}
                user={user}
                onSignOut={handleSignOut}
                onDashboardClick={() => openDashboardTo('overview')}
            />

            <Home
                user={user}
                onBookingAuthRequired={() => setAuthOpen(true)}
                onBookingSuccess={() => openDashboardTo('inquiries')}
                handlePolicyClick={(policy) => setViewingPolicy(policy)}
                viewingPolicy={viewingPolicy}
                handleClosePolicy={() => setViewingPolicy(null)}
                navAction={navAction}
            />

            {!viewingPolicy && (
                <Footer
                    onPolicyClick={(policy: string) => setViewingPolicy(policy)}
                    onAdminClick={() => handleAdminAccess()}
                    onOperatorClick={handleOperatorAccess}
                    user={user}
                />
            )}

            <AuthModal
                isOpen={authOpen}
                onClose={() => setAuthOpen(false)}
                onLoginSuccess={handleLoginSuccess}
                onAdminAccess={handleAdminAccess}
            />
        </div>
    );
}
