import React, { useEffect, useState } from 'react';
import { RefreshCw, Plane, Clock, User, ArrowRight, MapPin, Calendar, X, DollarSign, CheckCircle, Loader2, Search, Filter, ChevronDown, CheckCircle2 } from 'lucide-react';
import { OperatorService } from '../OperatorService.ts';
import { motion } from 'framer-motion';

export const OpRequests = ({ user }: { user: any }) => {
    const [requests, setRequests] = useState<any[]>([]);
    const [fleet, setFleet] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Modal State
    const [selectedReq, setSelectedReq] = useState<any | null>(null);
    const [quotePrice, setQuotePrice] = useState('');
    const [quoteAircraft, setQuoteAircraft] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = await OperatorService.getRequests();
            setRequests(data);
        } catch (error) {
            console.error("Failed to fetch requests", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
        OperatorService.getAircraft().then(setFleet).catch(console.error);
    }, []);

    const handleQuote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedReq || !quotePrice || !quoteAircraft) return;

        setSubmitting(true);
        try {
            await OperatorService.submitQuote(selectedReq.id, quoteAircraft, parseFloat(quotePrice), user);
            setSelectedReq(null);
            setQuotePrice('');
            setQuoteAircraft('');
            fetchRequests();
            alert("Quote submitted successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to submit quote.");
        } finally {
            setSubmitting(false);
        }
    };

    const filteredRequests = requests.filter(r => {
        const matchesSearch = r.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.destination.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'All' || r.tripType === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            {/* Page Header matching Customer Dashboard */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-slate-800">Flight Requests</h1>
                    <p className="text-slate-500 mt-1 text-sm">Review active charter inquiries and submit proposals.</p>
                </div>
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-gold-500" />
                        <input
                            type="text"
                            placeholder="Search routes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 w-full md:w-64 transition-all"
                        />
                    </div>
                    <div className="relative">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm font-bold text-slate-700 flex items-center justify-between min-w-[140px] hover:bg-stone-50 transition-all"
                        >
                            <span>{filter === 'All' ? 'All Types' : filter}</span>
                            <ChevronDown className="w-4 h-4 ml-2 text-gray-400" />
                        </button>
                        {isFilterOpen && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-stone-100 overflow-hidden z-20 animate-fade-in-up">
                                {['All', 'One Way', 'Round Trip'].map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => { setFilter(opt); setIsFilterOpen(false); }}
                                        className={`w-full text-left px-4 py-3 text-sm font-medium hover:bg-stone-50 transition-colors ${filter === opt ? 'text-gold-600 bg-gold-50/50' : 'text-slate-600'}`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={fetchRequests}
                        className="p-2.5 bg-white border border-stone-200 rounded-xl text-slate-400 hover:text-gold-600 hover:border-gold-500 hover:bg-gold-50 transition-all"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-stone-50/50 border-b border-stone-100">
                        <tr>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Route</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Schedule</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Details</th>
                            <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                        {loading ? (
                            <tr><td colSpan={5} className="p-12 text-center text-slate-400">Loading requests...</td></tr>
                        ) : filteredRequests.length === 0 ? (
                            <tr><td colSpan={5} className="p-12 text-center text-slate-400">No requests found.</td></tr>
                        ) : (
                            filteredRequests.map((req) => (
                                <tr key={req.id} className="hover:bg-stone-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3 font-medium text-slate-800">
                                            <span className="text-sm font-bold tracking-wide w-12">{req.origin}</span>
                                            <div className="flex flex-col items-center gap-0.5 px-2">
                                                <div className="text-[9px] text-slate-400 font-medium whitespace-nowrap">{req.tripType}</div>
                                                <div className="flex items-center w-20">
                                                    <span className="h-px bg-stone-300 w-full"></span>
                                                    <Plane className="w-3 h-3 text-gold-500 mx-1 rotate-90" />
                                                    <span className="h-px bg-stone-300 w-full"></span>
                                                    <ArrowRight className="w-3 h-3 text-stone-300 -ml-1" />
                                                </div>
                                            </div>
                                            <span className="text-sm font-bold tracking-wide w-12 text-right">{req.destination}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-800 text-sm">{new Date(req.date).toLocaleDateString()}</span>
                                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{new Date(req.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium bg-stone-100 px-2 py-1 rounded">
                                                <User className="w-3 h-3 text-slate-400" /> {req.pax}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium bg-stone-100 px-2 py-1 rounded">
                                                <Plane className="w-3 h-3 text-slate-400" /> {req.aircraftType}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${req.status === 'Open' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                                            }`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setSelectedReq(req)}
                                            className="px-4 py-2 rounded-lg bg-[#0B1120] text-white text-xs font-bold hover:bg-gold-500 hover:text-navy-900 transition-all shadow-md hover:shadow-lg whitespace-nowrap flex items-center justify-center gap-1 group w-fit ml-auto"
                                        >
                                            View Details
                                            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {loading ? (
                    <div className="p-12 text-center text-slate-400"><Loader2 className="w-8 h-8 animate-spin mx-auto text-gold-500 mb-2" />Loading...</div>
                ) : filteredRequests.length === 0 ? (
                    <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                        <p className="text-slate-500 font-medium">No requests found.</p>
                    </div>
                ) : (
                    filteredRequests.map((req) => (
                        <div key={req.id} className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-stone-100 relative overflow-hidden">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex flex-col gap-0.5">
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(req.date).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl font-serif font-bold text-slate-800">{req.origin}</span>
                                        <ArrowRight className="w-4 h-4 text-gold-500" />
                                        <span className="text-xl font-serif font-bold text-slate-800">{req.destination}</span>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${req.status === 'Open' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                                    }`}>
                                    {req.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-5">
                                <div className="bg-stone-50 p-3 rounded-xl">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Format</p>
                                    <p className="text-xs font-bold text-slate-700">{req.tripType}</p>
                                </div>
                                <div className="bg-stone-50 p-3 rounded-xl">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Pax</p>
                                    <p className="text-xs font-bold text-slate-700">{req.pax} Passengers</p>
                                </div>
                                <div className="col-span-2 bg-stone-50 p-3 rounded-xl">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Aircraft Pref</p>
                                    <p className="text-xs font-bold text-slate-700">{req.aircraftType}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedReq(req)}
                                className="w-full py-3 bg-[#0B1120] text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gold-500 hover:text-navy-900 transition-all shadow-lg flex items-center justify-center gap-2 group"
                            >
                                View Details
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Modal - Styled for Light Theme */}
            {selectedReq && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy-950/40 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedReq(null)}>
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-scale-up border border-stone-100 relative" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setSelectedReq(null)}
                            className="absolute top-4 right-4 z-50 p-2 bg-stone-100 hover:bg-stone-200 text-slate-600 rounded-full transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="bg-[#0B1120] p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>
                            <h3 className="font-serif font-bold text-2xl mb-1 mt-2">Submit Proposal</h3>
                            <div className="flex items-center gap-2 text-gold-500 text-xs font-bold uppercase tracking-widest">
                                {selectedReq.origin} <ArrowRight className="w-3 h-3" /> {selectedReq.destination}
                            </div>
                        </div>

                        <form onSubmit={handleQuote} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Select Aircraft</label>
                                    <div className="relative">
                                        <select
                                            required
                                            value={quoteAircraft}
                                            onChange={e => setQuoteAircraft(e.target.value)}
                                            className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm text-slate-800 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none appearance-none font-medium"
                                        >
                                            <option value="">Choose from Fleet...</option>
                                            {fleet.map(ac => (
                                                <option key={ac.id} value={ac.id}>
                                                    {ac.registration} ({ac.model}) - {ac.seats} Pax
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Charter Price (USD)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="number"
                                            required
                                            min="1000"
                                            value={quotePrice}
                                            onChange={e => setQuotePrice(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 pl-10 text-sm text-slate-800 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 outline-none font-mono font-bold"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-xs text-amber-800 leading-relaxed font-medium">
                                <p>A 15% platform fee will be added to the customer price. Your net payout will be exactly what you enter.</p>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-gold-500 text-navy-900 py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gold-400 transition-all shadow-lg hover:shadow-gold-500/20 flex items-center justify-center disabled:opacity-70 disabled:cursor-wait"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                {submitting ? 'Submitting...' : 'Send Proposal'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
