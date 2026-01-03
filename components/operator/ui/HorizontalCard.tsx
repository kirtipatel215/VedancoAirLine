import React, { useState } from 'react';
import { Plane, Clock, MapPin, ChevronRight, User, FileText, Utensils, AlertCircle } from 'lucide-react';

interface HorizontalCardProps {
    data: {
        id: string;
        flightId: string;
        tailNumber: string;
        origin: string;
        destination: string;
        departureTime: string;
        status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
        pax: number;
        aircraftType: string;
    };
}

export const HorizontalCard = ({ data }: HorizontalCardProps) => {
    const [expanded, setExpanded] = useState(false);

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'confirmed': return 'text-emerald-400 border-l-4 border-emerald-500';
            case 'pending': return 'text-gold-400 border-l-4 border-gold-500';
            case 'cancelled': return 'text-red-400 border-l-4 border-red-500';
            default: return 'text-gray-400 border-l-4 border-gray-500';
        }
    };

    return (
        <div
            className={`group bg-charcoal-900/50 hover:bg-charcoal-800 border border-white/5 rounded-lg mb-3 transition-all duration-300 overflow-hidden ${expanded ? 'shadow-2xl shadow-black/50 ring-1 ring-gold-500/30' : 'hover:shadow-lg hover:border-white/10'}`}
        >
            {/* Main Bar (80px height) */}
            <div
                className={`flex items-center justify-between p-5 cursor-pointer relative ${getStatusColor(data.status)}`}
                onClick={() => setExpanded(!expanded)}
            >
                {/* Left Indicator Gradient Fade */}
                <div className={`absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-current/10 to-transparent pointer-events-none`}></div>

                <div className="flex items-center gap-8 relative z-10 w-full">

                    {/* Flight ID & Tail */}
                    <div className="min-w-[120px]">
                        <h4 className="text-white font-serif font-bold text-lg tracking-wide">{data.flightId}</h4>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold font-sans">{data.tailNumber}</p>
                    </div>

                    {/* Route */}
                    <div className="flex items-center gap-4 flex-1">
                        <div className="text-center">
                            <span className="text-2xl font-black text-white/90 font-sans block">{data.origin}</span>
                            <span className="text-[9px] text-gray-500 uppercase tracking-widest">Dep</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center px-4">
                            <div className="flex items-center gap-2 text-[10px] text-gold-500 uppercase tracking-widest mb-1 font-bold">
                                <Clock className="w-3 h-3" /> {data.departureTime}
                            </div>
                            <div className="w-full h-[1px] bg-white/10 relative">
                                <Plane className="w-3 h-3 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90" />
                            </div>
                            <div className="text-[9px] text-gray-600 mt-1">{data.aircraftType}</div>
                        </div>
                        <div className="text-center">
                            <span className="text-2xl font-black text-white/90 font-sans block">{data.destination}</span>
                            <span className="text-[9px] text-gray-500 uppercase tracking-widest">Arr</span>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className="min-w-[100px] text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold bg-white/5 ${getStatusColor(data.status).split(' ')[0]}`}>
                            {data.status}
                        </span>
                    </div>

                    {/* Expand Icon */}
                    <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center transition-transform duration-300 ${expanded ? 'rotate-90 bg-gold-500 text-charcoal-900' : 'text-gray-400 group-hover:text-white'}`}>
                        <ChevronRight className="w-4 h-4" />
                    </div>
                </div>
            </div>

            {/* Expansion Drawer (Panel) */}
            <div className={`bg-black/30 border-t border-white/5 transition-[max-height,opacity] duration-300 ease-in-out ${expanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-6 grid grid-cols-3 gap-8 text-sm">
                    {/* Column 1: Passenger Manifest */}
                    <div className="col-span-1 border-r border-white/5 pr-6">
                        <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <User className="w-3 h-3" /> Passenger Manifest ({data.pax})
                        </h5>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-gray-300">
                                <div className="w-6 h-6 rounded-full bg-gold-500 text-charcoal-900 flex items-center justify-center text-[10px] font-bold">VP</div>
                                <span>Vladimir Putin (Lead)</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-300">
                                <div className="w-6 h-6 rounded-full bg-white/10 text-white flex items-center justify-center text-[10px] font-bold">JD</div>
                                <span>John Doe</span>
                            </li>
                        </ul>
                    </div>

                    {/* Column 2: Operational Notes */}
                    <div className="col-span-1 border-r border-white/5 pr-6">
                        <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Utensils className="w-3 h-3" /> Catering & Services
                        </h5>
                        <div className="space-y-2 text-gray-400 text-xs">
                            <p className="bg-white/5 p-2 rounded border-l-2 border-gold-500">Premium Seafood Platter requested.</p>
                            <p className="bg-white/5 p-2 rounded border-l-2 border-transparent">Ground transport required at VABB.</p>
                        </div>
                    </div>

                    {/* Column 3: Actions */}
                    <div className="col-span-1 flex flex-col gap-2 justify-center">
                        <button className="w-full py-3 bg-gold-500 hover:bg-gold-400 text-charcoal-900 font-bold uppercase tracking-widest text-xs rounded transition-colors shadow-lg shadow-gold-500/20">
                            Download Flight Briefing
                        </button>
                        <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-widest text-xs rounded transition-colors border border-white/10 flex items-center justify-center gap-2">
                            <AlertCircle className="w-3 h-3" /> Report Issue
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
