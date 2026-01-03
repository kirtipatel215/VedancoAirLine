/**
 * ROLE-BASED ACCESS CONTROL (RBAC) MIDDLEWARE
 * 
 * Provides:
 * - Role validation before rendering components
 * - Route protection
 * - Permission checks
 * - Automatic redirection for unauthorized access
 * 
 * @module RBACMiddleware
 */

import { AuthSessionService, UserRole } from './AuthSessionService';
import { supabase } from '../supabaseClient';

// ================================================================
// TYPES
// ================================================================

export interface RoleCheckResult {
    allowed: boolean;
    userRole: UserRole | null;
    requiredRoles: UserRole[];
    message?: string;
}

export interface PermissionCheck {
    resource: string;
    action: 'read' | 'write' | 'delete' | 'admin';
    allowed: boolean;
}

// ================================================================
// ROLE HIERARCHY
// ================================================================

const ROLE_HIERARCHY: Record<UserRole, number> = {
    'customer': 1,
    'operator': 2,
    'admin': 3,
    'superadmin': 4
};

// ================================================================
// RBAC MIDDLEWARE
// ================================================================

export class RBACMiddleware {

    /**
     * Check if current user has required role
     * 
     * @param requiredRoles - Array of acceptable roles
     * @returns Role check result with permission status
     */
    static async checkRole(
        requiredRoles: UserRole | UserRole[]
    ): Promise<RoleCheckResult> {
        try {
            // Normalize to array
            const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

            // Validate current session
            const validation = await AuthSessionService.validateSession();

            if (!validation.valid || !validation.role) {
                return {
                    allowed: false,
                    userRole: null,
                    requiredRoles: rolesArray,
                    message: validation.message || 'No active session'
                };
            }

            // Check if user's role is in allowed roles
            const hasRole = rolesArray.includes(validation.role);

            if (!hasRole) {
                // Log unauthorized access attempt
                await AuthSessionService.logAuthEvent({
                    event_type: 'ROLE_CHECK_FAILED',
                    user_id: validation.user?.id,
                    success: false,
                    metadata: {
                        userRole: validation.role,
                        requiredRoles: rolesArray,
                        timestamp: new Date().toISOString()
                    }
                });

                return {
                    allowed: false,
                    userRole: validation.role,
                    requiredRoles: rolesArray,
                    message: `Insufficient permissions. Required: ${rolesArray.join(' or ')}`
                };
            }

            return {
                allowed: true,
                userRole: validation.role,
                requiredRoles: rolesArray
            };

        } catch (error: any) {
            console.error('Role check error:', error);

            return {
                allowed: false,
                userRole: null,
                requiredRoles: Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles],
                message: 'Role check failed'
            };
        }
    }

    /**
     * Check if user has at least a minimum role level
     * 
     * @param minimumRole - Minimum required role
     * @returns True if user has this role or higher
     */
    static async hasMinimumRole(minimumRole: UserRole): Promise<boolean> {
        const validation = await AuthSessionService.validateSession();

        if (!validation.valid || !validation.role) {
            return false;
        }

        const userLevel = ROLE_HIERARCHY[validation.role];
        const requiredLevel = ROLE_HIERARCHY[minimumRole];

        return userLevel >= requiredLevel;
    }

    /**
     * Enforce role requirement - throws error if not met
     * Used in component rendering or API calls
     */
    static async enforceRole(requiredRoles: UserRole | UserRole[]): Promise<void> {
        const result = await this.checkRole(requiredRoles);

        if (!result.allowed) {
            throw new Error(result.message || 'Access denied');
        }
    }

    /**
     * Check specific permission for a resource
     * 
     * Examples:
     * - Can customer read their own bookings? Yes
     * - Can customer write to others' bookings? No
     * - Can admin delete users? Yes
     */
    static async checkPermission(
        resource: string,
        action: 'read' | 'write' | 'delete' | 'admin',
        resourceOwnerId?: string
    ): Promise<PermissionCheck> {
        const validation = await AuthSessionService.validateSession();

        if (!validation.valid || !validation.role || !validation.user) {
            return {
                resource,
                action,
                allowed: false
            };
        }

        const userId = validation.user.id;
        const role = validation.role;

        // Permission matrix
        const permissions: Record<UserRole, Record<string, string[]>> = {
            'customer': {
                'inquiries': ['read', 'write'],
                'quotes': ['read'],
                'bookings': ['read'],
                'transactions': ['read'],
                'profile': ['read', 'write']
            },
            'operator': {
                'inquiries': ['read'], // Marketplace
                'quotes': ['read', 'write'], // Submit quotes
                'bookings': ['read', 'write'], // Update flight status
                'documents': ['read', 'write'],
                'profile': ['read', 'write']
            },
            'admin': {
                'inquiries': ['read', 'write', 'delete'],
                'quotes': ['read', 'write', 'delete'],
                'bookings': ['read', 'write', 'delete'],
                'users': ['read', 'write', 'admin'],
                'operators': ['read', 'write', 'admin'],
                'documents': ['read', 'write', 'delete'],
                'audit_logs': ['read']
            },
            'superadmin': {
                '*': ['read', 'write', 'delete', 'admin'] // All permissions
            }
        };

        // Superadmin has all permissions
        if (role === 'superadmin') {
            return { resource, action, allowed: true };
        }

        // Get allowed actions for this role and resource
        const rolePermissions = permissions[role] || {};
        const allowedActions = rolePermissions[resource] || [];

        // Check if action is allowed
        let allowed = allowedActions.includes(action);

        // Additional check: user can only modify their own resources
        // (unless they're admin)
        if (allowed && resourceOwnerId && role !== 'admin') {
            const isOwnResource = resourceOwnerId === userId;

            if (action === 'write' || action === 'delete') {
                allowed = isOwnResource;
            }
        }

        return { resource, action, allowed };
    }

    /**
     * Get user's dashboard route based on role
     */
    static getDashboardRoute(role: UserRole): string {
        const routes: Record<UserRole, string> = {
            'customer': '/dashboard',
            'operator': '/operator',
            'admin': '/admin',
            'superadmin': '/admin'
        };

        return routes[role] || '/';
    }

    /**
     * Redirect user to appropriate dashboard
     */
    static async redirectToDashboard(): Promise<string> {
        const validation = await AuthSessionService.validateSession();

        if (!validation.valid || !validation.role) {
            return '/';
        }

        return this.getDashboardRoute(validation.role);
    }

    /**
     * Check if current user can access a specific dashboard
     */
    static async canAccessDashboard(dashboard: 'customer' | 'operator' | 'admin'): Promise<boolean> {
        const dashboardRoles: Record<string, UserRole[]> = {
            'customer': ['customer', 'operator', 'admin', 'superadmin'], // All can see customer view
            'operator': ['operator', 'admin', 'superadmin'],
            'admin': ['admin', 'superadmin']
        };

        const requiredRoles = dashboardRoles[dashboard] || [];
        const result = await this.checkRole(requiredRoles);

        return result.allowed;
    }
}

// ================================================================
// REACT HOOKS (Optional convenience methods)
// ================================================================

/**
 * Hook to check if user has required role
 * Usage in React components:
 * 
 * const hasAccess = await useRoleCheck(['admin', 'operator']);
 */
export const useRoleCheck = async (requiredRoles: UserRole | UserRole[]): Promise<boolean> => {
    const result = await RBACMiddleware.checkRole(requiredRoles);
    return result.allowed;
};

/**
 * Hook to get current user role
 */
export const useUserRole = async (): Promise<UserRole | null> => {
    const validation = await AuthSessionService.validateSession();
    return validation.role;
};

// ================================================================
// EXPORT
// ================================================================

export default RBACMiddleware;
