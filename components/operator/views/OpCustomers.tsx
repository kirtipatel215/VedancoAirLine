
import React, { useState, useEffect } from 'react';
import { OperatorService } from '../OperatorService.ts';
import { SectionHeader, SearchFilterToolbar } from '../ui/shared.tsx';
import { User, Phone, Mail, Award, Calendar, MoreHorizontal, MessageSquare, History } from 'lucide-react';

export const OpCustomers = () => {
    const [customers, setCustomers] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

    useEffect(() => {
        OperatorService.getCustomers().then(setCustomers);
    }, []);

    const filtered = customers.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'all' || c.status.toLowerCase() === filterStatus.toLowerCase();
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-8 animate-fade-in relative text-gray-200">
            <SectionHeader title="Client Management" subtitle="View client profiles, history, and preferences." />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {['Total Clients', 'Active Members', 'Top Tier', 'Retention Rate'].map((label, i) => (
                    <div key={i} className="glass-panel p-6 rounded-xl border border-white/5 bg-white/5 shadow-sm">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">{label}</p>
                        <p className="text-3xl font-serif font-bold text-white mb-1 glow-text">
                            {i === 0 ? customers.length : i === 1 ? customers.filter(c => c.status === 'Active').length : i === 2 ? '12' : '94%'}
                        </p>
                    </div>
                ))}
            </div>

            <SearchFilterToolbar
                onSearch={setSearchQuery}
                onFilter={setFilterStatus}
                filterOptions={['Active', 'Inactive']}
                placeholder="Search Client Name or Email..."
            />

            <div className="glass-panel rounded-xl overflow-hidden border border-white/5">
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left min-w-[900px]">
                        <thead className="bg-white/5 border-b border-white/5">
                            <tr className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                <th className="px-8 py-5">Client Profile</th>
                                <th className="px-8 py-5">Contact Info</th>
                                <th className="px-8 py-5">Membership Tier</th>
                                <th className="px-8 py-5 text-right">Total Spend</th>
                                <th className="px-8 py-5 text-right">Bookings</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.length === 0 ? (
                                <tr><td colSpan={6} className="px-8 py-10 text-center text-gray-500 italic">No clients found.</td></tr>
                            ) : filtered.map((customer) => (
                                <tr key={customer.id} className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => setSelectedCustomer(customer)}>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-charcoal-900 font-bold text-sm shadow-lg">
                                                {customer.avatar}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-sm group-hover:text-gold-500 transition-colors">{customer.name}</p>
                                                <div className="flex items-center mt-1">
                                                    <div className={`w-1.5 h-1.5 rounded-full mr-2 ${customer.status === 'Active' ? 'bg-emerald-500 shadow-[0_0_5px_#10B981]' : 'bg-gray-500'}`}></div>
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{customer.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center text-xs text-gray-400">
                                                <Mail className="w-3 h-3 mr-2 opacity-70" /> {customer.email}
                                            </div>
                                            <div className="flex items-center text-xs text-gray-400">
                                                <Phone className="w-3 h-3 mr-2 opacity-70" /> {customer.phone}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        {customer.tier === 'Platinum' && (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-[10px] font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                                                <Award className="w-3 h-3 mr-1.5" /> Platinum
                                            </span>
                                        )}
                                        {customer.tier === 'Gold' && (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded border border-gold-500/30 bg-gold-500/10 text-gold-400 text-[10px] font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(212,175,55,0.2)]">
                                                <Award className="w-3 h-3 mr-1.5" /> Gold
                                            </span>
                                        )}
                                        {customer.tier === 'Silver' && (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded border border-gray-400/30 bg-gray-400/10 text-gray-300 text-[10px] font-bold uppercase tracking-widest">
                                                <Award className="w-3 h-3 mr-1.5" /> Silver
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-8 py-6 text-right font-serif font-bold text-emerald-400">${customer.totalSpent.toLocaleString()}</td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="inline-block text-center">
                                            <span className="block font-bold text-white text-sm">{customer.bookingsCount}</span>
                                            <span className="text-[9px] text-gray-500 uppercase tracking-widest">Trips</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="text-gray-500 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Customer Detail Drawer could go here similar to Quotes if requested, but table is rich enough for now. */}
        </div>
    );
};
