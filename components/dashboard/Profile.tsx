import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Briefcase, Save, Loader2, BadgeCheck, AlertCircle, Building, Globe } from 'lucide-react';
import { SectionHeader } from './shared.tsx';
import { SecureApiService } from './service.ts';
import { UserProfile } from './types';
import { LogoIcon } from '../Logo.tsx';

// Enhanced Member Card with Premium Glass & Gradient
const MemberCard = ({ profile }: { profile: UserProfile }) => (
    <div className="relative w-full aspect-[1.586/1] rounded-3xl overflow-hidden shadow-2xl p-8 flex flex-col justify-between text-white group perspective-1000 transition-transform duration-700 hover:scale-[1.01] border border-white/10">

        {/* Deep Chemical/Luxury Background */}
        <div className="absolute inset-0 bg-[#020408]"></div>

        {/* Dynamic Gradient Blobs */}
        <div className="absolute top-[-50%] left-[-20%] w-[80%] h-[150%] bg-gradient-to-br from-blue-900/40 via-purple-900/20 to-transparent rounded-full blur-[100px] opacity-70"></div>
        <div className="absolute bottom-[-30%] right-[-10%] w-[100%] h-[100%] bg-gradient-to-t from-emerald-900/30 via-gold-900/10 to-transparent rounded-full blur-[80px] opacity-60"></div>

        {/* Noise Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

        {/* Glass Reflection */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

        {/* Header */}
        <div className="relative z-10 flex justify-between items-start">
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/5 rounded-full border border-white/10 backdrop-blur-md shadow-lg">
                    <LogoIcon className="w-5 h-5 text-gold-400" />
                </div>
                <div className="flex flex-col">
                    <span className="font-serif font-bold tracking-[0.2em] text-xs text-gray-200 leading-none">VEDANCO</span>
                    <span className="text-[0.4em] font-bold uppercase tracking-[0.3em] text-gold-500 leading-tight mt-1 ml-0.5">AIR</span>
                </div>
            </div>
            <div className="text-right">
                <div className="inline-flex items-center px-3 py-1 rounded-full border border-gold-500/30 bg-gold-500/10 backdrop-blur-md">
                    <span className="text-[9px] text-gold-300 font-bold uppercase tracking-[0.2em]">Private Client</span>
                </div>
            </div>
        </div>

        {/* Content */}
        <div className="relative z-10 mt-auto">
            <div className="flex items-end justify-between mb-10">
                <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-2 pl-0.5">Member Name</p>
                    <p className="font-serif text-3xl md:text-4xl text-white tracking-wide drop-shadow-lg bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-gray-300">
                        {profile.first_name} {profile.last_name}
                    </p>
                </div>
                <div>
                    {profile.email_verified && profile.phone_verified ? (
                        <div className="flex items-center gap-2 text-emerald-300 bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-500/20 backdrop-blur-md shadow-emerald-900/20 shadow-lg">
                            <div className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-widest">Verified</span>
                        </div>
                    ) : (
                        <div className="flex items-center text-amber-400 bg-amber-950/40 px-3 py-1.5 rounded-full border border-amber-500/20 backdrop-blur-md">
                            <AlertCircle className="w-3 h-3 mr-1.5" />
                            <span className="text-[9px] font-bold uppercase tracking-widest">Pending</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-between items-end border-t border-white/10 pt-6">
                <div>
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">Member ID</p>
                    <p className="font-mono text-xs text-gray-200 tracking-wider flex items-center gap-2">
                        {profile.memberId || 'REG-PENDING'}
                        <Save className="w-3 h-3 text-gray-600 cursor-pointer hover:text-white transition-colors" />
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">Valid Thru</p>
                    <p className="font-mono text-xs text-gray-200 tracking-wider">12/28</p>
                </div>
            </div>
        </div>
    </div>
);

export const Profile = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        SecureApiService.getProfile().then(data => {
            setProfile(data);
            setLoading(false);
        });
    }, []);

    const handleChange = (field: keyof UserProfile, value: any) => {
        if (!profile) return;
        setProfile({ ...profile, [field]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;
        setSaving(true);
        await SecureApiService.updateProfile(profile);
        setSaving(false);
        // Could replace with a toast
        alert("Profile updated successfully.");
    };

    if (loading || !profile) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gold-500" /></div>;

    return (
        <div className="animate-fade-in max-w-6xl mx-auto pb-20">
            <SectionHeader title="Account Settings" subtitle="Manage your membership profile and preferences." />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">

                {/* Left Sidebar: Card & Status */}
                <div className="lg:col-span-5 space-y-8">
                    <MemberCard profile={profile} />

                    {/* Status Card - Premium Dark */}
                    <div className="bg-[#0B1120] p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div>
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Current Tier</h4>
                                <div className="text-2xl font-serif font-bold text-white tracking-wide">Gold Status</div>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 shadow-lg shadow-amber-500/30 flex items-center justify-center">
                                <BadgeCheck className="w-5 h-5 text-white" />
                            </div>
                        </div>

                        <div className="relative mb-4">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                                <span>Progress</span>
                                <span className="text-gold-400">75%</span>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden box-border border border-white/5">
                                <div className="bg-gradient-to-r from-amber-600 via-amber-400 to-amber-200 h-full rounded-full w-3/4 shadow-[0_0_15px_rgba(245,158,11,0.6)] relative overflow-hidden">
                                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                                </div>
                            </div>
                        </div>

                        <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                            <span className="text-white font-bold">3 flights</span> remaining to unlock <span className="text-white font-serif italic">Platinum</span> benefits including complimentary upgrades.
                        </p>
                    </div>
                </div>

                {/* Right Main Form - Premium Dark */}
                <div className="lg:col-span-7">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* Personal Info */}
                        <div className="bg-[#0f1115] p-10 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden group">
                            {/* Subtle Glow Effect on Hover */}
                            <div className="absolute -top-[200px] -right-[200px] w-[400px] h-[400px] bg-indigo-900/20 rounded-full blur-[100px] group-hover:bg-indigo-900/30 transition-all duration-1000"></div>

                            <h3 className="text-xl font-serif font-bold text-white mb-8 flex items-center relative z-10">
                                <div className="p-2 bg-indigo-500/10 rounded-lg mr-4 border border-indigo-500/20">
                                    <User className="w-5 h-5 text-indigo-400" />
                                </div>
                                Identity & Contact
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">First Name</label>
                                    <input
                                        value={profile.first_name}
                                        onChange={e => handleChange('first_name', e.target.value)}
                                        className="w-full bg-[#18181b] border border-white/5 rounded-xl p-3.5 text-sm font-medium text-white outline-none focus:border-indigo-500/50 focus:bg-[#202025] transition-all placeholder-gray-700 focus:shadow-[0_0_20px_-5px_rgba(99,102,241,0.2)]"
                                        placeholder="Enter first name"
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Last Name</label>
                                    <input
                                        value={profile.last_name}
                                        onChange={e => handleChange('last_name', e.target.value)}
                                        className="w-full bg-[#18181b] border border-white/5 rounded-xl p-3.5 text-sm font-medium text-white outline-none focus:border-indigo-500/50 focus:bg-[#202025] transition-all placeholder-gray-700 focus:shadow-[0_0_20px_-5px_rgba(99,102,241,0.2)]"
                                        placeholder="Enter last name"
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1 flex items-center"><Mail className="w-3 h-3 mr-1.5 opacity-50" /> Email Address</label>
                                    <input
                                        value={profile.email}
                                        disabled
                                        className="w-full bg-[#0a0a0c] border border-white/5 rounded-xl p-3.5 text-sm text-gray-500 cursor-not-allowed font-mono opacity-60"
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1 flex items-center"><Phone className="w-3 h-3 mr-1.5 opacity-50" /> Mobile Number</label>
                                    <input
                                        value={profile.phone_number}
                                        onChange={e => handleChange('phone_number', e.target.value)}
                                        className="w-full bg-[#18181b] border border-white/5 rounded-xl p-3.5 text-sm font-medium text-white outline-none focus:border-indigo-500/50 focus:bg-[#202025] transition-all placeholder-gray-700 focus:shadow-[0_0_20px_-5px_rgba(99,102,241,0.2)]"
                                        placeholder="+1 234 567 890"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Professional & Preferences */}
                        <div className="bg-[#0f1115] p-10 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden group">
                            <div className="absolute -bottom-[200px] -left-[200px] w-[400px] h-[400px] bg-emerald-900/10 rounded-full blur-[100px] group-hover:bg-emerald-900/20 transition-all duration-1000"></div>

                            <h3 className="text-xl font-serif font-bold text-white mb-8 flex items-center relative z-10">
                                <div className="p-2 bg-emerald-500/10 rounded-lg mr-4 border border-emerald-500/20">
                                    <Briefcase className="w-5 h-5 text-emerald-400" />
                                </div>
                                Corporate & Travel
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1 flex items-center"><Building className="w-3 h-3 mr-1.5 opacity-50" /> Company Name</label>
                                    <input
                                        value={profile.company}
                                        onChange={e => handleChange('company', e.target.value)}
                                        className="w-full bg-[#18181b] border border-white/5 rounded-xl p-3.5 text-sm font-medium text-white outline-none focus:border-emerald-500/50 focus:bg-[#202025] transition-all placeholder-gray-700 focus:shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)]"
                                        placeholder="Organization name"
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1 flex items-center"><Globe className="w-3 h-3 mr-1.5 opacity-50" /> Country</label>
                                    <input
                                        value={profile.country}
                                        onChange={e => handleChange('country', e.target.value)}
                                        className="w-full bg-[#18181b] border border-white/5 rounded-xl p-3.5 text-sm font-medium text-white outline-none focus:border-emerald-500/50 focus:bg-[#202025] transition-all placeholder-gray-700 focus:shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)]"
                                        placeholder="e.g. India"
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1 flex items-center"><MapPin className="w-3 h-3 mr-1.5 opacity-50" /> Home Airport</label>
                                    <input
                                        value={profile.homeAirport}
                                        onChange={e => handleChange('homeAirport', e.target.value)}
                                        className="w-full bg-[#18181b] border border-white/5 rounded-xl p-3.5 text-sm font-medium text-white outline-none focus:border-emerald-500/50 focus:bg-[#202025] transition-all placeholder-gray-700 focus:shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)]"
                                        placeholder="ICAO / IATA Code"
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Preferred Currency</label>
                                    <div className="relative">
                                        <select
                                            value={profile.preferred_currency}
                                            onChange={e => handleChange('preferred_currency', e.target.value)}
                                            className="w-full bg-[#18181b] border border-white/5 rounded-xl p-3.5 text-sm font-medium text-white outline-none focus:border-emerald-500/50 focus:bg-[#202025] transition-all cursor-pointer appearance-none relative z-10 placeholder-gray-700 focus:shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)]"
                                        >
                                            <option value="USD">USD ($)</option>
                                            <option value="EUR">EUR (€)</option>
                                            <option value="GBP">GBP (£)</option>
                                            <option value="INR">INR (₹)</option>
                                            <option value="AED">AED (د.إ)</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none z-20 text-gray-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-gradient-to-r from-amber-400 to-amber-600 text-white px-10 py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:from-white hover:to-gray-200 hover:text-[#0B1120] transition-all shadow-lg hover:shadow-amber-500/30 flex items-center transform hover:-translate-y-0.5"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
