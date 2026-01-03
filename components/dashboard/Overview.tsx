import React, { useMemo, useEffect, useState } from 'react';
import {
    Search, FileText, Plane, CreditCard, Plus, ArrowRight,
    ShieldCheck, Clock, Bell, ChevronRight, TrendingUp, Loader2
} from 'lucide-react';
import { StatusBadge } from './shared.tsx';
import { SecureApiService } from './service.ts';
import { DashboardView, Booking, Quote, Inquiry } from './types.ts';

export const Overview = ({ onNavigate, user }: { onNavigate: (view: DashboardView, params?: any) => void, user: any }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<{
        inquiries: Inquiry[];
        quotes: Quote[];
        bookings: Booking[];
        balance: number;
    }>({
        inquiries: [],
        quotes: [],
        bookings: [],
        balance: 0
    });

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const [inquiries, quotes, bookings, paymentsResult] = await Promise.all([
                    SecureApiService.getInquiries(),
                    SecureApiService.getQuotes(),
                    SecureApiService.getBookings(),
                    SecureApiService.getPayments(1) // Get recent to Calc balance or just show count
                ]);

                // Calculate Balance (Mock logic for now as full ledger requires backend aggregation)
                // In production, this should be a specific 'getBalance' API call
                const balance = paymentsResult.data
                    .filter(p => p.status === 'pending')
                    .reduce((acc, curr) => acc + curr.amount, 0);

                setData({
                    inquiries: inquiries as Inquiry[],
                    quotes: (quotes as any).data || [],
                    bookings: bookings as Booking[],
                    balance
                });
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    // Calculate live stats
    const stats = useMemo(() => [
        {
            label: 'Active Missions',
            val: data.inquiries.filter(i => i.status !== 'Closed' && i.status !== 'Booked').length,
            sub: 'Inquiries Processing',
            icon: Search,
            action: 'inquiries',
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        {
            label: 'Pending Proposals',
            val: data.quotes.filter(q => q.status === 'Pending').length,
            sub: 'Awaiting Approval',
            icon: FileText,
            action: 'quotes',
            color: 'text-amber-600',
            bg: 'bg-amber-50'
        },
        {
            label: 'Upcoming Flights',
            val: data.bookings.filter(b => b.status === 'Confirmed' || b.status === 'Scheduled').length,
            sub: 'Scheduled Departures',
            icon: Plane,
            action: 'bookings',
            color: 'text-emerald-600',
            bg: 'bg-emerald-50'
        },
    ], [data]);

    const nextFlight = data.bookings.find(b => b.status === 'Confirmed' || b.status === 'Scheduled');

    // Derived recent activity from actual data
    const recentActivity = useMemo(() => {
        const activities = [];

        // Add recent quotes
        data.quotes.slice(0, 2).forEach(q => {
            activities.push({
                id: `q-${q.id}`,
                type: 'quote',
                msg: `Proposal received for ${q.aircraft_model}`,
                time: new Date(q.created_at).toLocaleDateString(),
                date: new Date(q.created_at)
            });
        });

        // Add recent inquiries
        data.inquiries.slice(0, 2).forEach(i => {
            activities.push({
                id: `i-${i.id}`,
                type: 'inquiry',
                msg: `Request sent: ${i.from_airport} -> ${i.to_airport}`,
                time: new Date(i.created_at).toLocaleDateString(),
                date: new Date(i.created_at)
            });
        });

        return activities.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 4);
    }, [data]);

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in pb-20 md:pb-10 max-w-[100vw] overflow-x-hidden">

            {/* Hero Section */}
            <div className="bg-navy-950 rounded-2xl md:rounded-3xl p-6 md:p-12 text-white relative overflow-hidden shadow-2xl group border border-white/5 mx-1">
                {/* Decorative Elements */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-gold-500/10 rounded-full blur-[80px] md:blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 md:gap-10">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_15px_rgba(52,211,153,0.6)]"></span>
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold-500">System Operational</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold mb-4 tracking-tight leading-tight">
                            Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">{user?.name.split(' ')[0]}</span>.
                        </h1>
                        <p className="text-gray-400 font-light text-base md:text-xl leading-relaxed max-w-lg">
                            Your personal flight deck is ready. Review proposals or initiate a new mission.
                        </p>
                    </div>

                    <div className="flex gap-3 w-full lg:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                        <button onClick={() => onNavigate('inquiries', { openCreate: true })} className="flex-1 lg:flex-none bg-gold-500 text-navy-950 px-6 md:px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-white transition-all shadow-lg hover:shadow-gold-500/20 whitespace-nowrap flex items-center justify-center">
                            <Plus className="w-4 h-4 mr-2" /> New Charter
                        </button>
                        <button onClick={() => onNavigate('quotes')} className="flex-1 lg:flex-none bg-navy-900 border border-white/10 text-white px-6 md:px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-navy-800 transition-all whitespace-nowrap flex items-center justify-center">
                            Proposals
                        </button>
                    </div>
                </div>
            </div>

            {/* Quick Stats - Horizontal Scroll on Mobile */}
            <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto snap-x px-1 pb-4 md:pb-0 scrollbar-hide -mx-1 md:mx-0">
                {stats.map((stat, i) => (
                    <div
                        key={i}
                        onClick={() => onNavigate(stat.action as DashboardView)}
                        className="min-w-[85vw] md:min-w-0 snap-center bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className="p-2 bg-gray-50 rounded-full hover:bg-gold-500 hover:text-white transition-colors">
                                <ChevronRight className="w-4 h-4 text-gray-400 hover:text-white" />
                            </div>
                        </div>
                        <p className="text-4xl md:text-5xl font-serif font-bold text-navy-900 mb-2 group-hover:text-gold-600 transition-colors">
                            {String(stat.val).padStart(2, '0')}
                        </p>
                        <p className="text-sm font-bold text-gray-900 mb-1">{stat.label}</p>
                        <p className="text-xs font-medium text-gray-500">{stat.sub}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 px-1">
                {/* Next Flight Card */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300 min-h-[400px]">
                    <div className="p-6 md:p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                        <div className="flex items-center gap-3">
                            <Plane className="w-5 h-5 text-gold-600" />
                            <h3 className="font-serif font-bold text-navy-900 text-lg md:text-xl">Mission Priority</h3>
                        </div>
                        <button onClick={() => onNavigate('bookings')} className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-gold-600 transition-colors flex items-center">
                            Manifest <ArrowRight className="w-3 h-3 ml-1" />
                        </button>
                    </div>

                    {nextFlight ? (
                        <div className="p-6 md:p-10 flex-1 flex flex-col justify-center">
                            {/* Flight Details UI - Same data but better spacing */}
                            <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
                                <div className="text-center md:text-left">
                                    <p className="text-2xl md:text-4xl font-serif font-bold text-navy-900">{nextFlight.origin?.split(' ')[0] || 'Origin'}</p>
                                    <p className="text-xs font-bold text-gold-600 uppercase tracking-widest mt-2 bg-gold-50 inline-block px-2 py-1 rounded">Origin</p>
                                </div>
                                <div className="flex-1 w-full md:w-auto px-4 flex flex-col items-center">
                                    <div className="w-full h-px bg-gray-200 relative mb-4">
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-2 md:p-3 rounded-full border border-gray-100 shadow-sm animate-pulse-slow">
                                            <Plane className="w-4 h-4 md:w-5 md:h-5 text-navy-900 rotate-90" />
                                        </div>
                                    </div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        {/* @ts-ignore - Booking type might be partial */}
                                        {nextFlight.duration || 'Direct'}
                                    </p>
                                </div>
                                <div className="text-center md:text-right">
                                    <p className="text-2xl md:text-4xl font-serif font-bold text-navy-900">{nextFlight.destination?.split(' ')[0] || 'Dest'}</p>
                                    <p className="text-xs font-bold text-gold-600 uppercase tracking-widest mt-2 bg-gold-50 inline-block px-2 py-1 rounded">Destination</p>
                                </div>
                            </div>
                            <div className="bg-navy-950 text-white rounded-xl p-4 md:p-6 flex flex-col md:flex-row justify-between items-center gap-4 border border-navy-800 shadow-lg">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-white/10 rounded-lg">
                                        <Clock className="w-5 h-5 text-gold-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Departure</p>
                                        <p className="text-sm md:text-lg font-bold text-white tracking-wide">{new Date(nextFlight.departure_datetime).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                    </div>
                                </div>
                                <StatusBadge status={nextFlight.status} />
                            </div>
                        </div>
                    ) : (
                        <div className="p-8 md:p-16 text-center flex-1 flex flex-col items-center justify-center bg-gray-50/10">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100 shadow-inner">
                                <Plane className="w-8 h-8 md:w-10 md:h-10 text-gray-300" />
                            </div>
                            <p className="text-navy-900 font-bold text-lg">No active missions</p>
                            <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto leading-relaxed">Your flight schedule is clear. Ready to plan your next journey?</p>
                            <button onClick={() => onNavigate('inquiries', { openCreate: true })} className="mt-6 text-xs font-bold text-gold-600 uppercase tracking-widest hover:text-navy-900 transition-colors border-b border-gold-200 pb-0.5 hover:border-navy-900">
                                Start New Request
                            </button>
                        </div>
                    )}
                </div>

                {/* Ledger & Activity Column */}
                <div className="flex flex-col gap-6 md:gap-8">
                    {/* Ledger */}
                    <div className="bg-navy-900 rounded-2xl p-6 md:p-8 text-white shadow-xl flex flex-col justify-between relative overflow-hidden group min-h-[220px]">
                        <div className="absolute top-0 right-0 p-16 bg-gold-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-gold-500/20 transition-colors duration-700"></div>
                        <div className="relative z-10 flex justify-between items-start">
                            <div>
                                <h3 className="font-serif font-bold text-xl md:text-2xl mb-1">Ledger</h3>
                                <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Current Balance</p>
                            </div>
                            <div className="p-2 bg-white/5 rounded-lg">
                                <CreditCard className="w-5 h-5 text-gold-500" />
                            </div>
                        </div>

                        <div className="my-6 relative z-10">
                            <p className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-white">
                                ${data.balance.toLocaleString()}
                            </p>
                            <p className="text-gold-500 text-xs mt-2 font-bold uppercase tracking-widest flex items-center">
                                <TrendingUp className="w-3 h-3 mr-1" /> Pending Settlement
                            </p>
                        </div>

                        <button onClick={() => onNavigate('payments')} className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-bold uppercase tracking-widest text-xs transition-colors backdrop-blur-sm border border-white/5">
                            View Statements
                        </button>
                    </div>

                    {/* Recent Activity / Notifications */}
                    <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm flex-1">
                        <h3 className="text-sm font-bold text-navy-900 uppercase tracking-widest mb-4 flex items-center">
                            <Bell className="w-4 h-4 mr-2 text-gold-500" /> recent updates
                        </h3>
                        <div className="space-y-4">
                            {recentActivity.length > 0 ? recentActivity.map((act) => (
                                <div key={act.id} className="flex gap-3 items-start p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                                    <div className="w-2 h-2 rounded-full bg-gold-500 mt-1.5 shrink-0"></div>
                                    <div>
                                        <p className="text-sm font-medium text-navy-900 leading-snug">{act.msg}</p>
                                        <p className="text-xs text-gray-400 mt-1">{act.time}</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-gray-400 italic">No recent activity.</p>
                            )}
                            <div className="pt-2">
                                <button className="text-xs text-gray-400 hover:text-navy-900 font-bold transition-colors">View All Logs</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
