
import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, AlertTriangle, XCircle, Upload, ShieldCheck, X, Eye, Plane, Building, Plus } from 'lucide-react';
import { OperatorService } from '../OperatorService.ts';
import { OpDocument } from '../types';
import { SectionHeader } from '../ui/shared.tsx';

// --- Verification Center ---
export const OpDocuments = () => {
    const [docs, setDocs] = useState<OpDocument[]>([]);
    const [selectedDoc, setSelectedDoc] = useState<OpDocument | null>(null);
    const [activeTab, setActiveTab] = useState<'company' | 'aircraft'>('company');
    const [showAddAircraft, setShowAddAircraft] = useState(false);

    // New Aircraft Form
    const [newAircraft, setNewAircraft] = useState({ reg: '', model: '', base: '' });

    useEffect(() => {
        OperatorService.getDocuments().then(setDocs);
    }, []);

    // Filter logic based on tab
    const filteredDocs = docs.filter(d => {
        if (activeTab === 'company') {
            return ['AOC', 'Insurance', 'Tax', 'Incorporation'].includes(d.type);
        } else {
            return ['Registration', 'Airworthiness', 'Maintenance'].includes(d.type);
        }
    });

    const requiredCompanyDocs = [
        { label: 'Certificate of Incorporation', type: 'Incorporation' },
        { label: 'Air Operator Certificate (AOC)', type: 'AOC', required: true },
        { label: 'Aviation Operating Permit', type: 'Permit' },
        { label: 'Company Tax Certificate', type: 'Tax' }
    ];

    const getDocStatus = (type: string) => {
        const doc = docs.find(d => d.type === type);
        return doc ? doc.status : 'Missing';
    };

    const handleUpload = async (type: string) => {
        // Simulation of upload logic
        const blob = new Blob(["demo"], { type: "application/pdf" });
        const file = new File([blob], `${type}_Document.pdf`, { type: "application/pdf" });

        await OperatorService.uploadDocument({
            id: `D-${Date.now()}`,
            name: file.name,
            type: type as any,
            expiry: '2025-12-31',
            status: 'Pending'
        });
        const updated = await OperatorService.getDocuments();
        setDocs(updated);
    };

    return (
        <div className="space-y-8 animate-fade-in relative min-h-[600px] text-gray-200">
            <SectionHeader
                title="Verification Center"
                subtitle="Manage regulatory compliance documents and asset certifications."
            />

            {/* Verification Status Banner */}
            <div className="glass-panel p-6 rounded-xl border border-white/5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-gold-500 border border-gold-500/20 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-serif font-bold text-white text-lg">Operator Status: <span className="text-amber-500">Under Review</span></h3>
                        <p className="text-xs text-gray-400 font-light">Documents are being vetted by the compliance team.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setActiveTab('company')} className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'company' ? 'bg-white text-charcoal-900 shadow-lg' : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white'}`}>Company Legal</button>
                    <button onClick={() => setActiveTab('aircraft')} className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'aircraft' ? 'bg-white text-charcoal-900 shadow-lg' : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white'}`}>Aircraft Docs</button>
                </div>
            </div>

            {activeTab === 'company' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
                    {requiredCompanyDocs.map((req, idx) => {
                        const status = getDocStatus(req.type);
                        const isMissing = status === 'Missing';
                        return (
                            <div key={idx} className={`p-6 rounded-xl border-2 border-dashed transition-all ${isMissing ? 'border-white/10 bg-white/5 hover:border-gold-500/50' : 'border-emerald-500/20 bg-emerald-500/5'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${isMissing ? 'bg-white/10 text-gray-500' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                            <Building className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-white">{req.label}</h4>
                                            {req.required && <span className="text-[9px] text-red-400 font-bold uppercase tracking-widest">Required</span>}
                                        </div>
                                    </div>
                                    {status !== 'Missing' && <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>{status}</span>}
                                </div>

                                {isMissing ? (
                                    <button onClick={() => handleUpload(req.type)} className="w-full py-3 bg-transparent border border-white/10 rounded text-xs font-bold text-gold-500 uppercase tracking-widest hover:border-gold-500 hover:bg-gold-500/10 transition-colors flex items-center justify-center">
                                        <Upload className="w-3 h-3 mr-2" /> Upload PDF
                                    </button>
                                ) : (
                                    <div className="flex justify-between items-center bg-black/20 p-3 rounded border border-white/5">
                                        <span className="text-xs font-mono text-gray-400">{req.type}_Doc.pdf</span>
                                        <button className="text-white hover:text-gold-500"><Eye className="w-4 h-4" /></button>
                                    </div>
                                )}
                                {req.required && isMissing && <p className="text-[10px] text-red-400 mt-2 flex items-center"><AlertTriangle className="w-3 h-3 mr-1" /> Application auto-rejected if missing.</p>}
                            </div>
                        )
                    })}
                </div>
            )}

            {activeTab === 'aircraft' && (
                <div className="space-y-6 animate-fade-in-up">
                    <div className="flex justify-between items-center">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Fleet Documentation</h3>
                        <button onClick={() => setShowAddAircraft(!showAddAircraft)} className="flex items-center text-gold-500 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors">
                            <Plus className="w-4 h-4 mr-1" /> Add Aircraft
                        </button>
                    </div>

                    {showAddAircraft && (
                        <div className="glass-panel p-6 rounded-xl border border-white/10 mb-6 bg-white/5">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">New Aircraft Details</h4>
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <input placeholder="Registration (e.g. VT-ABC)" className="p-3 rounded text-sm bg-black/40 border border-white/10 text-white outline-none focus:border-gold-500 transition-colors placeholder-gray-600" />
                                <input placeholder="Model (e.g. Global 6000)" className="p-3 rounded text-sm bg-black/40 border border-white/10 text-white outline-none focus:border-gold-500 transition-colors placeholder-gray-600" />
                                <input placeholder="Base Airport" className="p-3 rounded text-sm bg-black/40 border border-white/10 text-white outline-none focus:border-gold-500 transition-colors placeholder-gray-600" />
                            </div>
                            <div className="flex justify-end">
                                <button className="bg-white text-charcoal-900 px-6 py-2 rounded text-xs font-bold uppercase tracking-widest hover:bg-gold-500 transition-colors shadow-lg">Save & Upload Docs</button>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4">
                        {/* Mock Aircraft Row */}
                        {['VT-RSA'].map((reg, i) => (
                            <div key={i} className="border border-white/5 rounded-xl p-6 hover:bg-white/5 transition-all bg-white/5 glass-panel">
                                <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-white/10 rounded text-gray-300"><Plane className="w-5 h-5" /></div>
                                        <div>
                                            <h4 className="font-bold text-white text-lg">{reg}</h4>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Phenom 300E • VABB</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20 uppercase tracking-widest">Docs Pending</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {['Registration Cert', 'Airworthiness Cert', 'Insurance Policy'].map((doc, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-black/20 border border-white/5 rounded-lg hover:border-white/10 transition-colors">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                                <span className="text-xs font-bold text-gray-400 truncate">{doc}</span>
                                            </div>
                                            <button className="text-[10px] font-bold text-gold-500 uppercase tracking-widest hover:text-white transition-colors">Upload</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
