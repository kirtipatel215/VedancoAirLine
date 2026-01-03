
import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Plane,
    User,
    Settings,
    LogOut,
    Plus,
    CreditCard,
    Bell,
    Search,
    ChevronDown,
    ArrowUpRight,
    Shield,
    FileText,
    FolderLock,
    ShieldCheck,
    Headphones,
    Globe,
    Menu,
    X
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { SecureApiService } from './dashboard/service';
import { LogoIcon } from './Logo';

import { Overview } from './dashboard/Overview';
import { Bookings } from './dashboard/Bookings';
import { Payments } from './dashboard/Payments';
import { Inquiries } from './dashboard/Inquiries';
import { Quotes } from './dashboard/Quotes';
import { Documents } from './dashboard/Documents';
import { Profile } from './dashboard/Profile';
import { KYC } from './dashboard/KYC';
import { PartnerApplication } from './dashboard/PartnerApplication';

interface DashboardProps {
    user: any;
    initialView?: string;
    onLogout: () => void;
    onBack: () => void;
    onSwitchToOperator?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, initialView = 'overview', onLogout, onBack, onSwitchToOperator }) => {
    const [activeTab, setActiveTab] = useState(initialView);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [stats, setStats] = useState({
        totalFlights: 0,
        upcomingFlights: 0,
        totalSpent: 0
    });

    useEffect(() => {
        if (initialView) setActiveTab(initialView);
    }, [initialView]);

    useEffect(() => {
        // Simulate data fetching for "rich" feel
        setTimeout(() => {
            setStats({
                totalFlights: 12,
                upcomingFlights: 2,
                totalSpent: 45200
            });
            setLoading(false);
        }, 800);
    }, []);

    // --- Navigation & Routing ---
    const navItems = [
        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'bookings', label: 'My Flights', icon: Plane },
        { id: 'inquiries', label: 'Requests', icon: Search },
        { id: 'quotes', label: 'Quotes', icon: FileText },
        { id: 'payments', label: 'Payments', icon: CreditCard },
        { id: 'documents', label: 'Documents', icon: FolderLock },
        { id: 'partner-application', label: 'Operator Portal', icon: ShieldCheck },
        { id: 'profile', label: 'Profile', icon: User },
    ];

    const renderView = () => {
        switch (activeTab) {
            case 'overview': return <Overview user={user} onNavigate={setActiveTab} />;
            case 'bookings': return <Bookings />;
            case 'inquiries': return <Inquiries />;
            case 'quotes': return <Quotes onNavigate={setActiveTab} />;
            case 'payments': return <Payments />;
            case 'documents': return <Documents />;
            case 'profile': return <Profile />;
            case 'partner-application': return <PartnerApplication user={user} onSwitchToOperator={onSwitchToOperator} />;
            default: return <Overview user={user} onNavigate={setActiveTab} />;
        }
    };

    return (
        <div className="flex h-screen bg-[#F8F9FB] font-sans text-slate-900 relative">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* --- SIDEBAR --- */}
            <aside className={`
                fixed top-0 left-0 bottom-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300 md:static
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Logo Area */}
                <div className="h-20 flex items-center px-8 border-b border-gray-50 flex-shrink-0">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={onBack}>
                        <LogoIcon className="w-8 h-8 text-[#0B1120]" color="text-[#0B1120]" />
                        <span className="font-serif font-bold tracking-widest text-lg text-[#0B1120]">VEDANCO</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-4 mb-4">Overview</div>
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                setIsSidebarOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${activeTab === item.id
                                ? 'bg-[#0B1120] text-white shadow-lg shadow-navy-900/20'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-[#0B1120]'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-amber-500' : 'text-gray-400 group-hover:text-[#0B1120]'}`} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* User Profile Snippet */}
                <div className="p-4 border-t border-gray-50 bg-gray-50/50 m-4 rounded-2xl flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold border border-amber-200">
                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold text-[#0B1120] truncate">{user?.name || 'Valued Member'}</p>
                            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
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

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 overflow-y-auto w-full relative">
                <header className="h-20 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <button
                            className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h1 className="text-lg md:text-xl font-bold text-[#0B1120] capitalize truncate">
                            {activeTab === 'overview' ? 'Dashboard Overview' : activeTab.replace('-', ' ')}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block group">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 group-focus-within:text-amber-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-gray-100 border-none rounded-full pl-10 pr-4 py-2 text-sm w-48 lg:w-64 focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition-all outline-none"
                            />
                        </div>
                        <button className="relative p-2 text-gray-400 hover:text-[#0B1120] transition-colors rounded-full hover:bg-gray-100">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                    </div>
                </header>

                <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in-up pb-24">
                    {renderView()}
                </div>
            </main>
        </div>
    );
};

