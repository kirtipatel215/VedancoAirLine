
import React, { useState } from 'react';
import { Lock, Mail, Loader2, ArrowRight, AlertCircle, KeyRound, ArrowLeft } from 'lucide-react';
import { AdminService } from './adminService.ts';
import { LogoIcon } from '../Logo.tsx';

export const AdminLogin = ({ onLogin, onBack }: { onLogin: (user: any) => void, onBack?: () => void }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const user = await AdminService.login(email.trim(), password.trim());
            if (user) {
                onLogin(user);
            } else {
                setError('Access Denied: Invalid Credentials');
            }
        } catch (err: any) {
            console.error('Admin login error:', err);

            // Show specific error message for better debugging
            const errorMsg = err?.message || 'Unknown error';

            if (errorMsg.includes('Invalid login credentials')) {
                setError('Invalid email or password. Please check your credentials.');
            } else if (errorMsg.includes('Email not confirmed')) {
                setError('Please confirm your email address before logging in.');
            } else if (errorMsg.includes('Invalid API key')) {
                setError('System Configuration Error: Invalid Supabase credentials');
            } else if (errorMsg.includes('fetch')) {
                setError('Network Error: Cannot connect to authentication server');
            } else if (errorMsg.includes('Profile not found')) {
                setError('Profile Error: Your profile could not be found');
            } else if (errorMsg.includes('Admin privileges required')) {
                setError('Access Denied: Admin privileges required');
            } else {
                setError(`System Error: ${errorMsg}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-charcoal-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-gold-500/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-charcoal-800/30 rounded-full blur-[120px] pointer-events-none"></div>

            {onBack && (
                <button onClick={onBack} className="absolute top-6 left-6 text-gray-500 hover:text-white flex items-center text-xs font-bold uppercase tracking-widest z-50 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Return to Site
                </button>
            )}

            <div className="w-full max-w-md bg-charcoal-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative z-10 animate-scale-up">
                {/* Gold Stripe */}
                <div className="h-1 w-full bg-gradient-to-r from-gold-600 via-gold-400 to-gold-600"></div>

                <div className="p-8 md:p-10">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-charcoal-800 border border-white/5 mb-6 shadow-inner">
                            <LogoIcon className="w-8 h-8" color="text-gold-500" />
                        </div>
                        <h1 className="text-2xl font-serif font-bold text-white tracking-widest mb-2">COMMAND CENTER</h1>
                        <p className="text-xs text-gray-500 uppercase tracking-[0.2em] font-bold">Restricted Personnel Only</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gold-500 uppercase tracking-widest ml-1">Secure ID</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-gold-500 transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-charcoal-950 border border-white/10 rounded-lg pl-12 pr-4 py-4 text-white text-sm focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition-all placeholder-gray-700"
                                    placeholder="admin@vedanco.com"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gold-500 uppercase tracking-widest ml-1">Passkey</label>
                            <div className="relative group">
                                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-gold-500 transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-charcoal-950 border border-white/10 rounded-lg pl-12 pr-4 py-4 text-white text-sm focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition-all placeholder-gray-700"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-400">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span className="text-xs font-bold">{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-gold-600 to-gold-500 text-charcoal-950 font-bold py-4 rounded-lg uppercase tracking-widest text-xs hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all flex items-center justify-center group"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                <>
                                    <span>Authenticate</span>
                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Demo Credentials Hint */}
                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-[10px] text-gray-600 mb-2">DEMO ACCESS CREDENTIALS</p>
                        <div className="inline-block bg-charcoal-800 px-4 py-2 rounded border border-white/5">
                            <p className="text-[10px] text-gray-400 font-mono">
                                <span className="text-gold-500">U:</span> admin@vedanco.com &nbsp;|&nbsp; <span className="text-gold-500">P:</span> admin123
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .animate-scale-up {
                    animation: scaleUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                @keyframes scaleUp {
                    from { transform: scale(0.95) translateY(10px); opacity: 0; }
                    to { transform: scale(1) translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};
