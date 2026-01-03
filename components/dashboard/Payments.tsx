import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Download, CreditCard, X, ChevronDown, CheckCircle2, Clock, ArrowRight, Eye, CalendarDays, DollarSign } from 'lucide-react';
import { PageTemplate, DataTable, Column, StatusBadge } from './shared';
import { Transaction, PaginationMeta } from './types';
import { SecureApiService } from './service';

const PaymentReceipt = ({ payment, onClose }: { payment: Transaction, onClose: () => void }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-scale-up border border-gray-200" onClick={e => e.stopPropagation()}>
                <div className="bg-navy-900 p-8 text-white flex justify-between items-start relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl font-serif font-bold mb-1">{payment.currency} {payment.amount.toLocaleString()}</h2>
                        <p className="text-xs text-gold-500 font-bold uppercase tracking-[0.2em]">Verified Payment</p>
                    </div>
                    <button onClick={onClose} className="relative z-10 p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-10 space-y-8">
                    <div className="grid grid-cols-1 gap-4">
                        <div className="border-b border-gray-100 pb-3">
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">Transaction ID (Internal)</p>
                            <p className="font-mono text-xs font-bold text-navy-900 break-all">{payment.id}</p>
                        </div>
                        {payment.transactionReference && (
                            <div className="border-b border-gray-100 pb-3">
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">Bank Ref</p>
                                <p className="font-mono text-xs text-gray-600 break-all">{payment.transactionReference}</p>
                            </div>
                        )}
                        <div className="border-b border-gray-100 pb-3">
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">Payment Method</p>
                            <p className="font-mono text-xs text-gray-500 break-all">{payment.payment_method || 'Standard'}</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        {payment.invoice_pdf_url && (
                            <button onClick={() => window.open(payment.invoice_pdf_url, '_blank')} className="flex-1 bg-navy-900 text-white py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gold-500 hover:text-navy-900 transition-all shadow-md flex items-center justify-center">
                                <Download className="w-4 h-4 mr-2" /> Download Receipt
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const Payments = ({ initialData }: { initialData?: any }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<Transaction[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [selectedPayment, setSelectedPayment] = useState<Transaction | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const statusDropdownRef = useRef<HTMLDivElement>(null);

    const load = useCallback(async (p: number) => {
        setLoading(true);
        // ideally api should filtering
        const res = await SecureApiService.getPayments(p);

        // Client side filter for demo since API doesn't support it yet
        let filtered = res.data;
        if (statusFilter !== 'All') {
            filtered = filtered.filter(t =>
                (statusFilter === 'Paid' && t.status === 'succeeded') ||
                (statusFilter === 'Pending' && t.status !== 'succeeded')
            );
        }
        if (searchQuery) {
            const lower = searchQuery.toLowerCase();
            filtered = filtered.filter(t =>
                t.id.toLowerCase().includes(lower) ||
                (t.description && t.description.toLowerCase().includes(lower))
            );
        }

        setData(filtered);
        setMeta(res.pagination);
        setLoading(false);
    }, [searchQuery, statusFilter]);

    useEffect(() => { load(1); }, [load]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
                setIsStatusDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Define Columns
    const columns: Column<Transaction>[] = [
        {
            header: "Description",
            accessor: (txn) => (
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-navy-900">{txn.description || 'Flight Payment'}</span>
                    <span className="text-[10px] text-gray-400 font-mono mt-0.5">{txn.id}</span>
                </div>
            )
        },
        {
            header: "Date",
            accessor: (txn) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">{new Date(txn.created_at).toLocaleDateString()}</span>
                    <span className="text-[10px] text-gray-400">{new Date(txn.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            )
        },
        {
            header: "Amount",
            accessor: (txn) => (
                <span className="text-sm font-bold text-navy-900">{txn.currency} {txn.amount.toLocaleString()}</span>
            )
        },
        {
            header: "Status",
            accessor: (txn) => {
                let badgeStatus: 'Paid' | 'Pending' | 'Failed' = 'Pending';
                if (txn.status === 'succeeded') badgeStatus = 'Paid';
                if (txn.status === 'failed') badgeStatus = 'Failed';

                return <StatusBadge status={badgeStatus} />;
            }
        },
        {
            header: "",
            accessor: (txn) => (
                <button
                    onClick={(e) => { e.stopPropagation(); setSelectedPayment(txn); }}
                    className="p-2.5 hover:bg-navy-50 rounded-full text-gray-400 hover:text-navy-900 transition-all transform hover:scale-105"
                    title="View Receipt"
                >
                    <Eye className="w-4 h-4" />
                </button>
            )
        }
    ];

    return (
        <PageTemplate
            title="Payments"
            subtitle="Financial history and verified settlements."
            onSearch={setSearchQuery}
            action={
                <div className="relative" ref={statusDropdownRef}>
                    <button
                        onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                        className="bg-white border border-gray-200 hover:border-gold-500 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide text-navy-700 flex items-center justify-between min-w-[140px] transition-all shadow-sm"
                    >
                        <span className="truncate">{statusFilter === 'All' ? 'All Status' : statusFilter}</span>
                        <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isStatusDropdownOpen && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20 animate-fade-in-up">
                            <div className="p-1">
                                {['All', 'Paid', 'Pending'].map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => {
                                            setStatusFilter(opt);
                                            setIsStatusDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 text-xs font-bold rounded-lg transition-colors ${statusFilter === opt ? 'bg-navy-50 text-navy-900' : 'text-gray-500 hover:bg-gray-50 hover:text-navy-900'
                                            }`}
                                    >
                                        {opt === 'All' ? 'All Status' : opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            }
        >
            {selectedPayment && <PaymentReceipt payment={selectedPayment} onClose={() => setSelectedPayment(null)} />}

            {/* Desktop Table View */}
            <div className="hidden md:block">
                <DataTable
                    columns={columns}
                    data={data}
                    loading={loading}
                    pagination={meta ? {
                        currentPage: meta.currentPage,
                        totalPages: meta.totalPages,
                        onPageChange: load
                    } : undefined}
                    onRowClick={setSelectedPayment}
                    emptyMessage="No transactions found matching your criteria."
                />
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {loading ? (
                    <div className="p-8 text-center text-gray-400">Loading payments...</div>
                ) : data.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 border border-dashed border-gray-200 rounded-2xl">
                        No transactions found.
                    </div>
                ) : (
                    data.map((txn) => (
                        <div
                            key={txn.id}
                            onClick={() => setSelectedPayment(txn)}
                            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 active:scale-[0.98] transition-transform relative overflow-hidden"
                        >
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${txn.status === 'succeeded' ? 'bg-emerald-500' : txn.status === 'failed' ? 'bg-red-500' : 'bg-amber-500'}`}></div>

                            <div className="flex justify-between items-start mb-4 pl-2">
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-bold text-navy-900">{txn.description || 'Payment'}</span>
                                    <span className="text-[10px] text-gray-400 font-mono">{txn.id}</span>
                                </div>
                                <StatusBadge status={txn.status === 'succeeded' ? 'Paid' : txn.status === 'failed' ? 'Failed' : 'Pending'} />
                            </div>

                            <div className="flex items-end justify-between pl-2">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Date</p>
                                    <p className="text-sm font-bold text-navy-900">{new Date(txn.created_at).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-serif font-bold text-navy-900">{txn.currency} {txn.amount.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
                {/* Mobile Pagination */}
                {meta && meta.totalPages > 1 && (
                    <div className="flex justify-center gap-2 pt-4">
                        <button
                            disabled={meta.currentPage === 1}
                            onClick={() => load(meta.currentPage - 1)}
                            className="px-3 py-1 rounded-lg bg-white border border-gray-200 text-xs font-bold disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <span className="text-xs font-bold text-gray-500 self-center">Page {meta.currentPage} of {meta.totalPages}</span>
                        <button
                            disabled={meta.currentPage === meta.totalPages}
                            onClick={() => load(meta.currentPage + 1)}
                            className="px-3 py-1 rounded-lg bg-white border border-gray-200 text-xs font-bold disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </PageTemplate>
    );
};
