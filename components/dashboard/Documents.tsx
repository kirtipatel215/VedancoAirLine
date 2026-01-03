
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FileText, Download, Trash2, Upload, Loader2, Image as ImageIcon, Shield, Plus, AlertCircle, CheckCircle2, HardDrive, X, Lock, Eye, File } from 'lucide-react';
import { SectionHeader, StatusBadge } from './shared.tsx';
import { Document } from './types';
import { SecureApiService } from './service.ts';

// --- Toast Notification Component ---
const Toast = ({ message, type, onClose }: { message: string, type: 'error' | 'success', onClose: () => void }) => (
    <div className={`fixed bottom-8 right-8 z-[100] flex items-center p-6 rounded-2xl shadow-2xl border animate-fade-in-up ${type === 'error' ? 'bg-white border-red-100 text-red-600' : 'bg-navy-900 border-navy-800 text-gold-500'}`}>
        {type === 'error' ? <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" /> : <CheckCircle2 className="w-5 h-5 mr-3 flex-shrink-0" />}
        <span className="text-sm font-bold mr-8">{message}</span>
        <button onClick={onClose} className="hover:opacity-70"><X className="w-4 h-4" /></button>
    </div>
);

// --- View Document Modal ---
const ViewModal = ({ doc, onClose }: { doc: Document, onClose: () => void }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy-950/90 backdrop-blur-md animate-fade-in" onClick={onClose}>
            <div className="bg-white w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative animate-scale-up" onClick={e => e.stopPropagation()}>
                <div className="bg-navy-900 p-6 flex justify-between items-center border-b border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-white/10 rounded-lg">
                            <FileText className="w-5 h-5 text-gold-500" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-sm tracking-wide">{doc.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{doc.type}</span>
                                <span className="w-1 h-1 rounded-full bg-gray-500"></span>
                                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{doc.size}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 bg-gray-100 overflow-auto flex items-center justify-center p-10 relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
                    {doc.url ? (
                        doc.name.toLowerCase().endsWith('.pdf') ? (
                            <iframe src={doc.url} className="w-full h-full rounded-lg shadow-xl border border-gray-200" title="Document Preview"></iframe>
                        ) : (
                            <img src={doc.url} alt={doc.name} className="max-w-full max-h-full object-contain rounded-lg shadow-xl border border-gray-200" />
                        )
                    ) : (
                        <div className="text-center p-10">
                            <Lock className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                            <p className="text-gray-500 font-bold text-lg">Secure Preview Unavailable</p>
                            <p className="text-sm text-gray-400 mt-2">This document is encrypted. Please download to view.</p>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-white border-t border-gray-100 flex justify-end">
                    <button
                        onClick={() => {
                            const link = document.createElement('a');
                            link.href = doc.url || '#';
                            link.download = doc.name;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }}
                        className="bg-navy-900 text-white px-8 py-3.5 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-gold-500 hover:text-navy-900 transition-all flex items-center shadow-lg transform hover:-translate-y-0.5"
                    >
                        <Download className="w-4 h-4 mr-2" /> Download Original
                    </button>
                </div>
            </div>
        </div>
    );
};

export const Documents = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<Document[]>([]);
    const [uploading, setUploading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [toast, setToast] = useState<{ msg: string, type: 'error' | 'success' } | null>(null);
    const [viewingDoc, setViewingDoc] = useState<Document | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-dismiss toast
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const load = useCallback(async () => {
        try {
            const docs = await SecureApiService.getDocuments();
            setData(docs);
        } catch (e) {
            setToast({ msg: "System Error: Vault inaccessible.", type: 'error' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const validateFile = (file: File): string | null => {
        const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!validTypes.includes(file.type)) return "Format not supported. Use PDF/JPG/PNG.";
        if (file.size > maxSize) return "File exceeds secure limit (5MB).";
        return null;
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        e.target.value = ''; // Reset input

        const error = validateFile(file);
        if (error) {
            setToast({ msg: error, type: 'error' });
            return;
        }

        setUploading(true);
        try {
            let docType: any = 'Other';
            const name = file.name.toLowerCase();
            if (name.includes('passport')) docType = 'Passport';
            else if (name.includes('visa')) docType = 'Visa';
            else if (name.includes('invoice') || name.includes('bill')) docType = 'Invoice';
            else if (name.includes('ticket') || name.includes('boarding')) docType = 'Ticket';
            else if (name.includes('contract')) docType = 'Contract';

            await SecureApiService.uploadDocument(file, docType);

            setToast({ msg: "File encrypted and stored successfully.", type: 'success' });
            await load();
        } catch (err) {
            setToast({ msg: "Upload interrupted. Please retry.", type: 'error' });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Security Warning: This action will permanently remove the document from your vault. Proceed?")) return;

        setDeletingId(id);
        try {
            await SecureApiService.deleteDocument(id);
            setToast({ msg: "Document securely shredded.", type: 'success' });
            await load();
        } catch (err) {
            setToast({ msg: "Deletion failed. Contact support.", type: 'error' });
        } finally {
            setDeletingId(null);
        }
    };

    const handleDownload = (doc: Document) => {
        if (!doc.url) {
            setToast({ msg: "Document source not found.", type: 'error' });
            return;
        }
        const link = document.createElement('a');
        link.href = doc.url;
        link.download = doc.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setToast({ msg: "Download started securely.", type: 'success' });
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'Passport': return <Shield className="w-8 h-8 text-gold-600" />;
            case 'Visa': return <FileText className="w-8 h-8 text-blue-600" />;
            case 'Ticket': return <ImageIcon className="w-8 h-8 text-emerald-600" />;
            case 'Invoice': return <FileText className="w-8 h-8 text-gray-600" />;
            default: return <File className="w-8 h-8 text-navy-500" />;
        }
    };

    return (
        <div className="animate-fade-in relative min-h-[600px] space-y-8 pb-20">
            {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
            {viewingDoc && <ViewModal doc={viewingDoc} onClose={() => setViewingDoc(null)} />}

            <SectionHeader
                title="Secure Document Vault"
                subtitle="Encrypted storage for identity, travel, and financial records."
            />

            {/* Vault Status Bar */}
            <div className="bg-navy-950 rounded-2xl p-1 shadow-2xl overflow-hidden">
                <div className="bg-navy-900 rounded-xl p-8 flex flex-col md:flex-row justify-between items-center gap-8 relative">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>

                    <div className="flex items-center gap-6 relative z-10">
                        <div className="p-4 bg-gold-500/10 rounded-xl border border-gold-500/20">
                            <Lock className="w-8 h-8 text-gold-500" />
                        </div>
                        <div>
                            <h4 className="text-white font-bold text-lg tracking-wide mb-1">AES-256 Encryption Active</h4>
                            <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Identity Protection Enabled</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-10 relative z-10">
                        <div className="text-right">
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Vault Capacity</p>
                            <div className="flex items-center justify-end text-white text-sm font-mono font-bold">
                                <HardDrive className="w-4 h-4 mr-2 text-gold-500" />
                                {data.length} / 50 Slots Used
                            </div>
                        </div>
                        <div className="h-10 w-px bg-white/10 hidden md:block"></div>
                        <button className="text-xs font-bold text-gold-500 uppercase tracking-widest hover:text-white transition-colors border-b border-gold-500/50 pb-0.5">
                            View Audit Logs
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {/* Upload Action Card */}
                <div
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center p-8 cursor-pointer transition-all duration-300 group hover:border-gold-500 hover:bg-gold-50/5 h-80 bg-white shadow-sm hover:shadow-xl ${uploading ? 'opacity-70 pointer-events-none' : ''}`}
                >
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} accept=".pdf,.jpg,.jpeg,.png" />

                    {uploading ? (
                        <>
                            <Loader2 className="w-12 h-12 text-gold-500 animate-spin mb-4" />
                            <p className="text-xs font-bold text-navy-900 uppercase tracking-widest">Encrypting...</p>
                        </>
                    ) : (
                        <>
                            <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-500 border border-gray-100 group-hover:border-gold-200 group-hover:bg-white">
                                <Upload className="w-8 h-8 text-gray-400 group-hover:text-gold-600 transition-colors" />
                            </div>
                            <h4 className="font-serif font-bold text-navy-900 text-xl mb-3">Upload File</h4>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest text-center leading-relaxed">
                                PDF, JPG, PNG <br /> Max 5MB
                            </p>
                        </>
                    )}
                </div>

                {/* Document Cards */}
                {loading ? (
                    Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="h-80 bg-gray-50 rounded-2xl animate-pulse border border-gray-100"></div>
                    ))
                ) : (
                    data.map((doc) => (
                        <div key={doc.id} className="bg-white group rounded-2xl border border-gray-100 shadow-sm hover:shadow-2xl hover:border-gold-300 transition-all duration-500 flex flex-col h-80 relative overflow-hidden transform hover:-translate-y-1">
                            {/* Card Header */}
                            <div className="p-8 flex justify-between items-start">
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 group-hover:bg-white group-hover:shadow-md transition-all">
                                    {getIcon(doc.type)}
                                </div>
                                <StatusBadge status={doc.status} />
                            </div>

                            {/* Card Body */}
                            <div className="px-8 flex-grow">
                                <h4 className="font-bold text-navy-900 text-base mb-2 truncate" title={doc.name}>{doc.name}</h4>
                                <div className="flex items-center gap-3 mt-3">
                                    <span className="text-[9px] font-bold text-gray-500 uppercase bg-gray-50 px-2 py-1 rounded border border-gray-100 tracking-wide">{doc.type}</span>
                                    <span className="text-[9px] font-bold text-gray-500 uppercase bg-gray-50 px-2 py-1 rounded border border-gray-100 tracking-wide">{doc.size}</span>
                                </div>
                            </div>

                            {/* Card Footer / Actions */}
                            <div className="mt-auto border-t border-gray-50 p-6 bg-gray-50/30 flex items-center justify-between group-hover:bg-white transition-colors">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{doc.date}</span>

                                <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 sm:translate-y-0 sm:group-hover:translate-y-0">
                                    <button
                                        onClick={() => setViewingDoc(doc)}
                                        className="p-2 text-gray-400 hover:text-gold-600 hover:bg-gold-50 rounded-lg transition-colors"
                                        title="View"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDownload(doc)}
                                        className="p-2 text-gray-400 hover:text-navy-900 hover:bg-gray-100 rounded-lg transition-colors"
                                        title="Download"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(doc.id)}
                                        disabled={deletingId === doc.id}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        {deletingId === doc.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
