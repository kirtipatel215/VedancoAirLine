import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Loader2, MapPin, Search, Filter, ChevronDown, ChevronLeft, ChevronRight, Activity, Download, Plus } from 'lucide-react';
import { PaginationMeta } from './types';

// --- Types ---

export interface Column<T> {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    className?: string;
}

export interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    loading?: boolean;
    pagination?: {
        currentPage: number;
        totalPages: number;
        onPageChange: (page: number) => void;
    };
    onRowClick?: (item: T) => void;
    emptyMessage?: string;
}

export interface PageTemplateProps {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
    onSearch?: (query: string) => void;
    onFilter?: () => void;
    filterLabel?: string;
    children: React.ReactNode;
}

// --- Enterprise Input Component ---
export const LocationAutocomplete = ({ label, icon: Icon, placeholder, value, onChange, error, required }: any) => {
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            }, (err) => console.log("Geolocation error", err));
        }
    }, []);

    useEffect(() => {
        function handleClickOutside(event: any) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        let active = true;
        if (!value || value.length < 3) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: `List 5 distinct airports or major aviation cities matching the search term "${value}".Output descriptive names including city and airport code if available(e.g., "London Heathrow (LHR)").`,
                    config: {
                        tools: [{ googleMaps: {} }],
                        ...(userLocation ? {
                            toolConfig: {
                                retrievalConfig: {
                                    latLng: {
                                        latitude: userLocation.lat,
                                        longitude: userLocation.lng
                                    }
                                }
                            }
                        } : {})
                    }
                });

                if (!active) return;

                const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
                const validSuggestions = chunks
                    .filter((c: any) => c.maps)
                    .map((c: any) => ({ title: c.maps.title }));

                const unique = validSuggestions.filter((v: any, i: number, a: any[]) => a.findIndex((t: any) => (t.title === v.title)) === i);
                setSuggestions(unique);
                if (unique.length > 0) setShowSuggestions(true);
            } catch (e) {
                console.error("Maps error", e);
            } finally {
                if (active) setLoading(false);
            }
        }, 500);

        return () => { active = false; clearTimeout(timer); };
    }, [value, userLocation]);

    return (
        <div className="relative w-full group" ref={wrapperRef}>
            <label className="text-[10px] font-bold text-navy-900 uppercase tracking-widest mb-2 flex items-center transition-colors group-focus-within:text-gold-600">
                {Icon && <Icon className="w-3 h-3 mr-1.5 opacity-50 group-focus-within:opacity-100 group-focus-within:text-gold-600 transition-all" />} {label} {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={`w-full bg-white border border-gray-300 rounded-xl px-4 py-4 text-sm text-navy-900 font-bold outline-none transition-all placeholder-gray-500 focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 focus:shadow-sm ${error ? 'border-red-300 bg-red-50/10' : ''}`}
                    autoComplete="off"
                />
                {loading && <div className="absolute right-3 top-1/2 -translate-y-1/2"><Loader2 className="w-5 h-5 animate-spin text-gold-600" /></div>}
            </div>
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 top-full mt-2 w-full bg-white border border-gray-100 shadow-2xl z-50 rounded-xl overflow-hidden animate-fade-in-up">
                    {suggestions.map((s, idx) => (
                        <div key={idx} onClick={() => { onChange(s.title); setShowSuggestions(false); }} className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm text-navy-800 font-medium border-b border-gray-50 last:border-0 flex items-center justify-between group/item transition-colors">
                            <span>{s.title}</span>
                            <MapPin className="w-3.5 h-3.5 text-gray-300 group-hover/item:text-gold-500 transition-colors" />
                        </div>
                    ))}
                </div>
            )}
            {error && <p className="text-[10px] text-red-600 font-bold mt-1.5 tracking-wide flex items-center"><span className="w-1 h-1 bg-red-500 rounded-full mr-1.5"></span>{error}</p>}
        </div>
    );
};

// --- Premium Toolbar ---
export const SearchFilterToolbar = ({ onSearch, onFilter, filterOptions, placeholder }: any) => (
    <div className="flex flex-col md:flex-row gap-4 mb-10 items-center bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
                type="text"
                placeholder={placeholder || "Search database..."}
                className="w-full bg-transparent border-none pl-12 pr-4 py-3 text-sm focus:ring-0 outline-none text-navy-900 placeholder-gray-400 font-medium"
                onChange={(e) => onSearch(e.target.value)}
            />
        </div>
        <div className="w-full h-px md:h-10 md:w-px bg-gray-100"></div>
        <div className="w-full md:w-auto relative min-w-[200px]">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
                className="w-full bg-gray-50 border-none rounded-xl pl-12 pr-10 py-3 text-xs font-bold uppercase tracking-wide text-navy-700 focus:ring-0 cursor-pointer outline-none hover:bg-gray-100 transition-colors appearance-none"
                onChange={(e) => onFilter(e.target.value)}
            >
                <option value="All">All Status</option>
                {filterOptions && filterOptions.map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>
    </div>
);

// --- Editorial Section Header ---
export const SectionHeader = ({ title, subtitle, action }: any) => (
    <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-12 gap-6">
        <div>
            <h2 className="text-4xl font-serif font-bold text-navy-900 tracking-tight">{title}</h2>
            <div className="h-1 w-12 bg-gold-500 mt-4 mb-4"></div>
            <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-lg">{subtitle}</p>
        </div>
        {action && (
            <div className="flex-shrink-0">
                {action}
            </div>
        )}
    </div>
);

// --- "Signal Light" Status Badge ---
export const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
        'Booked': 'bg-emerald-50 text-emerald-700 border-emerald-100',
        'Confirmed': 'bg-emerald-50 text-emerald-700 border-emerald-100',
        'Paid': 'bg-emerald-50 text-emerald-700 border-emerald-100',
        'Approved': 'bg-emerald-50 text-emerald-700 border-emerald-100',
        'Accepted': 'bg-emerald-50 text-emerald-700 border-emerald-100',
        'Active': 'bg-emerald-50 text-emerald-700 border-emerald-100',
        'Verified': 'bg-emerald-50 text-emerald-700 border-emerald-100',
        'Settled': 'bg-emerald-50 text-emerald-700 border-emerald-100',
        'In-Flight': 'bg-navy-50 text-navy-700 border-navy-100 animate-pulse',
        'Processing': 'bg-navy-50 text-navy-700 border-navy-100',
        'In Progress': 'bg-navy-50 text-navy-700 border-navy-100',
        'Submitted': 'bg-navy-50 text-navy-700 border-navy-100',
        'Pending': 'bg-amber-50 text-amber-700 border-amber-100',
        'Scheduled': 'bg-amber-50 text-amber-700 border-amber-100',
        'Quoted': 'bg-amber-50 text-amber-700 border-amber-100',
        'Sent': 'bg-amber-50 text-amber-700 border-amber-100',
        'Under Review': 'bg-amber-50 text-amber-700 border-amber-100',
        'Correction Required': 'bg-amber-100 text-amber-800 border-amber-200',
        'Expired': 'bg-rose-50 text-rose-700 border-rose-100',
        'Failed': 'bg-rose-50 text-rose-700 border-rose-100',
        'Cancelled': 'bg-rose-50 text-rose-700 border-rose-100',
        'Rejected': 'bg-rose-50 text-rose-700 border-rose-100',
        'Suspended': 'bg-rose-50 text-rose-700 border-rose-100',
        'New': 'bg-gray-50 text-gray-700 border-gray-200',
        'Open': 'bg-gray-50 text-gray-700 border-gray-200',
        'Draft': 'bg-gray-50 text-gray-600 border-gray-200',
        'Completed': 'bg-gray-100 text-gray-600 border-gray-200',
        'Closed': 'bg-gray-100 text-gray-500 border-gray-200',
    };

    const style = styles[status] || styles['Pending'];

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${style}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 opacity-60"></span>
            {status}
        </span>
    );
};

export const Pagination = ({ meta, onPageChange, loading }: { meta: PaginationMeta | null, onPageChange: (p: number) => void, loading: boolean }) => {
    if (!meta || meta.totalPages <= 1) return null;
    return (
        <div className="flex items-center justify-between py-8 border-t border-gray-100 mt-8">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Viewing {meta.currentPage} of {meta.totalPages}
            </p>
            <div className="flex gap-3">
                <button disabled={loading || !meta.hasPrev} onClick={() => onPageChange(meta.currentPage - 1)} className="p-2.5 bg-white border border-gray-200 rounded-lg hover:bg-navy-900 hover:text-white text-gray-500 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-500 transition-all shadow-sm"><ChevronLeft className="w-4 h-4" /></button>
                <button disabled={loading || !meta.hasNext} onClick={() => onPageChange(meta.currentPage + 1)} className="p-2.5 bg-white border border-gray-200 rounded-lg hover:bg-navy-900 hover:text-white text-gray-500 disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-500 transition-all shadow-sm"><ChevronRight className="w-4 h-4" /></button>
            </div>
        </div>
    );
};

// --- New Components for Standardized Pages ---

export const PageTemplate: React.FC<PageTemplateProps> = ({
    title,
    subtitle,
    action,
    onSearch,
    onFilter,
    filterLabel = "Filter",
    children
}) => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#0B1120]">{title}</h2>
                    {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
                </div>
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                    {onSearch && (
                        <div className="relative group w-full md:w-auto">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search..."
                                onChange={(e) => onSearch(e.target.value)}
                                className="bg-white border border-gray-200 rounded-full pl-10 pr-4 py-2 text-sm w-full md:w-64 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all outline-none shadow-sm"
                            />
                        </div>
                    )}
                    <div className="flex gap-3 flex-wrap items-center">
                        {onFilter && (
                            <button
                                onClick={onFilter}
                                className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-[#0B1120] hover:border-gray-300 transition-all shadow-sm whitespace-nowrap"
                            >
                                <Filter className="w-4 h-4" />
                                {filterLabel}
                            </button>
                        )}
                        {action}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden min-h-[600px]">
                {children}
            </div>
        </div>
    );
};

export const DataTable = <T extends { id: string | number }>({
    columns,
    data,
    loading,
    pagination,
    onRowClick,
    emptyMessage = "No records found."
}: DataTableProps<T>) => {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 text-sm">Loading data...</p>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-6 h-6 text-gray-300" />
                </div>
                <h3 className="text-gray-900 font-medium mb-1">No results found</h3>
                <p className="text-gray-500 text-sm max-w-xs">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    className={`py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider ${col.className || ''}`}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {data.map((row) => (
                            <tr
                                key={row.id}
                                onClick={() => onRowClick && onRowClick(row)}
                                className={`group hover:bg-gray-50/80 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                            >
                                {columns.map((col, idx) => (
                                    <td key={idx} className="py-4 px-6 text-sm text-[#0B1120]">
                                        {typeof col.accessor === 'function'
                                            ? col.accessor(row)
                                            : (row[col.accessor] as React.ReactNode)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-between bg-white">
                    <p className="text-sm text-gray-500">
                        Page <span className="font-bold text-[#0B1120]">{pagination.currentPage}</span> of {pagination.totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage === 1}
                            className="p-2 rounded-lg border border-gray-100 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage === pagination.totalPages}
                            className="p-2 rounded-lg border border-gray-100 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

