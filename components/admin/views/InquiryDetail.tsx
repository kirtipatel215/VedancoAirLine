
import React from 'react';
import {
    ArrowLeft, Send, Users, MapPin, Briefcase, FileText,
    ShieldCheck, Mail, Phone
} from 'lucide-react';
import { AdminInquiryView } from '../types';
import { StatusBadge } from '../../dashboard/shared.tsx';

interface InquiryDetailProps {
    inquiry: AdminInquiryView;
    onBack: () => void;
    onUpdate: (id: string, field: string, val: any) => void;
}

export const InquiryDetail: React.FC<InquiryDetailProps> = ({ inquiry, onBack, onUpdate }) => {
    return (
        <div className="animate-fade-in space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <button onClick={onBack} className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-charcoal-900 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Inquiries
                </button>
                <div className="flex gap-2">
                    <button className="bg-charcoal-900 text-white px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-gold-500 hover:text-charcoal-900 transition-all flex items-center">
                        <Send className="w-3 h-3 mr-2" /> Request Quote
                    </button>
                    <button className="border border-red-200 text-red-500 px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 transition-all">
                        Close Inquiry
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-lg overflow-hidden relative">
                <div className={`absolute top-0 left-0 w-full h-1 ${inquiry.urgency === 'Critical' ? 'bg-red-500' : inquiry.urgency === 'High' ? 'bg-orange-500' : 'bg-gold-500'}`}></div>

                <div className="p-8 md:p-10">
                    <div className="flex flex-col md:flex-row justify-between items-start mb-10 border-b border-gray-50 pb-8 gap-6">
                        <div>
                            <div className="flex items-center gap-4 mb-2">
                                <h1 className="text-3xl font-serif font-bold text-charcoal-900">{inquiry.maskedId}</h1>
                                <StatusBadge status={inquiry.status} />
                            </div>
                            <p className="text-sm font-bold text-gold-600 uppercase tracking-widest flex items-center">
                                <Users className="w-4 h-4 mr-2" /> {inquiry.customerName}
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Urgency</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${inquiry.urgency === 'Critical' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-gray-50 text-charcoal-600 border-gray-200'
                                    }`}>
                                    {inquiry.urgency}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Priority</span>
                                <span className="bg-gray-100 text-charcoal-700 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">{inquiry.priority}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Trip Details */}
                        <div className="lg:col-span-2 space-y-8">
                            <div>
                                <h3 className="text-sm font-serif font-bold text-charcoal-900 mb-6 flex items-center">
                                    <MapPin className="w-4 h-4 mr-2 text-gold-600" /> Flight Parameters
                                </h3>
                                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 flex items-center justify-between relative overflow-hidden">
                                    <div className="relative z-10">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Origin</p>
                                        <p className="text-xl font-bold text-charcoal-900">{inquiry.origin || inquiry.route.split('->')[0]}</p>
                                    </div>
                                    <div className="flex-1 px-8 text-center relative z-10">
                                        <div className="h-0.5 w-full bg-gray-300 relative flex items-center justify-center">
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white border border-gray-200 px-3 py-1 rounded-full text-[10px] font-bold text-charcoal-600 uppercase whitespace-nowrap shadow-sm">
                                                {inquiry.date}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right relative z-10">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Destination</p>
                                        <p className="text-xl font-bold text-charcoal-900">{inquiry.destination || inquiry.route.split('->')[1]}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                <div className="p-4 rounded-lg border border-gray-100 bg-white">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center mb-1"><Users className="w-3 h-3 mr-1" /> Passengers</p>
                                    <p className="text-lg font-bold text-charcoal-900">{inquiry.pax || 0} Pax</p>
                                </div>
                                <div className="p-4 rounded-lg border border-gray-100 bg-white">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center mb-1"><Briefcase className="w-3 h-3 mr-1" /> Purpose</p>
                                    <p className="text-lg font-bold text-charcoal-900">{inquiry.priority} Travel</p>
                                </div>
                                <div className="p-4 rounded-lg border border-gray-100 bg-white">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center mb-1"><FileText className="w-3 h-3 mr-1" /> Quotes</p>
                                    <p className="text-lg font-bold text-charcoal-900">{inquiry.quoteCount} Generated</p>
                                </div>
                            </div>

                            {/* Operator Assignment */}
                            <div className="p-6 rounded-xl border border-blue-100 bg-blue-50/30">
                                <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-3 flex items-center">
                                    <ShieldCheck className="w-4 h-4 mr-2" /> Fulfilment Status
                                </h4>
                                {inquiry.assignedOperatorId ? (
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-charcoal-900">Assigned Operator</p>
                                            <p className="text-xs text-gray-500 font-mono mt-1">{inquiry.assignedOperatorId}</p>
                                        </div>
                                        <button className="text-xs font-bold text-blue-600 uppercase tracking-widest hover:text-blue-800">Manage</button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between text-gray-500 text-sm italic">
                                        <span>No operator assigned yet.</span>
                                        <button className="text-xs font-bold text-charcoal-900 uppercase tracking-widest border border-gray-300 px-3 py-1 rounded hover:bg-white transition-colors">Assign Now</button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar Actions */}
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                <h3 className="text-xs font-bold text-charcoal-900 uppercase tracking-widest mb-4">Contact Details</h3>
                                <div className="space-y-4 text-sm">
                                    <div className="flex items-center text-charcoal-700 p-3 bg-gray-50 rounded-lg">
                                        <Mail className="w-4 h-4 mr-3 text-gold-500" />
                                        <span className="truncate">{inquiry.customerEmail || 'client@vedanco.com'}</span>
                                    </div>
                                    <div className="flex items-center text-charcoal-700 p-3 bg-gray-50 rounded-lg">
                                        <Phone className="w-4 h-4 mr-3 text-gold-500" /> +1 (555) 000-0000
                                    </div>
                                </div>
                            </div>

                            <div className="bg-charcoal-950 p-6 rounded-xl text-white shadow-lg">
                                <h3 className="text-xs font-bold text-gold-500 uppercase tracking-widest mb-6">Admin Controls</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-300">Update Urgency</span>
                                        <select className="bg-white/10 border border-white/20 rounded text-xs p-1.5 text-white outline-none focus:border-gold-500 cursor-pointer">
                                            <option>Low</option>
                                            <option>Medium</option>
                                            <option>High</option>
                                            <option>Critical</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-300">Assign Agent</span>
                                        <select className="bg-white/10 border border-white/20 rounded text-xs p-1.5 text-white outline-none focus:border-gold-500 cursor-pointer">
                                            <option>Unassigned</option>
                                            <option>Me</option>
                                            <option>Support Team</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
