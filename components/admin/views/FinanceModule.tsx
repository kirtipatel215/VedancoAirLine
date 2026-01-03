
import React, { useState, useEffect } from 'react';
import { Download, CreditCard, Calendar, FileText, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { AdminService } from '../adminService.ts';
import { SectionHeader, SearchFilterToolbar, StatusBadge } from '../../dashboard/shared.tsx';

// --- Detail Component ---
const TransactionDetail = ({ item, type, onBack }: { item: any, type: 'Invoices' | 'Payouts', onBack: () => void }) => {
    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <button onClick={onBack} className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-charcoal-900 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to {type}
                </button>
                <div className="flex gap-2">
                    <button className="bg-charcoal-900 text-white px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-gold-500 transition-all flex items-center">
                        <Download className="w-3 h-3 mr-2" /> Download PDF
                    </button>
                    {item.status !== 'Paid' && item.status !== 'Settled' && (
                        <button className="bg-emerald-600 text-white px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center">
                            <CheckCircle className="w-3 h-3 mr-2" /> Mark as {type === 'Invoices' ? 'Paid' : 'Settled'}
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-lg p-10 max-w-3xl mx-auto">
                <div className="flex justify-between items-start border-b border-gray-100 pb-8 mb-8">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-charcoal-900 mb-2">
                            {type === 'Invoices' ? item.number : `Payout #${item.id.split('-')[1]}`}
                        </h1>
                        <p className="text-sm text-gray-500">{type === 'Invoices' ? `Ref: ${item.bookingRef}` : `To: ${item.operatorName}`}</p>
                    </div>
                    <div className="text-right">
                        <StatusBadge status={item.status} />
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">
                            {type === 'Invoices' ? item.date : item.dateInitiated}
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between py-4 border-b border-gray-50">
                        <span className="text-gray-500 font-medium">Subtotal Amount</span>
                        <span className="font-bold text-charcoal-900">${item.amount.toLocaleString()}</span>
                    </div>
                    {type === 'Invoices' && (
                        <div className="flex justify-between py-4 border-b border-gray-50">
                            <span className="text-gray-500 font-medium">Tax & Fees</span>
                            <span className="font-bold text-charcoal-900">${item.tax.toLocaleString()}</span>
                        </div>
                    )}
                    <div className="flex justify-between py-4 items-center">
                        <span className="text-lg font-serif font-bold text-charcoal-900">Total Transaction</span>
                        <span className="text-2xl font-serif font-bold text-gold-600">
                            ${(item.amount + (item.tax || 0)).toLocaleString()} {item.currency}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main List ---
export const FinanceModule = ({ type }: { type: 'Invoices' | 'Payouts' }) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedItem, setSelectedItem] = useState<any>(null);
    
    useEffect(() => {
        setLoading(true);
        // Clear data immediately on type change to prevent filter crashes during re-render
        setData([]); 
        if(type === 'Invoices') AdminService.getInvoices().then((d) => { setData(d); setLoading(false); });
        else AdminService.getPayouts().then((d) => { setData(d); setLoading(false); });
        setSelectedItem(null); 
    }, [type]);

    const filtered = data.filter(item => {
        // Safe access: ensure property exists before accessing, fallback to empty string
        const term = (type === 'Invoices' ? item.number : item.operatorName) || '';
        const matchesSearch = term.toString().toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = statusFilter === 'All' || item.status === statusFilter;
        return matchesSearch && matchesFilter;
    });

    if (selectedItem) {
        return <TransactionDetail item={selectedItem} type={type} onBack={() => setSelectedItem(null)} />;
    }

    return (
        <div className="animate-fade-in space-y-6">
            <SectionHeader 
                title={type === 'Invoices' ? 'Client Invoices' : 'Operator Payouts'} 
                subtitle={type === 'Invoices' ? 'Billing records for all confirmed charters.' : 'Settlement queue for flight operators.'} 
            />
            <SearchFilterToolbar 
                onSearch={setSearchQuery} 
                onFilter={setStatusFilter} 
                filterOptions={['Paid', 'Unpaid', 'Pending', 'Processing', 'Settled']}
                placeholder={type === 'Invoices' ? "Search Invoice #..." : "Search Operator..."}
            />

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="p-20 text-center"><div className="animate-spin w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full mx-auto"></div></div>
                ) : filtered.length === 0 ? (
                    <div className="p-10 text-center text-gray-400">No records found.</div>
                ) : filtered.map((item) => (
                    <div 
                        key={item.id} 
                        onClick={() => setSelectedItem(item)}
                        className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:border-gold-300 transition-all flex flex-col md:flex-row items-center justify-between gap-6 group cursor-pointer"
                    >
                        
                        {/* Left Info */}
                        <div className="flex items-center gap-6 w-full md:w-auto">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${type === 'Invoices' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                {type === 'Invoices' ? <FileText className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                            </div>
                            <div>
                                <h4 className="font-bold text-charcoal-900 text-sm group-hover:text-gold-600 transition-colors">
                                    {type === 'Invoices' ? item.number : item.operatorName}
                                </h4>
                                <div className="flex items-center text-xs text-gray-400 mt-1 space-x-3">
                                    {type === 'Invoices' ? (
                                        <>
                                            <span className="font-mono font-bold tracking-wider">{item.bookingRef}</span>
                                            <span>•</span>
                                            <span>{item.type}</span>
                                        </>
                                    ) : (
                                        <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> Initiated: {item.dateInitiated}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Info & Actions */}
                        <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                            <div className="text-right">
                                <p className="text-lg font-serif font-bold text-charcoal-900">
                                    {type === 'Invoices' ? '$' : ''}{item.amount.toLocaleString()} {type === 'Payouts' ? item.currency : ''}
                                </p>
                                {type === 'Invoices' && <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">+ Tax: ${item.tax}</p>}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <StatusBadge status={item.status} />
                                <button className="text-[10px] font-bold text-gold-600 uppercase tracking-widest hover:text-charcoal-900 flex items-center mt-1">
                                    {type === 'Invoices' ? <><Download className="w-3 h-3 mr-1" /> View PDF</> : <><ArrowRight className="w-3 h-3 mr-1" /> Details</>}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
