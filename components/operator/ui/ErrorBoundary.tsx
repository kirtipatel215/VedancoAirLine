/**
 * Error Boundary for Operator Dashboard
 * 
 * Catches runtime errors in operator views and displays
 * user-friendly error messages instead of crashing the app.
 */

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

export class OperatorErrorBoundary extends Component<Props, State> {
    setState(arg0: { hasError: boolean; error: null; errorInfo: null; }) {
        throw new Error('Method not implemented.');
    }
    state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };
    props: any;

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log to console for development
        console.error('Operator Dashboard Error:', error, errorInfo);

        // Store error info for display
        this.setState({
            errorInfo,
            hasError: false,
            error: null
        });

        // TODO: Send to monitoring service (Sentry, LogRocket, etc.)
        // Example: Sentry.captureException(error, { extra: errorInfo });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="min-h-[400px] flex items-center justify-center p-8">
                    <div className="glass-panel max-w-2xl w-full p-10 rounded-xl border border-red-500/20 bg-red-500/5 text-center">
                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-10 h-10 text-red-500" />
                        </div>

                        <h2 className="text-2xl font-serif font-bold text-white mb-3">
                            Something Went Wrong
                        </h2>

                        <p className="text-gray-400 mb-6">
                            {this.state.error?.message || 'An unexpected error occurred in the operator dashboard.'}
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                            <details className="mb-6 text-left bg-black/40 p-4 rounded border border-white/10">
                                <summary className="text-xs font-mono text-gray-500 cursor-pointer mb-2">
                                    Error Details (Development Only)
                                </summary>
                                <pre className="text-xs text-red-400 overflow-auto max-h-40">
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={this.handleReset}
                                className="bg-gold-500 hover:bg-white text-charcoal-900 px-6 py-3 rounded font-bold uppercase tracking-widest text-xs transition-all flex items-center gap-2"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Try Again
                            </button>

                            <button
                                onClick={() => window.location.reload()}
                                className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded font-bold uppercase tracking-widest text-xs transition-all border border-white/10"
                            >
                                Reload Page
                            </button>
                        </div>

                        <p className="text-xs text-gray-600 mt-6">
                            If this problem persists, please contact support.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Lightweight error display component for use in views
 */
export const ErrorState: React.FC<{ message: string; onRetry?: () => void }> = ({
    message,
    onRetry
}) => (
    <div className="glass-panel p-12 rounded-xl border border-red-500/20 bg-red-500/5 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white mb-2">Error</h3>
        <p className="text-gray-400 mb-4">{message}</p>
        {onRetry && (
            <button
                onClick={onRetry}
                className="bg-gold-500 hover:bg-white text-charcoal-900 px-6 py-2 rounded text-xs font-bold uppercase tracking-widest transition-all"
            >
                Try Again
            </button>
        )}
    </div>
);

/**
 * Loading spinner component
 */
export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
    <div className="flex flex-col items-center justify-center p-20">
        <div className="animate-spin w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full mb-4"></div>
        <p className="text-sm text-gray-400 uppercase tracking-widest font-bold">{message}</p>
    </div>
);
