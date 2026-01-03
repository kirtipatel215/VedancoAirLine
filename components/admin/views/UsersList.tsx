
import React, { useState, useEffect } from 'react';
import { 
    User, Plus, X, Edit2, Save, ArrowLeft, Mail, Phone, Calendar, 
    DollarSign, ShieldCheck, AlertCircle, FileText, Plane, 
    MoreVertical, Star, Clock, CheckCircle2, Crown, Gem, Award, MapPin
} from 'lucide-react';
import { AdminService } from '../adminService.ts';
import { CustomerUser, AdminInquiryView, AdminBooking } from '../types';
import { SectionHeader, SearchFilterToolbar, StatusBadge } from '../../dashboard/shared.tsx';

// --- Premium UI Components ---

const TierBadge = ({ tier }: { tier: string }) => {
    const styles: Record<string, string> = {
        Gold: "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-200",
        Silver: "bg-gradient-to-r from-slate-100 to-gray-200 text-slate-700 border-slate-200",
        Bronze: "bg-gradient-to-r from-orange-50 to-orange-100 text-orange-800 border-orange-200"
    };
    
    const icons: Record<string, any> = {
        Gold: Crown,
        Silver: Gem,
        Bronze: Award
    };

    const Icon = icons[tier] || Award;

    return (
        <span className={`flex items-center px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm whitespace-nowrap ${styles[tier] || styles.Bronze}`}>
            <Icon className="w-3 md:w-3.5 h-3 md:h-3.5 mr-1.5 md:mr-2" />
            {tier} Member
        </span>
    );
};

const StatCard = ({ label, value, icon: Icon, color }: any) => (
    <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 md:gap-5 hover:shadow-md transition-shadow">
        <div className={`p-3 md:p-3.5 rounded-full bg-opacity-10 ${color.bg} ${color.text}`}>
            <Icon className="w-5 h-5 md:w-6 md:h-6" />
        </div>
        <div>
            <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5 md:mb-1">{label}</p>
            <p className="text-lg md:text-xl font-serif font-bold text-charcoal-900">{value}</p>
        </div>
    </div>
);

// --- Add User Modal ---
const AddUserModal = ({ isOpen, onClose, onSubmit, loading }: any) => {
    const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-scale-up border border-white/10">
                <div className="bg-charcoal-950 p-6 md:p-8 flex justify-between items-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <User className="w-32 h-32 text-white transform translate-x-10 -translate-y-10" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-white font-serif font-bold text-xl md:text-2xl">New Profile</h3>
                        <p className="text-gold-500 text-xs font-bold uppercase tracking-widest mt-1">Create Customer Account</p>
                    </div>
                    <button onClick={onClose} className="text-white/50 hover:text-white transition-colors relative z-10 p-2 hover:bg-white/10 rounded-full"><X className="w-5 h-5" /></button>
                </div>
                
                <div className="p-6 md:p-8 space-y-5 md:space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center">
                                <User className="w-3 h-3 mr-1.5" /> Full Name
                            </label>
                            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg text-sm font-medium outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all" placeholder="e.g. John Doe" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center">
                                <Phone className="w-3 h-3 mr-1.5" /> Contact
                            </label>
                            <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg text-sm font-medium outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all" placeholder="+1 234..." />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center">
                            <Mail className="w-3 h-3 mr-1.5" /> Email Address
                        </label>
                        <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg text-sm font-medium outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all" placeholder="client@example.com" />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center">
                            <FileText className="w-3 h-3 mr-1.5" /> Internal Notes
                        </label>
                        <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg text-sm font-medium outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500 transition-all h-24 resize-none" placeholder="VIP status, preferences..." />
                    </div>

                    <div className="pt-4">
                        <button onClick={() => onSubmit(form)} disabled={!form.name || !form.email || loading} className="w-full bg-charcoal-900 text-white py-4 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-gold-500 hover:text-charcoal-900 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? 'Creating Profile...' : 'Create Account'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- User Detail View ---
const UserDetail = ({ user, onBack, onUpdate }: { user: CustomerUser, onBack: () => void, onUpdate: (id: string, data: Partial<CustomerUser>) => void }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState(user);
    const [relatedData, setRelatedData] = useState<{ inquiries: AdminInquiryView[], bookings: AdminBooking[] }>({ inquiries: [], bookings: [] });
    const [loadingRelated, setLoadingRelated] = useState(true);

    useEffect(() => {
        AdminService.getCustomerRelatedData(user.id).then(data => {
            if (data) setRelatedData(data);
            setLoadingRelated(false);
        });
    }, [user.id]);

    const handleSave = () => {
        onUpdate(user.id, editForm);
        setIsEditing(false);
    };

    return (
        <div className="animate-fade-in space-y-6 md:space-y-8 pb-10">
            {/* Navigation Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <button onClick={onBack} className="group flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-charcoal-900 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center mr-3 group-hover:border-gold-500 group-hover:text-gold-500 transition-colors shadow-sm">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    Back to Directory
                </button>
                <div className="flex gap-3 w-full sm:w-auto justify-end">
                    {isEditing ? (
                        <>
                            <button onClick={() => setIsEditing(false)} className="px-4 md:px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-charcoal-900 transition-colors">Cancel</button>
                            <button onClick={handleSave} className="bg-gold-500 text-charcoal-900 px-4 md:px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-gold-400 transition-all flex items-center shadow-md">
                                <Save className="w-4 h-4 mr-2" /> Save
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="bg-white border border-gray-200 text-charcoal-600 px-4 md:px-6 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center shadow-sm">
                            <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
                        </button>
                    )}
                </div>
            </div>

            {/* Profile Hero */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden relative z-0">
                {/* Banner Background */}
                <div className="h-32 md:h-40 bg-charcoal-950 relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
                
                <div className="px-6 md:px-10 pb-8 md:pb-10">
                    <div className="flex flex-col md:flex-row gap-6 md:gap-8 relative items-center md:items-start text-center md:text-left">
                        {/* Avatar overlapped */}
                        <div className="-mt-12 md:-mt-14 relative z-10 flex-shrink-0">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white p-1.5 shadow-2xl rotate-2 transform hover:rotate-0 transition-transform duration-300">
                                <div className="w-full h-full bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex items-center justify-center text-charcoal-900 text-4xl md:text-5xl font-serif font-bold shadow-inner border border-gold-300">
                                    {user.name ? user.name.charAt(0) : '?'}
                                </div>
                            </div>
                        </div>

                        {/* Name & Quick Actions */}
                        <div className="flex-1 pt-0 md:pt-4 w-full">
                            <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
                                <div>
                                    {isEditing ? (
                                        <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="text-2xl md:text-4xl font-serif font-bold text-charcoal-900 border-b-2 border-gold-500 outline-none bg-transparent w-full text-center md:text-left" />
                                    ) : (
                                        <h1 className="text-2xl md:text-4xl font-serif font-bold text-charcoal-900 drop-shadow-sm">{user.name || 'Unknown User'}</h1>
                                    )}
                                    <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 md:gap-4 mt-3">
                                        <span className="flex items-center text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                                            ID: {user.id}
                                        </span>
                                        <div className={`flex items-center px-2 py-1 rounded-full border ${user.status === 'Active' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full mr-2 ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                            <span className="text-[10px] font-bold uppercase tracking-widest">{user.status}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col items-center md:items-end gap-3">
                                    <TierBadge tier={user.tier} />
                                    {isEditing && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold uppercase text-gray-400">Account Status:</span>
                                            <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value as any})} className="bg-gray-50 border border-gray-200 rounded-lg text-xs p-2 outline-none focus:border-gold-500 font-bold text-charcoal-700 cursor-pointer">
                                                <option value="Active">Active</option>
                                                <option value="Suspended">Suspended</option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-8 md:mt-12 mb-8 md:mb-12">
                        <StatCard 
                            label="Lifetime Spend" 
                            value={`$${(user.totalSpend || 0).toLocaleString()}`} 
                            icon={DollarSign} 
                            color={{bg: 'bg-emerald-500', text: 'text-emerald-600'}} 
                        />
                        <StatCard 
                            label="Total Flights" 
                            value={relatedData.bookings.filter(b => b.status === 'Completed').length} 
                            icon={Plane} 
                            color={{bg: 'bg-blue-500', text: 'text-blue-600'}} 
                        />
                        <StatCard 
                            label="Active Inquiries" 
                            value={relatedData.inquiries.filter(i => i.status !== 'Closed').length} 
                            icon={FileText} 
                            color={{bg: 'bg-gold-500', text: 'text-gold-600'}} 
                        />
                        <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                            <div>
                                <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">KYC Verification</p>
                                <p className={`text-sm md:text-base font-bold mt-1 ${user.verified ? 'text-emerald-600' : 'text-amber-600'}`}>{user.verified ? 'Verified Identity' : 'Pending Review'}</p>
                            </div>
                            {user.verified ? <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-emerald-200" /> : <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-amber-200" />}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Contact Card */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-gray-50 p-6 md:p-8 rounded-xl border border-gray-100 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-gold-500"></div>
                                <h3 className="text-xs font-bold text-charcoal-900 uppercase tracking-widest mb-6 flex items-center">
                                    <User className="w-4 h-4 mr-2 text-gold-600" /> Contact Information
                                </h3>
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">Email Address</p>
                                        {isEditing ? (
                                            <input value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full bg-white border border-gray-200 p-2.5 rounded-lg text-sm outline-none focus:border-gold-500" />
                                        ) : (
                                            <div className="flex items-center text-sm font-medium text-charcoal-800 break-all">
                                                <Mail className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" /> {user.email}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">Phone Number</p>
                                        {isEditing ? (
                                            <input value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="w-full bg-white border border-gray-200 p-2.5 rounded-lg text-sm outline-none focus:border-gold-500" />
                                        ) : (
                                            <div className="flex items-center text-sm font-medium text-charcoal-800">
                                                <Phone className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" /> {user.phone}
                                            </div>
                                        )}
                                    </div>
                                    <div className="pt-2 border-t border-gray-200/50">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">Member Since</p>
                                        <div className="flex items-center text-sm font-medium text-charcoal-800">
                                            <Calendar className="w-4 h-4 mr-3 text-gray-400 flex-shrink-0" /> {new Date(user.joinDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white p-6 md:p-8 rounded-xl border border-gray-100 shadow-sm">
                                <h3 className="text-xs font-bold text-charcoal-900 uppercase tracking-widest mb-4">Concierge Notes</h3>
                                {isEditing ? (
                                    <textarea value={editForm.notes || ''} onChange={e => setEditForm({...editForm, notes: e.target.value})} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg text-sm text-charcoal-700 h-32 outline-none focus:border-gold-500 resize-none" placeholder="Add internal notes..." />
                                ) : (
                                    <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-100/50">
                                        <p className="text-sm text-charcoal-600 italic leading-relaxed">
                                            "{user.notes || "No notes available for this client."}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Activity Timeline */}
                        <div className="lg:col-span-8">
                            <div className="bg-white rounded-xl border border-gray-100 p-6 md:p-8 h-full shadow-sm">
                                <h3 className="text-xs font-bold text-charcoal-900 uppercase tracking-widest mb-8 flex items-center border-b border-gray-50 pb-4">
                                    <Clock className="w-4 h-4 mr-2 text-gold-600" /> Activity Ledger
                                </h3>
                                
                                {loadingRelated ? (
                                    <div className="text-center text-gray-400 text-xs py-20 flex flex-col items-center">
                                        <div className="animate-spin w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full mb-4"></div>
                                        Syncing transaction history...
                                    </div>
                                ) : (
                                    <div className="relative pl-4 space-y-6 md:space-y-8">
                                        {/* Vertical Line */}
                                        <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-gray-100"></div>

                                        {[...relatedData.bookings, ...relatedData.inquiries]
                                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                            .map((item: any, idx) => {
                                                const isBooking = 'ref' in item;
                                                return (
                                                    <div key={idx} className="relative pl-8 md:pl-12 group">
                                                        {/* Icon Node */}
                                                        <div className={`absolute left-0 top-1.5 w-10 h-10 rounded-full border-4 border-white flex items-center justify-center z-10 shadow-sm transition-transform group-hover:scale-110 ${isBooking ? 'bg-emerald-100 text-emerald-600' : 'bg-gold-100 text-gold-600'}`}>
                                                            {isBooking ? <Plane className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                                        </div>
                                                        
                                                        <div className="bg-gray-50 p-4 md:p-5 rounded-xl border border-gray-100 hover:border-gold-300 hover:bg-white hover:shadow-lg transition-all duration-300 cursor-default">
                                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                                                                <div className="flex items-center gap-3">
                                                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm ${isBooking ? 'bg-emerald-100 text-emerald-700' : 'bg-gold-100 text-gold-700'}`}>
                                                                        {isBooking ? 'Booking' : 'Inquiry'}
                                                                    </span>
                                                                    <span className="text-[10px] text-gray-400 font-bold">{new Date(item.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                                                </div>
                                                                <StatusBadge status={item.status} />
                                                            </div>
                                                            
                                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mt-3 gap-2">
                                                                <div>
                                                                    <p className="font-bold text-charcoal-900 text-base mb-1">
                                                                        {item.route}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 font-mono flex items-center">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-2"></span>
                                                                        ID: {isBooking ? item.ref : item.maskedId}
                                                                    </p>
                                                                </div>
                                                                {isBooking && (
                                                                    <div className="text-left sm:text-right">
                                                                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-0.5">Value</p>
                                                                        <p className="text-sm font-serif font-bold text-charcoal-900">${item.price?.toLocaleString()}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        }
                                        {relatedData.bookings.length === 0 && relatedData.inquiries.length === 0 && (
                                            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                <p className="text-sm text-gray-400 italic">No activity recorded for this user yet.</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main List ---
export const UsersList = () => {
    const [users, setUsers] = useState<CustomerUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedUser, setSelectedUser] = useState<CustomerUser | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [adding, setAdding] = useState(false);

    useEffect(() => { 
        setLoading(true);
        AdminService.getCustomers().then(data => {
            setUsers(data);
            setLoading(false);
        }); 
    }, []);

    const handleAddUser = async (formData: any) => {
        setAdding(true);
        await AdminService.addCustomer(formData);
        const updated = await AdminService.getCustomers();
        setUsers(updated);
        setAdding(false);
        setShowAddModal(false);
    };

    const handleUpdateUser = async (id: string, data: Partial<CustomerUser>) => {
        setLoading(true);
        await AdminService.updateCustomer(id, data);
        const updated = await AdminService.getCustomers();
        setUsers(updated);
        if (selectedUser && selectedUser.id === id) {
            setSelectedUser(updated.find(u => u.id === id) || null);
        }
        setLoading(false);
    }

    const filtered = users.filter(u => {
        const name = u.name || '';
        const email = u.email || '';
        const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = statusFilter === 'All' || u.status === statusFilter;
        return matchesSearch && matchesFilter;
    });

    if (selectedUser) {
        return <UserDetail user={selectedUser} onBack={() => setSelectedUser(null)} onUpdate={handleUpdateUser} />;
    }

    return (
        <div className="animate-fade-in space-y-6">
            <SectionHeader title="Customer Directory" subtitle="Manage registered private clients and corporate accounts." 
                action={
                    <button onClick={() => setShowAddModal(true)} className="bg-charcoal-900 text-white px-6 py-3 rounded-sm font-bold uppercase tracking-widest text-xs hover:bg-gold-500 hover:text-charcoal-900 transition-all shadow-lg flex items-center">
                        <Plus className="w-4 h-4 mr-2" /> New Profile
                    </button>
                }
            />
            
            <SearchFilterToolbar 
                onSearch={setSearchQuery} 
                onFilter={setStatusFilter} 
                filterOptions={['Active', 'Suspended']}
                placeholder="Search name or email..."
            />

            <AddUserModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={handleAddUser} loading={adding} />

            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left min-w-[1000px]">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <th className="px-8 py-5">Customer Profile</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5">Tier</th>
                                <th className="px-8 py-5">Total Spend</th>
                                <th className="px-8 py-5">Last Active</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan={6} className="p-10 text-center"><div className="animate-spin w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full mx-auto"></div></td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={6} className="p-10 text-center text-gray-400">No customers found.</td></tr>
                            ) : filtered.map(user => (
                                <tr key={user.id} onClick={() => setSelectedUser(user)} className="hover:bg-gray-50/80 transition-colors group cursor-pointer">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-charcoal-900 font-bold shadow-sm">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-charcoal-900 text-sm group-hover:text-gold-600 transition-colors">{user.name}</p>
                                                <div className="flex items-center text-[10px] text-gray-400 mt-0.5">
                                                    <Mail className="w-3 h-3 mr-1" /> {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <StatusBadge status={user.status} />
                                    </td>
                                    <td className="px-8 py-6">
                                        <TierBadge tier={user.tier} />
                                    </td>
                                    <td className="px-8 py-6 font-serif font-bold text-charcoal-900">
                                        ${user.totalSpend.toLocaleString()}
                                    </td>
                                    <td className="px-8 py-6 text-xs text-gray-500">
                                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-charcoal-900 transition-colors">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
