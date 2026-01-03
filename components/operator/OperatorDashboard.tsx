import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard, FileText, Plane, Send, DollarSign, FileCheck,
    Settings, LogOut, Menu, X, Bell, ShieldAlert, CheckCircle, ChevronRight, Users, Search, User, Loader2, AlertTriangle
} from 'lucide-react';
import { LogoIcon } from '../Logo.tsx';
import { OpOverview } from './views/OpOverview.tsx';
import { OpRequests } from './views/OpRequests.tsx';
import { OpQuotes } from './views/OpQuotes.tsx';
import { OpFleet } from './views/OpFleet.tsx';
import { OpFlights } from './views/OpFlights.tsx';
import { OpFinance } from './views/OpFinance.tsx';
import { OpDocuments } from './views/OpDocuments.tsx';
import { OpSettings } from './views/OpSettings.tsx';
import { OpCustomers } from './views/OpCustomers.tsx';
import { OperatorErrorBoundary, LoadingSpinner } from './ui/ErrorBoundary.tsx';
import {
    requireOperator,
    OperatorNotApprovedError,
    OperatorNotFoundError,
    NotAuthenticatedError,
    formatOperatorError,
    type Operator
} from './OperatorGuards.ts';

// --- Verification Pending Screen (Kept distinct or can be styled light too? Keeping dark for high contrast alert for now, or switching to light?) 
// User asked for "Exact same design", usually implies the main dashboard. I will switch pending to light for consistency or keep it as a distinct "locked" state. 
// Let's make it clean light to match the new brand.

const VerificationPending = ({ onLogout }: { onLogout: () => void }) => (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
        <div className="bg-white max-w-lg w-full rounded-3xl p-12 text-center relative z-10 border border-stone-100 shadow-xl">
            <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-8">
                <ShieldAlert className="w-10 h-10 text-amber-600" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-slate-800 mb-4">Verification Pending</h2>
            <p className="text-slate-500 mb-10 leading-relaxed text-sm">
                Your operator account is currently under review by the Vedanco Compliance Team.
                Standard due diligence (AOC check & Insurance validation) typically takes 24-48 hours.
            </p>
            <div className="space-y-4">
                <button className="w-full bg-[#0B1120] text-white font-bold py-4 rounded-xl uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl">
                    Check Status
                </button>
                <button onClick={onLogout} className="w-full text-slate-400 font-bold py-3 uppercase tracking-widest text-xs hover:text-red-500 transition-colors">
                    Sign Out
                </button>
            </div>
        </div>
    </div>
);

// --- Sidebar Component ---
const OperatorSidebar = ({ activeView, setActiveView, onLogout, mobileOpen, setMobileOpen, user }: any) => {
    const navItems = [
        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'requests', label: 'Requests', icon: Bell },
        { id: 'quotes', label: 'Quotes', icon: Send },
        { id: 'fleet', label: 'Fleet', icon: Plane },
        { id: 'flights', label: 'Bookings', icon: FileText },
        { id: 'customers', label: 'Customers', icon: Users },
        { id: 'finance', label: 'Payments', icon: DollarSign },
        { id: 'docs', label: 'Documents', icon: FileCheck },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <aside className={`
            fixed top-0 left-0 bottom-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 md:static shadow-xl md:shadow-none
            ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
            {/* Brand Header */}
            <div className="h-20 flex items-center px-8 border-b border-gray-50 flex-shrink-0 relative">
                <div className="flex items-center gap-3">
                    <LogoIcon className="w-8 h-8 text-[#0B1120]" color="text-[#0B1120]" />
                    <div className="flex flex-col">
                        <span className="font-serif font-bold tracking-widest text-lg text-[#0B1120] leading-none">VEDANCO</span>
                        <span className="text-[10px] text-amber-600 uppercase tracking-widest font-bold block mt-1">Operator</span>
                    </div>
                </div>
                <button onClick={() => setMobileOpen(false)} className="md:hidden ml-auto text-gray-400"><X className="w-5 h-5" /></button>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto px-4 py-8 space-y-2 custom-scrollbar">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 mb-4">Main Menu</div>
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => { setActiveView(item.id); setMobileOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative ${activeView === item.id
                                ? 'bg-[#0B1120] text-white shadow-lg shadow-navy-900/20'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-[#0B1120]'
                            }`}
                    >
                        <item.icon className={`w-5 h-5 ${activeView === item.id ? 'text-amber-500' : 'text-gray-400 group-hover:text-[#0B1120]'}`} />
                        <span className="tracking-wide">{item.label}</span>
                    </button>
                ))}
            </div>

            {/* User Profile Snippet */}
            <div className="p-4 border-t border-gray-50 bg-gray-50/50 m-4 rounded-2xl flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold border border-amber-200">
                        {user?.companyName?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'O'}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold text-[#0B1120] truncate">{user?.companyName || 'Operator'}</p>
                        <p className="text-xs text-green-600 truncate flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Online
                        </p>
                    </div>
                </div>
                <button
                    onClick={onLogout}
                    className="mt-3 w-full flex items-center justify-center gap-2 text-xs font-bold text-red-500 hover:bg-red-50 py-2 rounded-lg transition-colors border border-transparent hover:border-100"
                >
                    <LogOut className="w-3 h-3" /> Sign Out
                </button>
            </div>
        </aside>
    );
};

// --- Top Bar ---
const TopBar = ({ title, user, setMobileOpen }: any) => (
    <header className="h-20 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-4">
            <button
                className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                onClick={() => setMobileOpen(true)}
            >
                <Menu className="w-6 h-6" />
            </button>
            <div className="flex flex-col md:flex-row md:items-center gap-2">
                <h1 className="text-lg md:text-xl font-bold text-[#0B1120] capitalize truncate">
                    {title.replace('-', ' ')}
                </h1>
                <div className="hidden md:flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span className="text-[9px] text-emerald-700 font-bold uppercase tracking-widest">System Live</span>
                </div>
            </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
            {/* Search Trigger (Desktop) */}
            <div className="hidden lg:flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-full border border-gray-100 hover:border-amber-200 transition-colors cursor-pointer group w-64">
                <Search className="w-4 h-4 text-gray-400 group-hover:text-amber-500 transition-colors" />
                <input
                    type="text"
                    placeholder="Search operations..."
                    className="bg-transparent border-none text-xs text-gray-600 placeholder-gray-400 focus:outline-none w-full"
                />
                <span className="text-[10px] bg-white px-1.5 py-0.5 rounded text-gray-400 border border-gray-200">/</span>
            </div>

            <div className="h-8 w-[1px] bg-gray-100 mx-2 hidden md:block"></div>

            {/* Notifications */}
            <button className="relative p-2 text-gray-400 hover:text-[#0B1120] transition-colors rounded-full hover:bg-gray-100">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
        </div>
    </header>
);

// --- Main Dashboard ---
export const OperatorDashboard = ({ user, onLogout }: { user: any, onLogout: () => void }) => {
    const [activeView, setActiveView] = useState('overview');
    const [mobileOpen, setMobileOpen] = useState(false);

    // Access Control Gate
    if (!user.verified) return <VerificationPending onLogout={onLogout} />;

    const renderView = () => {
        switch (activeView) {
            case 'overview': return <OpOverview onViewChange={setActiveView} user={user} />;
            case 'requests': return <OpRequests user={user} />;
            case 'quotes': return <OpQuotes />;
            case 'fleet': return <OpFleet />;
            case 'flights': return <OpFlights />;
            case 'finance': return <OpFinance />;
            case 'docs': return <OpDocuments />;
            case 'customers': return <OpCustomers />;
            case 'settings': return <OpSettings user={user} />;
            default: return <OpOverview onViewChange={setActiveView} user={user} />;
        }
    };

    return (
        <div className="flex h-screen bg-[#F8F9FB] font-sans text-slate-900 relative selection:bg-amber-100 selection:text-amber-900">
            {/* Mobile Sidebar Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <OperatorSidebar
                activeView={activeView}
                setActiveView={setActiveView}
                onLogout={onLogout}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
                user={user}
            />

            <div className="flex-1 flex flex-col min-h-screen w-full relative overflow-hidden">
                <TopBar title={activeView} user={user} setMobileOpen={setMobileOpen} />

                <main className="flex-1 overflow-y-auto scroll-smooth p-4 md:p-8 relative">
                    <div className="max-w-[1600px] mx-auto pb-24 animate-fade-in-up">
                        {renderView()}
                    </div>
                </main>
            </div>
        </div>
    );
};

