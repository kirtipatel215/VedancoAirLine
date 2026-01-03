
import React, { useState } from 'react';
import { Plane, Lock, Mail, Loader2, ArrowRight, AlertCircle, ArrowLeft, Building, User, MapPin, Phone, CheckCircle, ShieldCheck, Globe, CreditCard, ChevronRight, Check } from 'lucide-react';
import { OperatorService } from './OperatorService.ts';
import { AdminService } from '../admin/adminService.ts'; 
import { LogoIcon } from '../Logo.tsx';

// --- Step Indicators ---
const StepIndicator = ({ currentStep, steps }: { currentStep: number, steps: string[] }) => (
    <div className="flex justify-between items-center w-full px-4 mb-8">
        {steps.map((label, idx) => {
            const stepNum = idx + 1;
            const active = stepNum === currentStep;
            const completed = stepNum < currentStep;
            return (
                <div key={idx} className="flex flex-col items-center relative z-10 w-full">
                    {/* Connector Line */}
                    {idx !== 0 && (
                        <div className={`absolute top-3 right-[50%] w-full h-0.5 -z-10 ${completed ? 'bg-gold-500' : 'bg-gray-200'}`}></div>
                    )}
                    
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${
                        active ? 'border-gold-500 bg-white text-gold-600' : 
                        completed ? 'border-gold-500 bg-gold-500 text-white' : 
                        'border-gray-200 bg-white text-gray-400'
                    }`}>
                        {completed ? <Check className="w-3 h-3" /> : stepNum}
                    </div>
                    <span className={`text-[8px] uppercase font-bold tracking-widest mt-2 ${active ? 'text-charcoal-900' : 'text-gray-400'}`}>{label}</span>
                </div>
            )
        })}
    </div>
);

export const OperatorLogin = ({ onLogin, onBack }: { onLogin: (user: any) => void, onBack: () => void }) => {
    const [view, setView] = useState<'login' | 'apply'>('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // --- Login Logic ---
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const user = await OperatorService.login(loginEmail.trim(), loginPassword.trim());
            if (user) {
                onLogin(user);
            } else {
                setError('Invalid credentials. If you applied recently, please wait for admin approval.');
            }
        } catch (err) {
            setError('System Error: Authentication failed.');
        } finally {
            setLoading(false);
        }
    };

    // --- Wizard State ---
    const [step, setStep] = useState(1);
    const steps = ['Company', 'Contact', 'Business', 'Operations', 'Verify'];
    
    // Detailed Form State
    const [formData, setFormData] = useState({
        companyInfo: { name: '', brand: '', regNumber: '', year: '', address: '', base: '', baseAirports: [], website: '' },
        contact: { name: '', designation: '', email: '', mobile: '', alternate: '', emailVerified: false, mobileVerified: false },
        business: { taxId: '', billingAddr: '', currency: 'USD', bankCountry: '' },
        ops: { fleetSize: '', categories: [] as string[], regions: [] as string[], responseTime: '<1hr', medical: false, intl: false },
        declarations: { confirm: false, terms: false, auditConsent: false }
    });

    const [verifying, setVerifying] = useState<'email' | 'mobile' | null>(null);

    // --- Wizard Handlers ---
    const updateField = (section: keyof typeof formData, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [section]: { ...prev[section], [field]: value }
        }));
    };

    const handleVerify = (type: 'email' | 'mobile') => {
        setVerifying(type);
        setTimeout(() => {
            setVerifying(null);
            updateField('contact', type === 'email' ? 'emailVerified' : 'mobileVerified', true);
        }, 1500);
    };

    const validateStep = (s: number) => {
        const d = formData;
        if (s === 1) return d.companyInfo.name && d.companyInfo.regNumber && d.companyInfo.address && d.companyInfo.base;
        if (s === 2) return d.contact.name && d.contact.email && d.contact.mobile && d.contact.emailVerified;
        if (s === 3) return d.business.taxId && d.business.billingAddr && d.business.bankCountry;
        if (s === 4) return d.ops.fleetSize && d.ops.categories.length > 0 && d.ops.regions.length > 0;
        if (s === 5) return d.declarations.confirm && d.declarations.terms;
        return false;
    };

    const handleNext = () => {
        if (validateStep(step)) setStep(prev => prev + 1);
        else setError('Please complete all required fields (*)');
    };

    const handleSubmitApplication = async () => {
        if (!validateStep(5)) return;
        setLoading(true);
        setError('');
        try {
            await AdminService.submitOperatorApplication(formData);
            setSuccessMsg(`Application submitted for ${formData.companyInfo.name}.`);
        } catch (err) {
            setError('Submission failed.');
        } finally {
            setLoading(false);
        }
    };

    const toggleArray = (section: 'ops', field: 'categories' | 'regions', value: string) => {
        const current = formData[section][field] as string[];
        const updated = current.includes(value) ? current.filter(i => i !== value) : [...current, value];
        updateField(section, field, updated);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden transition-all duration-500">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-white opacity-100 pointer-events-none"></div>
            
            <button onClick={onBack} className="absolute top-6 left-6 text-gray-400 hover:text-charcoal-900 flex items-center text-xs font-bold uppercase tracking-widest z-50 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
            </button>

            <div className={`w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative z-10 animate-fade-in-up transition-all duration-700 ease-in-out ${view === 'apply' ? 'max-w-4xl' : 'max-w-md'}`}>
                <div className="bg-gradient-to-r from-gold-400 to-gold-600 h-1.5 w-full"></div>
                
                {view === 'login' ? (
                    <div className="p-10">
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-charcoal-950 text-gold-500 mb-4 shadow-lg border border-gold-500/20">
                                <Plane className="w-8 h-8" />
                            </div>
                            <h1 className="text-2xl font-serif font-bold text-charcoal-900 tracking-wide mb-1">Operator Portal</h1>
                            <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">Authorized Personnel Only</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-charcoal-500 uppercase tracking-widest ml-1">Work Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-gold-500 transition-colors" />
                                    <input 
                                        type="email" 
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-12 pr-4 py-4 text-charcoal-900 text-sm focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition-all placeholder-gray-400"
                                        placeholder="ops@airline.com"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-charcoal-500 uppercase tracking-widest ml-1">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-gold-500 transition-colors" />
                                    <input 
                                        type="password" 
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-12 pr-4 py-4 text-charcoal-900 text-sm focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none transition-all placeholder-gray-400"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3 text-red-500 animate-shake">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                    <span className="text-xs font-bold leading-relaxed">{error}</span>
                                </div>
                            )}

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-charcoal-950 text-white font-bold py-4 rounded-lg uppercase tracking-widest text-xs hover:bg-gold-500 hover:text-charcoal-950 transition-all flex items-center justify-center group shadow-xl"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                    <>
                                        <span>Secure Login</span>
                                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-10 text-center pt-6 border-t border-gray-100">
                            <p className="text-xs text-gray-500 mb-4">New charter operator?</p>
                            <button onClick={() => setView('apply')} className="text-xs font-bold text-gold-600 hover:text-charcoal-900 uppercase tracking-widest border-b border-gold-200 pb-1 hover:border-charcoal-900 transition-all">
                                Submit Network Application
                            </button>
                        </div>
                    </div>
                ) : (
                    // --- Multi-Step Application Wizard ---
                    <div className="p-8 md:p-12">
                        {successMsg ? (
                            <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in py-20">
                                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-8 shadow-inner border border-emerald-100">
                                    <CheckCircle className="w-12 h-12 text-emerald-500" />
                                </div>
                                <h3 className="text-3xl font-serif font-bold text-charcoal-900 mb-4">Application Received</h3>
                                <p className="text-gray-500 text-sm mb-10 max-w-sm leading-relaxed">
                                    Thank you for applying. Your application status is now <span className="font-bold text-charcoal-900">Applied</span>.
                                    <br />Our fleet management team will review your credentials within 48 hours.
                                </p>
                                <button onClick={() => { setSuccessMsg(''); setView('login'); }} className="bg-charcoal-900 text-white px-8 py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-gold-500 hover:text-charcoal-900 transition-all shadow-lg">
                                    Return to Login
                                </button>
                            </div>
                        ) : (
                            <div className="animate-fade-in">
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h2 className="text-2xl font-serif font-bold text-charcoal-900">Partner Application</h2>
                                        <p className="text-xs text-gray-400 mt-1">Step {step} of 5: {steps[step-1]}</p>
                                    </div>
                                    <button onClick={() => setView('login')} className="text-xs font-bold text-gray-400 hover:text-charcoal-900 uppercase tracking-widest">Cancel</button>
                                </div>

                                <StepIndicator currentStep={step} steps={steps} />

                                <div className="min-h-[300px]">
                                    {/* STEP 1: COMPANY */}
                                    {step === 1 && (
                                        <div className="space-y-6 animate-fade-in-up">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Company Legal Name*</label>
                                                    <input value={formData.companyInfo.name} onChange={e => updateField('companyInfo', 'name', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded p-3 text-sm font-bold text-charcoal-900 outline-none focus:border-gold-500" placeholder="Legal Entity Name" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Brand / Trade Name</label>
                                                    <input value={formData.companyInfo.brand} onChange={e => updateField('companyInfo', 'brand', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded p-3 text-sm font-bold text-charcoal-900 outline-none focus:border-gold-500" placeholder="Operating As" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Registration Number*</label>
                                                    <input value={formData.companyInfo.regNumber} onChange={e => updateField('companyInfo', 'regNumber', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded p-3 text-sm font-bold text-charcoal-900 outline-none focus:border-gold-500" placeholder="Company Reg No." />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Year of Incorporation</label>
                                                    <input type="number" value={formData.companyInfo.year} onChange={e => updateField('companyInfo', 'year', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded p-3 text-sm font-bold text-charcoal-900 outline-none focus:border-gold-500" placeholder="YYYY" />
                                                </div>
                                                <div className="space-y-1.5 md:col-span-2">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Registered Office Address*</label>
                                                    <input value={formData.companyInfo.address} onChange={e => updateField('companyInfo', 'address', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded p-3 text-sm font-bold text-charcoal-900 outline-none focus:border-gold-500" placeholder="Full HQ Address" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Primary Base Airport*</label>
                                                    <input value={formData.companyInfo.base} onChange={e => updateField('companyInfo', 'base', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded p-3 text-sm font-bold text-charcoal-900 outline-none focus:border-gold-500" placeholder="ICAO Code (e.g. VABB)" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Website</label>
                                                    <input value={formData.companyInfo.website} onChange={e => updateField('companyInfo', 'website', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded p-3 text-sm font-bold text-charcoal-900 outline-none focus:border-gold-500" placeholder="https://" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 2: CONTACT */}
                                    {step === 2 && (
                                        <div className="space-y-6 animate-fade-in-up">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">SPOC Full Name*</label>
                                                    <input value={formData.contact.name} onChange={e => updateField('contact', 'name', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded p-3 text-sm font-bold text-charcoal-900 outline-none focus:border-gold-500" placeholder="Primary Contact" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Designation*</label>
                                                    <input value={formData.contact.designation} onChange={e => updateField('contact', 'designation', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded p-3 text-sm font-bold text-charcoal-900 outline-none focus:border-gold-500" placeholder="Job Title" />
                                                </div>
                                                <div className="space-y-1.5 md:col-span-2">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Official Email Address*</label>
                                                    <div className="flex gap-2">
                                                        <input type="email" value={formData.contact.email} onChange={e => updateField('contact', 'email', e.target.value)} className="flex-1 bg-gray-50 border border-gray-200 rounded p-3 text-sm font-bold text-charcoal-900 outline-none focus:border-gold-500" placeholder="work@company.com" disabled={formData.contact.emailVerified} />
                                                        <button 
                                                            type="button"
                                                            onClick={() => handleVerify('email')} 
                                                            disabled={!formData.contact.email || formData.contact.emailVerified}
                                                            className={`px-4 rounded text-[10px] font-bold uppercase tracking-widest transition-all ${formData.contact.emailVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-charcoal-900 text-white hover:bg-gold-500'}`}
                                                        >
                                                            {verifying === 'email' ? <Loader2 className="w-4 h-4 animate-spin" /> : (formData.contact.emailVerified ? 'Verified' : 'Verify')}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mobile Number*</label>
                                                    <div className="flex gap-2">
                                                        <input type="tel" value={formData.contact.mobile} onChange={e => updateField('contact', 'mobile', e.target.value)} className="flex-1 bg-gray-50 border border-gray-200 rounded p-3 text-sm font-bold text-charcoal-900 outline-none focus:border-gold-500" placeholder="+1 234..." />
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Alternate Contact</label>
                                                    <input type="tel" value={formData.contact.alternate} onChange={e => updateField('contact', 'alternate', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded p-3 text-sm font-bold text-charcoal-900 outline-none focus:border-gold-500" placeholder="Optional" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 3: BUSINESS */}
                                    {step === 3 && (
                                        <div className="space-y-6 animate-fade-in-up">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tax ID (GST/VAT)*</label>
                                                    <input value={formData.business.taxId} onChange={e => updateField('business', 'taxId', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded p-3 text-sm font-bold text-charcoal-900 outline-none focus:border-gold-500" placeholder="Tax Identification Number" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bank Country*</label>
                                                    <input value={formData.business.bankCountry} onChange={e => updateField('business', 'bankCountry', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded p-3 text-sm font-bold text-charcoal-900 outline-none focus:border-gold-500" placeholder="Jurisdiction of Bank" />
                                                </div>
                                                <div className="space-y-1.5 md:col-span-2">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Billing Address*</label>
                                                    <input value={formData.business.billingAddr} onChange={e => updateField('business', 'billingAddr', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded p-3 text-sm font-bold text-charcoal-900 outline-none focus:border-gold-500" placeholder="Address for Invoicing" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Billing Currency*</label>
                                                    <select value={formData.business.currency} onChange={e => updateField('business', 'currency', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded p-3 text-sm font-bold text-charcoal-900 outline-none focus:border-gold-500 cursor-pointer">
                                                        <option>USD</option>
                                                        <option>EUR</option>
                                                        <option>GBP</option>
                                                        <option>AED</option>
                                                        <option>INR</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 4: OPS */}
                                    {step === 4 && (
                                        <div className="space-y-6 animate-fade-in-up">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Fleet Size*</label>
                                                    <select value={formData.ops.fleetSize} onChange={e => updateField('ops', 'fleetSize', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded p-3 text-sm font-bold text-charcoal-900 outline-none focus:border-gold-500 cursor-pointer">
                                                        <option value="">Select Size</option>
                                                        <option value="1-5">1-5 Aircraft</option>
                                                        <option value="6-15">6-15 Aircraft</option>
                                                        <option value="16-50">16-50 Aircraft</option>
                                                        <option value="50+">50+ Aircraft</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Response Time*</label>
                                                    <select value={formData.ops.responseTime} onChange={e => updateField('ops', 'responseTime', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded p-3 text-sm font-bold text-charcoal-900 outline-none focus:border-gold-500 cursor-pointer">
                                                        <option value="<15m">Less than 15 mins</option>
                                                        <option value="<30m">Less than 30 mins</option>
                                                        <option value="<1hr">Less than 1 hour</option>
                                                        <option value=">1hr">More than 1 hour</option>
                                                    </select>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Aircraft Categories*</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {['Light Jet', 'Midsize', 'Heavy', 'Helicopter', 'Turboprop'].map(cat => (
                                                        <button 
                                                            key={cat} 
                                                            type="button"
                                                            onClick={() => toggleArray('ops', 'categories', cat)}
                                                            className={`px-3 py-1.5 rounded border text-xs font-bold transition-all ${formData.ops.categories.includes(cat) ? 'bg-charcoal-900 text-white border-charcoal-900' : 'bg-white text-gray-500 border-gray-200'}`}
                                                        >
                                                            {cat}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Operational Regions*</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {['Domestic', 'International', 'Remote/Offshore'].map(reg => (
                                                        <button 
                                                            key={reg} 
                                                            type="button"
                                                            onClick={() => toggleArray('ops', 'regions', reg)}
                                                            className={`px-3 py-1.5 rounded border text-xs font-bold transition-all ${formData.ops.regions.includes(reg) ? 'bg-charcoal-900 text-white border-charcoal-900' : 'bg-white text-gray-500 border-gray-200'}`}
                                                        >
                                                            {reg}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                                                    <input type="checkbox" checked={formData.ops.medical} onChange={e => updateField('ops', 'medical', e.target.checked)} className="rounded text-gold-500 focus:ring-gold-500" />
                                                    <span className="text-xs font-bold text-charcoal-900">Medical Capability</span>
                                                </label>
                                                <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                                                    <input type="checkbox" checked={formData.ops.intl} onChange={e => updateField('ops', 'intl', e.target.checked)} className="rounded text-gold-500 focus:ring-gold-500" />
                                                    <span className="text-xs font-bold text-charcoal-900">Global Permits</span>
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    {/* STEP 5: DECLARATIONS */}
                                    {step === 5 && (
                                        <div className="space-y-6 animate-fade-in-up">
                                            <h3 className="text-sm font-bold text-charcoal-900 uppercase tracking-widest border-b border-gray-200 pb-2 mb-4">Declarations</h3>
                                            
                                            <div className="space-y-4">
                                                <label className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                                    <input type="checkbox" checked={formData.declarations.confirm} onChange={e => updateField('declarations', 'confirm', e.target.checked)} className="mt-1" />
                                                    <div className="text-xs text-gray-600 leading-relaxed">
                                                        <span className="font-bold text-charcoal-900 block mb-1">Accuracy Confirmation</span>
                                                        I confirm that all information provided in this application is accurate and up-to-date. I understand that false information will lead to immediate rejection.
                                                    </div>
                                                </label>
                                                <label className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                                    <input type="checkbox" checked={formData.declarations.terms} onChange={e => updateField('declarations', 'terms', e.target.checked)} className="mt-1" />
                                                    <div className="text-xs text-gray-600 leading-relaxed">
                                                        <span className="font-bold text-charcoal-900 block mb-1">Terms of Service</span>
                                                        I agree to the Vedanco Air Operator Terms and Conditions, including the commission structure and SLA requirements.
                                                    </div>
                                                </label>
                                                <label className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                                    <input type="checkbox" checked={formData.declarations.auditConsent} onChange={e => updateField('declarations', 'auditConsent', e.target.checked)} className="mt-1" />
                                                    <div className="text-xs text-gray-600 leading-relaxed">
                                                        <span className="font-bold text-charcoal-900 block mb-1">Audit Consent</span>
                                                        I consent to document verification checks and periodic operational audits by Vedanco compliance teams.
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {error && (
                                    <div className="mt-6 p-3 bg-red-50 border border-red-100 rounded flex items-center gap-2 text-red-500 animate-shake">
                                        <AlertCircle className="w-4 h-4" /> <span className="text-xs font-bold">{error}</span>
                                    </div>
                                )}

                                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between">
                                    <button 
                                        onClick={() => setStep(prev => Math.max(1, prev - 1))}
                                        disabled={step === 1}
                                        className="px-6 py-2 rounded text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-charcoal-900 disabled:opacity-30 disabled:hover:text-gray-400"
                                    >
                                        Back
                                    </button>
                                    
                                    {step < 5 ? (
                                        <button 
                                            onClick={handleNext}
                                            className="bg-charcoal-900 text-white px-8 py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-gold-500 hover:text-charcoal-900 transition-all shadow-lg"
                                        >
                                            Next Step
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={handleSubmitApplication}
                                            disabled={loading}
                                            className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg flex items-center"
                                        >
                                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Application'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
