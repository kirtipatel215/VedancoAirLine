
import React, { useState, useEffect } from 'react';
import { History } from 'lucide-react';
import { AdminService } from '../adminService.ts';
import { AuditLog } from '../types';
import { SectionHeader } from '../../dashboard/shared.tsx';

export const AuditLogs = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { 
        setLoading(true);
        AdminService.getAuditLogs().then(data => {
            setLogs(data);
            setLoading(false);
        }); 
    }, []);

    return (
        <div className="animate-fade-in space-y-6">
            <SectionHeader title="System Audit Logs" subtitle="Immutable record of all administrative actions." />

            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            <th className="px-8 py-5">Timestamp</th>
                            <th className="px-8 py-5">Administrator</th>
                            <th className="px-8 py-5">Action Type</th>
                            <th className="px-8 py-5">Target Entity</th>
                            <th className="px-8 py-5">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan={5} className="p-10 text-center"><div className="animate-spin w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full mx-auto"></div></td></tr>
                        ) : logs.map(log => (
                            <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                                <td className="px-8 py-6 font-mono text-[10px] text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                                <td className="px-8 py-6 font-bold text-sm text-charcoal-900">{log.adminName}</td>
                                <td className="px-8 py-6">
                                    <span className="bg-gray-100 text-charcoal-600 px-2 py-1 rounded-sm text-[9px] font-bold uppercase border border-gray-200">
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-xs text-charcoal-700">
                                    {log.entity} <span className="text-gray-400 font-mono ml-1">#{log.entityId}</span>
                                </td>
                                <td className="px-8 py-6 text-sm text-gray-600 italic">"{log.details}"</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
