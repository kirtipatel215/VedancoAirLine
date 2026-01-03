
import React, { useState, useEffect } from 'react';
import { Plane, Star, MoreVertical, ArrowLeft, ShieldCheck, MapPin, Calendar, Activity, AlertTriangle, CheckCircle, XCircle, FileText, Globe, Mail } from 'lucide-react';
import { AdminService } from '../adminService.ts';
import { Operator } from '../types';
import { SectionHeader, SearchFilterToolbar, StatusBadge } from '../../dashboard/shared.tsx';

// --- Detail Component ---
const OperatorDetail = ({ op, onBack, onStatusChange }: { op: Operator, onBack: () => void, onStatusChange: (id: string, status: 'Active' | 'Suspended') => void }) => {
    
    // Mock Fleet Data for UI Visualization
    const fleetComposition = [
        { type: 'Light Jet', count: Math.floor(op.aircraftCount * 0.4), model: 'Phenom 300E' },
        { type: 'Midsize Jet', count: Math.floor(op.aircraftCount * 0.3), model: 'Citation XLS+' },
        { type: 'Heavy Jet', count: Math.ceil(op.aircraftCount * 0.3), model: 'Challenger 605' },
    ];

    // Mock Email if not present (since it was added as an optional field in service)
    const opEmail = (op as any).email || 'ops@operator.com';

    return (
        <div className="animate-fade-in space-y-6">
            {/* Header Navigation */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <button onClick={onBack} className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-charcoal-900 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Fleet List
                </button>
                <div className="flex gap-3">
                    {op.status === 'Active' ? (
                        <button 
                            onClick={() => onStatusChange(op.id, 'Suspended')}
                            className="flex items-center border border-red-200 text-red-600 px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 transition-colors"
                        >
                            <XCircle className="w-4 h-4 mr-2" /> Suspend Operator
                        </button>
                    ) : (
                        <button 
                            onClick={() => onStatusChange(op.id, 'Active')}
                            className="flex items-center bg-emerald-600 text-white px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-700 transition-colors shadow-md"
                        >
                            <CheckCircle className="w-4 h-4 mr-2" /> Reactivate Operator
                        </button>
                    )}
                </div>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden relative">
                <div className={`absolute top-0 left-0 w-full h-1.5 ${op.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                
                <div className="p-8 md:p-10">
                    <div className="flex flex-col md:flex-row justify-between items-start mb-10 border-b border-gray-50 pb-8">
                        <div>
                            <div className="flex items-center gap-4 mb-2">
                                <h1 className="text-3xl font-serif font-bold text-charcoal-900">{op.name}</h1>
                                <StatusBadge status={op.status} />
                            </div>
                            <div className="flex flex-wrap items-center text-sm text-gray-500 font-medium gap-6 mt-2">
                                <span className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-gold-500" /> {op.country}</span>
                                <span className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-gold-500" /> Since {new Date(op.joinedDate).getFullYear()}</span>
                                <span className="flex items-center"><ShieldCheck className="w-4 h-4 mr-2 text-gold-500" /> {op.id}</span>
                                <span className="flex items-center text-charcoal-800"><Mail className="w-4 h-4 mr-2 text-gold-500" /> {opEmail}</span>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-4 md:mt-0 bg-gray-50 px-4 py-3 rounded-lg border border-gray-100 shadow-sm">
                            <div className="text-right mr-2">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Performance Rating</p>
                                <div className="flex items-center justify-end text-amber-500">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(op.rating) ? 'fill-current' : 'text-gray-300'}`} />
                                    ))}
                                    <span className="text-lg font-bold ml-2 text-charcoal-900">{op.rating}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Fleet Section */}
                        <div className="lg:col-span-2 space-y-8">
                            <div>
                                <h3 className="text-xs font-bold text-charcoal-900 uppercase tracking-widest mb-4 flex items-center">
                                    <Plane className="w-4 h-4 mr-2 text-gold-600" /> Active Fleet Distribution
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {fleetComposition.map((item, idx) => (
                                        <div key={idx} className="bg-white p-5 rounded-xl border border-gray-100 flex flex-col justify-between group hover:border-gold-300 hover:shadow-md transition-all">
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{item.type}</p>
                                                <p className="text-sm font-bold text-charcoal-900 truncate">{item.model}</p>
                                            </div>
                                            <div className="text-3xl font-serif font-bold text-charcoal-900 mt-4 group-hover:text-gold-600 transition-colors">
                                                {item.count}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-charcoal-900 uppercase tracking-widest mb-4 flex items-center">
                                    <Activity className="w-4 h-4 mr-2 text-gold-600" /> Operational Metrics
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div className="p-4 rounded-lg border border-gray-100 text-center bg-gray-50/50">
                                        <div className={`text-2xl font-bold mb-1 ${op.slaScore > 95 ? 'text-emerald-600' : 'text-amber-500'}`}>{op.slaScore}%</div>
                                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">SLA Score</div>
                                    </div>
                                    <div className="p-4 rounded-lg border border-gray-100 text-center bg-gray-50/50">
                                        <div className="text-2xl font-bold text-charcoal-900 mb-1">24m</div>
                                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Avg Quote Time</div>
                                    </div>
                                    <div className="p-4 rounded-lg border border-gray-100 text-center bg-gray-50/50">
                                        <div className="text-2xl font-bold text-charcoal-900 mb-1">0%</div>
                                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Cancellation Rt</div>
                                    </div>
                                    <div className="p-4 rounded-lg border border-gray-100 text-center bg-gray-50/50">
                                        <div className="text-2xl font-bold text-charcoal-900 mb-1">{op.aircraftCount * 12}</div>
                                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Missions YTD</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Compliance Sidebar */}
                        <div className="bg-gray-50 p-6 md:p-8 rounded-xl border border-gray-200 h-fit">
                            <h3 className="text-xs font-bold text-charcoal-900 uppercase tracking-widest mb-6 flex items-center border-b border-gray-200 pb-3">
                                <FileText className="w-4 h-4 mr-2 text-gold-600" /> Compliance & Docs
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-white rounded border border-gray-100">
                                    <span className="text-xs font-medium text-gray-600">Air Operator Cert (AOC)</span>
                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white rounded border border-gray-100">
                                    <span className="text-xs font-medium text-gray-600">Insurance Liability</span>
                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white rounded border border-gray-100">
                                    <span className="text-xs font-medium text-gray-600">Safety Audit (ARGUS)</span>
                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                </div>
                                <div className="flex items-center justify-between p-3 bg-white rounded border border-gray-100">
                                    <span className="text-xs font-medium text-gray-600">Tax Compliance</span>
                                    {op.status === 'Suspended' ? <AlertTriangle className="w-4 h-4 text-red-500" /> : <CheckCircle className="w-4 h-4 text-emerald-500" />}
                                </div>
                            </div>
                            
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Primary Base</p>
                                <div className="flex items-center text-sm font-bold text-charcoal-900 bg-white p-3 rounded border border-gray-100">
                                    <Globe className="w-4 h-4 mr-2 text-charcoal-400" />
                                    {op.country === 'India' ? 'Delhi (VIDP)' : op.country === 'UAE' ? 'Dubai (OMDB)' : 'Frankfurt (EDDF)'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main List Component ---
export const OperatorsList = () => {
    const [operators, setOperators] = useState<Operator[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedOp, setSelectedOp] = useState<Operator | null>(null);

    useEffect(() => { 
        setLoading(true);
        AdminService.getOperators().then(data => {
            setOperators(data);
            setLoading(false);
        }); 
    }, []);

    const handleStatusChange = async (id: string, status: 'Active' | 'Suspended') => {
        setLoading(true);
        await AdminService.updateOperatorStatus(id, status);
        const updatedOps = await AdminService.getOperators();
        setOperators(updatedOps);
        
        // Update detail view if open
        if (selectedOp && selectedOp.id === id) {
            const updated = updatedOps.find(o => o.id === id);
            if (updated) setSelectedOp(updated);
        }
        setLoading(false);
    };

    const filteredOps = operators.filter(op => {
        const name = op.name || '';
        const country = op.country || '';
        const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              country.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = statusFilter === 'All' || op.status === statusFilter;
        return matchesSearch && matchesFilter;
    });

    if (selectedOp) {
        return <OperatorDetail op={selectedOp} onBack={() => setSelectedOp(null)} onStatusChange={handleStatusChange} />;
    }

    return (
        <div className="animate-fade-in space-y-6">
            <SectionHeader title="Fleet Operators" subtitle="Manage active carriers, compliance ratings, and performance." />
            
            <SearchFilterToolbar 
                onSearch={setSearchQuery} 
                onFilter={setStatusFilter} 
                filterOptions={['Active', 'Suspended']}
                placeholder="Search operator name..."
            />

            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left min-w-[900px]">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <th className="px-8 py-5">Operator Name</th>
                                <th className="px-8 py-5">Region</th>
                                <th className="px-8 py-5">Fleet Size</th>
                                <th className="px-8 py-5">Performance</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={6} className="p-10 text-center"><div className="animate-spin w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full mx-auto"></div></td></tr>
                            ) : filteredOps.map(op => (
                                <tr key={op.id} onClick={() => setSelectedOp(op)} className="hover:bg-gray-50/80 transition-colors group cursor-pointer">
                                    <td className="px-8 py-6">
                                        <p className="font-bold text-charcoal-900 text-sm group-hover:text-gold-600 transition-colors">{op.name}</p>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold mt-1">Joined {new Date(op.joinedDate).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-8 py-6 text-sm text-charcoal-600 font-medium">{op.country}</td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center text-sm font-bold text-charcoal-700">
                                            <Plane className="w-4 h-4 mr-2 text-gray-400" /> {op.aircraftCount}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center text-amber-500">
                                                <Star className="w-3 h-3 fill-current mr-1" />
                                                <span className="text-xs font-bold">{op.rating}</span>
                                            </div>
                                            <div className={`text-xs font-bold px-2 py-0.5 rounded-sm ${op.slaScore > 95 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                {op.slaScore}% SLA
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6"><StatusBadge status={op.status} /></td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2 opacity-100 transition-opacity">
                                            <button onClick={(e) => { e.stopPropagation(); setSelectedOp(op); }} className="text-gray-400 bg-gray-50 p-2 rounded-lg hover:bg-charcoal-900 hover:text-white transition-colors">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {!loading && filteredOps.length === 0 && <div className="p-10 text-center text-gray-400 text-sm">No operators found.</div>}
            </div>
        </div>
    );
};
