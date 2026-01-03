
// ... imports ...
import React, { useState, useEffect } from 'react';
import { X, Mail, ArrowRight, CheckCircle, Loader2, Lock, AlertCircle, Eye, EyeOff, KeyRound, User, ChevronRight } from 'lucide-react';
import { LogoIcon } from './Logo.tsx';
import { supabase } from '../supabaseClient.ts';
import { SecureApiService } from './dashboard/service.ts';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: (user: any) => void;
    triggerSource?: 'nav' | 'booking';
    onAdminAccess?: (user?: any) => void;
}

type AuthMode = 'login' | 'signup' | 'forgot';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');

    // Status States
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setEmail('');
            setPassword('');
            setFirstName('');
            setLastName('');
            setError(null);
            setSuccessMsg(null);
            setMode('login');
        }
    }, [isOpen]);

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleForgotPassword = async () => {
        setError(null);
        setSuccessMsg(null);

        if (!email) {
            setError("Please enter your email address.");
            return;
        }
        if (!validateEmail(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;

            setSuccessMsg("If an account exists with this email, you will receive a password reset link shortly.");
        } catch (err: any) {
            console.error('Reset error:', err);
            // Don't reveal if user exists or not for security, unless it's a rate limit error
            if (err.message.includes("rate limit")) {
                setError("Too many requests. Please try again later.");
            } else {
                setSuccessMsg("If an account exists with this email, you will receive a password reset link shortly.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInputSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);

        if (mode === 'forgot') {
            await handleForgotPassword();
            return;
        }

        setLoading(true);
        const cleanEmail = email.trim();
        const cleanPass = password.trim();

        try {
            // Validation
            if (!cleanEmail || !cleanPass) {
                throw new Error("Please fill in all required fields.");
            }
            if (!validateEmail(cleanEmail)) {
                throw new Error("Please enter a valid email address.");
            }

            if (mode === 'signup') {
                if (!firstName.trim() || !lastName.trim()) {
                    throw new Error("Please provide your full name.");
                }
                if (cleanPass.length < 6) {
                    throw new Error("Password must be at least 6 characters long.");
                }

                // Sign up logic
                const { data, error } = await supabase.auth.signUp({
                    email: cleanEmail,
                    password: cleanPass,
                    options: {
                        data: {
                            first_name: firstName.trim(),
                            last_name: lastName.trim(),
                            role: 'customer'
                        },
                        emailRedirectTo: window.location.origin
                    }
                });

                if (error) throw error;

                setSuccessMsg("Account created! Please check your email to verify your account.");
                setTimeout(() => setMode('login'), 3000); // Auto switch to login
                setFirstName('');
                setLastName('');
            } else {
                // Login Flow
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: cleanEmail,
                    password: cleanPass
                });

                if (error) {
                    if (error.message.includes('Invalid login credentials')) {
                        throw new Error("Incorrect email or password.");
                    } else if (error.message.includes('Email not confirmed')) {
                        throw new Error("Please verify your email address before logging in.");
                    } else {
                        throw new Error(error.message);
                    }
                }

                if (!data.user) throw new Error("Authentication failed.");

                // Validate Role
                const profile = await SecureApiService.getProfile();
                if (!profile) throw new Error("Profile Not Found.");

                if (profile.role === 'admin' || profile.role === 'superadmin') {
                    await supabase.auth.signOut();
                    throw new Error("Please use the Admin Portal for staff access.");
                }

                onLoginSuccess({
                    id: data.user.id,
                    email: data.user.email,
                    name: `${profile.first_name} ${profile.last_name}`,
                    role: profile.role
                });
            }

        } catch (err: any) {
            console.error('Auth error:', err);
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500" onClick={onClose}></div>

            {/* Modal Card */}
            <div className="relative w-full max-w-[450px] bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col transform transition-all animate-scale-up">

                {/* Gold Accent Bar */}
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300 z-10"></div>

                <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-black transition-all z-20 hover:bg-gray-100 rounded-full p-2">
                    <X className="w-5 h-5" />
                </button>

                <div className="px-10 pt-12 pb-6 text-center z-10">
                    <div className="flex flex-col items-center justify-center mb-8">
                        <LogoIcon className="w-12 h-12 text-[#0B1120] mb-4" color="text-[#0B1120]" />

                        {/* Marquee Company Name */}
                        <div className="relative w-32 h-6 overflow-hidden">
                            <style>{`
                                @keyframes marquee {
                                    0% { transform: translateX(100%); }
                                    100% { transform: translateX(-100%); }
                                }
                                .animate-marquee {
                                    animation: marquee 8s linear infinite;
                                }
                            `}</style>
                            <div className="absolute whitespace-nowrap animate-marquee">
                                <span className="font-serif font-bold tracking-[0.2em] text-[#0B1120] text-lg">VEDANCO</span>
                            </div>
                        </div>
                    </div>

                    <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2 tracking-tight">
                        {mode === 'login' && 'Welcome Back'}
                        {mode === 'signup' && 'Join the Elite'}
                        {mode === 'forgot' && 'Reset Password'}
                    </h2>
                    <p className="text-gray-500 text-xs font-medium tracking-wide">
                        {mode === 'forgot' ? 'Secure account recovery' : 'Access your personalized travel concierge'}
                    </p>
                </div>

                <div className="px-10 pb-10 overflow-y-auto">

                    {/* Success Message */}
                    {successMsg && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <p className="text-sm text-green-800">{successMsg}</p>
                        </div>
                    )}

                    <form onSubmit={handleInputSubmit} className="space-y-5">

                        {/* Name Fields (Signup Only) */}
                        {mode === 'signup' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider ml-1">First Name</label>
                                    <input
                                        value={firstName}
                                        onChange={e => setFirstName(e.target.value)}
                                        placeholder="John"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-md p-3 text-gray-900 text-sm outline-none focus:border-amber-500 transition-all placeholder-gray-400 focus:bg-white"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider ml-1">Last Name</label>
                                    <input
                                        value={lastName}
                                        onChange={e => setLastName(e.target.value)}
                                        placeholder="Doe"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-md p-3 text-gray-900 text-sm outline-none focus:border-amber-500 transition-all placeholder-gray-400 focus:bg-white"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email Field */}
                        <div className="space-y-1">
                            {mode !== 'login' && <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider ml-1">Email</label>}
                            <div className="relative group">
                                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="Email Address"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-md pl-10 p-3 text-gray-900 text-sm outline-none focus:border-amber-500 transition-all placeholder-gray-400 focus:bg-white"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        {mode !== 'forgot' && (
                            <div className="space-y-1">
                                {mode !== 'login' && <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider ml-1">Password</label>}
                                <div className="relative group">
                                    <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        placeholder="Password"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-md pl-10 p-3 text-gray-900 text-sm outline-none focus:border-amber-500 transition-all placeholder-gray-400 focus:bg-white"
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-400 hover:text-black transition-colors">
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Forgot Password Link (Login Only) */}
                        {mode === 'login' && (
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setMode('forgot')}
                                    className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-amber-600 transition-colors"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded flex items-start gap-2 animate-shake">
                                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs font-medium text-red-600 leading-tight">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white font-bold py-3.5 rounded-sm hover:bg-amber-500 hover:text-white transition-all duration-300 shadow-lg hover:shadow-amber-500/20 flex items-center justify-center space-x-2 text-xs uppercase tracking-[0.2em] group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <span>
                                        {mode === 'login' && 'Sign In'}
                                        {mode === 'signup' && 'Create Account'}
                                        {mode === 'forgot' && 'Send Reset Link'}
                                    </span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Mode Toggles */}
                    <div className="mt-8 text-center pt-6 border-t border-gray-100">
                        {mode === 'login' ? (
                            <p className="text-xs text-gray-500">
                                Not a member yet?{' '}
                                <button onClick={() => setMode('signup')} className="text-black font-bold hover:text-amber-600 transition-colors ml-1 underline decoration-gray-200 underline-offset-4">
                                    Apply for Membership
                                </button>
                            </p>
                        ) : (
                            <button onClick={() => setMode('login')} className="text-xs text-gray-400 font-bold hover:text-black transition-colors uppercase tracking-widest flex items-center justify-center mx-auto group">
                                <ChevronRight className="w-3 h-3 mr-1 rotate-180 group-hover:-translate-x-1 transition-transform" /> Back to Sign In
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
