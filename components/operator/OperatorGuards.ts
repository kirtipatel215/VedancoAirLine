/**
 * Operator Authentication & Authorization Guards
 * 
 * This module provides centralized validation for operator access.
 * ALL operator dashboard pages MUST use these guards.
 */

import { supabase } from "../../supabaseClient.ts";

// ==================== Error Classes ====================

export class OperatorAuthError extends Error {
    constructor(message: string, public code: string) {
        super(message);
        this.name = 'OperatorAuthError';
    }
}

export class OperatorNotFoundError extends OperatorAuthError {
    constructor(message = 'Operator record not found') {
        super(message, 'OPERATOR_NOT_FOUND');
    }
}

export class OperatorNotApprovedError extends OperatorAuthError {
    constructor(status?: string) {
        super(
            `Operator not approved. Current status: ${status || 'unknown'}`,
            'OPERATOR_NOT_APPROVED'
        );
        this.status = status;
    }
    status?: string;
}

export class UnauthorizedAccessError extends OperatorAuthError {
    constructor(message = 'Unauthorized access') {
        super(message, 'UNAUTHORIZED');
    }
}

export class NotAuthenticatedError extends OperatorAuthError {
    constructor() {
        super('Not authenticated', 'NOT_AUTHENTICATED');
    }
}

// ==================== Type Definitions ====================

export interface Operator {
    id: string;
    email: string;
    name: string;
    company_name?: string;
    status: 'Active' | 'Suspended' | 'Pending';
    rating?: number;
    bank_account?: string;
    created_at: string;
    updated_at?: string;
}

export interface OperatorSession {
    user: any; // Supabase user
    operator: Operator;
    profile: any;
}

// ==================== Core Validation Functions ====================

/**
 * Validates current user is an authenticated, approved operator
 * This is the PRIMARY guard - use at the top of every operator page
 * 
 * @throws {NotAuthenticatedError} If user not logged in
 * @throws {OperatorNotApprovedError} If operator not approved
 * @throws {OperatorNotFoundError} If operator record missing
 */
export async function requireOperator(): Promise<OperatorSession> {
    // Step 1: Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        throw new NotAuthenticatedError();
    }

    // Step 2: Get profile and check operator role
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profileError || !profile) {
        throw new OperatorAuthError('Profile not found', 'PROFILE_NOT_FOUND');
    }

    // Step 3: Verify operator status in profile
    if (!profile.is_operator) {
        throw new UnauthorizedAccessError('User is not an operator');
    }

    if (profile.operator_status !== 'approved') {
        throw new OperatorNotApprovedError(profile.operator_status);
    }

    // Step 4: Get full operator record
    const { data: operator, error: operatorError } = await supabase
        .from('operators')
        .select('*')
        .eq('email', profile.email)
        .eq('status', 'Active')
        .single();

    if (operatorError || !operator) {
        // This is a critical inconsistency - profile says approved but no operator record
        console.error('CRITICAL: Approved operator missing from operators table', {
            userId: user.id,
            email: profile.email
        });
        throw new OperatorNotFoundError('Operator record not found. Please contact support.');
    }

    return {
        user,
        operator,
        profile
    };
}

/**
 * Validates that a resource belongs to the current operator
 * Use this before showing operator-specific data
 */
export async function validateOperatorOwnership(
    resourceOperatorId: string
): Promise<void> {
    const { operator } = await requireOperator();

    if (operator.id !== resourceOperatorId) {
        throw new UnauthorizedAccessError('Resource does not belong to this operator');
    }
}

/**
 * Checks if current user is an operator WITHOUT throwing
 * Use for conditional rendering
 */
export async function isOperator(): Promise<boolean> {
    try {
        await requireOperator();
        return true;
    } catch (err) {
        return false;
    }
}

/**
 * Gets current operator if exists, returns null otherwise
 * Use when operator data is optional
 */
export async function getCurrentOperator(): Promise<Operator | null> {
    try {
        const { operator } = await requireOperator();
        return operator;
    } catch (err) {
        return null;
    }
}

/**
 * Refreshes the current session
 * Call this after admin approval or status changes
 */
export async function refreshOperatorSession(): Promise<void> {
    const { error } = await supabase.auth.refreshSession();
    if (error) {
        console.error('Failed to refresh session:', error);
    }
}

/**
 * Validates operator can perform a specific action
 * Extend this as needed for granular permissions
 */
export async function canOperatorPerform(
    action: 'quote' | 'book' | 'add_aircraft' | 'update_documents'
): Promise<boolean> {
    try {
        const { operator } = await requireOperator();

        // For now, all active operators can perform all actions
        // Extend this logic if you need role-based permissions later
        return operator.status === 'Active';
    } catch (err) {
        return false;
    }
}

// ==================== Helper Functions ====================

/**
 * Logs operator action for audit trail
 */
export function logOperatorAction(
    operatorId: string,
    action: string,
    metadata?: Record<string, any>
) {
    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        service: 'operator-dashboard',
        operatorId,
        action,
        ...metadata
    }));

    // TODO: Send to monitoring service in production
    // Example: Sentry, LogRocket, CloudWatch, etc.
}

/**
 * Helper to format operator errors for user display
 */
export function formatOperatorError(error: any): string {
    if (error instanceof OperatorNotApprovedError) {
        return 'Your operator account is pending approval. Please check back later.';
    }

    if (error instanceof OperatorNotFoundError) {
        return 'Operator account not found. Please contact support.';
    }

    if (error instanceof NotAuthenticatedError) {
        return 'Please sign in to access the operator dashboard.';
    }

    if (error instanceof UnauthorizedAccessError) {
        return 'You do not have permission to access this resource.';
    }

    return 'An error occurred. Please try again or contact support.';
}
