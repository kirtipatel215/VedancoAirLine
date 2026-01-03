
import React, { useState, useEffect } from 'react';
import { AdminService } from '../adminService.ts';
import { SystemSettings } from '../types';

export const SettingsView = ({ user }: { user: any }) => {
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    useEffect(() => { AdminService.getSettings().then(setSettings); }, []);

    if (user.role !== 'superadmin') return <div className="p-10 text-center text-red-500 font-bold uppercase tracking-widest">Restricted Access: Super Admin Only</div>;
    if (!settings) return null;

    return (
        <div className="max-w-2xl bg-white p-8 rounded-xl border border-gray-100 shadow-sm animate-fade-in">
            <h3 className="text-xl font-serif font-bold text-charcoal-900 mb-6">Global Configuration</h3>
            <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                    <div>
                        <p className="font-bold text-sm text-charcoal-900">Platform Commission</p>
                        <p className="text-xs text-gray-500">Percentage taken from operator quotes</p>
                    </div>
                    <div className="flex items-center"><input type="number" defaultValue={settings.commissionRate} className="w-16 p-2 border rounded text-right font-mono" /> <span className="ml-2 text-sm">%</span></div>
                </div>
                <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                    <div>
                        <p className="font-bold text-sm text-charcoal-900">KYC Threshold</p>
                        <p className="text-xs text-gray-500">Bookings above this amount trigger manual review</p>
                    </div>
                    <div className="flex items-center"><span className="mr-2 text-sm">$</span> <input type="number" defaultValue={settings.kycThreshold} className="w-24 p-2 border rounded text-right font-mono" /></div>
                </div>
                <button className="w-full bg-charcoal-900 text-white py-3 rounded-md font-bold uppercase tracking-widest text-xs hover:bg-gold-500 transition-all">Save Changes</button>
            </div>
        </div>
    );
};
