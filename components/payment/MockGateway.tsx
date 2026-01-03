
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, CreditCard, ChevronRight, Loader2, XCircle } from 'lucide-react';

interface MockGatewayProps {
    transactionId: string;
    amount: number;
    currency: string;
    onComplete: (status: 'success' | 'failed') => void;
}

export const MockGateway: React.FC<MockGatewayProps> = ({ transactionId, amount, currency, onComplete }) => {
    const [processing, setProcessing] = useState(false);
    const [step, setStep] = useState<'login' | 'confirm'>('login');

    const handleLogin = () => {
        setProcessing(true);
        setTimeout(() => {
            setProcessing(false);
            setStep('confirm');
        }, 1000); // Simulate network delay
    };

    const handlePayment = async (status: 'success' | 'failed') => {
        setProcessing(true);
        try {
            // Call the process-payment Edge Function
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({
                    transactionId,
                    status,
                    gatewayResponse: {
                        simulated: true,
                        provider: 'MockGateway',
                        timestamp: new Date().toISOString()
                    }
                })
            });

            if (!response.ok) throw new Error('Payment processing failed');

            onComplete(status);

        } catch (error) {
            console.error("Payment error", error);
            onComplete('failed');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
            <div className="bg-white max-w-md w-full rounded-xl shadow-2xl overflow-hidden border border-gray-200">
                {/* Header */}
                <div className="bg-[#003087] p-6 flex justify-between items-center text-white">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-6 h-6" />
                        <span className="font-bold text-lg tracking-wide">SecurePay</span>
                    </div>
                    <div className="text-xs opacity-80 bg-white/10 px-2 py-1 rounded">
                        TEST MODE
                    </div>
                </div>

                {/* Body */}
                <div className="p-8">
                    <div className="mb-8 text-center">
                        <p className="text-gray-500 text-sm uppercase tracking-wider mb-1">Merchant</p>
                        <h2 className="text-2xl font-bold text-gray-800">Vedanco Air</h2>
                        <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <p className="text-gray-500 text-xs uppercase mb-1">Amount Due</p>
                            <p className="text-3xl font-bold text-[#003087]">{currency} {amount.toLocaleString()}</p>
                        </div>
                    </div>

                    {step === 'login' ? (
                        <div className="space-y-4 animate-fade-in">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Mock Username</label>
                                <input type="text" defaultValue="demo_user" disabled className="w-full bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Mock Password</label>
                                <input type="password" value="********" disabled className="w-full bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed" />
                            </div>
                            <button
                                onClick={handleLogin}
                                disabled={processing}
                                className="w-full bg-[#003087] hover:bg-[#00205b] text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all mt-6"
                            >
                                {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Log In <ChevronRight className="w-4 h-4" /></>}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-fade-in">
                            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-start gap-3">
                                <Lock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                <p className="text-sm text-blue-800">Please confirm your payment of <b>{currency} {amount.toLocaleString()}</b> to Vedanco Air.</p>
                            </div>

                            <div className="pt-4 flex flex-col gap-3">
                                <button
                                    onClick={() => handlePayment('success')}
                                    disabled={processing}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-200"
                                >
                                    {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Approve Payment <ShieldCheck className="w-5 h-5" /></>}
                                </button>
                                <button
                                    onClick={() => handlePayment('failed')}
                                    disabled={processing}
                                    className="w-full bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
                                >
                                    Decline Transaction
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
                    <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                        <Lock className="w-3 h-3" /> 256-bit SSL Encrypted Connection
                    </p>
                </div>
            </div>
        </div>
    );
};
