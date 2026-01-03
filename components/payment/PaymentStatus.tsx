
import React from 'react';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

interface PaymentStatusProps {
    status: 'success' | 'failed';
    transactionId: string;
    onContinue: () => void;
}

export const PaymentStatus: React.FC<PaymentStatusProps> = ({ status, transactionId, onContinue }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white max-w-lg w-full rounded-2xl shadow-2xl p-8 md:p-12 text-center animate-scale-up">
                {status === 'success' ? (
                    <>
                        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                        </div>
                        <h2 className="text-3xl font-serif font-bold text-navy-900 mb-4">Payment Successful</h2>
                        <p className="text-gray-500 mb-8">
                            Your booking has been confirmed. A receipt has been sent to your email.
                        </p>
                    </>
                ) : status === 'cancelled' ? (
                    <>
                        <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <XCircle className="w-12 h-12 text-yellow-600" />
                        </div>
                        <h2 className="text-3xl font-serif font-bold text-navy-900 mb-4">Payment Cancelled</h2>
                        <p className="text-gray-500 mb-8">
                            You cancelled the payment. No charges were made.
                        </p>
                    </>
                ) : (
                    <>
                        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <XCircle className="w-12 h-12 text-red-600" />
                        </div>
                        <h2 className="text-3xl font-serif font-bold text-navy-900 mb-4">Payment Failed</h2>
                        <p className="text-gray-500 mb-8">
                            The transaction was declined or could not be processed. Please try again.
                        </p>
                    </>
                )}

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-8">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Transaction Ref</p>
                    <p className="font-mono text-sm font-bold text-navy-900">{transactionId}</p>
                </div>

                <button
                    onClick={onContinue}
                    className="w-full bg-navy-900 text-white font-bold py-4 rounded-xl hover:bg-gold-500 hover:text-navy-900 transition-all flex items-center justify-center gap-2"
                >
                    Return to Dashboard <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
