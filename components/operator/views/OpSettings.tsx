
import React, { useState, useEffect } from 'react';
import { SectionHeader } from '../ui/shared.tsx';
import { Building, Mail, Banknote, Save, Loader2 } from 'lucide-react';
import { OperatorService } from '../OperatorService.ts';

export const OpSettings = ({ user }: any) => {
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        companyName: '',
        email: '',
        account: ''
    });

    useEffect(() => {
        const load = async () => {
            try {
                // Fetch fresh data 
                const freshUser = await OperatorService.checkOperatorStatus(user.email);
                if (freshUser) {
                    setForm({
                        companyName: freshUser.companyName,
                        email: freshUser.email,
                        account: freshUser.bankAccount || ''
                    });
                } else {
                    // Fallback to prop if fetch fails (unlikely if logged in)
                    setForm({
                        companyName: user.companyName,
                        email: user.email,
                        account: user.bankAccount || ''
                    });
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user.email]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await OperatorService.updateSettings({
                companyName: form.companyName,
                email: form.email,
                account: form.account
            });
            alert("Settings updated successfully.");
        } catch (e: any) {
            console.error(e);
            alert("Failed to update settings: " + e.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gold-500" /></div>;

    return (
        <div className="space-y-8 animate-fade-in max-w-4xl mx-auto text-gray-200">
            <SectionHeader title="Account Settings" subtitle="Manage your company profile and banking details." />

            <div className="glass-panel p-10 rounded-xl border border-white/5 shadow-sm bg-white/5">
                <h3 className="text-lg font-serif font-bold text-white mb-8 pb-4 border-b border-white/10 flex items-center">
                    <Building className="w-5 h-5 mr-3 text-gold-500" /> Company Profile
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Legal Entity Name</label>
                        <input value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} className="w-full bg-black/40 border border-white/10 p-4 rounded-sm text-sm font-bold text-white outline-none focus:border-gold-500 transition-all placeholder-gray-600" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center"><Mail className="w-3 h-3 mr-1" /> Operations Email</label>
                        <input disabled value={form.email} className="w-full bg-black/20 border border-white/5 p-4 rounded-sm text-sm font-bold text-gray-400 cursor-not-allowed" title="Contact support to change email" />
                    </div>
                </div>
            </div>

            <div className="glass-panel p-10 rounded-xl border border-white/5 shadow-sm bg-white/5">
                <h3 className="text-lg font-serif font-bold text-white mb-8 pb-4 border-b border-white/10 flex items-center">
                    <Banknote className="w-5 h-5 mr-3 text-gold-500" /> Payout Configuration
                </h3>
                <div className="p-6 bg-black/40 border border-white/10 rounded-lg flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4 w-full">
                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10 text-gray-400 flex-shrink-0">
                            <Banknote className="w-6 h-6" />
                        </div>
                        <div className="w-full">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Primary Account / IBAN</p>
                            <input
                                value={form.account}
                                onChange={e => setForm({ ...form, account: e.target.value })}
                                placeholder="Enter Bank Account / IBAN"
                                className="w-full bg-transparent font-mono text-lg font-bold text-white outline-none border-b border-transparent focus:border-gold-500 transition-colors"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button onClick={handleSave} disabled={saving} className="bg-gold-500 text-charcoal-900 px-8 py-3 rounded-sm font-bold uppercase tracking-widest text-xs hover:bg-white hover:text-charcoal-950 transition-all shadow-[0_0_15px_rgba(212,175,55,0.3)] flex items-center disabled:opacity-70">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} Save Changes
                </button>
            </div>
        </div>
    );
};
