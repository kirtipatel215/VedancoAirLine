
import React, { useState, useEffect } from 'react';
import { OperatorService } from '../OperatorService.ts';
import { OpQuote } from '../types';
import { StatusBadge, SectionHeader, SearchFilterToolbar } from '../ui/shared.tsx';
import { X, Eye, Plane, DollarSign, Calendar, Trash2, User, Mail, Phone, ShoppingBag, Cat, Info, ChevronRight } from 'lucide-react';

export const OpQuotes = () => {
    const [quotes, setQuotes] = useState<OpQuote[]>([]);
    const [selectedQuote, setSelectedQuote] = useState<OpQuote | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        OperatorService.getQuotes().then(setQuotes);
    }, []);

    const handleWithdraw = async () => {
        if (!selectedQuote) return;
        if (confirm("Withdraw this proposal? The client will no longer be able to accept it.")) {
            await OperatorService.withdrawQuote(selectedQuote.id);
            const updated = await OperatorService.getQuotes();
            setQuotes(updated);
            setSelectedQuote(updated.find(q => q.id === selectedQuote.id) || null);
        }
    };

    const filtered = quotes.filter(q => {
        const matchesSearch = q.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.aircraftId.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = statusFilter === 'All' || q.status === statusFilter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-8 animate-fade-in relative">
            <SectionHeader title="Active Proposals" subtitle="Track status of quotes sent to clients." />

            <SearchFilterToolbar
                onSearch={setSearchQuery}
                onFilter={setStatusFilter}
                filterOptions={['Submitted', 'Accepted', 'Rejected', 'Expired']}
                placeholder="Search Quote ID, Route, or Aircraft..."
            />

            {/* Enhanced Detail Drawer */}
            <div className={`fixed inset-y-0 right-0 w-full md:w-[600px] bg-charcoal-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-white/10 ${selectedQuote ? 'translate-x-0' : 'translate-x-full'}`}>
                {selectedQuote && (
                    <div className="h-full flex flex-col">
                        <div className="p-8 bg-charcoal-950 text-white flex justify-between items-center border-b border-white/10">
                            <div>
                                <h3 className="font-serif font-bold text-xl mb-1 text-glow">Quote Details</h3>
                                <div className="flex items-center gap-3">
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest font-mono">{selectedQuote.id}</p>
                                    <StatusBadge status={selectedQuote.status} />
                                </div>
                            </div>
                            <button onClick={() => setSelectedQuote(null)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"><X className="w-4 h-4" /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8">

                            {/* Client Information Section */}
                            <div className="bg-white/5 p-6 rounded-xl border border-white/10 shadow-sm relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center">
                                    <User className="w-4 h-4 mr-2 text-gold-500" /> Client Profile
                                </h4>
                                {selectedQuote.clientDetails ? (
                                    <div className="space-y-4 relative z-10">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-bold text-gray-200">{selectedQuote.clientDetails.name}</span>
                                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">{selectedQuote.clientDetails.type}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center text-xs text-gray-400 bg-white/5 p-3 rounded">
                                                <Mail className="w-3 h-3 mr-2" /> {selectedQuote.clientDetails.email}
                                            </div>
                                            <div className="flex items-center text-xs text-gray-400 bg-white/5 p-3 rounded">
                                                <Phone className="w-3 h-3 mr-2" /> {selectedQuote.clientDetails.phone}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-500 italic">Client details not available.</p>
                                )}
                            </div>

                            {/* Trip Parameters */}
                            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                                <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center">
                                    <Plane className="w-4 h-4 mr-2 text-gold-500" /> Flight Requirements
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between bg-white/5 p-4 rounded-lg border border-white/5">
                                        <div>
                                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Route</p>
                                            <p className="font-bold text-gray-200 text-sm">{selectedQuote.route}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-1">Date</p>
                                            <p className="font-bold text-gray-200 text-sm">
                                                {selectedQuote.inquiryDetails?.date ? new Date(selectedQuote.inquiryDetails.date).toLocaleDateString() : 'TBD'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="bg-white/5 p-3 rounded border border-white/5 text-center">
                                            <p className="text-[9px] text-gray-500 uppercase font-bold mb-1">Pax</p>
                                            <p className="font-bold text-gray-200">{selectedQuote.inquiryDetails?.pax || '-'}</p>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded border border-white/5 text-center">
                                            <p className="text-[9px] text-gray-500 uppercase font-bold mb-1">Pets</p>
                                            <div className="flex items-center justify-center font-bold text-gray-200">
                                                <Cat className="w-3 h-3 mr-1 text-gray-400" /> {selectedQuote.inquiryDetails?.pets || 0}
                                            </div>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded border border-white/5 text-center">
                                            <p className="text-[9px] text-gray-500 uppercase font-bold mb-1">Luggage</p>
                                            <div className="flex items-center justify-center font-bold text-gray-200">
                                                <ShoppingBag className="w-3 h-3 mr-1 text-gray-400" /> {selectedQuote.inquiryDetails?.luggage ? 'Yes' : 'Std'}
                                            </div>
                                        </div>
                                    </div>

                                    {selectedQuote.inquiryDetails?.notes && (
                                        <div className="bg-amber-500/10 p-4 rounded border border-amber-500/20 text-xs text-amber-500">
                                            <span className="font-bold block mb-1 flex items-center"><Info className="w-3 h-3 mr-1" /> Notes:</span>
                                            {selectedQuote.inquiryDetails.notes}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quote Economics */}
                            <div>
                                <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center">
                                    <DollarSign className="w-4 h-4 mr-2 text-gold-500" /> Proposal Economics
                                </h4>
                                <div className="p-6 bg-black/40 rounded-xl text-white shadow-lg border border-white/10">
                                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
                                        <span className="text-sm font-medium text-gray-400">Assigned Aircraft</span>
                                        <span className="text-sm font-bold">{selectedQuote.aircraftId}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-400">Net Charter Price</span>
                                        <span className="text-2xl font-serif font-bold text-gold-500">${selectedQuote.price.toLocaleString()}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-600 mt-2 text-right uppercase tracking-widest">Excludes Platform Fees</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t border-white/10 bg-black/20">
                            <button
                                onClick={handleWithdraw}
                                disabled={selectedQuote.status !== 'Submitted'}
                                className="w-full border border-red-500/30 text-red-500 py-4 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-red-500/10 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Trash2 className="w-4 h-4 mr-2" /> Withdraw Proposal
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Overlay */}
            {selectedQuote && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-all duration-300" onClick={() => setSelectedQuote(null)}></div>}

            <div className="glass-panel rounded-xl overflow-hidden border border-white/5">
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead className="bg-white/5 border-b border-white/5">
                            <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <th className="px-8 py-5">Quote Reference</th>
                                <th className="px-8 py-5">Route Details</th>
                                <th className="px-8 py-5">Aircraft</th>
                                <th className="px-8 py-5">Charter Price</th>
                                <th className="px-8 py-5">Submission Date</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.length === 0 ? (
                                <tr><td colSpan={7} className="px-8 py-10 text-center text-gray-500 italic">No quotes matching criteria.</td></tr>
                            ) : filtered.map(q => (
                                <tr key={q.id} onClick={() => setSelectedQuote(q)} className="hover:bg-white/5 transition-colors group cursor-pointer">
                                    <td className="px-8 py-6 font-mono text-[10px] font-bold text-gray-500 group-hover:text-gold-500 transition-colors">{q.id}</td>
                                    <td className="px-8 py-6">
                                        <p className="font-bold text-white text-sm">{q.route}</p>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold mt-1">Ref: {q.inquiryId}</p>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-bold text-gray-300">{q.aircraftId}</td>
                                    <td className="px-8 py-6 font-serif font-bold text-gold-400 text-lg">${q.price.toLocaleString()}</td>
                                    <td className="px-8 py-6 text-xs text-gray-500 font-medium">{q.submittedAt}</td>
                                    <td className="px-8 py-6"><StatusBadge status={q.status} /></td>
                                    <td className="px-8 py-6 text-right">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest group-hover:text-white transition-colors mr-2">Details</span>
                                        <ChevronRight className="w-4 h-4 inline-block text-gray-600 group-hover:text-gold-500 group-hover:translate-x-1 transition-all" />
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
