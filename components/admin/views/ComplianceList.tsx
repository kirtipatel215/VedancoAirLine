
import React, { useState, useEffect } from 'react';
import { FileCheck, ShieldCheck, AlertTriangle, ArrowLeft, CheckCircle, XCircle, FileText } from 'lucide-react';
import { AdminService } from '../adminService.ts';
import { KYCCase } from '../types';
import { SectionHeader, SearchFilterToolbar, StatusBadge } from '../../dashboard/shared.tsx';

// --- Detail Component ---
const KYCDetail = ({ caseData, onBack, onApprove }: { caseData: KYCCase, onBack: () => void, onApprove: (id: string) => void }) => {
    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <button onClick={onBack} className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-charcoal-900 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Compliance
                </button>
                <div className="flex gap-2">
                    {caseData.status === 'Pending' && (
                        <>
                            <button onClick={() => onApprove(caseData.id)} className="bg-emerald-600 text-white px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center">
                                <CheckCircle className="w-3 h-3 mr-2" /> Approve Case
                            </button>
                            <button className="border border-red-200 text-red-500 px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 transition-all flex items-center">
                                <XCircle className="w-3 h-3 mr-2" /> Reject / Flag
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden">
                <div className="p-8 md:p-10 border-b border-gray-50">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-serif font-bold text-charcoal-900">{caseData.id}</h1>
                                <StatusBadge status={caseData.status} />
                            </div>
                            <p className="text-sm font-bold text-gold-600 uppercase tracking-widest">{caseData.customerName} (Ref: {caseData.bookingId})</p>
                        </div>
                        <div className={`px-4 py-2 rounded-lg flex items-center gap-2 ${caseData.riskScore === 'High' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            {caseData.riskScore === 'High' ? <AlertTriangle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest">Risk Score</p>
                                <p className="text-lg font-bold">{caseData.riskScore}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 md:p-10 bg-gray-50/50">
                    <h3 className="text-sm font-serif font-bold text-charcoal-900 mb-6 flex items-center">
                        <FileCheck className="w-4 h-4 mr-2 text-gold-600" /> Submitted Documents
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {caseData.documents.map((doc, idx) => (
                            <div key={idx} className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gold-300 transition-all cursor-pointer group">
                                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400 group-hover:text-gold-600 group-hover:bg-gold-50 transition-colors">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <p className="font-bold text-charcoal-900 text-sm mb-1">{doc}</p>
                                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Click to Review</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main List ---
export const ComplianceList = () => {
    const [cases, setCases] = useState<KYCCase[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedCase, setSelectedCase] = useState<KYCCase | null>(null);

    useEffect(() => { 
        setLoading(true);
        AdminService.getKYC().then(data => {
            setCases(data);
            setLoading(false);
        }); 
    }, []);

    const filtered = cases.filter(c => {
        const bookingId = c.bookingId || '';
        const custName = c.customerName || '';
        const matchesSearch = bookingId.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              custName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = statusFilter === 'All' || c.status === statusFilter;
        return matchesSearch && matchesFilter;
    });

    const handleApprove = async (id: string) => {
        setLoading(true);
        await AdminService.approveKYC(id);
        const updated = await AdminService.getKYC();
        setCases(updated);
        
        if (selectedCase && selectedCase.id === id) {
            setSelectedCase(updated.find(c => c.id === id) || null);
        }
        setLoading(false);
    };

    if (selectedCase) {
        return <KYCDetail caseData={selectedCase} onBack={() => setSelectedCase(null)} onApprove={handleApprove} />;
    }

    return (
        <div className="animate-fade-in space-y-6">
            <SectionHeader title="Compliance & KYC" subtitle="Identity verification and anti-money laundering checks." />
            <SearchFilterToolbar 
                onSearch={setSearchQuery} 
                onFilter={setStatusFilter} 
                filterOptions={['Pending', 'Approved', 'Correction Required']}
                placeholder="Search booking or customer..."
            />

            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <th className="px-8 py-5">Case ID / Booking</th>
                            <th className="px-8 py-5">Customer Entity</th>
                            <th className="px-8 py-5">Submitted Docs</th>
                            <th className="px-8 py-5">Risk Profile</th>
                            <th className="px-8 py-5">Status</th>
                            <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan={6} className="p-10 text-center"><div className="animate-spin w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full mx-auto"></div></td></tr>
                        ) : filtered.map(c => (
                            <tr key={c.id} onClick={() => setSelectedCase(c)} className="hover:bg-gray-50/80 transition-colors cursor-pointer group">
                                <td className="px-8 py-6">
                                    <p className="font-mono text-[10px] font-bold text-gray-400">{c.id}</p>
                                    <p className="text-sm font-bold text-blue-600 mt-1">{c.bookingId}</p>
                                </td>
                                <td className="px-8 py-6 font-bold text-charcoal-900">{c.customerName}</td>
                                <td className="px-8 py-6">
                                    <div className="flex gap-2">
                                        {c.documents.map((d, i) => (
                                            <span key={i} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-sm text-[9px] font-bold uppercase border border-gray-200">{d}</span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className={`flex items-center text-xs font-bold ${c.riskScore === 'High' ? 'text-red-600' : c.riskScore === 'Medium' ? 'text-amber-600' : 'text-emerald-600'}`}>
                                        {c.riskScore === 'High' ? <AlertTriangle className="w-4 h-4 mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                                        {c.riskScore}
                                    </div>
                                </td>
                                <td className="px-8 py-6"><StatusBadge status={c.status} /></td>
                                <td className="px-8 py-6 text-right">
                                    {c.status === 'Pending' && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleApprove(c.id); }} 
                                            className="bg-emerald-600 text-white px-4 py-2 rounded-sm text-[9px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-sm"
                                        >
                                            Approve
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
