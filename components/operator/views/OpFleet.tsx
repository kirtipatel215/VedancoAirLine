
import React, { useState, useEffect } from 'react';
import { Plane, Settings, CheckCircle, MapPin, Users, Plus, X, Wrench, AlertTriangle, Loader2 } from 'lucide-react';
import { OperatorService } from '../OperatorService.ts';
import { OpAircraft } from '../types';
import { SectionHeader, SearchFilterToolbar } from '../ui/shared.tsx';

export const OpFleet = () => {
    const [fleet, setFleet] = useState<OpAircraft[]>([]);
    const [selectedAC, setSelectedAC] = useState<OpAircraft | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Add Aircraft State
    const [showAdd, setShowAdd] = useState(false);
    const [adding, setAdding] = useState(false);
    const [newAc, setNewAc] = useState<Partial<OpAircraft>>({ status: 'Active', type: 'Midsize' });

    const loadFleet = async () => {
        const data = await OperatorService.getAircraft();
        setFleet(data);
    };

    useEffect(() => {
        loadFleet();
    }, []);

    const toggleStatus = async () => {
        if (!selectedAC) return;
        const newStatus = selectedAC.status === 'Active' ? 'Maintenance' : 'Active';
        await OperatorService.updateAircraftStatus(selectedAC.id, newStatus);
        const updated = await OperatorService.getAircraft();
        setFleet(updated);
        setSelectedAC(updated.find(a => a.id === selectedAC.id) || null);
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAc.registration || !newAc.model || !newAc.base || !newAc.seats) return;
        setAdding(true);
        try {
            await OperatorService.addAircraft({
                registration: newAc.registration,
                model: newAc.model,
                type: newAc.type as any,
                seats: Number(newAc.seats),
                base: newAc.base,
                status: 'Active'
            });
            setShowAdd(false);
            setNewAc({ status: 'Active', type: 'Midsize' });
            loadFleet();
            alert("Aircraft added successfully.");
        } catch (err: any) {
            console.error(err);
            alert("Error adding aircraft: " + err.message);
        } finally {
            setAdding(false);
        }
    };

    const filtered = fleet.filter(ac => {
        const matchesSearch = ac.registration.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ac.model.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = statusFilter === 'All' || ac.status === statusFilter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-8 animate-fade-in text-gray-200">
            <SectionHeader
                title="Fleet Management"
                subtitle="Manage availability, base location, and maintenance schedules."
                action={
                    <button
                        onClick={() => setShowAdd(true)}
                        className="bg-gold-500 text-charcoal-900 px-6 py-3 rounded-sm font-bold uppercase tracking-widest text-xs hover:bg-white transition-all flex items-center shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add Aircraft
                    </button>
                }
            />

            <SearchFilterToolbar
                onSearch={setSearchQuery}
                onFilter={setStatusFilter}
                filterOptions={['Active', 'Maintenance']}
                placeholder="Search Registration or Model..."
            />

            {/* Add Aircraft Modal */}
            {showAdd && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setShowAdd(false)}>
                    <div className="glass-panel w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-scale-up border border-white/10" onClick={e => e.stopPropagation()}>
                        <div className="p-8 border-b border-white/10 flex justify-between items-center bg-charcoal-900/50">
                            <h3 className="font-serif font-bold text-2xl text-white glow-text">Register Aircraft</h3>
                            <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleAdd} className="p-8 space-y-4 bg-charcoal-950/80">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Registration</label>
                                    <input required placeholder="VT-XYZ" value={newAc.registration || ''} onChange={e => setNewAc({ ...newAc, registration: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded p-3 text-sm text-white focus:border-gold-500 outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Type</label>
                                    <select value={newAc.type} onChange={e => setNewAc({ ...newAc, type: e.target.value as any })} className="w-full bg-black/40 border border-white/10 rounded p-3 text-sm text-white focus:border-gold-500 outline-none">
                                        <option value="Light">Light Jet</option>
                                        <option value="Midsize">Midsize Jet</option>
                                        <option value="Heavy">Heavy Jet</option>
                                        <option value="Ultra Long">Ultra Long Range</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Model</label>
                                <input required placeholder="e.g. Challenger 605" value={newAc.model || ''} onChange={e => setNewAc({ ...newAc, model: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded p-3 text-sm text-white focus:border-gold-500 outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Base Airport</label>
                                    <input required placeholder="ICAO (e.g. VABB)" value={newAc.base || ''} onChange={e => setNewAc({ ...newAc, base: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded p-3 text-sm text-white focus:border-gold-500 outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Capacity (Pax)</label>
                                    <input required type="number" min="1" placeholder="8" value={newAc.seats || ''} onChange={e => setNewAc({ ...newAc, seats: parseInt(e.target.value) })} className="w-full bg-black/40 border border-white/10 rounded p-3 text-sm text-white focus:border-gold-500 outline-none" />
                                </div>
                            </div>
                            <div className="pt-4">
                                <button type="submit" disabled={adding} className="w-full bg-gold-500 text-charcoal-900 py-3 rounded font-bold uppercase tracking-widest text-xs hover:bg-white transition-all shadow-lg flex items-center justify-center disabled:opacity-70">
                                    {adding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />} Register to Fleet
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Existing Detail Modal */}
            {selectedAC && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedAC(null)}>
                    <div className="glass-panel w-full max-w-lg rounded-xl shadow-2xl overflow-hidden animate-scale-up border border-white/10" onClick={e => e.stopPropagation()}>
                        <div className="p-8 border-b border-white/10 flex justify-between items-center bg-charcoal-900/50">
                            <div>
                                <h3 className="font-serif font-bold text-2xl text-white text-glow">{selectedAC.registration}</h3>
                                <p className="text-xs text-gold-500 font-bold uppercase tracking-widest mt-1">{selectedAC.model}</p>
                            </div>
                            <button onClick={() => setSelectedAC(null)} className="p-2 bg-white/5 hover:bg-white/20 hover:text-white text-gray-400 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-8 space-y-6 bg-charcoal-950/80">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Base</p>
                                    <p className="font-bold text-white items-center flex"><MapPin className="w-3 h-3 mr-2 text-gold-500" /> {selectedAC.base}</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Capacity</p>
                                    <p className="font-bold text-white items-center flex"><Users className="w-3 h-3 mr-2 text-gold-500" /> {selectedAC.seats} Seats</p>
                                </div>
                            </div>

                            <div className="p-6 border border-white/10 rounded-lg bg-white/5">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm font-bold text-white">Current Status</span>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border flex items-center ${selectedAC.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                        {selectedAC.status}
                                    </span>
                                </div>
                                <button
                                    onClick={toggleStatus}
                                    className={`w-full py-3 rounded-lg font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-center shadow-lg ${selectedAC.status === 'Active' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'}`}
                                >
                                    {selectedAC.status === 'Active' ? <><Wrench className="w-3 h-3 mr-2" /> Mark for Maintenance</> : <><CheckCircle className="w-3 h-3 mr-2" /> Return to Service</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {filtered.length === 0 ? (
                <div className="p-20 text-center text-gray-500 border border-white/10 rounded-xl glass-panel">
                    <Plane className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                    <p className="font-bold">No aircraft found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filtered.map(ac => (
                        <div key={ac.id} className="glass-panel p-8 rounded-xl border border-white/5 hover:border-gold-500/50 hover:bg-white/5 transition-all group relative overflow-hidden cursor-pointer" onClick={() => setSelectedAC(ac)}>
                            {/* Status Indicator Line */}
                            <div className={`absolute top-0 left-0 w-full h-1 ${ac.status === 'Active' ? 'bg-emerald-500 shadow-[0_0_10px_#10B981]' : 'bg-amber-500 shadow-[0_0_10px_#F59E0B]'}`}></div>

                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 bg-white/5 rounded-full group-hover:bg-gold-500/10 group-hover:text-gold-500 transition-colors shadow-inner text-gray-400">
                                    <Plane className="w-8 h-8" />
                                </div>
                                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border flex items-center ${ac.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                    {ac.status === 'Active' && <CheckCircle className="w-3 h-3 mr-1.5" />}
                                    {ac.status === 'Maintenance' && <AlertTriangle className="w-3 h-3 mr-1.5" />}
                                    {ac.status}
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-2xl font-serif font-bold text-white mb-1 group-hover:text-gold-500 transition-colors">{ac.registration}</h3>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{ac.model}</p>
                                <p className="text-xs text-gray-600 font-medium mt-1 uppercase tracking-wide">{ac.type} Category</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6 mb-6">
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1 flex items-center"><Users className="w-3 h-3 mr-1" /> Capacity</p>
                                    <p className="font-bold text-gray-200">{ac.seats} Pax</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1 flex items-center"><MapPin className="w-3 h-3 mr-1" /> Home Base</p>
                                    <p className="font-bold text-gray-200">{ac.base}</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button className="flex-1 bg-white/5 text-white py-3 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-gold-500 hover:text-charcoal-900 transition-colors shadow-lg border border-white/5">
                                    Update Schedule
                                </button>
                                <button className="px-4 border border-white/10 rounded-sm hover:bg-white/10 hover:border-white/20 transition-colors text-gray-400 hover:text-white">
                                    <Settings className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
