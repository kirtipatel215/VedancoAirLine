
import React, { useState, useEffect, useRef } from 'react';
import { Building, User, Mail, Phone, MapPin, Loader2, CheckCircle, ArrowRight, ShieldCheck, Briefcase, Globe, CreditCard, Plane, Star, Lock, Plus, Trash2, FileUp, AlertTriangle, Info, Check, Upload, BadgeCheck, FileText, X, Clock } from 'lucide-react';
import { SectionHeader } from './shared.tsx';
import { AdminService } from '../admin/adminService.ts';
import { SecureApiService } from './service.ts';

// --- Components ---

const StepIndicator = ({ currentStep, steps }: { currentStep: number, steps: string[] }) => (
    <div className="flex justify-between items-center w-full px-4 mb-10">
        {steps.map((label, idx) => {
            const stepNum = idx + 1;
            const active = stepNum === currentStep;
            const completed = stepNum < currentStep;
            return (
                <div key={idx} className="flex flex-col items-center relative z-10 w-full group">
                    {/* Connector Line */}
                    {idx !== 0 && (
                        <div className={`absolute top-4 right-[50%] w-full h-0.5 -z-10 transition-all duration-700 ${completed ? 'bg-gold-500' : 'bg-gray-100'}`}></div>
                    )}

                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all duration-300 shadow-sm ${active ? 'border-gold-500 bg-white text-gold-600 scale-110 shadow-gold-500/20' :
                        completed ? 'border-gold-500 bg-gold-500 text-white' :
                            'border-gray-200 bg-white text-gray-300'
                        }`}>
                        {completed ? <Check className="w-4 h-4" /> : stepNum}
                    </div>
                    <span className={`text-[8px] uppercase font-bold tracking-[0.2em] mt-3 transition-colors ${active ? 'text-navy-900' : 'text-gray-400 group-hover:text-gray-500'}`}>
                        {label}
                    </span>
                </div>
            )
        })}
    </div>
);

const EnhancedFileUpload = ({ label, type, onFileChange, file, required }: { label: string, type: string, onFileChange: (f: File | null) => void, file: File | null, required?: boolean }) => {
    const [dragging, setDragging] = useState(false);
    const [progress, setProgress] = useState(0);
    const [uploaded, setUploaded] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (file && !uploaded) {
            setProgress(0);
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setUploaded(true);
                        return 100;
                    }
                    return prev + 20;
                });
            }, 150);
            return () => clearInterval(interval);
        } else if (!file) {
            setUploaded(false);
            setProgress(0);
        }
    }, [file]);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files?.[0]) {
            onFileChange(e.dataTransfer.files[0]);
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        onFileChange(null);
        setUploaded(false);
        setProgress(0);
        if (inputRef.current) inputRef.current.value = '';
    };

    return (
        <div
            onClick={() => !file && inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`relative rounded-xl border-2 border-dashed transition-all duration-300 h-48 flex flex-col items-center justify-center cursor-pointer overflow-hidden group ${file
                ? 'border-emerald-200 bg-emerald-50/30'
                : dragging
                    ? 'border-gold-500 bg-gold-50'
                    : 'border-gray-200 bg-gray-50 hover:border-gold-300 hover:bg-white'
                }`}
        >
            <input
                type="file"
                ref={inputRef}
                className="hidden"
                onChange={(e) => e.target.files?.[0] && onFileChange(e.target.files[0])}
                accept=".pdf,.jpg,.jpeg,.png"
            />

            {file ? (
                <div className="w-full h-full p-6 flex flex-col items-center justify-center relative animate-fade-in-up">
                    <button onClick={handleRemove} className="absolute top-3 right-3 p-1.5 bg-white rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm z-10">
                        <X className="w-4 h-4" />
                    </button>

                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm border border-emerald-100">
                        <FileText className="w-6 h-6 text-emerald-600" />
                    </div>

                    <p className="text-sm font-bold text-navy-900 truncate max-w-[90%] mb-1">{file.name}</p>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{(file.size / 1024 / 1024).toFixed(2)} MB</p>

                    {!uploaded && (
                        <div className="w-32 h-1 bg-gray-200 rounded-full mt-4 overflow-hidden">
                            <div className="h-full bg-emerald-500 transition-all duration-150" style={{ width: `${progress}%` }}></div>
                        </div>
                    )}

                    {uploaded && (
                        <div className="flex items-center mt-3 text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-white px-3 py-1 rounded-full shadow-sm">
                            <CheckCircle className="w-3 h-3 mr-1.5" /> Ready
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center p-6 transition-transform duration-300 group-hover:scale-105">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 text-gray-400 group-hover:text-gold-500 shadow-sm mx-auto border border-gray-100 group-hover:border-gold-200 transition-colors">
                        <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold uppercase text-navy-900 mb-1 tracking-wide">{label} {required && <span className="text-red-500">*</span>}</p>
                    <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">{type}</p>
                    <p className="text-[9px] text-gray-300 mt-3 group-hover:text-gold-400 transition-colors">Drag & Drop or Click</p>
                </div>
            )}
        </div>
    );
};

export const PartnerApplication = ({ user, onSwitchToOperator }: { user: any, onSwitchToOperator?: () => void }) => {
    const [step, setStep] = useState(1);
    const steps = ['Profile', 'Company', 'Operations', 'Docs', 'Banking', 'Review'];
    const [loading, setLoading] = useState(false);
    const [applicationStatus, setApplicationStatus] = useState<'loading' | 'none' | 'applied' | 'approved' | 'rejected'>('loading');
    const [rejectionReason, setRejectionReason] = useState<string>('');
    const [verificationSent, setVerificationSent] = useState(false);
    const [verificationType, setVerificationType] = useState<'email' | 'mobile' | null>(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [verifying, setVerifying] = useState(false);

    // Initial Form State
    const [form, setForm] = useState({
        contact: {
            firstName: '',
            lastName: '',
            email: '',
            mobile: '',
            designation: '',
            alternate: '',
            emailVerified: true,
            mobileVerified: true,
            isProfileDataModified: false
        },
        company: {
            name: '', brand: '', regNumber: '', year: '', address: '', base: '', baseAirports: [], website: ''
        },
        ops: {
            fleetSize: '', categories: [] as string[], regions: [] as string[], responseTime: '<1hr', medical: false, intl: false
        },
        docs: {
            incorporation: null as File | null,
            aoc: null as File | null,
            permit: null as File | null,
            tax: null as File | null
        },
        fleet: [] as { reg: string, model: string, base: string }[],
        banking: {
            bankName: '', accountHolder: '', accountNumber: '', ifscSwift: '', currency: 'USD', country: ''
        },
        declarations: {
            accurate: false, terms: false, auditConsent: false
        }
    });

    // Populate from User Profile & Check Status
    useEffect(() => {
        const init = async () => {
            try {
                const profile = await SecureApiService.getProfile();
                if (profile) {
                    // Determine current status
                    if (profile.isOperator || profile.operator_status === 'approved') {
                        setApplicationStatus('approved');
                    } else if (profile.operator_status === 'applied') {
                        setApplicationStatus('applied');
                    } else if (profile.operator_status === 'rejected') {
                        setApplicationStatus('rejected');
                        setRejectionReason("Document verification failed. Please check your uploaded files.");
                    } else {
                        setApplicationStatus('none');
                    }

                    setForm(prev => ({
                        ...prev,
                        contact: {
                            ...prev.contact,
                            firstName: profile.first_name || '',
                            lastName: profile.last_name || '',
                            email: profile.email || '',
                            mobile: profile.phone_number || '',
                            emailVerified: profile.email_verified || false,
                            mobileVerified: profile.phone_verified || false
                        }
                    }));
                } else {
                    setApplicationStatus('none');
                }
            } catch (error) {
                console.error("Failed to load profile", error);
                setApplicationStatus('none');
            }
        };
        init();
    }, [user]);

    // Update Handler
    const update = (section: keyof typeof form, field: string, value: any) => {
        setForm(prev => {
            const newState = { ...prev, [section]: { ...prev[section], [field]: value } };
            if (section === 'contact') {
                const originalEmail = user.email;
                const originalPhone = user.phone_number;

                if (field === 'email' && value !== originalEmail) {
                    newState.contact.emailVerified = false;
                    newState.contact.isProfileDataModified = true;
                }
                if (field === 'mobile' && value !== originalPhone) {
                    newState.contact.mobileVerified = false;
                    newState.contact.isProfileDataModified = true;
                }
            }
            return newState;
        });
    };

    const toggleArray = (section: 'ops', field: 'categories' | 'regions', value: string) => {
        setForm(prev => {
            const current = prev[section][field] as string[];
            const updated = current.includes(value) ? current.filter(i => i !== value) : [...current, value];
            return {
                ...prev,
                [section]: { ...prev[section], [field]: updated }
            };
        });
    };

    // --- Actions ---

    const sendVerification = (type: 'email' | 'mobile') => {
        setVerificationType(type);
        setVerificationSent(true);
        setTimeout(() => alert(`OTP sent to ${type === 'email' ? form.contact.email : form.contact.mobile}`), 500);
    };

    const verifyCode = () => {
        setVerifying(true);
        setTimeout(() => {
            if (verificationCode === '1234') {
                setForm(prev => ({
                    ...prev,
                    contact: {
                        ...prev.contact,
                        [verificationType === 'email' ? 'emailVerified' : 'mobileVerified']: true
                    }
                }));
                setVerificationSent(false);
                setVerificationCode('');
                setVerificationType(null);
            } else {
                alert("Invalid Code (Try 1234)");
            }
            setVerifying(false);
        }, 1000);
    };

    const handleFile = (field: string, file: File | null) => {
        setForm(prev => ({ ...prev, docs: { ...prev.docs, [field]: file } }));
    };

    const validateStep = () => {
        if (step === 1) return form.contact.firstName && form.contact.lastName && form.contact.emailVerified && form.contact.mobileVerified;
        if (step === 2) return form.company.name && form.company.regNumber && form.company.address && form.company.base;
        if (step === 3) return form.ops.fleetSize && form.ops.categories.length > 0 && form.ops.regions.length > 0;
        if (step === 4) return form.docs.aoc;
        if (step === 5) return form.banking.accountNumber && form.banking.bankName;
        return true;
    };

    const handleNext = () => {
        if (validateStep()) setStep(prev => prev + 1);
        else alert("Please complete all required fields and verifications.");
    };

    const handleSubmit = async () => {
        if (!form.declarations.accurate || !form.declarations.terms) {
            alert("You must agree to the terms.");
            return;
        }
        setLoading(true);
        try {
            await AdminService.submitOperatorApplication({
                companyInfo: form.company,
                contact: form.contact,
                business: form.company,
                banking: form.banking,
                ops: form.ops,
                fleetDetails: form.fleet,
                declarations: form.declarations,
                docs: form.docs
            });
            setApplicationStatus('applied');
        } catch (e: any) {
            alert("Submission failed: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    // --- Render States ---

    useEffect(() => {
        if (applicationStatus === 'approved' && onSwitchToOperator) {
            const timer = setTimeout(() => {
                onSwitchToOperator();
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [applicationStatus, onSwitchToOperator]);

    if (applicationStatus === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center">
                    <Loader2 className="w-8 h-8 text-gold-500 animate-spin mb-3" />
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Checking Status...</p>
                </div>
            </div>
        );
    }

    if (applicationStatus === 'approved') {
        return (
            <div className="animate-fade-in flex items-center justify-center py-20 px-4">
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-navy-100 border-t-gold-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Plane className="w-6 h-6 text-navy-900" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-navy-900 mt-6 mb-2">Accessing Operator Portal</h3>
                    <p className="text-gray-500 text-sm">Verifying credentials and redirecting...</p>

                    {/* Fallback Button */}
                    <button
                        onClick={onSwitchToOperator}
                        className="mt-8 text-xs font-bold text-gold-600 hover:text-gold-700 uppercase tracking-widest underline decoration-dotted underline-offset-4"
                    >
                        Click here if not redirected
                    </button>
                </div>
            </div>
        );
    }

    if (applicationStatus === 'applied') {
        return (
            <div className="animate-fade-in flex items-center justify-center py-12 md:py-24 px-4">
                <div className="max-w-2xl w-full bg-white rounded-3xl border border-emerald-100 shadow-2xl p-10 md:p-14 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-emerald-600 to-emerald-400"></div>
                    <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-8 mx-auto shadow-inner border border-emerald-100">
                        <Clock className="w-12 h-12 text-emerald-600" />
                    </div>
                    <h3 className="text-3xl font-serif font-bold text-navy-900 mb-4">Application Under Review</h3>
                    <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-md mx-auto">
                        Your dossier has been securely transmitted. Our compliance team is currently reviewing your credentials.
                    </p>
                    <div className="bg-gray-50 rounded-xl p-5 mb-8 inline-block border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Expected Response</p>
                        <p className="text-sm font-bold text-navy-900">Within 48 Hours</p>
                    </div>
                </div>
            </div>
        );
    }

    if (applicationStatus === 'rejected') {
        return (
            <div className="animate-fade-in flex items-center justify-center py-12 md:py-24 px-4">
                <div className="max-w-2xl w-full bg-white rounded-3xl border border-red-100 shadow-2xl p-10 md:p-14 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 via-red-600 to-red-400"></div>
                    <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-8 mx-auto shadow-inner border border-red-100">
                        <AlertTriangle className="w-12 h-12 text-red-600" />
                    </div>
                    <h3 className="text-3xl font-serif font-bold text-navy-900 mb-4">Application Returned</h3>
                    <p className="text-gray-500 text-lg leading-relaxed mb-6 max-w-md mx-auto">
                        We could not verify your application at this time.
                    </p>
                    {rejectionReason && (
                        <div className="bg-red-50 border border-red-100 p-4 rounded-xl mb-8 max-w-md mx-auto">
                            <p className="text-red-800 text-sm font-medium">{rejectionReason}</p>
                        </div>
                    )}
                    <button onClick={() => setApplicationStatus('none')} className="bg-navy-900 text-white px-8 py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg">
                        Update & Re-Apply
                    </button>
                </div>
            </div>
        );
    }

    // Default: Show Application Form
    return (
        <div className="animate-fade-in max-w-5xl mx-auto pb-20 px-4 md:px-6">
            <SectionHeader
                title="Partner Application"
                subtitle="Join our exclusive network of verified aircraft operators."
            />

            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-navy-900 to-gold-500"></div>

                <div className="p-8 md:p-12">
                    <StepIndicator currentStep={step} steps={steps} />

                    {/* STEP 1: PROFILE */}
                    {step === 1 && (
                        <div className="animate-fade-in-up space-y-8">
                            <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl flex items-start">
                                <Info className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-blue-800 leading-relaxed font-medium">
                                    <strong>Note:</strong> Your personal details have been auto-filled. You may edit them for this application, but changing contact information will require re-verification.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">First Name</label>
                                    <input value={form.contact.firstName} onChange={e => update('contact', 'firstName', e.target.value)} className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm font-bold outline-none focus:border-gold-500 focus:bg-white transition-all text-navy-900" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Last Name</label>
                                    <input value={form.contact.lastName} onChange={e => update('contact', 'lastName', e.target.value)} className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm font-bold outline-none focus:border-gold-500 focus:bg-white transition-all text-navy-900" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Email Address</label>
                                    <div className="flex gap-2">
                                        <input value={form.contact.email} onChange={e => update('contact', 'email', e.target.value)} className="flex-1 bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm font-bold outline-none focus:border-gold-500 focus:bg-white transition-all text-navy-900" />
                                        {form.contact.emailVerified ? (
                                            <div className="flex items-center px-5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 shadow-sm"><BadgeCheck className="w-5 h-5" /></div>
                                        ) : (
                                            <button onClick={() => sendVerification('email')} className="px-6 bg-gold-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gold-600 shadow-md">Verify</button>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Mobile Number</label>
                                    <div className="flex gap-2">
                                        <input value={form.contact.mobile} onChange={e => update('contact', 'mobile', e.target.value)} className="flex-1 bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm font-bold outline-none focus:border-gold-500 focus:bg-white transition-all text-navy-900" />
                                        {form.contact.mobileVerified ? (
                                            <div className="flex items-center px-5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 shadow-sm"><BadgeCheck className="w-5 h-5" /></div>
                                        ) : (
                                            <button onClick={() => sendVerification('mobile')} className="px-6 bg-gold-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gold-600 shadow-md">Verify</button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {verificationSent && (
                                <div className="p-8 bg-white border border-gray-200 rounded-2xl shadow-xl max-w-sm mx-auto animate-scale-up text-center">
                                    <h4 className="text-sm font-bold text-navy-900 mb-6">Enter Verification Code</h4>
                                    <input value={verificationCode} onChange={e => setVerificationCode(e.target.value)} placeholder="1234" className="w-full text-center text-3xl tracking-[0.5em] font-mono border-b-2 border-gold-500 outline-none pb-4 mb-8 text-navy-900" maxLength={4} />
                                    <button onClick={verifyCode} disabled={verifying} className="w-full bg-navy-900 text-white py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gold-500 hover:text-navy-900 transition-colors">{verifying ? 'Checking...' : 'Confirm Code'}</button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 2: COMPANY */}
                    {step === 2 && (
                        <div className="animate-fade-in-up space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Company Legal Name *</label>
                                    <input value={form.company.name} onChange={e => update('company', 'name', e.target.value)} className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm font-bold outline-none focus:border-gold-500 focus:bg-white transition-all text-navy-900" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Brand / Trade Name *</label>
                                    <input value={form.company.brand} onChange={e => update('company', 'brand', e.target.value)} className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm font-bold outline-none focus:border-gold-500 focus:bg-white transition-all text-navy-900" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Registration Number *</label>
                                    <input value={form.company.regNumber} onChange={e => update('company', 'regNumber', e.target.value)} className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm font-bold outline-none focus:border-gold-500 focus:bg-white transition-all text-navy-900" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Year of Incorporation</label>
                                    <input type="number" value={form.company.year} onChange={e => update('company', 'year', e.target.value)} className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm font-bold outline-none focus:border-gold-500 focus:bg-white transition-all text-navy-900" placeholder="YYYY" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Registered Office Address *</label>
                                    <input value={form.company.address} onChange={e => update('company', 'address', e.target.value)} className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm font-bold outline-none focus:border-gold-500 focus:bg-white transition-all text-navy-900" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Primary Base Airport (ICAO) *</label>
                                    <input value={form.company.base} onChange={e => update('company', 'base', e.target.value)} className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm font-bold outline-none focus:border-gold-500 focus:bg-white transition-all text-navy-900" placeholder="e.g. VABB" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Website</label>
                                    <input value={form.company.website} onChange={e => update('company', 'website', e.target.value)} className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm font-bold outline-none focus:border-gold-500 focus:bg-white transition-all text-navy-900" placeholder="https://" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: OPS (Operations) */}
                    {step === 3 && (
                        <div className="animate-fade-in-up space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total Fleet Size *</label>
                                    <select value={form.ops.fleetSize} onChange={e => update('ops', 'fleetSize', e.target.value)} className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm font-bold outline-none focus:border-gold-500 text-navy-900 cursor-pointer">
                                        <option value="">Select Size</option>
                                        <option value="1-5">1-5 Aircraft</option>
                                        <option value="6-15">6-15 Aircraft</option>
                                        <option value="16-50">16-50 Aircraft</option>
                                        <option value="50+">50+ Aircraft</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Response Time *</label>
                                    <select value={form.ops.responseTime} onChange={e => update('ops', 'responseTime', e.target.value)} className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm font-bold outline-none focus:border-gold-500 text-navy-900 cursor-pointer">
                                        <option value="<15m">Less than 15 mins</option>
                                        <option value="<30m">Less than 30 mins</option>
                                        <option value="<1hr">Less than 1 hour</option>
                                        <option value=">1hr">More than 1 hour</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Aircraft Categories*</label>
                                <div className="flex flex-wrap gap-3">
                                    {['Light Jet', 'Midsize', 'Heavy', 'Helicopter', 'Turboprop'].map(cat => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => toggleArray('ops', 'categories', cat)}
                                            className={`px-5 py-2.5 rounded-full border text-xs font-bold transition-all shadow-sm ${form.ops.categories.includes(cat) ? 'bg-navy-900 text-white border-navy-900 shadow-md transform scale-105' : 'bg-white text-gray-500 border-gray-200 hover:border-gold-400 hover:text-navy-900'}`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Operational Regions*</label>
                                <div className="flex flex-wrap gap-3">
                                    {['Domestic', 'International', 'Remote/Offshore'].map(reg => (
                                        <button
                                            key={reg}
                                            type="button"
                                            onClick={() => toggleArray('ops', 'regions', reg)}
                                            className={`px-5 py-2.5 rounded-full border text-xs font-bold transition-all shadow-sm ${form.ops.regions.includes(reg) ? 'bg-navy-900 text-white border-navy-900 shadow-md transform scale-105' : 'bg-white text-gray-500 border-gray-200 hover:border-gold-400 hover:text-navy-900'}`}
                                        >
                                            {reg}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-8 pt-4">
                                <label className="flex items-center space-x-3 cursor-pointer group">
                                    <input type="checkbox" checked={form.ops.medical} onChange={e => update('ops', 'medical', e.target.checked)} className="rounded border-gray-300 text-gold-500 focus:ring-gold-500 h-5 w-5 accent-gold-500" />
                                    <span className="text-sm font-bold text-navy-900 group-hover:text-gold-600 transition-colors">Medical Evacuation Capability</span>
                                </label>
                                <label className="flex items-center space-x-3 cursor-pointer group">
                                    <input type="checkbox" checked={form.ops.intl} onChange={e => update('ops', 'intl', e.target.checked)} className="rounded border-gray-300 text-gold-500 focus:ring-gold-500 h-5 w-5 accent-gold-500" />
                                    <span className="text-sm font-bold text-navy-900 group-hover:text-gold-600 transition-colors">International Permits Ready</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: DOCUMENTS */}
                    {step === 4 && (
                        <div className="animate-fade-in-up space-y-10">
                            <h3 className="text-xl font-serif font-bold text-navy-900">Required Documentation</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <EnhancedFileUpload label="Air Operator Certificate" type="Required for all ops" onFileChange={(f) => handleFile('aoc', f)} file={form.docs.aoc} required />
                                <EnhancedFileUpload label="Certificate of Incorporation" type="Business Proof" onFileChange={(f) => handleFile('incorporation', f)} file={form.docs.incorporation} />
                                <EnhancedFileUpload label="Insurance Liability" type="Valid Policy" onFileChange={(f) => handleFile('permit', f)} file={form.docs.permit} />
                                <EnhancedFileUpload label="Tax Registration" type="GST / VAT" onFileChange={(f) => handleFile('tax', f)} file={form.docs.tax} />
                            </div>
                            <div className="p-5 bg-amber-50 rounded-xl border border-amber-100 flex items-start">
                                <AlertTriangle className="w-5 h-5 text-amber-500 mr-4 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-amber-800 leading-relaxed font-medium">
                                    Please ensure all documents are valid and high-resolution (PDF preferred). Expired or blurry documents will cause immediate rejection of your application.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* STEP 5: BANKING */}
                    {step === 5 && (
                        <div className="animate-fade-in-up space-y-8">
                            <h3 className="text-xl font-serif font-bold text-navy-900">Settlement Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Bank Name *</label>
                                    <input value={form.banking.bankName} onChange={e => update('banking', 'bankName', e.target.value)} className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm font-bold outline-none focus:border-gold-500 focus:bg-white transition-all text-navy-900" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Account Holder Name *</label>
                                    <input value={form.banking.accountHolder} onChange={e => update('banking', 'accountHolder', e.target.value)} className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm font-bold outline-none focus:border-gold-500 focus:bg-white transition-all text-navy-900" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Account Number / IBAN *</label>
                                    <input value={form.banking.accountNumber} onChange={e => update('banking', 'accountNumber', e.target.value)} className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm font-bold outline-none focus:border-gold-500 focus:bg-white transition-all text-navy-900" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">SWIFT / IFSC / Sort Code</label>
                                    <input value={form.banking.ifscSwift} onChange={e => update('banking', 'ifscSwift', e.target.value)} className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm font-bold outline-none focus:border-gold-500 focus:bg-white transition-all text-navy-900" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Currency</label>
                                    <select value={form.banking.currency} onChange={e => update('banking', 'currency', e.target.value)} className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm font-bold outline-none focus:border-gold-500 text-navy-900 cursor-pointer">
                                        <option>USD</option>
                                        <option>EUR</option>
                                        <option>GBP</option>
                                        <option>INR</option>
                                        <option>AED</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Bank Country</label>
                                    <input value={form.banking.country} onChange={e => update('banking', 'country', e.target.value)} className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm font-bold outline-none focus:border-gold-500 focus:bg-white transition-all text-navy-900" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 6: REVIEW & SUBMIT */}
                    {step === 6 && (
                        <div className="animate-fade-in-up space-y-10">
                            <h3 className="text-xl font-serif font-bold text-navy-900">Final Verification</h3>

                            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200 space-y-5 shadow-inner">
                                <div className="flex justify-between border-b border-gray-200 pb-3">
                                    <span className="text-xs text-gray-500 font-medium">Applicant</span>
                                    <span className="text-xs font-bold text-navy-900">{form.contact.firstName} {form.contact.lastName}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-200 pb-3">
                                    <span className="text-xs text-gray-500 font-medium">Company</span>
                                    <span className="text-xs font-bold text-navy-900">{form.company.name}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-200 pb-3">
                                    <span className="text-xs text-gray-500 font-medium">Fleet Size</span>
                                    <span className="text-xs font-bold text-navy-900">{form.ops.fleetSize} Aircraft</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-xs text-gray-500 font-medium">Documents Uploaded</span>
                                    <span className="text-xs font-bold text-navy-900">{Object.values(form.docs).filter(d => d !== null).length} Files</span>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <label className="flex items-start gap-5 p-5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors group">
                                    <input type="checkbox" checked={form.declarations.accurate} onChange={e => update('declarations', 'accurate', e.target.checked)} className="mt-1 accent-navy-900 w-5 h-5" />
                                    <div className="text-xs text-gray-600 leading-relaxed">
                                        <span className="font-bold text-navy-900 block mb-1 group-hover:text-gold-600 transition-colors">Accuracy Confirmation</span>
                                        I confirm that all information provided in this application is accurate and up-to-date. I understand that false information will lead to immediate rejection.
                                    </div>
                                </label>
                                <label className="flex items-start gap-5 p-5 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors group">
                                    <input type="checkbox" checked={form.declarations.terms} onChange={e => update('declarations', 'terms', e.target.checked)} className="mt-1 accent-navy-900 w-5 h-5" />
                                    <div className="text-xs text-gray-600 leading-relaxed">
                                        <span className="font-bold text-navy-900 block mb-1 group-hover:text-gold-600 transition-colors">Terms of Service</span>
                                        I agree to the Vedanco Air Operator Terms and Conditions, including the commission structure and SLA requirements.
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}

                    <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between">
                        <button
                            onClick={() => setStep(prev => Math.max(1, prev - 1))}
                            disabled={step === 1}
                            className="px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-navy-900 disabled:opacity-30 transition-all"
                        >
                            Back
                        </button>

                        {step < 6 ? (
                            <button
                                onClick={handleNext}
                                className="bg-navy-900 text-white px-10 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gold-500 hover:text-navy-900 transition-all shadow-lg flex items-center"
                            >
                                Next Step <ArrowRight className="w-4 h-4 ml-2" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="bg-emerald-600 text-white px-10 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg flex items-center"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Application'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}