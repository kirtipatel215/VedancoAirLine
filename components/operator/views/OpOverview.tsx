import React, { useEffect, useState } from 'react';
import { Bell, Send, Plane, DollarSign, ArrowRight, AlertTriangle, TrendingUp, Calendar, ChevronDown, Download, Clock } from 'lucide-react';
import { OperatorService } from '../OperatorService.ts';
import { motion } from 'framer-motion';

// Mock Data for the Chart if real data isn't full 12-months yet
const revenueData = [
    { month: 'Jan', value: 45000 },
    { month: 'Feb', value: 52000 },
    { month: 'Mar', value: 48000 },
    { month: 'Apr', value: 61000 },
    { month: 'May', value: 55000 },
    { month: 'Jun', value: 67000 },
    { month: 'Jul', value: 72000 },
    { month: 'Aug', value: 84000 },
    { month: 'Sep', value: 79000 },
    { month: 'Oct', value: 88000 },
    { month: 'Nov', value: 92000 },
    { month: 'Dec', value: 105000 },
];

const RevenueChart = () => {
    const maxVal = Math.max(...revenueData.map(d => d.value)) * 1.2;
    const points = revenueData.map((d, i) => {
        const x = (i / (revenueData.length - 1)) * 100;
        const y = 100 - (d.value / maxVal) * 100;
        return `${x},${y}`;
    }).join(' ');

    const areaPath = `M0,100 L0,${100 - (revenueData[0].value / maxVal) * 100} ${points} L100,${100 - (revenueData[revenueData.length - 1].value / maxVal) * 100} L100,100 Z`;

    return (
        <div className="w-full h-64 relative pt-6">
            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible preserve-3d">
                {/* Grid Lines */}
                {[0, 25, 50, 75, 100].map((y) => (
                    <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="2" />
                ))}

                {/* Area Gradient */}
                <defs>
                    <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Chart Area */}
                <motion.path
                    d={areaPath}
                    fill="url(#chartGradient)"
                    initial={{ opacity: 0, pathLength: 0 }}
                    animate={{ opacity: 1, pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />

                {/* Chart Line */}
                <motion.polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="1.5"
                    points={points}
                    vectorEffect="non-scaling-stroke"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />

                {/* Hover Points (Simplified for SVG) */}
                {revenueData.map((d, i) => (
                    <circle
                        key={i}
                        cx={(i / (revenueData.length - 1)) * 100}
                        cy={100 - (d.value / maxVal) * 100}
                        r="1.5"
                        className="fill-emerald-600 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                    >
                        <title>{d.month}: ${d.value.toLocaleString()}</title>
                    </circle>
                ))}
            </svg>

            {/* X-Axis Labels */}
            <div className="flex justify-between mt-2 text-[10px] text-gray-400 font-medium uppercase tracking-wider px-1">
                {revenueData.filter((_, i) => i % 2 === 0).map((d) => ( // Show every other month for cleanliness
                    <span key={d.month}>{d.month}</span>
                ))}
            </div>
        </div>
    );
};

export const OpOverview = ({ onViewChange, user }: any) => {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        OperatorService.getStats().then(setStats);
    }, []);

    if (!stats) return <div className="p-20 text-center"><div className="animate-spin w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full mx-auto"></div></div>;

    const kpi = [
        { label: 'New Requests', val: stats.newRequests, sub: 'Pending Review', icon: Bell, color: 'text-blue-600', bg: 'bg-blue-50', link: 'requests' },
        { label: 'Active Quotes', val: stats.submittedQuotes, sub: 'Awaiting Acceptance', icon: Send, color: 'text-amber-600', bg: 'bg-amber-50', link: 'quotes' },
        { label: 'Upcoming Flights', val: stats.upcomingFlights, sub: 'Scheduled Departures', icon: Plane, color: 'text-emerald-600', bg: 'bg-emerald-50', link: 'flights' },
        { label: 'Pending Payout', val: `$${(stats.earningsPending / 1000).toFixed(1)}k`, sub: 'Estimated Earnings', icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50', link: 'finance' },
    ];

    return (
        <div className="space-y-8 animate-fade-in">

            {/* Hero Section */}
            <div className="bg-[#0B1120] rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl group border border-white/5">
                {/* Decorative Elements */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 md:gap-10">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_15px_rgba(52,211,153,0.6)]"></span>
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold-500">System Live</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4 tracking-tight leading-tight">
                            Operator Dashboard, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">{user?.companyName?.split(' ')[0] || 'Partner'}</span>.
                        </h1>
                        <p className="text-gray-400 font-light text-base md:text-lg leading-relaxed max-w-lg">
                            Financial overview and operational status at a glance.
                        </p>
                    </div>

                    <div className="flex gap-3 w-full lg:w-auto">
                        <button onClick={() => onViewChange('quotes')} className="flex-1 lg:flex-none bg-gold-500 text-[#0B1120] px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-white transition-all shadow-lg hover:shadow-gold-500/20 whitespace-nowrap flex items-center justify-center">
                            New Quote
                        </button>
                    </div>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpi.map((k, i) => (
                    <div
                        key={i}
                        onClick={() => onViewChange(k.link)}
                        className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${k.bg} ${k.color} group-hover:scale-110 transition-transform duration-300`}>
                                <k.icon className="w-6 h-6" />
                            </div>
                            <div className="p-2 bg-gray-50 rounded-full hover:bg-gold-500 hover:text-white transition-colors">
                                <ArrowRight className="w-4 h-4 text-gray-400 hover:text-white" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-serif font-bold text-slate-800 mb-1 group-hover:text-gold-600 transition-colors">{k.val}</h3>
                        <p className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-1">{k.label}</p>
                        <p className="text-[10px] font-medium text-slate-400">{k.sub}</p>
                    </div>
                ))}
            </div>

            {/* Main Content Grid: Financial Chart & Alerts (Removed Map, Removed redundancy) */}
            <div className="grid grid-cols-12 gap-8">

                {/* Left: Financial Performance Chart */}
                <div className="col-span-12 lg:col-span-8 bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden p-8 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-lg font-serif font-bold text-slate-800 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-emerald-600" /> Revenue Analytics
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">Gross earnings over the last 12 months</p>
                        </div>
                        <div className="flex bg-stone-50 rounded-lg p-1">
                            <button className="px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white text-slate-800 shadow-sm">Year</button>
                            <button className="px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600">Month</button>
                        </div>
                    </div>

                    {/* The Chart Component */}
                    <RevenueChart />

                    <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-stone-100">
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Revenue</p>
                            <p className="text-2xl font-serif font-bold text-slate-800">$1.2M</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Avg. Monthly</p>
                            <p className="text-2xl font-serif font-bold text-slate-800">$98.5k</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">YTD Growth</p>
                            <p className="text-2xl font-serif font-bold text-emerald-600">+18%</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Key Alerts (Cleaned up) */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm hover:shadow-lg transition-shadow relative overflow-hidden h-full">
                        <h3 className="text-sm font-serif font-bold text-slate-800 mb-6 flex items-center justify-between">
                            <span className="flex items-center"><AlertTriangle className="w-4 h-4 mr-2 text-red-500" /> Action Required</span>
                            <span className="text-[10px] bg-red-50 text-red-600 px-2 py-1 rounded-full">{2}</span>
                        </h3>

                        <div className="space-y-4">
                            {/* Alert Item 1 */}
                            <div className="p-4 rounded-xl bg-red-50 border border-red-100 hover:bg-red-100 transition-colors cursor-pointer group/alert">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest group-hover/alert:text-red-700">Compliance</p>
                                    <Clock className="w-3 h-3 text-red-400" />
                                </div>
                                <p className="text-xs text-slate-700 font-medium leading-relaxed">Insurance for <span className="font-bold">VT-RSA</span> expires in 5 days.</p>
                                <div className="mt-3 flex items-center gap-2">
                                    <button onClick={() => onViewChange('fleet')} className="text-[10px] font-bold text-red-700 bg-red-200/50 px-2 py-1 rounded hover:bg-white/50 transition-colors">
                                        Update Now
                                    </button>
                                </div>
                            </div>

                            {/* Alert Item 2 */}
                            <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 hover:bg-amber-100 transition-colors cursor-pointer group/alert">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest group-hover/alert:text-amber-700">Expiring Quote</p>
                                    <Clock className="w-3 h-3 text-amber-400" />
                                </div>
                                <p className="text-xs text-slate-700 font-medium leading-relaxed">Proposal for <span className="font-bold">INQ-8821</span> expires in 2h.</p>
                                <div className="mt-3 flex items-center gap-2">
                                    <button onClick={() => onViewChange('quotes')} className="text-[10px] font-bold text-amber-700 bg-amber-200/50 px-2 py-1 rounded hover:bg-white/50 transition-colors">
                                        Extend
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="absolute bottom-6 left-6 right-6">
                            <button className="w-full py-3 bg-stone-50 hover:bg-stone-100 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors border border-stone-200 flex items-center justify-center gap-2">
                                View All Alerts <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
