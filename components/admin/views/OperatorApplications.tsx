
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, Clock, Download, FileText, ArrowLeft, Building, User, Globe, Calendar, ShieldCheck, AlertTriangle, FileCheck, Mail, Briefcase, ChevronRight, Activity, MapPin, Landmark, Plane } from 'lucide-react';
import { AdminService } from '../adminService.ts';
import { OperatorApplication } from '../types';
import { SectionHeader, SearchFilterToolbar, StatusBadge } from '../../dashboard/shared.tsx';

// --- Detail Component ---
const ApplicationDetail = ({ app, onBack, onAction, loading }: { app: OperatorApplication, onBack: () => void, onAction: (id: string, status: 'Approved' | 'Rejected', reason?: string) => void, loading: boolean }) => {
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectInput, setShowRejectInput] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'finance' | 'ops' | 'docs'>('overview');

    const getRemainingTime = (iso: string) => {
        if (!iso) return 'No Deadline';
        const diff = new Date(iso).getTime() - Date.now();
        if (diff < 0) return 'Expired';
        const hours = Math.floor(diff / (1000 * 60 * 60));
        return `${hours}h Remaining`;
    };

    const handleReject = () => {
        if (!rejectReason) {
            alert("Please provide a reason for rejection.");
            return;
        }
        onAction(app.id, 'Rejected', rejectReason);
    };

    const isActionable = !['Approved', 'Rejected'].includes(app.status);

    return (
        <div className="animate-fade-in space-y-8 pb-10">
            {/* Header Nav */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <button onClick={onBack} className="group flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-charcoal-900 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center mr-3 group-hover:border-gold-500 group-hover:text-gold-500 transition-colors shadow-sm">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    Back to Applications
                </button>
                
                {isActionable && !showRejectInput && (
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button onClick={() => setShowRejectInput(true)} disabled={loading} className="flex-1 sm:flex-none border border-red-200 text-red-600 px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 transition-all shadow-sm">
                            Reject
                        </button>
                        <button onClick={() => onAction(app.id, 'Approved')} disabled={loading} className="flex-1 sm:flex-none bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-md flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 mr-2" /> Approve & Create
                        </button>
                    </div>
                )}
            </div>

            {/* Rejection Input */}
            {showRejectInput && (
                <div className="bg-red-50 border border-red-100 p-6 rounded-xl animate-fade-in">
                    <h4 className="text-sm font-bold text-red-700 mb-2">Rejection Reason</h4>
                    <textarea 
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="State why this application is being rejected (sent to applicant via email)..."
                        className="w-full p-3 text-sm border border-red-200 rounded-lg outline-none focus:border-red-400 h-24 mb-4"
                    />
                    <div className="flex gap-3 justify-end">
                        <button onClick={() => setShowRejectInput(false)} className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-widest hover:text-gray-800">Cancel</button>
                        <button onClick={handleReject} disabled={loading} className="bg-red-600 text-white px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-red-700 shadow-sm">Confirm Rejection</button>
                    </div>
                </div>
            )}

            {/* Profile Header */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden relative z-0">
                <div className="h-32 bg-charcoal-950 relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                </div>
                
                <div className="px-8 pb-8">
                    <div className="flex flex-col md:flex-row gap-8 relative items-center md:items-start text-center md:text-left">
                        <div className="-mt-12 relative z-10 flex-shrink-0">
                            <div className="w-24 h-24 rounded-2xl bg-white p-1.5 shadow-2xl">
                                <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-200 rounded-xl flex items-center justify-center text-charcoal-400 text-4xl font-serif font-bold border border-gray-200">
                                    <Building className="w-10 h-10" />
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 pt-4 w-full">
                            <h1 className="text-3xl font-serif font-bold text-charcoal-900">{app.companyName}</h1>
                            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 mt-2">
                                <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded border border-gray-200">ID: {app.id}</span>
                                <StatusBadge status={app.status} />
                                {isActionable && (
                                    <span className="flex items-center px-2 py-1 rounded border bg-amber-50 border-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-widest">
                                        <Clock className="w-3 h-3 mr-1.5" /> SLA: {getRemainingTime(app.slaDeadline)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-6 mt-8 border-b border-gray-100">
                        {['overview', 'finance', 'ops', 'docs'].map(tab => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`pb-4 text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab ? 'text-gold-600 border-b-2 border-gold-500' : 'text-gray-400 hover:text-charcoal-900'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="mt-8">
                        {activeTab === 'overview' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-charcoal-900 uppercase tracking-widest mb-4">Company Details</h3>
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-3">
                                        <div className="flex justify-between"><span className="text-xs text-gray-500">Legal Name</span> <span className="text-sm font-bold text-charcoal-900">{app.companyName}</span></div>
                                        <div className="flex justify-between"><span className="text-xs text-gray-500">Brand Name</span> <span className="text-sm font-bold text-charcoal-900">{app.details?.brandName}</span></div>
                                        <div className="flex justify-between"><span className="text-xs text-gray-500">Registration</span> <span className="text-sm font-bold text-charcoal-900">{app.details?.regNumber}</span></div>
                                        <div className="flex justify-between"><span className="text-xs text-gray-500">Incorporation</span> <span className="text-sm font-bold text-charcoal-900">{app.details?.incorporationYear}</span></div>
                                        <div>
                                            <span className="text-xs text-gray-500 block mb-1">Registered Address</span>
                                            <p className="text-sm font-medium text-charcoal-800">{app.details?.registeredAddress}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-charcoal-900 uppercase tracking-widest mb-4">Primary Contact</h3>
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-gray-200"><User className="w-4 h-4 text-gray-400" /></div>
                                            <div>
                                                <p className="text-sm font-bold text-charcoal-900">{app.contact?.firstName} {app.contact?.lastName}</p>
                                                <p className="text-[10px] text-gray-400 uppercase">{app.contact?.designation}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2 mt-2">
                                            <div className="flex items-center text-xs p-2 bg-white rounded border border-gray-100">
                                                <Mail className="w-3 h-3 mr-2 text-gold-500" /> {app.email}
                                                {app.contact?.emailVerified ? <CheckCircle className="w-3 h-3 ml-auto text-emerald-500" /> : <XCircle className="w-3 h-3 ml-auto text-red-500" />}
                                            </div>
                                            <div className="flex items-center text-xs p-2 bg-white rounded border border-gray-100">
                                                <Activity className="w-3 h-3 mr-2 text-gold-500" /> {app.contact?.mobile}
                                                {app.contact?.mobileVerified ? <CheckCircle className="w-3 h-3 ml-auto text-emerald-500" /> : <XCircle className="w-3 h-3 ml-auto text-red-500" />}
                                            </div>
                                        </div>
                                        {app.contact?.isProfileDataModified && (
                                            <div className="p-2 bg-amber-50 text-[10px] text-amber-700 rounded border border-amber-100 flex items-center">
                                                <AlertTriangle className="w-3 h-3 mr-2" /> Profile info was modified for this app.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'finance' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-charcoal-900 uppercase tracking-widest mb-4">Tax & Legal</h3>
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-4">
                                        <div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Tax ID Number</span>
                                            <p className="text-sm font-mono font-bold text-charcoal-900">{app.business?.taxId}</p>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Billing Jurisdiction</span>
                                            <p className="text-sm font-bold text-charcoal-900">{app.business?.bankCountry}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-charcoal-900 uppercase tracking-widest mb-4">Banking Information</h3>
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-4 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-5"><Landmark className="w-24 h-24" /></div>
                                        <div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Bank Name</span>
                                            <p className="text-sm font-bold text-charcoal-900">{app.banking?.bankName}</p>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Account Holder</span>
                                            <p className="text-sm font-bold text-charcoal-900">{app.banking?.accountHolder}</p>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Account Number</span>
                                            <p className="text-sm font-mono font-bold text-charcoal-900 bg-white p-2 rounded border border-gray-200 inline-block">{app.banking?.accountNumber}</p>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">IFSC / SWIFT</span>
                                            <p className="text-sm font-mono font-bold text-charcoal-900">{app.banking?.ifscSwift}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'ops' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-charcoal-900 uppercase tracking-widest mb-4">General Capabilities</h3>
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 grid grid-cols-2 gap-4">
                                        <div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Fleet Size</span>
                                            <p className="text-lg font-bold text-charcoal-900">{app.operations?.fleetSize}</p>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Response</span>
                                            <p className="text-lg font-bold text-charcoal-900">{app.operations?.responseTime}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Categories</span>
                                            <div className="flex flex-wrap gap-2">
                                                {app.operations?.categories.map(c => <span key={c} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-bold text-charcoal-600">{c}</span>)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-charcoal-900 uppercase tracking-widest mb-4">Proposed Fleet</h3>
                                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                        {app.fleetDetails && app.fleetDetails.length > 0 ? (
                                            app.fleetDetails.map((ac, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                                    <div className="flex items-center">
                                                        <Plane className="w-4 h-4 mr-3 text-gold-500" />
                                                        <div>
                                                            <p className="text-xs font-bold text-charcoal-900">{ac.reg}</p>
                                                            <p className="text-[10px] text-gray-500">{ac.model}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] font-mono bg-gray-100 px-2 py-1 rounded">{ac.base}</span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-xs text-gray-400 italic">No specific aircraft detailed.</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'docs' && (
                            <div>
                                <h3 className="text-xs font-bold text-charcoal-900 uppercase tracking-widest mb-6">Submitted Documents</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {app.documents.map((doc, idx) => (
                                        <div key={idx} className="p-4 bg-white border border-gray-200 rounded-lg hover:border-gold-300 transition-colors group cursor-pointer shadow-sm">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="p-2 bg-gray-50 rounded text-gray-400 group-hover:text-gold-600 group-hover:bg-gold-50 transition-colors">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <StatusBadge status={doc.status} />
                                            </div>
                                            <p className="font-bold text-sm text-charcoal-900 mb-1">{doc.name}</p>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-widest">{doc.category} • {doc.type}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const OperatorApplications = () => {
    const [apps, setApps] = useState<OperatorApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedApp, setSelectedApp] = useState<OperatorApplication | null>(null);

    useEffect(() => { 
        setLoading(true);
        AdminService.getOperatorApps().then(data => {
            setApps(data);
            setLoading(false);
        }); 
    }, []);

    const handleAction = async (id: string, status: 'Approved' | 'Rejected', reason?: string) => {
        setLoading(true);
        try {
            await AdminService.updateOperatorApp(id, status, reason);
            const updatedApps = await AdminService.getOperatorApps();
            setApps(updatedApps);
            
            // Close detail view on success
            setSelectedApp(null);
            alert(`Application ${status} successfully.`);
        } catch (error: any) {
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic
    const filteredApps = apps.filter(app => {
        const name = app.companyName || '';
        const email = app.email || '';
        const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = statusFilter === 'All' || app.status === statusFilter;
        return matchesSearch && matchesFilter;
    });

    if (selectedApp) {
        return <ApplicationDetail app={selectedApp} onBack={() => setSelectedApp(null)} onAction={handleAction} loading={loading} />;
    }

    return (
        <div className="animate-fade-in space-y-6">
            <SectionHeader title="Operator Applications" subtitle="Review and validate new charter operator requests." />
            
            <SearchFilterToolbar 
                onSearch={setSearchQuery} 
                onFilter={setStatusFilter} 
                filterOptions={['Applied', 'Approved', 'Rejected']}
                placeholder="Search company or email..."
            />

            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left min-w-[1000px]">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <th className="px-8 py-5">Company & Contact</th>
                                <th className="px-8 py-5">Jurisdiction</th>
                                <th className="px-8 py-5">Fleet Size</th>
                                <th className="px-8 py-5">Date</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={6} className="p-10 text-center"><div className="animate-spin w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full mx-auto"></div></td></tr>
                            ) : filteredApps.map(app => (
                                <tr key={app.id} onClick={() => setSelectedApp(app)} className="hover:bg-gray-50/80 transition-colors group cursor-pointer">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-charcoal-900 flex items-center justify-center text-white font-bold text-xs shadow-md border-2 border-white">
                                                {app.companyName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-serif font-bold text-charcoal-900 text-sm group-hover:text-gold-600 transition-colors">{app.companyName}</p>
                                                <div className="flex items-center text-[10px] text-gray-400 mt-0.5">
                                                    <User className="w-3 h-3 mr-1" /> {app.contactPerson}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center text-sm font-medium text-charcoal-600">
                                            <MapPin className="w-3.5 h-3.5 mr-2 text-gray-400" /> {app.country}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-bold text-charcoal-900">{app.operations?.fleetSize || '-'}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs text-gray-500">{new Date(app.submittedDate).toLocaleDateString()}</span>
                                    </td>
                                    <td className="px-8 py-6"><StatusBadge status={app.status} /></td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end items-center gap-2 opacity-100 transition-opacity">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-gold-600 group-hover:underline mr-2 hidden sm:inline">Review</span>
                                            <button className="text-gray-400 hover:text-charcoal-900 p-2 rounded-full hover:bg-gray-100 transition-colors">
                                                <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {!loading && filteredApps.length === 0 && <div className="p-10 text-center text-gray-400 text-sm">No applications found matching criteria.</div>}
            </div>
        </div>
    );
};
