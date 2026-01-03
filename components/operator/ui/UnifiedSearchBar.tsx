import React, { useState } from 'react';
import { Search, Filter, Calendar, Plane, ChevronDown } from 'lucide-react';

interface FilterOption {
    label: string;
    value: string;
}

interface UnifiedSearchBarProps {
    onSearch: (term: string) => void;
    onFilterChange: (type: string, value: string) => void;
}

export const UnifiedSearchBar = ({ onSearch, onFilterChange }: UnifiedSearchBarProps) => {
    const [activeFilter, setActiveFilter] = useState<string | null>(null);

    const toggleFilter = (filter: string) => {
        setActiveFilter(activeFilter === filter ? null : filter);
    };

    return (
        <div className="glass-panel rounded-lg p-2 mb-8 flex flex-col md:flex-row gap-4 items-center animate-fade-in relative z-30">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by Flight ID, Tail Number, or Client..."
                    className="glass-input w-full pl-12 pr-4 py-3 rounded-md text-sm font-medium focus:ring-1 focus:ring-gold-500 transition-all placeholder-gray-500"
                    onChange={(e) => onSearch(e.target.value)}
                />
            </div>

            {/* Filters */}
            <div className="flex gap-2 w-full md:w-auto">
                <div className="relative group">
                    <button
                        onClick={() => toggleFilter('date')}
                        className={`px-4 py-3 rounded-md text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${activeFilter === 'date' ? 'bg-gold-500 text-charcoal-900 shadow-lg shadow-gold-500/20' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                    >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Date Range</span>
                        <ChevronDown className={`w-3 h-3 transition-transform ${activeFilter === 'date' ? 'rotate-180' : ''}`} />
                    </button>
                    {/* Dropdown (Mock) */}
                    {activeFilter === 'date' && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-charcoal-900 border border-gray-800 rounded-lg shadow-2xl p-2 z-40">
                            <div className="text-gray-400 text-xs px-2 py-1">Select Range</div>
                            <button className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/5 rounded">Today</button>
                            <button className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/5 rounded">Next 7 Days</button>
                            <button className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/5 rounded">This Month</button>
                        </div>
                    )}
                </div>

                <div className="relative group">
                    <button
                        onClick={() => toggleFilter('status')}
                        className={`px-4 py-3 rounded-md text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${activeFilter === 'status' ? 'bg-gold-500 text-charcoal-900 shadow-lg shadow-gold-500/20' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                    >
                        <Filter className="w-3.5 h-3.5" />
                        <span>Status</span>
                        <ChevronDown className={`w-3 h-3 transition-transform ${activeFilter === 'status' ? 'rotate-180' : ''}`} />
                    </button>
                    {activeFilter === 'status' && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-charcoal-900 border border-gray-800 rounded-lg shadow-2xl p-2 z-40">
                            <div className="text-gray-400 text-xs px-2 py-1">Filter by Status</div>
                            <button className="w-full text-left px-3 py-2 text-sm text-emerald-400 hover:bg-white/5 rounded">Confirmed</button>
                            <button className="w-full text-left px-3 py-2 text-sm text-gold-400 hover:bg-white/5 rounded">Pending</button>
                            <button className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:bg-white/5 rounded">Completed</button>
                        </div>
                    )}
                </div>

                <div className="relative group">
                    <button
                        onClick={() => toggleFilter('aircraft')}
                        className={`px-4 py-3 rounded-md text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all ${activeFilter === 'aircraft' ? 'bg-gold-500 text-charcoal-900 shadow-lg shadow-gold-500/20' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                    >
                        <Plane className="w-3.5 h-3.5" />
                        <span>Aircraft</span>
                        <ChevronDown className={`w-3 h-3 transition-transform ${activeFilter === 'aircraft' ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>
        </div>
    );
};
