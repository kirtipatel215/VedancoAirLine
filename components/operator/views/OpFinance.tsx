
import React, { useState, useEffect } from 'react';
import { OperatorService } from '../OperatorService.ts';
import { OpPayout } from '../types';
import { StatusBadge, SectionHeader, SearchFilterToolbar } from '../ui/shared.tsx';
import { Download, X, Hash, Calendar, DollarSign, CreditCard } from 'lucide-react';

export const OpFinance = () => {
    const [payouts, setPayouts] = useState<OpPayout[]>([]);
    const [selectedPayout, setSelectedPayout] = useState<OpPayout | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        OperatorService.getPayouts().then(setPayouts);
    }, []);

    const filtered = payouts.filter(p => {
        const matchesSearch = p.ref.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = statusFilter === 'All' || p.status === statusFilter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-8 animate-fade-in relative">
            <SectionHeader title="Financial Earnings" subtitle="Track charter revenue and settlement status." />

            <SearchFilterToolbar
                onSearch={setSearchQuery}
                onFilter={setStatusFilter}
                filterOptions={['Paid', 'Processing', 'Pending']}
                placeholder="Search Transaction ID..."
            />

            {/* Invoice Modal */}
            {selectedPayout && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedPayout(null)}>
                    <div className="glass-panel w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-scale-up border border-white/10" onClick={e => e.stopPropagation()}>
                        <div className="bg-charcoal-900/50 p-8 border-b border-white/10 flex justify-between items-start">
                            <div>
                                <h3 className="font-serif font-bold text-2xl text-white mb-1 text-glow">Payment Advice</h3>
                                <p className="text-xs text-gold-500 font-bold uppercase tracking-widest">Settlement Receipt</p>
                            </div>
                            <button onClick={() => setSelectedPayout(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                        </div>

                        <div className="p-8 space-y-6 relative bg-charcoal-950/80">
                            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                                <DollarSign className="w-48 h-48 text-gold-500" />
                            </div>

                            <div className="flex justify-between items-center bg-black/40 text-white p-6 rounded-lg shadow-lg relative z-10 border border-white/5">
                                <span className="text-xs font-bold uppercase tracking-widest text-gold-500">Net Amount</span>
                                <span className="text-3xl font-serif font-bold text-white">${selectedPayout.amount.toLocaleString()}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-6 relative z-10">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Transaction Ref</p>
                                    <p className="font-mono text-sm font-bold text-white">{selectedPayout.ref}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Date</p>
                                    <p className="font-bold text-white">{selectedPayout.date}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Status</p>
                                    <StatusBadge status={selectedPayout.status} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Method</p>
                                    <p className="font-bold text-white flex items-center text-sm"><CreditCard className="w-3 h-3 mr-2 text-gray-400" /> Wire Transfer</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-white/5 border-t border-white/10">
                            <button className="w-full bg-white/5 border border-white/10 text-white py-3 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-gold-500 hover:text-charcoal-900 hover:border-gold-500 transition-all shadow-sm flex items-center justify-center">
                                <Download className="w-4 h-4 mr-2" /> Download Statement
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="glass-panel rounded-xl overflow-hidden border border-white/5">
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead className="bg-white/5 border-b border-white/5">
                            <tr className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                <th className="px-8 py-5">Transaction ID</th>
                                <th className="px-8 py-5">Date Initiated</th>
                                <th className="px-8 py-5">Net Amount (USD)</th>
                                <th className="px-8 py-5">Settlement Status</th>
                                <th className="px-8 py-5 text-right">Invoice</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.length === 0 ? (
                                <tr><td colSpan={5} className="px-8 py-10 text-center text-gray-500 italic">No transactions found.</td></tr>
                            ) : filtered.map(p => (
                                <tr key={p.id} className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => setSelectedPayout(p)}>
                                    <td className="px-8 py-6 font-mono text-[10px] font-bold text-gray-500 group-hover:text-gold-500 transition-colors">{p.ref}</td>
                                    <td className="px-8 py-6 text-sm text-gray-400 font-medium">{p.date}</td>
                                    <td className="px-8 py-6 font-serif font-bold text-emerald-400 text-lg">${p.amount.toLocaleString()}</td>
                                    <td className="px-8 py-6"><StatusBadge status={p.status} /></td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="text-gray-500 hover:text-gold-500 transition-colors p-2 rounded-full hover:bg-white/10 inline-block">
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
