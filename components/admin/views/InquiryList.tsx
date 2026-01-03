
import React, { useState, useEffect } from 'react';
import {
    ChevronRight, ArrowLeft, ArrowUpRight, Calendar, Users,
    Filter, Search, RefreshCw, Briefcase, ChevronLeft, Plane
} from 'lucide-react';
import { AdminInquiryView } from '../types';
import { SectionHeader, StatusBadge } from '../../dashboard/shared.tsx';
import { supabase } from '../../../supabaseClient';
import { InquiryDetail } from './InquiryDetail';

// --- Types ---
interface FilterState {
    status: string;
    origin: string;
    destination: string;
    dateRange: string;
    aircraftCategory: string;
}

// --- Helpers ---
const formatRelativeTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
};

const maskId = (id: string) => `VA-${id.slice(0, 4).toUpperCase()}`;

// --- Components ---

const RequestFilters = ({
    filters, onChange, onSearch, searchQuery
}: {
    filters: FilterState;
    onChange: (key: keyof FilterState, val: string) => void;
    onSearch: (val: string) => void;
    searchQuery: string;
}) => {
    return (
        <div className="flex flex-col md:flex-row gap-4 mb-6 p-1">
            {/* Search */}
            <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search Request ID..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:border-gold-500 transition-colors"
                    value={searchQuery}
                    onChange={(e) => onSearch(e.target.value)}
                />
            </div>

            {/* Structured Filters */}
            <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
                <select
                    className="bg-white border border-gray-200 rounded-lg text-xs font-bold px-3 py-2.5 outline-none focus:border-gold-500 cursor-pointer min-w-[120px]"
                    value={filters.status}
                    onChange={(e) => onChange('status', e.target.value)}
                >
                    <option value="All">All Status</option>
                    <option value="New">New</option>
                    <option value="Open">Sent to Operators</option>
                    <option value="Quoted">Offers Received</option>
                    <option value="Booked">Booked</option>
                    <option value="Cancelled">Cancelled</option>
                </select>

                <select
                    className="bg-white border border-gray-200 rounded-lg text-xs font-bold px-3 py-2.5 outline-none focus:border-gold-500 cursor-pointer min-w-[140px]"
                    value={filters.aircraftCategory}
                    onChange={(e) => onChange('aircraftCategory', e.target.value)}
                >
                    <option value="All">Any Aircraft</option>
                    <option value="Light">Light Jet</option>
                    <option value="Midsize">Midsize Jet</option>
                    <option value="Heavy">Heavy Jet</option>
                </select>

                {/* Visual wrapper for "Date" - placeholder strictly for UI demo as full date picker requires more libs */}
                <div className="relative">
                    <button className="bg-white border border-gray-200 rounded-lg text-xs font-bold px-3 py-2.5 flex items-center gap-2 hover:bg-gray-50">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span>Recent</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export const InquiryList = () => {
    // State
    const [inquiries, setInquiries] = useState<AdminInquiryView[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);

    // Pagination & Sort
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 10;

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<FilterState>({
        status: 'All',
        origin: '',
        destination: '',
        dateRange: 'All',
        aircraftCategory: 'All'
    });

    // Helper: Update filter
    const handleFilterChange = (key: keyof FilterState, val: string) => {
        setFilters(prev => ({ ...prev, [key]: val }));
        setPage(1); // Reset to page 1 on filter trigger
    };

    // --- Data Fetching ---
    const fetchInquiries = async () => {
        setLoading(true);
        try {
            // Build Query
            let query = supabase
                .from('inquiries')
                .select(`
                    *,
                    profiles:customer_id ( first_name, last_name, email )
                `, { count: 'exact' });

            // Apply Filters
            if (filters.status !== 'All') {
                query = query.eq('status', filters.status);
            }
            if (filters.aircraftCategory !== 'All') {
                query = query.eq('aircraft_preference', filters.aircraftCategory);
            }
            if (searchQuery) {
                // If searching by ID, we need to handle the UUID or mapped ID logic
                // For simplicity, we search customer notes or route
                // Supabase doesn't easily support fuzzy search on joined tables without views
                // So we'll limit search to local fields for now
                query = query.or(`from_airport.ilike.%${searchQuery}%,to_airport.ilike.%${searchQuery}%`);
            }

            // Pagination
            const from = (page - 1) * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;

            const { data, error, count } = await query
                .order('created_at', { ascending: false })
                .range(from, to);

            if (error) throw error;

            // Transform Data
            if (data) {
                const mapped: AdminInquiryView[] = data.map((item: any) => ({
                    id: item.id,
                    maskedId: maskId(item.id),
                    customerName: item.profiles ? `${item.profiles.first_name || ''} ${item.profiles.last_name || ''}`.trim() || 'Guest' : 'Unknown',
                    customerEmail: item.profiles?.email,
                    route: `${item.from_airport} -> ${item.to_airport}`,
                    origin: item.from_airport,
                    destination: item.to_airport,
                    date: new Date(item.departure_datetime).toLocaleDateString(),
                    pax: item.passengers,
                    status: item.status,
                    priority: 'Normal', // Default unless logic exists
                    quoteCount: 0, // Need separate count query or assumption
                    urgency: 'Medium',
                    aircraftPreference: item.aircraft_preference,
                    tripType: item.route_type,
                    created_at: item.created_at
                }));
                setInquiries(mapped);
                setTotalCount(count || 0);
            }
        } catch (err) {
            console.error('Error fetching inquiries:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInquiries();
    }, [page, filters, searchQuery]); // Re-fetch on dependencies

    // --- Render ---
    return (
        <div className="space-y-6 animate-fade-in pb-12">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <SectionHeader
                    title="Flight Requests"
                    subtitle={`Manage ${totalCount} active charter inquiries across the network.`}
                />
                <button
                    onClick={fetchInquiries}
                    className="p-2 text-gray-400 hover:text-charcoal-900 transition-colors"
                    title="Refresh Data"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Controls */}
            <RequestFilters
                filters={filters}
                onChange={handleFilterChange}
                onSearch={setSearchQuery}
                searchQuery={searchQuery}
            />

            {/* Table Card */}
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] uppercase tracking-widest font-bold text-gray-400">
                                <th className="px-6 py-4 w-32">Request ID</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Route</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-center">Pax</th>
                                <th className="px-6 py-4">Aircraft</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Age</th>
                                <th className="px-6 py-4 w-12"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading && inquiries.length === 0 ? (
                                // Skeleton Loading
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-3 w-16 bg-gray-100 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-3 w-24 bg-gray-100 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-3 w-32 bg-gray-100 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-3 w-20 bg-gray-100 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-3 w-8 bg-gray-100 rounded mx-auto"></div></td>
                                        <td className="px-6 py-4"><div className="h-3 w-20 bg-gray-100 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-6 w-20 bg-gray-100 rounded-full"></div></td>
                                        <td className="px-6 py-4"></td>
                                        <td className="px-6 py-4"></td>
                                    </tr>
                                ))
                            ) : inquiries.length === 0 ? (
                                // No Data
                                <tr>
                                    <td colSpan={9} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-300">
                                            <Plane className="w-8 h-8 mb-3 opacity-20" />
                                            <p className="text-sm font-medium">No requests match your filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                inquiries.map((req) => (
                                    <tr
                                        key={req.id}
                                        className="group hover:bg-gold-50/5 transition-colors cursor-pointer border-l-2 border-l-transparent hover:border-l-gold-500"
                                    >
                                        {/* ID */}
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs font-bold text-gray-500 group-hover:text-gold-600 transition-colors">
                                                {req.maskedId}
                                            </span>
                                        </td>

                                        {/* Customer */}
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm font-bold text-charcoal-900 leading-tight">
                                                    {req.customerName}
                                                </p>
                                                {req.customerEmail && (
                                                    <p className="text-[10px] text-gray-400 font-medium truncate max-w-[140px]">
                                                        {req.customerEmail}
                                                    </p>
                                                )}
                                            </div>
                                        </td>

                                        {/* Route */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-sm font-bold text-charcoal-800">{req.origin}</span>
                                                </div>
                                                <ArrowUpRight className="w-3 h-3 text-gray-300 transform rotate-45" />
                                                <div className="flex flex-col items-center">
                                                    <span className="text-sm font-bold text-charcoal-800">{req.destination}</span>
                                                </div>
                                            </div>
                                            {req.tripType === 'Round Trip' && (
                                                <span className="text-[9px] font-bold text-blue-600 uppercase mt-0.5 block">Round Trip</span>
                                            )}
                                        </td>

                                        {/* Date */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-charcoal-600">
                                                <Calendar className="w-3 h-3 text-gold-500" />
                                                <span className="text-xs font-medium">{req.date}</span>
                                            </div>
                                        </td>

                                        {/* Pax */}
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1 bg-gray-50 rounded-md py-1 px-2 w-fit mx-auto border border-gray-100">
                                                <Users className="w-3 h-3 text-gray-400" />
                                                <span className="text-xs font-bold text-charcoal-700">{req.pax}</span>
                                            </div>
                                        </td>

                                        {/* Aircraft */}
                                        <td className="px-6 py-4">
                                            {req.aircraftPreference ? (
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 border border-gray-200 px-2 py-1 rounded-sm bg-white">
                                                    {req.aircraftPreference}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-gray-300 italic">No pref</span>
                                            )}
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            <StatusBadge status={req.status} />
                                        </td>

                                        {/* Age */}
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-[10px] font-medium text-gray-400">
                                                {formatRelativeTime(req.created_at)}
                                            </span>
                                        </td>

                                        {/* Action Icon */}
                                        <td className="px-6 py-4 text-right">
                                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gold-500 transition-colors" />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="bg-gray-50 border-t border-gray-100 px-6 py-3 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Showing {((page - 1) * PAGE_SIZE) + 1} - {Math.min(page * PAGE_SIZE, totalCount)} of {totalCount}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="p-1 rounded hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-transparent transition-all"
                        >
                            <ChevronLeft className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="text-xs font-bold text-charcoal-900 bg-white px-3 py-1 rounded border border-gray-200">
                            {page}
                        </span>
                        <button
                            disabled={page * PAGE_SIZE >= totalCount}
                            onClick={() => setPage(p => p + 1)}
                            className="p-1 rounded hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-transparent transition-all"
                        >
                            <ChevronRight className="w-4 h-4 text-gray-600" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
