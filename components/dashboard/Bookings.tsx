
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Plane, CheckCircle2, CalendarDays, ArrowRight, Clock, MapPin, Eye, Search, Filter, Download, Star, ShieldCheck, User, X, ChevronDown } from 'lucide-react';
import { PageTemplate, DataTable, Column, StatusBadge } from './shared';
import { Booking, PaginationMeta } from './types';
import { SecureApiService, DB_BOOKINGS } from './service';

export const Bookings = ({ initialData }: { initialData?: any }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<Booking[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

    // Ref for click outside
    const detailModalRef = useRef<HTMLDivElement>(null);
    const statusDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (initialData?.filter) {
            setStatusFilter(initialData.filter);
        }
    }, [initialData]);

    const load = useCallback(async (p: number) => {
        setLoading(true);
        // Simulate fetching all from service (in real app, API handles filtering)
        let allBookings: Booking[] = await SecureApiService.getBookings() as Booking[];
        if (!allBookings || allBookings.length === 0) allBookings = DB_BOOKINGS || [];

        // 1. Tab Filter
        const now = new Date();
        let filtered = allBookings.filter(b => {
            const isPast = new Date(b.arrival_datetime || b.departure_datetime) < now || b.status === 'Completed' || b.status === 'Cancelled';
            return activeTab === 'active' ? !isPast : isPast;
        });

        // 2. Status/Search Filter
        if (statusFilter !== 'All') {
            filtered = filtered.filter(b => b.status === statusFilter);
        }

        if (searchQuery) {
            const lower = searchQuery.toLowerCase();
            filtered = filtered.filter(b =>
                b.booking_reference.toLowerCase().includes(lower) ||
                b.route.toLowerCase().includes(lower) ||
                b.aircraft_model.toLowerCase().includes(lower)
            );
        }

        const res = SecureApiService.paginateArray(filtered, p, 10);
        setData(res.data);
        setMeta(res.pagination);
        setLoading(false);
    }, [searchQuery, statusFilter, activeTab]);

    useEffect(() => { load(1); }, [load]);

    // Close on escape key & Click outside dropdown
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setSelectedBooking(null);
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

    // Define Columns
    const columns: Column<Booking>[] = [
        {
            header: "Route",
            accessor: (booking) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3 font-medium text-navy-900">
                        <span className="text-sm font-bold tracking-wide w-12">{booking.origin.split(' ')[0]}</span>

                        {/* Visual Arrow with Duration */}
                        <div className="flex flex-col items-center gap-0.5 px-2">
                            <div className="text-[9px] text-gray-400 font-medium whitespace-nowrap">{booking.duration || '2h 15m'}</div>
                            <div className="flex items-center w-24">
                                <span className="h-px bg-gray-300 w-full"></span>
                                <Plane className="w-3 h-3 text-gold-500 mx-1 rotate-90" />
                                <span className="h-px bg-gray-300 w-full"></span>
                                <ArrowRight className="w-3 h-3 text-gray-300 -ml-1" />
                            </div>
                        </div>

                        <span className="text-sm font-bold tracking-wide w-12 text-right">{booking.destination.split(' ')[0]}</span>
                    </div>
                </div>
            )
        },
        {
            header: "Schedule",
            accessor: (booking) => (
                <div className="flex flex-col">
                    <span className="font-bold text-navy-900 text-sm">{new Date(booking.departure_datetime).toLocaleDateString()}</span>
                    <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{new Date(booking.departure_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            )
        },
        {
            header: "Aircraft",
            accessor: (booking) => (
                <span className="text-sm text-gray-700 font-medium">{booking.aircraft_model}</span>
            )
        },
        {
            header: "Reference",
            accessor: (booking) => (
                <div className="font-mono text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100 w-fit">
                    {booking.booking_reference}
                </div>
            )
        },
        {
            header: "Status",
            accessor: (booking) => (
                <div className="flex flex-col items-start gap-1.5">
                    <StatusBadge status={booking.status} />
                    {booking.payment_status === 'Paid' && (
                        <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest flex items-center">
                            <CheckCircle2 className="w-2.5 h-2.5 mr-1" /> Paid
                        </span>
                    )}
                </div>
            )
        },
        {
            header: "",
            accessor: (booking) => (
                <button
                    onClick={(e) => { e.stopPropagation(); setSelectedBooking(booking); }}
                    className="px-4 py-2 rounded-lg bg-navy-900 text-white text-xs font-bold hover:bg-gold-500 hover:text-navy-900 transition-all shadow-md hover:shadow-lg whitespace-nowrap flex items-center justify-center gap-1 group"
                >
                    View Details
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                </button>
            )
        }
    ];

    if (selectedBooking) {
        return (
            <div
                className="fixed inset-0 z-[100] bg-navy-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
                onClick={() => setSelectedBooking(null)}
            >
                <div
                    ref={detailModalRef}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white w-full max-w-5xl rounded-[2rem] shadow-2xl overflow-hidden relative animate-scale-up my-auto border border-white/50 flex flex-col max-h-[90vh] md:max-h-none overflow-y-auto"
                >
                    {/* Close Button */}
                    <button
                        onClick={() => setSelectedBooking(null)}
                        className="absolute top-4 right-4 z-50 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>


                    {/* Hero Section */}
                    <div className="bg-[#0B1120] p-6 md:p-12 relative overflow-hidden text-white shrink-0">
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-[#1a2333] to-transparent pointer-events-none"></div>
                        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-8">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest text-gold-400">
                                        {selectedBooking.status}
                                    </div>
                                    <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/70 font-mono">
                                        {selectedBooking.booking_reference}
                                    </div>
                                </div>
                                <h1 className="text-2xl md:text-5xl font-serif font-bold leading-tight mb-2 flex flex-wrap md:flex-nowrap items-baseline gap-2 md:gap-4">
                                    <span>{selectedBooking.origin.split(' ')[0]}</span>
                                    <ArrowRight className="w-4 h-4 md:w-6 md:h-6 text-gold-500 hidden md:block" />
                                    <span className="md:hidden text-gold-500 text-sm font-sans mx-2">to</span>
                                    <span>{selectedBooking.destination.split(' ')[0]}</span>
                                </h1>
                                <p className="text-white/60 text-sm font-medium tracking-wide flex items-center gap-2 mt-2">
                                    <Plane className="w-4 h-4 text-gold-500" />
                                    {selectedBooking.aircraft_model}
                                </p>
                            </div>

                            <div className="w-full md:w-auto text-left md:text-right bg-white/5 backdrop-blur-sm p-4 md:p-6 rounded-2xl border border-white/10">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Total Amount</p>
                                <p className="text-2xl md:text-3xl font-serif font-bold text-white mb-1">${selectedBooking.total_amount?.toLocaleString()}</p>
                                {selectedBooking.payment_status === 'Paid' && (
                                    <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded">
                                        <CheckCircle2 className="w-3 h-3" /> Paid In Full
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Flight Timeline */}
                    <div className="bg-gray-50 border-b border-gray-100 p-6 md:p-12 shrink-0">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 relative">
                            {/* Line connecting */}
                            <div className="absolute top-1/2 left-20 right-20 h-0.5 bg-gray-200 -z-10 hidden md:block border-t border-dashed border-gray-300"></div>

                            {/* Departure */}
                            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center flex-1 w-full md:w-auto relative z-10 hover:shadow-md transition-shadow">
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Departure</div>
                                <div className="text-xl md:text-3xl font-bold text-navy-900 mb-1">
                                    {new Date(selectedBooking.departure_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="text-sm font-medium text-gray-500 mb-4">{new Date(selectedBooking.departure_datetime).toLocaleDateString()}</div>
                                <div className="flex items-center gap-2 text-navy-800 font-bold bg-navy-50 px-3 py-1.5 rounded-lg text-xs">
                                    <MapPin className="w-3.5 h-3.5 text-gold-500" /> {selectedBooking.origin.substring(0, 3).toUpperCase()}
                                </div>
                            </div>

                            {/* Duration */}
                            <div className="bg-navy-950 text-white px-4 py-2 rounded-full text-xs font-bold tracking-wide shadow-lg border border-navy-800 flex items-center gap-2 whitespace-nowrap z-20">
                                <Clock className="w-3.5 h-3.5 text-gold-500" />
                                {selectedBooking.duration || '2h 15m'}
                            </div>

                            {/* Arrival */}
                            <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center flex-1 w-full md:w-auto relative z-10 hover:shadow-md transition-shadow">
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Arrival</div>
                                <div className="text-xl md:text-3xl font-bold text-navy-900 mb-1">
                                    {new Date(selectedBooking.arrival_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div className="text-sm font-medium text-gray-500 mb-4">{new Date(selectedBooking.arrival_datetime).toLocaleDateString()}</div>
                                <div className="flex items-center gap-2 text-navy-800 font-bold bg-navy-50 px-3 py-1.5 rounded-lg text-xs">
                                    <MapPin className="w-3.5 h-3.5 text-gold-500" /> {selectedBooking.destination.substring(0, 3).toUpperCase()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Info Grid */}
                    <div className="p-6 md:p-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                        <div className="space-y-6">
                            <h4 className="text-xs font-bold text-navy-900 uppercase tracking-widest border-b border-gray-100 pb-2">Aircraft Details</h4>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center shrink-0">
                                    <Plane className="w-5 h-5 text-gold-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-navy-900">{selectedBooking.aircraft_model}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Tail: {selectedBooking.tail_number || 'TBA'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-xs font-bold text-navy-900 uppercase tracking-widest border-b border-gray-100 pb-2">Operator Info</h4>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center shrink-0">
                                    <ShieldCheck className="w-5 h-5 text-navy-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-navy-900">{selectedBooking.operator_id === 'OP-101' ? 'Royal Sky Aviation' : selectedBooking.operator_id}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Argus Platinum Rated</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-xs font-bold text-navy-900 uppercase tracking-widest border-b border-gray-100 pb-2">Documents</h4>
                            <button className="flex items-center gap-3 w-full p-3 rounded-xl border border-gray-200 hover:border-gold-500 hover:bg-gold-50/30 transition-all group">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-white flex items-center justify-center transition-colors">
                                    <Download className="w-4 h-4 text-gray-600 group-hover:text-gold-600" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-navy-900 group-hover:text-black">Download Itinerary</p>
                                    <p className="text-[10px] text-gray-400">PDF, 1.2MB</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <PageTemplate
            title="Missions"
            subtitle="Manage your active flights and view historical records."
            onSearch={setSearchQuery}
            action={
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    {/* Custom Tab Switcher */}
                    <div className="bg-gray-100 p-1 rounded-full flex relative">
                        {['active', 'history'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all z-10 ${activeTab === tab ? 'bg-white text-navy-900 shadow-sm' : 'text-gray-500 hover:text-navy-700'
                                    }`}
                            >
                                {tab === 'active' ? 'Active Flights' : 'History'}
                            </button>
                        ))}
                    </div>

                    {/* Custom Dropdown */}
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
                                    {['All', 'Confirmed', 'Scheduled', 'In-Flight', 'Completed', 'Cancelled'].map(opt => (
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
                </div>
            }
        >
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
                    onRowClick={setSelectedBooking}
                    emptyMessage="No flights found matching your criteria."
                />
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 pb-20">
                {loading ? (
                    <div className="p-12 flex flex-col items-center justify-center text-gray-400">
                        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                        <span className="text-xs font-bold uppercase tracking-widest">Loading flights...</span>
                    </div>
                ) : data.length === 0 ? (
                    <div className="p-8 text-center bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
                        <Plane className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                        <p className="text-navy-900 font-bold text-sm">No flights found</p>
                        <p className="text-xs text-gray-500 mt-1">Try adjusting your filters.</p>
                    </div>
                ) : (
                    data.map((booking) => (
                        <div
                            key={booking.id}
                            onClick={() => setSelectedBooking(booking)}
                            className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] border border-gray-100 active:scale-[0.98] transition-all relative overflow-hidden group"
                        >
                            {/* Decorative Background Tint */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-[100px] -z-0 opacity-50 group-hover:bg-gold-50/50 transition-colors"></div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex flex-col gap-0.5">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                            <CalendarDays className="w-3 h-3" />
                                            {new Date(booking.departure_datetime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl font-serif font-bold text-navy-900">{booking.origin.split(' ')[0]}</span>
                                            <div className="flex flex-col items-center justify-center w-8">
                                                <Plane className="w-4 h-4 text-gold-500 rotate-90" />
                                                <div className="w-full h-px bg-gold-200 mt-1"></div>
                                            </div>
                                            <span className="text-2xl font-serif font-bold text-navy-900">{booking.destination.split(' ')[0]}</span>
                                        </div>
                                    </div>
                                    <StatusBadge status={booking.status} />
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-5 p-4 bg-gray-50/80 rounded-2xl border border-gray-100">
                                    <div>
                                        <p className="text-[9px] uppercase font-bold text-gray-400 mb-1">Departure Time</p>
                                        <p className="text-sm font-bold text-navy-900 flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                                            {new Date(booking.departure_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] uppercase font-bold text-gray-400 mb-1">Aircraft</p>
                                        <p className="text-sm font-bold text-navy-900 text-right truncate">
                                            {booking.aircraft_model}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-2 text-navy-600 text-xs font-bold bg-navy-50 px-2 py-1 rounded">
                                        <Clock className="w-3 h-3" /> {booking.duration || '2h 15m'}
                                    </div>
                                    <button className="text-xs font-bold text-white bg-navy-900 px-4 py-2 rounded-xl shadow-lg hover:bg-navy-800 transition-all flex items-center gap-2 whitespace-nowrap">
                                        View Details <ChevronRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
                {/* Mobile Pagination */}
                {meta && meta.totalPages > 1 && (
                    <div className="flex justify-center gap-3 pt-6">
                        <button
                            disabled={meta.currentPage === 1}
                            onClick={() => load(meta.currentPage - 1)}
                            className="px-4 py-2 flex items-center justify-center gap-2 rounded-full bg-white border border-gray-200 shadow-sm disabled:opacity-50 text-xs font-bold text-navy-900 hover:bg-gray-50 transition-colors"
                        >
                            <ChevronLeft className="w-3 h-3" /> Prev
                        </button>
                        <span className="text-xs font-bold text-navy-900 self-center bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
                            {meta.currentPage} / {meta.totalPages}
                        </span>
                        <button
                            disabled={meta.currentPage === meta.totalPages}
                            onClick={() => load(meta.currentPage + 1)}
                            className="px-4 py-2 flex items-center justify-center gap-2 rounded-full bg-white border border-gray-200 shadow-sm disabled:opacity-50 text-xs font-bold text-navy-900 hover:bg-gray-50 transition-colors"
                        >
                            Next <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>
        </PageTemplate>
    );
};
