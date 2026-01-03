/**
 * AUTHENTICATION GUARD - React Component Wrapper
 * 
 * Protects routes and components based on authentication and roles
 * 
 * Usage:
 * <AuthGuard requiredRoles={['admin', 'superadmin']}>
 *   <AdminDashboard />
 * </AuthGuard>
 */

import React, { useEffect, useState } from 'react';
import { AuthSessionService, UserRole } from '../services/AuthSessionService';
import { RBACMiddleware } from '../services/RBACMiddleware';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
    children: React.ReactNode;
    requiredRoles?: UserRole | UserRole[];
    fallback?: React.ReactNode;
    redirectTo?: string;
    onUnauthorized?: () => void;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
    children,
    requiredRoles,
    fallback,
    redirectTo = '/',
    onUnauthorized
}) => {
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        checkAuthorization();

        // Re-check every 5 minutes
        const interval = setInterval(checkAuthorization, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, [requiredRoles]);

    const checkAuthorization = async () => {
        try {
            setLoading(true);
            setError(null);

            // Validate session
            const validation = await AuthSessionService.validateSession();

            if (!validation.valid) {
                setAuthorized(false);
                setError(validation.message || 'Not authenticated');

                if (onUnauthorized) {
                    onUnauthorized();
                } else if (redirectTo) {
                    window.location.href = redirectTo;
                }
                return;
            }

            // Check role if specified
            if (requiredRoles) {
                const roleCheck = await RBACMiddleware.checkRole(requiredRoles);

                if (!roleCheck.allowed) {
                    setAuthorized(false);
                    setError(roleCheck.message || 'Insufficient permissions');

                    if (onUnauthorized) {
                        onUnauthorized();
                    } else if (validation.role) {
                        // Redirect to appropriate dashboard
                        const userDashboard = RBACMiddleware.getDashboardRoute(validation.role);
                        window.location.href = userDashboard;
                    }
                    return;
                }
            }

            // Authorized!
            setAuthorized(true);

        } catch (err: any) {
            console.error('Authorization check failed:', err);
            setAuthorized(false);
            setError(err.message || 'Authorization failed');
        } finally {
            setLoading(false);
        }
    };

    // Loading state
    if (loading) {
        return fallback || (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-gold-500" />
                    <p className="text-gray-500">Verifying access...</p>
                </div>
            </div>
        );
    }

    // Not authorized
    if (!authorized) {
        return fallback || (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center max-w-md">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
                    <p className="text-gray-600 mb-6">
                        {error || 'You do not have permission to access this page.'}
                    </p>
                    <button
                        onClick={() => window.location.href = redirectTo}
                        className="bg-gold-500 text-white px-6 py-3 rounded-lg hover:bg-gold-600 transition"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // Authorized - render children
    return <>{children}</>;
};

/**
 * Hook to use authentication state
 */
export const useAuth = () => {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        const validation = await AuthSessionService.validateSession();
        setSession(validation.valid ? {
            user: validation.user,
            profile: validation.profile,
            role: validation.role
        } : null);
        setLoading(false);
    };

    const logout = async () => {
        await AuthSessionService.handleLogout(session?.user?.id);
        setSession(null);
    };

    return { session, loading, logout, refresh: checkSession };
};

export default AuthGuard;
