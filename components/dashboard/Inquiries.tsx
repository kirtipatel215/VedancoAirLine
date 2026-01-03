
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Calendar, Users, Briefcase, Plane, ArrowRight, Loader2, ChevronRight, Navigation, MapPin, Search, Plus, Filter, X, Luggage, ChevronLeft, Clock, CheckCircle2, ChevronDown, Eye } from 'lucide-react';
import { PageTemplate, DataTable, Column, StatusBadge, LocationAutocomplete } from './shared';
import { Inquiry, PaginationMeta } from './types';
import { SecureApiService, DB_INQUIRIES } from './service';

export const Inquiries = ({ initialData }: { initialData?: any }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<Inquiry[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [selected, setSelected] = useState<Inquiry | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

    // Refs
    const detailModalRef = useRef<HTMLDivElement>(null);
    const statusDropdownRef = useRef<HTMLDivElement>(null);

    // Init
    useEffect(() => {
        if (initialData?.filter) setStatusFilter(initialData.filter);
        if (initialData?.openCreate) setShowCreate(true);
    }, [initialData]);

    const load = useCallback(async (p: number) => {
        setLoading(true);
        // SAFETY CHECK: Ensure array is returned
        let allInquiries: Inquiry[] = await SecureApiService.getInquiries() as Inquiry[];
        if (!allInquiries || !Array.isArray(allInquiries)) allInquiries = DB_INQUIRIES || [];

        // 1. Tab Filter
        // For Inquiries: 'New', 'In Progress', 'Quoted' are Active. 'Booked', 'Closed' are History.
        let filtered = allInquiries.filter(i => {
            const isHistory = i.status === 'Booked' || i.status === 'Closed';
            return activeTab === 'active' ? !isHistory : isHistory;
        });

        // 2. Status/Search Filter
        if (statusFilter !== 'All') filtered = filtered.filter(i => i.status === statusFilter);
        if (searchQuery) {
            const lower = searchQuery.toLowerCase();
            filtered = filtered.filter(i =>
                i.id.toLowerCase().includes(lower) ||
                i.from_airport.toLowerCase().includes(lower) ||
                i.to_airport.toLowerCase().includes(lower)
            );
        }

        const res = SecureApiService.paginateArray(filtered, p, 10);
        setData(res.data);
        setMeta(res.pagination);
        setLoading(false);
    }, [searchQuery, statusFilter, activeTab]);

    useEffect(() => { load(1); }, [load]);

    // Handle deep link selection
    useEffect(() => {
        if (!loading && initialData?.selectedId && data.length > 0) {
            const item = data.find(i => i.id === initialData.selectedId);
            if (item) setSelected(item);
        }
    }, [loading, data, initialData]);

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


    // Create Form State
    const [formData, setFormData] = useState({
        route_type: 'One Way', from: '', to: '', date: '', returnDate: '', passengers: '1', purpose: 'Business Meeting', aircraft: 'Midsize Jet', notes: '', luggage: ''
    });
    const [formErrors, setFormErrors] = useState<any>({});

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const errors: any = {};
        if (!formData.from) errors.from = "Origin required";
        if (!formData.to) errors.to = "Destination required";
        if (!formData.date) errors.date = "Date required";

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setLoading(true);
        await SecureApiService.createInquiry(formData);
        setShowCreate(false);
        setFormData({ route_type: 'One Way', from: '', to: '', date: '', returnDate: '', passengers: '1', purpose: 'Business Meeting', aircraft: 'Midsize Jet', notes: '', luggage: '' });
        load(1);
    };

    // Columns Definition
    const columns: Column<Inquiry>[] = [
        {
            header: "Route",
            accessor: (item) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3 font-medium text-navy-900">
                        <span className="text-sm font-bold tracking-wide w-12">{item.from_airport.split('(')[0].substring(0, 3).toUpperCase()}</span>

                        {/* Visual Arrow */}
                        <div className="flex flex-col items-center gap-0.5 px-2">
                            <div className="text-[9px] text-gray-400 font-medium whitespace-nowrap">{item.route_type}</div>
                            <div className="flex items-center w-24">
                                <span className="h-px bg-gray-300 w-full"></span>
                                <Plane className="w-3 h-3 text-gold-500 mx-1 rotate-90" />
                                <span className="h-px bg-gray-300 w-full"></span>
                                <ArrowRight className="w-3 h-3 text-gray-300 -ml-1" />
                            </div>
                        </div>

                        <span className="text-sm font-bold tracking-wide w-12 text-right">{item.to_airport.split('(')[0].substring(0, 3).toUpperCase()}</span>
                    </div>
                </div>
            )
        },
        {
            header: "Schedule",
            accessor: (item) => (
                <div className="flex flex-col">
                    <span className="font-bold text-navy-900 text-sm">{new Date(item.departure_datetime).toLocaleDateString()}</span>
                    <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{new Date(item.departure_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            )
        },
        {
            header: "Pax",
            accessor: (item) => (
                <span className="text-sm text-gray-700 font-medium flex items-center gap-1">
                    <Users className="w-3 h-3 text-gray-400" /> {item.passengers}
                </span>
            )
        },
        {
            header: "Reference",
            accessor: (item) => (
                <div className="font-mono text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100 w-fit">
                    {item.id}
                </div>
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
                    title="View Details"
                >
                    <Eye className="w-4 h-4" />
                </button>
            )
        }
    ];


    // --- Create View ---
    if (showCreate) return (
        <div className="max-w-5xl mx-auto animate-slide-up pb-24">
            <button onClick={() => setShowCreate(false)} className="mb-6 flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-navy-900 transition-colors group">
                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center mr-3 group-hover:border-navy-900 transition-colors">
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-navy-900 rotate-180 transition-colors" />
                </div>
                Cancel & Return
            </button>

            <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] overflow-hidden relative border border-white/50">
                {/* Luxurious Header */}
                <div className="relative bg-navy-950 p-8 md:p-12 overflow-hidden">
                    <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold-500/20 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="h-px w-8 bg-gold-500"></span>
                            <span className="text-gold-500 text-[10px] font-bold uppercase tracking-[0.2em]">New Request</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">Charter a Private Jet</h2>
                        <p className="text-white/60 text-sm md:text-base font-medium max-w-xl leading-relaxed">
                            Experience seamless travel. Tell us your preferences, and our global network of operators will provide bespoke proposals within minutes.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 md:p-14 space-y-12">
                    {/* Trip Type Toggle - Premium Segmented Control */}
                    <div className="flex justify-center">
                        <div className="bg-gray-100 p-1.5 rounded-xl inline-flex relative shadow-inner">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, route_type: 'One Way' })}
                                className={`relative py-3 px-8 rounded-lg text-xs font-bold uppercase tracking-widest transition-all z-10 ${formData.route_type === 'One Way' ? 'bg-white text-navy-900 shadow-md' : 'text-gray-500 hover:text-navy-700'}`}
                            >
                                One Way
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, route_type: 'Round Trip' })}
                                className={`relative py-3 px-8 rounded-lg text-xs font-bold uppercase tracking-widest transition-all z-10 ${formData.route_type === 'Round Trip' ? 'bg-white text-navy-900 shadow-md' : 'text-gray-500 hover:text-navy-700'}`}
                            >
                                Round Trip
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <LocationAutocomplete
                            label="Origin"
                            icon={Navigation}
                            placeholder="Departure City/Airport"
                            value={formData.from}
                            onChange={(v: string) => setFormData({ ...formData, from: v })}
                            error={formErrors.from}
                            required
                        />
                        <LocationAutocomplete
                            label="Destination"
                            icon={MapPin}
                            placeholder="Arrival City/Airport"
                            value={formData.to}
                            onChange={(v: string) => setFormData({ ...formData, to: v })}
                            error={formErrors.to}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2 group">
                            <label className="text-[10px] font-bold text-navy-900 uppercase tracking-widest block mb-2 group-focus-within:text-gold-600 transition-colors">Departure Date</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className={`w-full bg-white border border-gray-300 rounded-xl px-4 py-4 text-sm font-bold text-navy-900 outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 transition-all shadow-sm ${formErrors.date ? 'border-red-300' : ''}`}
                                style={{ colorScheme: 'light' }}
                            />
                        </div>
                        {formData.route_type === 'Round Trip' && (
                            <div className="space-y-2 animate-fade-in group">
                                <label className="text-[10px] font-bold text-navy-900 uppercase tracking-widest block mb-2 group-focus-within:text-gold-600 transition-colors">Return Date</label>
                                <input
                                    type="date"
                                    value={formData.returnDate}
                                    onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-4 text-sm font-bold text-navy-900 outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 transition-all shadow-sm"
                                    style={{ colorScheme: 'light' }}
                                />
                            </div>
                        )}
                        <div className="space-y-2 group">
                            <label className="text-[10px] font-bold text-navy-900 uppercase tracking-widest block mb-2 group-focus-within:text-gold-600 transition-colors">Passengers</label>
                            <input type="number" min="1" max="100" value={formData.passengers} onChange={(e) => setFormData({ ...formData, passengers: e.target.value })} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-4 text-sm font-bold text-navy-900 outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 transition-all shadow-sm" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2 group">
                            <label className="text-[10px] font-bold text-navy-900 uppercase tracking-widest block mb-2 group-focus-within:text-gold-600 transition-colors">Purpose of Travel</label>
                            <div className="relative">
                                <select value={formData.purpose} onChange={(e) => setFormData({ ...formData, purpose: e.target.value })} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-4 text-sm font-bold text-navy-900 outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 transition-all shadow-sm appearance-none cursor-pointer hover:border-gray-400">
                                    <option>Business Meeting</option>
                                    <option>Leisure / Vacation</option>
                                    <option>Medical Transfer</option>
                                    <option>Relocation</option>
                                    <option>Other</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                            </div>
                        </div>
                        <div className="space-y-2 group">
                            <label className="text-[10px] font-bold text-navy-900 uppercase tracking-widest block mb-2 group-focus-within:text-gold-600 transition-colors">Luggage & Equipment</label>
                            <input
                                type="text"
                                value={formData.luggage}
                                onChange={(e) => setFormData({ ...formData, luggage: e.target.value })}
                                placeholder="e.g. 2 Large Suitcases, Golf Bags"
                                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-4 text-sm font-medium text-navy-900 outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 transition-all shadow-sm placeholder-gray-500"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 group pb-4">
                        <label className="text-[10px] font-bold text-navy-900 uppercase tracking-widest block mb-2 group-focus-within:text-gold-600 transition-colors">Special Requests</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Please detail any specific catering preferences, ground transportation needs, or pet travel requirements..."
                            className="w-full bg-white border border-gray-300 rounded-xl p-5 text-sm font-medium text-navy-900 outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 transition-all shadow-sm min-h-[140px] resize-none placeholder-gray-500"
                        />
                    </div>

                    <div className="flex justify-end pt-8 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full md:w-auto bg-navy-900 text-white px-10 py-5 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-gold-500 hover:text-navy-900 transition-all shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_40px_-10px_rgba(234,179,8,0.4)] flex items-center justify-center gap-3 transform hover:-translate-y-1 active:scale-[0.98]"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                <>
                                    <Plane className="w-4 h-4" />
                                    Submit Flight Request
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    // --- Modal View ---
    if (selected) {
        return (
            <div
                className="fixed inset-0 z-[100] bg-navy-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
                onClick={() => setSelected(null)}
            >
                <div
                    ref={detailModalRef}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white w-full max-w-5xl rounded-[2rem] shadow-2xl overflow-hidden relative animate-scale-up my-auto border border-white/50 flex flex-col max-h-[90vh] md:max-h-none overflow-y-auto"
                >
                    <button
                        onClick={() => setSelected(null)}
                        className="absolute top-4 right-4 z-50 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>


                    {/* Hero Section */}
                    <div className="bg-[#0B1120] p-6 md:p-12 relative overflow-hidden text-white shrink-0">
                        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-[#1a2333] to-transparent pointer-events-none"></div>
                        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-8">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest text-gold-400">
                                        {selected.status}
                                    </div>
                                    <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/70 font-mono">
                                        {selected.id}
                                    </div>
                                </div>
                                <h1 className="text-2xl md:text-5xl font-serif font-bold leading-tight mb-2 flex flex-wrap md:flex-nowrap items-baseline gap-2 md:gap-4">
                                    <span>{selected.from_airport.split('(')[0]}</span>
                                    <ArrowRight className="w-4 h-4 md:w-6 md:h-6 text-gold-500 hidden md:block" />
                                    <span className="md:hidden text-gold-500 text-sm font-sans mx-2">to</span>
                                    <span>{selected.to_airport.split('(')[0]}</span>
                                </h1>
                                <p className="text-white/60 text-sm font-medium tracking-wide flex items-center gap-2 mt-2">
                                    <Plane className="w-4 h-4 text-gold-500" />
                                    {selected.aircraft_preference || 'Any Aircraft'}
                                </p>
                            </div>

                            <div className="w-full md:w-auto text-left md:text-right bg-white/5 backdrop-blur-sm p-4 md:p-6 rounded-2xl border border-white/10">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Passengers</p>
                                <p className="text-2xl md:text-3xl font-serif font-bold text-white mb-1 flex items-center gap-2 md:justify-end">
                                    <Users className="w-6 h-6 text-gold-500" /> {selected.passengers}
                                </p>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                                    {selected.route_type}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Flight Timeline (Simplified for Inquiry) */}
                    <div className="bg-gray-50 border-b border-gray-100 p-6 md:p-12 shrink-0">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 relative">
                            {/* Line connecting */}
                            <div className="absolute top-1/2 left-20 right-20 h-0.5 bg-gray-200 -z-10 hidden md:block border-t border-dashed border-gray-300"></div>

                            {/* Departure */}
                            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center flex-1 w-full md:w-auto relative z-10 hover:shadow-md transition-shadow">
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Requested Departure</div>
                                <div className="text-xl md:text-3xl font-bold text-navy-900 mb-1">
                                    {new Date(selected.departure_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="text-sm font-medium text-gray-500 mb-4">{new Date(selected.departure_datetime).toLocaleDateString()}</div>
                                <div className="flex items-center gap-2 text-navy-800 font-bold bg-navy-50 px-3 py-1.5 rounded-lg text-xs">
                                    <MapPin className="w-3.5 h-3.5 text-gold-500" /> {selected.from_airport.substring(0, 3).toUpperCase()}
                                </div>
                            </div>

                            {/* Destination */}
                            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center flex-1 w-full md:w-auto relative z-10 hover:shadow-md transition-shadow">
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Destination</div>
                                <div className="text-xl md:text-3xl font-bold text-gray-300 mb-1">
                                    TBD
                                </div>
                                <div className="text-sm font-medium text-gray-500 mb-4">Arrival time calculated upon quote</div>
                                <div className="flex items-center gap-2 text-navy-800 font-bold bg-navy-50 px-3 py-1.5 rounded-lg text-xs">
                                    <MapPin className="w-3.5 h-3.5 text-gold-500" /> {selected.to_airport.substring(0, 3).toUpperCase()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Info Grid */}
                    <div className="p-6 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 pb-12">
                        <div className="space-y-6">
                            <h4 className="text-xs font-bold text-navy-900 uppercase tracking-widest border-b border-gray-100 pb-2">Requirements</h4>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center shrink-0">
                                    <Briefcase className="w-5 h-5 text-gold-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-navy-900">{selected.purpose}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Luggage: {selected.luggage || 'Standard'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-xs font-bold text-navy-900 uppercase tracking-widest border-b border-gray-100 pb-2">Notes</h4>
                            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                                <p className="text-sm text-navy-800 italic">
                                    "{selected.notes && selected.notes.length > 0 ? selected.notes : 'No special requirements.'}"
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- Main List View ---
    return (
        <PageTemplate
            title="Mission Log"
            subtitle="Track active requests and historical flight data."
            onSearch={setSearchQuery}
            action={
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    {/* Tab Switcher */}
                    <div className="bg-gray-100 p-1 rounded-full flex relative">
                        {['active', 'history'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all z-10 ${activeTab === tab ? 'bg-white text-navy-900 shadow-sm' : 'text-gray-500 hover:text-navy-700'
                                    }`}
                            >
                                {tab === 'active' ? 'Active' : 'History'}
                            </button>
                        ))}
                    </div>

                    {/* Status Dropdown */}
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
                                        ? ['All', 'New', 'In Progress', 'Quoted']
                                        : ['All', 'Booked', 'Closed']
                                    ).map(opt => (
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

                    <button
                        onClick={() => setShowCreate(true)}

                        className="bg-midnight-900 text-white px-6 py-2 rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-gold-500 hover:text-navy-900 shadow-lg hover:shadow-xl transition-all flex items-center justify-center flex-shrink-0"
                    >
                        <Plus className="w-3 h-3 mr-2" /> New Inquiry
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
                    emptyMessage="No inquiries found matching your criteria."
                />
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {loading ? (
                    <div className="p-8 text-center text-gray-400">Loading requests...</div>
                ) : data.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 border border-dashed border-gray-200 rounded-2xl">
                        No inquiries found.
                    </div>
                ) : (
                    data.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => setSelected(item)}
                            className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 active:scale-[0.98] transition-transform"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold text-navy-900">{item.from_airport.split('(')[0].substring(0, 3).toUpperCase()}</span>
                                        <ArrowRight className="w-4 h-4 text-gold-500" />
                                        <span className="text-lg font-bold text-navy-900">{item.to_airport.split('(')[0].substring(0, 3).toUpperCase()}</span>
                                    </div>
                                    <span className="text-xs text-gray-400 font-mono">{item.id}</span>
                                </div>
                                <StatusBadge status={item.status} />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Departure</p>
                                    <p className="text-sm font-bold text-navy-900">{new Date(item.departure_datetime).toLocaleDateString()}</p>
                                    <p className="text-xs text-gray-500">{new Date(item.departure_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Passengers</p>
                                    <p className="text-sm font-bold text-navy-900">{item.passengers} Pax</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                <div className="flex items-center gap-2 text-navy-600 text-xs font-bold bg-navy-50 px-2 py-1 rounded">
                                    <Clock className="w-3 h-3" /> {item.route_type}
                                </div>
                                <button className="text-xs font-bold text-gold-600 uppercase tracking-widest flex items-center gap-1">
                                    View Details <ChevronLeft className="w-3 h-3 rotate-180" />
                                </button>
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
