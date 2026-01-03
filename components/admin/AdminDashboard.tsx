
import React, { useState } from 'react';
import { 
    LayoutDashboard, Users, FileText, Plane, CreditCard, ShieldAlert, 
    FileSearch, Settings, LogOut, Bell, Menu, X, Search, CheckCircle, XCircle, Eye, 
    DollarSign, Briefcase, FileCheck, Receipt, Landmark, History, Clock, Download
} from 'lucide-react';
import { LogoIcon } from '../Logo.tsx';

// Import Views
import { DashboardOverview } from './views/DashboardOverview.tsx';
import { OperatorApplications } from './views/OperatorApplications.tsx';
import { OperatorsList } from './views/OperatorsList.tsx';
import { InquiryList } from './views/InquiryList.tsx';
import { QuotesList } from './views/QuotesList.tsx';
import { BookingsList } from './views/BookingsList.tsx';
import { FinanceModule } from './views/FinanceModule.tsx';
import { ComplianceList } from './views/ComplianceList.tsx';
import { AuditLogs } from './views/AuditLogs.tsx';
import { SettingsView } from './views/SettingsView.tsx';
import { UsersList } from './views/UsersList.tsx'; // Import new view

// --- Shared Components ---

const AdminSidebar = ({ activeView, setActiveView, onLogout, user, mobileOpen, setMobileOpen }: any) => {
    const navItems = [
        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'users', label: 'Customer Users', icon: Users }, // Added Users
        { id: 'applications', label: 'Op Applications', icon: FileCheck },
        { id: 'operators', label: 'Operators', icon: Briefcase },
        { id: 'inquiries', label: 'Cust Inquiries', icon: FileText },
        { id: 'quotes', label: 'Quotes', icon: FileSearch },
        { id: 'bookings', label: 'Bookings', icon: Plane },
        { id: 'payments', label: 'Payments', icon: CreditCard },
        { id: 'compliance', label: 'Compliance (KYC)', icon: ShieldAlert },
        { id: 'invoices', label: 'Invoices', icon: Receipt },
        { id: 'payouts', label: 'Payouts', icon: Landmark },
        { id: 'audit', label: 'Audit Logs', icon: History },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-charcoal-950 border-r border-white/5 transform transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
            <div className="h-full flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <LogoIcon className="w-8 h-8" color="text-gold-500" />
                        <div>
                            <span className="text-white font-serif font-bold tracking-widest text-lg block">VEDANCO</span>
                            <span className="text-[9px] text-gold-500 uppercase tracking-[0.2em] font-bold block">Admin</span>
                        </div>
                    </div>
                    <button onClick={() => setMobileOpen(false)} className="md:hidden text-gray-400"><X className="w-5 h-5" /></button>
                </div>

                {/* Nav */}
                <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
                    <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Modules</p>
                    {navItems.map(item => (
                        <button 
                            key={item.id}
                            onClick={() => { setActiveView(item.id); setMobileOpen(false); }}
                            className={`w-full flex items-center px-4 py-3 rounded-md text-xs font-bold uppercase tracking-widest transition-all ${activeView === item.id ? 'bg-gold-500 text-charcoal-950 shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <item.icon className="w-4 h-4 mr-3" />
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* User Footer */}
                <div className="p-4 border-t border-white/10 bg-charcoal-900">
                    <div className="flex items-center mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center text-charcoal-900 font-bold text-xs mr-3">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-white text-xs font-bold truncate">{user?.name || 'Admin User'}</p>
                            <p className="text-gray-500 text-[10px] truncate uppercase">{user?.role || 'Super Admin'}</p>
                        </div>
                    </div>
                    <button onClick={onLogout} className="w-full flex items-center justify-center text-red-400 hover:bg-white/5 py-2 rounded-md text-xs font-bold uppercase tracking-widest transition-all border border-red-500/20 hover:border-red-500">
                        <LogOut className="w-3 h-3 mr-2" /> Sign Out
                    </button>
                </div>
            </div>
        </aside>
    );
};

// --- Main Layout ---

export const AdminDashboard = ({ user, onLogout }: { user: any, onLogout: () => void }) => {
    const [activeView, setActiveView] = useState('overview');
    const [mobileOpen, setMobileOpen] = useState(false);

    const renderView = () => {
        switch(activeView) {
            case 'overview': return <DashboardOverview />;
            case 'users': return <UsersList />; // New Route
            case 'applications': return <OperatorApplications />;
            case 'operators': return <OperatorsList />;
            case 'inquiries': return <InquiryList />;
            case 'quotes': return <QuotesList />;
            case 'bookings': return <BookingsList />;
            case 'compliance': return <ComplianceList />;
            case 'invoices': return <FinanceModule type="Invoices" />;
            case 'payouts': return <FinanceModule type="Payouts" />;
            case 'audit': return <AuditLogs />;
            case 'settings': return <SettingsView user={user} />;
            default: return (
                <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                    <Settings className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-sm uppercase tracking-widest font-bold">Module Under Construction</p>
                </div>
            );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-charcoal-900 flex">
            {/* Mobile Overlay */}
            {mobileOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileOpen(false)}></div>}

            <AdminSidebar 
                activeView={activeView} 
                setActiveView={setActiveView} 
                onLogout={onLogout} 
                user={user}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            <div className="flex-1 md:ml-64 min-h-screen flex flex-col">
                <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-30">
                    <div className="flex items-center">
                        <button onClick={() => setMobileOpen(true)} className="md:hidden mr-4 text-gray-500"><Menu className="w-5 h-5" /></button>
                        <h2 className="text-xl font-serif font-bold text-charcoal-900 capitalize">{activeView.replace('-', ' ')}</h2>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input placeholder="Global Search..." className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs w-64 focus:border-gold-500 focus:ring-0 outline-none" />
                        </div>
                        <button className="relative p-2 text-gray-400 hover:text-gold-500 transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                    </div>
                </header>
                <main className="p-6 md:p-8 flex-1 overflow-y-auto">
                    {renderView()}
                </main>
            </div>
        </div>
    );
};
