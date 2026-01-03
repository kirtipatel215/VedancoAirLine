
import React, { useState, useEffect } from 'react';
import { Eye, ArrowRight, ArrowLeft, Plane, DollarSign, Calendar, Clock } from 'lucide-react';
import { AdminService } from '../adminService.ts';
import { AdminQuoteView } from '../types';
import { SectionHeader, SearchFilterToolbar, StatusBadge } from '../../dashboard/shared.tsx';

// --- Detail Component ---
const QuoteDetail = ({ quote, onBack }: { quote: AdminQuoteView, onBack: () => void }) => {
    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <button onClick={onBack} className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-charcoal-900 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Quotes
                </button>
                <div className="flex gap-2">
                    <button className="bg-charcoal-900 text-white px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-gold-500 transition-all">Send to Client</button>
                    <button className="border border-gray-200 text-charcoal-600 px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50">Edit Proposal</button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden">
                <div className="p-8 md:p-10 border-b border-gray-50">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-serif font-bold text-charcoal-900 mb-2">{quote.id}</h1>
                            <p className="text-sm font-bold text-gold-600 uppercase tracking-widest flex items-center">
                                <Plane className="w-4 h-4 mr-2" /> {quote.aircraft} <span className="text-gray-300 mx-2">|</span> {quote.operatorName}
                            </p>
                        </div>
                        <StatusBadge status={quote.status} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="p-8 md:p-10 border-b md:border-b-0 md:border-r border-gray-50 bg-gray-50/30">
                        <h3 className="text-sm font-serif font-bold text-charcoal-900 mb-6">Financial Breakdown</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Base Operator Price</span>
                                <span className="font-bold text-charcoal-900">${quote.basePrice.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Taxes & Fees</span>
                                <span className="font-bold text-charcoal-900">${quote.taxes.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Platform Commission ({quote.commissionPercent}%)</span>
                                <span className="font-bold text-emerald-600">+${(quote.basePrice * (quote.commissionPercent/100)).toLocaleString()}</span>
                            </div>
                            <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                                <span className="font-bold text-charcoal-900">Total Client Price</span>
                                <span className="text-2xl font-serif font-bold text-charcoal-900">${quote.totalPrice.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-10">
                        <h3 className="text-sm font-serif font-bold text-charcoal-900 mb-6">Proposal Details</h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Inquiry Ref</p>
                                <p className="text-sm font-bold text-blue-600">{quote.inquiryId}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Valid Until</p>
                                <p className="text-sm font-bold text-charcoal-900 flex items-center">
                                    <Clock className="w-3 h-3 mr-1 text-gold-500" /> 
                                    {new Date(quote.validUntil).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main List ---
export const QuotesList = () => {
    const [quotes, setQuotes] = useState<AdminQuoteView[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedQuote, setSelectedQuote] = useState<AdminQuoteView | null>(null);

    useEffect(() => { 
        setLoading(true);
        AdminService.getQuotes().then(data => {
            setQuotes(data);
            setLoading(false);
        }); 
    }, []);

    const filtered = quotes.filter(q => {
        const id = q.id || '';
        const opName = q.operatorName || '';
        const matchesSearch = id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              opName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = statusFilter === 'All' || q.status === statusFilter;
        return matchesSearch && matchesFilter;
    });

    if (selectedQuote) {
        return <QuoteDetail quote={selectedQuote} onBack={() => setSelectedQuote(null)} />;
    }

    return (
        <div className="animate-fade-in space-y-6">
            <SectionHeader title="Generated Proposals" subtitle="Monitor quotes sent by operators to clients." />
            <SearchFilterToolbar 
                onSearch={setSearchQuery} 
                onFilter={setStatusFilter} 
                filterOptions={['Draft', 'Sent', 'Accepted', 'Declined', 'Expired']}
                placeholder="Search quote ID or operator..."
            />

            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <th className="px-8 py-5">Quote ID</th>
                            <th className="px-8 py-5">Inquiry Ref</th>
                            <th className="px-8 py-5">Operator & Aircraft</th>
                            <th className="px-8 py-5">Financials</th>
                            <th className="px-8 py-5">Status</th>
                            <th className="px-8 py-5 text-right">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan={6} className="p-10 text-center"><div className="animate-spin w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full mx-auto"></div></td></tr>
                        ) : filtered.map(q => (
                            <tr key={q.id} onClick={() => setSelectedQuote(q)} className="hover:bg-gray-50/80 transition-colors group cursor-pointer">
                                <td className="px-8 py-6 font-mono text-[10px] font-bold text-gray-400">{q.id}</td>
                                <td className="px-8 py-6 text-xs font-bold text-blue-600 bg-blue-50/50 rounded-sm inline-block my-4 mx-8 px-2 py-1">{q.inquiryId}</td>
                                <td className="px-8 py-6">
                                    <p className="font-bold text-charcoal-900 text-sm group-hover:text-gold-600 transition-colors">{q.operatorName}</p>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold mt-1">{q.aircraft}</p>
                                </td>
                                <td className="px-8 py-6">
                                    <p className="font-serif font-bold text-charcoal-900">${q.totalPrice.toLocaleString()}</p>
                                    <p className="text-[9px] text-gray-400 uppercase mt-0.5">Comm: {q.commissionPercent}%</p>
                                </td>
                                <td className="px-8 py-6"><StatusBadge status={q.status} /></td>
                                <td className="px-8 py-6 text-right">
                                    <button className="p-2 rounded-full bg-gray-50 text-gray-400 group-hover:bg-gold-500 group-hover:text-white transition-colors">
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
