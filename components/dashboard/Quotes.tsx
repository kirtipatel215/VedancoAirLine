
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, Check, XCircle, ChevronLeft, Timer, ArrowRight, ShieldCheck, FileUp, Upload, CheckCircle2, RefreshCcw, ExternalLink, Search, Filter, ChevronDown, Sparkles, TrendingUp, Calendar, Users, Plane, MapPin, X, Clock, Wallet } from 'lucide-react';
import { PageTemplate, DataTable, Column, StatusBadge, Pagination } from './shared.tsx';
import { Quote, PaginationMeta, DashboardView } from './types';
import { SecureApiService } from './service.ts';


export const Quotes = ({ onNavigate, initialData }: { onNavigate: (view: DashboardView) => void, initialData?: any }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<Quote[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [selected, setSelected] = useState<Quote | null>(null);
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [paymentState, setPaymentState] = useState<'idle' | 'redirecting' | 'success' | 'fail'>('idle');
    const [paymentError, setPaymentError] = useState<string | null>(null);
    // Filter State
    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

    // Payment Mock State
    const [accepting, setAccepting] = useState(false);

    // Refs
    const detailModalRef = useRef<HTMLDivElement>(null);
    const statusDropdownRef = useRef<HTMLDivElement>(null);

    // Initial Load & Filters
    useEffect(() => {
        if (initialData?.filter) setStatusFilter(initialData.filter);
    }, [initialData]);

    // Close on escape key & Click outside
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setSelected(null);
                setIsStatusDropdownOpen(false);
            }
        };
        const handleClickOutside = (e: MouseEvent) => {
            if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
                setIsStatusDropdownOpen(false);
            }
        };
        window.addEventListener('keydown', handleEsc);
        window.addEventListener('mousedown', handleClickOutside);
        return () => {
            window.removeEventListener('keydown', handleEsc);
            window.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const load = useCallback(async (p: number) => {
        setLoading(true);
        try {
            const result = await SecureApiService.getQuotes(p, 10, {
                status: statusFilter,
                search: searchQuery,
                tab: activeTab
            });

            setData(result.data as Quote[]);
            setMeta(result.pagination);
        } catch (error) {
            console.error('Failed to load quotes:', error);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, statusFilter, activeTab]);


    useEffect(() => { load(1); }, [load]);

    // Handle Payment Verification on Return
    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        const sessionId = query.get('session_id');
        const action = query.get('action');

        if (sessionId && action === 'verify_payment') {
            setPaymentState('redirecting'); // Reuse redirecting UI state for verifying
            const verify = async () => {
                try {
                    const result = await SecureApiService.verifyPaymentSession(sessionId);
                    if (result.verified) {
                        setPaymentState('success');
                        // Refresh data to show updated status
                        load(meta?.currentPage || 1);
                        // Clean URL
                        window.history.replaceState({}, document.title, window.location.pathname);
                    } else {
                        throw new Error("Payment verification failed: " + result.status);
                    }
                } catch (err: any) {
                    console.error("Link verification error:", err);
                    setPaymentError(err.message);
                    setPaymentState('fail');
                }
            };
            verify();
        } else if (query.get('status') === 'cancelled') {
            setPaymentState('idle');
            // Maybe show a toast
            alert("Payment cancelled");
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [load, meta?.currentPage]);



    // --- ACTION HANDLERS ---
    const handleAcceptOffer = async () => {
        if (!selected) return;
        setAccepting(true);
        try {
            await SecureApiService.acceptOffer(selected.id);
            const result = await SecureApiService.getQuotes(meta?.currentPage || 1, 10, {
                status: statusFilter,
                search: searchQuery,
                tab: activeTab
            });
            // update local state to reflect change immediately in modal
            // @ts-ignore
            const updatedSelected = result.data.find((q: Quote) => q.id === selected.id);
            if (updatedSelected) setSelected(updatedSelected as Quote);
            setData(result.data as Quote[]);
            setMeta(result.pagination);
            setAccepting(false);
        } catch (err: any) {
            alert("Failed to accept offer: " + err.message);
            setAccepting(false);
        }
    };

    const initiateMockPayment = async () => {
        if (!selected) return;
        setPaymentState('redirecting');

        try {
            const result = await SecureApiService.initiateCheckout(selected.id, undefined);
            if (result.redirectUrl) {
                window.location.href = result.redirectUrl;
            } else {
                throw new Error("Failed to get payment redirect URL");
            }
        } catch (err: any) {
            console.error(err);
            setPaymentError(err.message);
            setPaymentState('fail');
        }
    };

    // Note: verifyStripeWebhook logic is implicit in the success handler of the modal component now,
    // or manually verified if modal closes.

    // --- COLUMNS ---
    const columns: Column<Quote>[] = [
        {
            header: "Aircraft",
            accessor: (item) => (
                <div className="flex items-center gap-4">
                    <img src={item.image} alt={item.aircraft_model} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                    <div className="flex flex-col">
                        <span className="font-bold text-navy-900 text-sm">{item.aircraft_model}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.operator_name}</span>
                    </div>
                </div>
            )
        },
        {
            header: "Price",
            accessor: (item) => (
                <span className="font-serif font-bold text-navy-900 text-base">
                    ${(item.total_price || 0).toLocaleString()}
                </span>
            )
        },
        {
            header: "Rating",
            accessor: (item) => (
                <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-gold-500" />
                    <span className="text-sm font-bold text-navy-900">{item.operator_rating}</span>
                </div>
            )
        },
        {
            header: "Valid Until",
            accessor: (item) => (
                <span className="text-sm font-medium text-gray-500">
                    {new Date(item.valid_until).toLocaleDateString()}
                </span>
            )
        },
        {
            header: "Status",
            accessor: (item) => <StatusBadge status={item.status} />
        },
        {
            header: "",
            accessor: (item) => (
                <button
                    onClick={(e) => { e.stopPropagation(); setSelected(item); }}
                    className="p-2.5 hover:bg-navy-50 rounded-full text-gray-400 hover:text-navy-900 transition-all transform hover:scale-105"
                    title="View Quote"
                >
                    <ArrowRight className="w-4 h-4" />
                </button>
            )
        }
    ];

    // --- MODAL RENDER ---
    const renderDetailModal = () => {
        if (!selected) return null;

        // Payment Processing Views contained WITHIN modal area if possible, or overlay?
        // Let's handle generic payment errors/states first.

        let modalContent;
        // Standard Detail View
        if (true) {
            modalContent = (
                <>
                    {/* Hero Section */}
                    <div className="bg-[#0B1120] p-6 md:p-12 relative overflow-hidden text-white shrink-0">
                        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-[#1a2333] to-transparent pointer-events-none"></div>
                        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${selected.image})` }}></div>
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-8">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <StatusBadge status={selected.status} />
                                    <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/70 font-mono">
                                        {selected.id}
                                    </div>
                                </div>
                                <h1 className="text-3xl md:text-5xl font-serif font-bold leading-tight mb-2">
                                    {selected.aircraft_model}
                                </h1>
                                <p className="text-white/60 text-sm font-medium tracking-wide flex items-center gap-2 mt-2 uppercase">
                                    <Sparkles className="w-3 h-3 text-gold-500" /> {selected.operator_name}
                                </p>
                            </div>

                            <div className="w-full md:w-auto text-left md:text-right bg-white/5 backdrop-blur-sm p-4 md:p-6 rounded-2xl border border-white/10">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Total Price</p>
                                <p className="text-2xl md:text-4xl font-serif font-bold text-white mb-1">
                                    ${(selected.total_price || 0).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Specs Grid */}
                    <div className="p-6 md:p-12 border-b border-gray-100">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Aircraft Specifications</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Seats</div>
                                <div className="text-lg font-bold text-navy-900 flex items-center gap-2"><Users className="w-4 h-4 text-gray-400" /> {selected.specs?.seats || '-'}</div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Range</div>
                                <div className="text-lg font-bold text-navy-900">{selected.specs?.range || '-'}</div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Speed</div>
                                <div className="text-lg font-bold text-navy-900">{selected.specs?.speed || '-'}</div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="text-[10px] font-bold text-gray-400 uppercase mb-1">Baggage</div>
                                <div className="text-lg font-bold text-navy-900">{selected.specs?.baggage || '-'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Price Breakdown & Actions */}
                    <div className="p-6 md:p-12 bg-gray-50/50 flex-1">
                        <div className="max-w-2xl">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Price Breakdown</h4>
                            <div className="space-y-4 mb-10">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Base Charter Fare</span>
                                    <span className="font-bold text-navy-900">${(selected.base_price || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Taxes & Fees</span>
                                    <span className="font-bold text-navy-900">${(selected.tax_breakup?.tax || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold pt-4 border-t border-gray-200">
                                    <span className="text-navy-900">Total</span>
                                    <span className="text-navy-900">${(selected.total_price || 0).toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                {selected.status === 'Pending' && (
                                    <button
                                        onClick={handleAcceptOffer}
                                        disabled={accepting}
                                        className="flex-1 bg-navy-900 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gold-500 hover:text-navy-900 transition-all shadow-xl flex items-center justify-center gap-2"
                                    >
                                        {accepting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Accept Offer <Check className="w-4 h-4" /></>}
                                    </button>
                                )}

                                {selected.status === 'Accepted' && (
                                    <button
                                        onClick={initiateMockPayment}
                                        className="flex-1 bg-emerald-600 text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-emerald-500 transition-all shadow-xl flex items-center justify-center gap-2"
                                    >
                                        Pay & Confirm ${selected.total_price.toLocaleString()} <ShieldCheck className="w-4 h-4" />
                                    </button>
                                )}

                                {selected.status === 'Rejected' && (
                                    <div className="w-full text-center py-3 bg-red-50 text-red-600 font-bold rounded-xl border border-red-100">
                                        Offer Rejected
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            );
        }

        return (
            <div className="fixed inset-0 z-[100] bg-navy-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
                <div ref={detailModalRef} onClick={(e) => e.stopPropagation()} className="bg-white w-full max-w-5xl rounded-[2rem] shadow-2xl overflow-hidden relative animate-scale-up my-auto border border-white/50 flex flex-col max-h-[90vh] md:max-h-none overflow-y-auto">
                    <button onClick={() => setSelected(null)} className="absolute top-4 right-4 z-50 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-all">
                        <X className="w-5 h-5" />
                    </button>
                    {modalContent}
                </div>
            </div>
        );
    };

    return (
        <>


            {renderDetailModal()}

            <PageTemplate
                title="Aviation Proposals"
                subtitle="Exclusive aircraft options sourced specifically for your route."
                onSearch={setSearchQuery}
                action={
                    <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                        <div className="bg-gray-100 p-1 rounded-full flex relative">
                            {['active', 'history'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab as any)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all z-10 ${activeTab === tab ? 'bg-white text-navy-900 shadow-sm' : 'text-gray-500 hover:text-navy-700'}`}
                                >
                                    {tab === 'active' ? 'Active' : 'History'}
                                </button>
                            ))}
                        </div>

                        <div className="relative" ref={statusDropdownRef}>
                            <button
                                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                                className="bg-gray-50 border border-transparent hover:border-gray-200 hover:bg-white rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide text-navy-700 flex items-center justify-between min-w-[140px] transition-all"
                            >
                                <span className="truncate">{statusFilter === 'All' ? 'All Status' : statusFilter}</span>
                                <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isStatusDropdownOpen && (
                                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20 animate-fade-in-up">
                                    <div className="p-1">
                                        {(activeTab === 'active'
                                            ? ['All', 'Pending', 'Accepted']
                                            : ['All', 'Rejected', 'Expired', 'Booked']
                                        ).map(opt => (
                                            <button
                                                key={opt}
                                                onClick={() => { setStatusFilter(opt); setIsStatusDropdownOpen(false); }}
                                                className={`w-full text-left px-4 py-2 text-xs font-bold rounded-lg transition-colors ${statusFilter === opt ? 'bg-navy-50 text-navy-900' : 'text-gray-500 hover:bg-gray-50 hover:text-navy-900'}`}
                                            >
                                                {opt === 'All' ? 'All Status' : opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <button onClick={() => load(1)} className="p-2 text-gray-400 hover:text-gold-500 transition-colors bg-white rounded-full border border-gray-100 shadow-sm">
                            <RefreshCcw className="w-4 h-4" />
                        </button>
                    </div>
                }
            >
                {/* Desktop Table View */}
                <div className="hidden md:block">
                    <DataTable
                        columns={columns}
                        data={data}
                        loading={loading}
                        pagination={meta ? { currentPage: meta.currentPage, totalPages: meta.totalPages, onPageChange: load } : undefined}
                        onRowClick={setSelected}
                        emptyMessage="No quotes found matching your criteria."
                    />
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                    {loading ? (
                        <div className="p-8 text-center text-gray-400">Loading quotes...</div>
                    ) : data.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 border border-dashed border-gray-200 rounded-2xl">
                            No quotes found.
                        </div>
                    ) : (
                        data.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => setSelected(item)}
                                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 active:scale-[0.98] transition-transform"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <img src={item.image} className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                                        <div>
                                            <div className="font-bold text-navy-900">{item.aircraft_model}</div>
                                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.operator_name}</div>
                                        </div>
                                    </div>
                                    <StatusBadge status={item.status} />
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Total Price</p>
                                        <p className="text-lg font-bold text-navy-900">${(item.total_price || 0).toLocaleString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Valid Until</p>
                                        <p className="text-sm font-medium text-gray-600">{new Date(item.valid_until).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-1 text-xs font-bold text-gold-600">
                                        <TrendingUp className="w-3 h-3" /> {item.operator_rating}/5.0
                                    </div>
                                    <button className="text-xs font-bold text-navy-900 uppercase tracking-widest flex items-center gap-1">
                                        View Details <ChevronLeft className="w-3 h-3 rotate-180" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                    {/* Mobile Pagination */}
                    {meta && meta.totalPages > 1 && (
                        <div className="flex justify-center gap-2 pt-4">
                            <button disabled={meta.currentPage === 1} onClick={() => load(meta.currentPage - 1)} className="px-3 py-1 rounded-lg bg-white border border-gray-200 text-xs font-bold disabled:opacity-50">Prev</button>
                            <span className="text-xs font-bold text-gray-500 self-center">Page {meta.currentPage} of {meta.totalPages}</span>
                            <button disabled={meta.currentPage === meta.totalPages} onClick={() => load(meta.currentPage + 1)} className="px-3 py-1 rounded-lg bg-white border border-gray-200 text-xs font-bold disabled:opacity-50">Next</button>
                        </div>
                    )}
                </div>
            </PageTemplate>
        </>
    );
};
