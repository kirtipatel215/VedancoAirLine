
import React, { useState, useEffect } from 'react';
import { Plane, Calendar, MoreHorizontal, ArrowLeft, User, Shield, Ban, Check, Download } from 'lucide-react';
import { AdminService } from '../adminService.ts';
import { AdminBooking } from '../types';
import { SectionHeader, SearchFilterToolbar, StatusBadge } from '../../dashboard/shared.tsx';

// --- Detail Component ---
const BookingDetail = ({ booking, onBack }: { booking: AdminBooking, onBack: () => void }) => {
    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <button onClick={onBack} className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-charcoal-900 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Manifest
                </button>
                <div className="flex gap-2">
                    <button className="bg-charcoal-900 text-white px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-gold-500 transition-all flex items-center">
                        <Download className="w-3 h-3 mr-2" /> Download Manifest
                    </button>
                    {booking.status === 'Confirmed' && (
                        <button className="border border-red-200 text-red-500 px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 transition-all flex items-center">
                            <Ban className="w-3 h-3 mr-2" /> Cancel Flight
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden">
                <div className="bg-charcoal-950 p-8 md:p-10 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <StatusBadge status={booking.status} />
                                <span className="font-mono text-xs text-gray-400 font-bold">{booking.ref}</span>
                            </div>
                            <h1 className="text-3xl font-serif font-bold mb-2">{booking.route.split('->').join(' to ')}</h1>
                            <p className="text-sm text-gold-500 font-bold uppercase tracking-widest flex items-center">
                                <Calendar className="w-4 h-4 mr-2" /> {new Date(booking.date).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-serif font-bold">${booking.price.toLocaleString()}</p>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Total Value</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 md:p-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div>
                            <h3 className="text-sm font-serif font-bold text-charcoal-900 mb-6 border-b border-gray-50 pb-2">Client Details</h3>
                            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-charcoal-400 border border-gray-100">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-charcoal-900 text-sm">{booking.customerName}</p>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Principal Pax</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-serif font-bold text-charcoal-900 mb-6 border-b border-gray-50 pb-2">Operator Assignment</h3>
                            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-charcoal-400 border border-gray-100">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-charcoal-900 text-sm">{booking.operatorName}</p>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Flight Provider</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main List ---
export const BookingsList = () => {
    const [bookings, setBookings] = useState<AdminBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);

    useEffect(() => { 
        setLoading(true);
        AdminService.getBookings().then(data => {
            setBookings(data);
            setLoading(false);
        }); 
    }, []);

    const filtered = bookings.filter(b => {
        const ref = b.ref || '';
        const custName = b.customerName || '';
        const matchesSearch = ref.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              custName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = statusFilter === 'All' || b.status === statusFilter;
        return matchesSearch && matchesFilter;
    });

    if (selectedBooking) {
        return <BookingDetail booking={selectedBooking} onBack={() => setSelectedBooking(null)} />;
    }

    return (
        <div className="animate-fade-in space-y-6">
            <SectionHeader title="Flight Manifest" subtitle="Confirmed missions, schedules, and active trips." />
            <SearchFilterToolbar 
                onSearch={setSearchQuery} 
                onFilter={setStatusFilter} 
                filterOptions={['Confirmed', 'Pending', 'Completed', 'Cancelled']}
                placeholder="Search booking ref or customer..."
            />

            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <th className="px-8 py-5">Reference</th>
                            <th className="px-8 py-5">Route & Date</th>
                            <th className="px-8 py-5">Parties</th>
                            <th className="px-8 py-5">Value</th>
                            <th className="px-8 py-5">Status</th>
                            <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan={6} className="p-10 text-center"><div className="animate-spin w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full mx-auto"></div></td></tr>
                        ) : filtered.map(b => (
                            <tr key={b.id} onClick={() => setSelectedBooking(b)} className="hover:bg-gray-50/80 transition-colors group cursor-pointer">
                                <td className="px-8 py-6 font-mono text-[10px] font-bold text-gray-400">{b.ref}</td>
                                <td className="px-8 py-6">
                                    <p className="font-bold text-charcoal-900 text-sm group-hover:text-gold-600 transition-colors">{b.route}</p>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold mt-1 flex items-center">
                                        <Calendar className="w-3 h-3 mr-1" /> {b.date}
                                    </p>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="text-xs">
                                        <p><span className="text-gray-400 font-bold">Client:</span> {b.customerName}</p>
                                        <p className="mt-0.5"><span className="text-gray-400 font-bold">Op:</span> {b.operatorName}</p>
                                    </div>
                                </td>
                                <td className="px-8 py-6 font-serif font-bold text-charcoal-900">${b.price.toLocaleString()}</td>
                                <td className="px-8 py-6"><StatusBadge status={b.status} /></td>
                                <td className="px-8 py-6 text-right">
                                    <button className="bg-white border border-gray-200 text-charcoal-900 hover:bg-charcoal-900 hover:text-white px-4 py-2 rounded-sm text-[9px] font-bold uppercase tracking-widest transition-all">
                                        Manage
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
