
import React, { useState, useEffect } from 'react';
import { FileSearch, ShieldAlert, Users, Plane, Landmark, DollarSign } from 'lucide-react';
import { AdminService } from '../adminService.ts';

export const DashboardOverview = () => {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        AdminService.getStats().then(setStats);
    }, []);

    if (!stats) return <div className="p-10 text-center"><div className="animate-spin w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full mx-auto"></div></div>;

    const cards = [
        { label: 'Total Inquiries', val: stats.totalInquiries, icon: FileSearch, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Pending Compliance', val: stats.pendingCompliance, icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50' },
        { label: 'Pending Operators', val: stats.pendingApps, icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Active Bookings', val: stats.activeBookings, icon: Plane, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Pending Payouts', val: stats.pendingPayouts, icon: Landmark, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Revenue (MTD)', val: `$${stats.revenueMTD.toLocaleString()}`, icon: DollarSign, color: 'text-gold-600', bg: 'bg-yellow-50' },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((c, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{c.label}</p>
                            <p className="text-2xl font-serif font-bold text-charcoal-900 mt-2">{c.val}</p>
                        </div>
                        <div className={`p-3 rounded-full ${c.bg} ${c.color}`}><c.icon className="w-6 h-6" /></div>
                    </div>
                ))}
            </div>
            
            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
                <h3 className="font-serif font-bold text-charcoal-900 mb-4">System Status</h3>
                <div className="flex gap-4">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100">API: Online</span>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-100">Database: Connected</span>
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100">Version: v2.1.0</span>
                </div>
            </div>
        </div>
    );
};
