
import React, { useState, useEffect } from 'react';
import { OperatorService } from '../OperatorService.ts';
import { OpFlight } from '../types';
import { StatusBadge, SectionHeader, SearchFilterToolbar } from '../ui/shared.tsx';
import { FileText, Users, MapPin, Plane, CheckCircle2, Navigation, X, Download } from 'lucide-react';

export const OpFlights = () => {
    const [flights, setFlights] = useState<OpFlight[]>([]);
    const [selectedFlight, setSelectedFlight] = useState<OpFlight | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        OperatorService.getFlights().then(setFlights);
    }, []);

    const handleUpdateStatus = async (status: 'In-Flight' | 'Completed' | 'Cancelled') => {
        if (!selectedFlight) return;
        await OperatorService.updateFlightStatus(selectedFlight.id, status);
        const updated = await OperatorService.getFlights();
        setFlights(updated);
        setSelectedFlight(updated.find(f => f.id === selectedFlight.id) || null);
    };

    const filtered = flights.filter(f => {
        const matchesSearch = f.bookingRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.route.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = statusFilter === 'All' || f.status === statusFilter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-8 animate-fade-in relative">
            <SectionHeader title="Flight Manifests" subtitle="Confirmed missions and passenger details." />

            <SearchFilterToolbar
                onSearch={setSearchQuery}
                onFilter={setStatusFilter}
                filterOptions={['Confirmed', 'In-Flight', 'Completed', 'Cancelled']}
                placeholder="Search Booking Ref or Route..."
            />

            {/* Flight Mission Modal */}
            {selectedFlight && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedFlight(null)}>
                    <div className="glass-panel w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-scale-up border border-white/10" onClick={e => e.stopPropagation()}>
                        <div className="bg-charcoal-900/50 p-8 text-white flex justify-between items-start border-b border-white/10">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-gold-500 font-bold font-mono">{selectedFlight.bookingRef}</span>
                                    <StatusBadge status={selectedFlight.status} />
                                    {selectedFlight.paymentStatus === 'succeeded' ? (
                                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-wider flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> Payment Complete
                                        </span>
                                    ) : (
                                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold uppercase tracking-wider">
                                            Payment Pending
                                        </span>
                                    )}
                                </div>
                                <h2 className="text-3xl font-serif font-bold text-glow">{selectedFlight.route}</h2>
                            </div>
                            <button onClick={() => setSelectedFlight(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 bg-charcoal-950/80">
                            {/* Left Col: Mission Details */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Mission Parameters */}
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-white/10 pb-2 mb-4">Mission Parameters</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white/5 p-3 rounded lg:col-span-1">
                                            <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Date</p>
                                            <p className="font-bold text-white text-sm">{selectedFlight.date}</p>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded lg:col-span-1">
                                            <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Aircraft</p>
                                            <p className="font-bold text-white text-sm">{selectedFlight.aircraft}</p>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded lg:col-span-1">
                                            <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Pax Count</p>
                                            <p className="font-bold text-white text-sm">{selectedFlight.paxManifest}</p>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded lg:col-span-1">
                                            <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Crew</p>
                                            <p className="font-bold text-white text-sm">2 Pilots, 1 FA</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment & Mission Status (Requested: Above Passenger Details) */}
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-white/10 pb-2 mb-4">Payment & Mission Status</h3>
                                    <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">Flight Status</p>
                                                <div className="flex items-center gap-2">
                                                    <StatusBadge status={selectedFlight.status} />
                                                    <span className="text-xs text-gray-400 italic">
                                                        {selectedFlight.status === 'Confirmed' ? 'Upcoming & Active' : 'Status Update Required'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase mb-2">Payment Status</p>
                                                {selectedFlight.paymentStatus === 'succeeded' ? (
                                                    <div>
                                                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase tracking-wider mb-1 gap-1 items-center">
                                                            <CheckCircle2 className="w-3 h-3" /> Confirmed
                                                        </span>
                                                        {selectedFlight.totalAmount && (
                                                            <p className="text-white font-mono text-sm mt-1">
                                                                {(selectedFlight.totalAmount / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                                                <span className="text-gray-500 text-xs ml-2">via {selectedFlight.paymentMethod || 'Card'}</span>
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold uppercase tracking-wider mb-1">
                                                            Pending Action
                                                        </span>
                                                        <p className="text-xs text-amber-500/50 mt-1">Payment required for manifest.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Passenger Manifest / Contact (Protected) */}
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-white/10 pb-2 mb-4">Passenger Manifest & Contact</h3>
                                    {selectedFlight.paymentStatus === 'succeeded' ? (
                                        <div className="bg-emerald-900/10 border border-emerald-500/20 p-4 rounded-xl">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-[10px] text-emerald-400/70 font-bold uppercase mb-1">Lead Passenger</p>
                                                    <p className="font-bold text-white text-sm">{selectedFlight.customerName}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-emerald-400/70 font-bold uppercase mb-1">Contact</p>
                                                    <p className="font-bold text-white text-sm">{selectedFlight.customerPhone || 'N/A'}</p>
                                                    <p className="text-xs text-gray-400">{selectedFlight.customerEmail}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-amber-900/10 border border-amber-500/20 p-4 rounded-xl flex items-center justify-center text-center py-6">
                                            <div>
                                                <Lock className="w-5 h-5 text-amber-500 mx-auto mb-2 opacity-50" />
                                                <p className="text-amber-500 font-bold text-sm mb-1">Passenger Details Locked</p>
                                                <p className="text-xs text-amber-400/70">Secure payment required to view passenger manifest.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Col: Actions & Payment */}
                            <div className="space-y-6">
                                {/* Flight Deck Controls */}
                                <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Flight Deck Controls</h3>
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => handleUpdateStatus('In-Flight')}
                                            disabled={selectedFlight.status !== 'Confirmed'}
                                            className="w-full bg-blue-600/20 text-blue-400 border border-blue-500/30 py-3 rounded-lg font-bold uppercase tracking-widest text-[10px] hover:bg-blue-600/40 transition-all shadow-md flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed disabled:bg-transparent disabled:border-white/10 disabled:text-gray-500"
                                        >
                                            <Plane className="w-4 h-4 mr-2" /> Wheels Up (Depart)
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus('Completed')}
                                            disabled={selectedFlight.status !== 'In-Flight'}
                                            className="w-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 py-3 rounded-lg font-bold uppercase tracking-widest text-[10px] hover:bg-emerald-600/40 transition-all shadow-md flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed disabled:bg-transparent disabled:border-white/10 disabled:text-gray-500"
                                        >
                                            <CheckCircle2 className="w-4 h-4 mr-2" /> Mission Complete
                                        </button>
                                    </div>
                                </div>

                                <button className="w-full border border-white/20 text-white py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center justify-center">
                                    <Download className="w-4 h-4 mr-2" /> Download GenDec
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="glass-panel rounded-xl overflow-hidden border border-white/5">
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead className="bg-white/5 border-b border-white/5">
                            <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <th className="px-8 py-5">Booking Ref</th>
                                <th className="px-8 py-5">Mission Route</th>
                                <th className="px-8 py-5">Date</th>
                                <th className="px-8 py-5">Assigned Aircraft</th>
                                <th className="px-8 py-5">Payment</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.length === 0 ? (
                                <tr><td colSpan={7} className="px-8 py-10 text-center text-gray-500 italic">No scheduled flights matching criteria.</td></tr>
                            ) : filtered.map(f => (
                                <tr key={f.id} onClick={() => setSelectedFlight(f)} className="hover:bg-white/5 transition-colors group cursor-pointer">
                                    <td className="px-8 py-6 font-mono text-[10px] font-bold text-gray-500 group-hover:text-gold-500 transition-colors">{f.bookingRef}</td>
                                    <td className="px-8 py-6 font-bold text-white text-sm">{f.route}</td>
                                    <td className="px-8 py-6 text-xs text-gray-400 font-medium">{f.date}</td>
                                    <td className="px-8 py-6 text-sm font-bold text-gray-200">{f.aircraft}</td>
                                    <td className="px-8 py-6">
                                        {f.paymentStatus === 'succeeded' ? (
                                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3" /> Paid
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Pending</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-6"><StatusBadge status={f.status} /></td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="flex items-center justify-end text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-gold-500 ml-auto transition-colors">
                                            <FileText className="w-3 h-3 mr-1" /> View Manifest
                                        </button>
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
