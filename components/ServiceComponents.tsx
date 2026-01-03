
import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, Plane, Star } from 'lucide-react';
import { servicesData } from '../data/data.tsx';
import { LogoIcon } from './Logo.tsx';

// --- Utility Hook for Scroll Animations ---
const useInView = (options = { threshold: 0.1 }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsInView(true);
                observer.disconnect();
            }
        }, options);

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) observer.disconnect();
        };
    }, []);

    return [ref, isInView] as const;
};

// --- Shared Views (Detail & All Services) ---

export const AllServicesView = ({ onServiceClick, onClose, onPolicyClick }: any) => {
    // Scroll to top when view opens
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-white animate-fade-in text-navy-900">
             {/* Sticky Header for All Services View */}
             <div className="fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 py-4 px-6 flex justify-between items-center transition-all duration-300">
                <button 
                    onClick={onClose}
                    className="flex items-center space-x-2 text-navy-900 hover:text-gold-600 transition-colors font-bold uppercase tracking-widest text-xs group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Home</span>
                </button>
                <div className="flex items-center space-x-2">
                    <LogoIcon className="w-8 h-8" color="text-gold-500" />
                    <span className="font-serif text-lg font-bold text-navy-900 tracking-widest">VEDANCO</span>
                </div>
                <div className="w-20"></div> {/* Spacer for center alignment */}
            </div>

            {/* Header Section */}
            <div className="pt-40 pb-20 bg-white text-center px-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:40px_40px] opacity-50"></div>
                <div className="relative z-10">
                    <span className="text-gold-600 font-bold uppercase tracking-[0.3em] text-xs mb-4 block">Our Expertise</span>
                    <h1 className="text-5xl md:text-7xl font-serif text-navy-900 mb-6 leading-tight">Premium Aviation <br/><span className="italic text-gray-400 font-light">Solutions</span></h1>
                    <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed font-light">
                        Explore our comprehensive range of aviation solutions, tailored to meet the exacting standards of global travelers.
                    </p>
                </div>
            </div>

            {/* Services Grid */}
            <div className="container mx-auto px-6 pb-32">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {servicesData.map((service) => (
                        <div 
                            key={service.id} 
                            onClick={() => onServiceClick(service)}
                            className="bg-gray-50 p-8 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-2xl hover:shadow-gray-200/50 hover:border-gray-200 transition-all duration-500 group cursor-pointer flex flex-col relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                                <service.icon className="w-32 h-32 text-navy-900 transform translate-x-8 -translate-y-8" />
                            </div>

                            <div className="mb-8 overflow-hidden rounded-xl h-56 w-full relative shadow-sm">
                                <img src={service.image} alt={service.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 grayscale group-hover:grayscale-0" />
                                <div className="absolute inset-0 bg-navy-900/10 group-hover:bg-transparent transition-colors"></div>
                            </div>

                            <div className="flex items-center justify-between mb-6 relative z-10">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-navy-900 border border-gray-200 group-hover:border-gold-500 group-hover:text-gold-500 transition-colors duration-300 shadow-sm">
                                    <service.icon className="w-5 h-5" />
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-gold-500 transition-colors transform group-hover:translate-x-1" />
                            </div>
                            
                            <h3 className="text-2xl font-serif mb-3 text-navy-900 group-hover:text-gold-600 transition-colors font-bold relative z-10">
                                {service.title}
                            </h3>
                            <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-grow relative z-10 font-medium">{service.desc}</p>
                            
                            <span className="text-[10px] font-bold uppercase tracking-widest text-navy-900 group-hover:text-gold-600 transition-colors border-b border-transparent group-hover:border-gold-600 inline-block self-start pb-1 relative z-10">
                                View Details
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export const ServiceDetailView = ({ service, onClose, onPolicyClick }: any) => {
    // Scroll to top when view opens
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-white animate-fade-in text-navy-900">
            {/* Sticky Header for Detail View */}
            <div className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 py-4 px-6 flex justify-between items-center">
                <button 
                    onClick={onClose}
                    className="flex items-center space-x-2 text-navy-900 hover:text-gold-600 transition-colors font-bold uppercase tracking-widest text-xs"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                </button>
                <div className="flex items-center space-x-2">
                    <LogoIcon className="w-8 h-8" color="text-gold-500" />
                    <span className="font-serif text-lg font-bold text-navy-900 tracking-widest">VEDANCO</span>
                </div>
                <div className="w-20"></div> {/* Spacer for center alignment */}
            </div>

            {/* Hero Image */}
            <div className="relative h-[70vh] w-full mt-16">
                <img 
                    src={service.image} 
                    alt={service.title} 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-900/20 to-transparent flex items-end justify-center pb-20">
                    <div className="text-center text-white px-6 animate-slide-up">
                        <div className="inline-block p-4 rounded-full bg-white/10 backdrop-blur-md mb-8 border border-white/20">
                            {service.icon && <service.icon className="w-10 h-10 text-gold-400" />}
                        </div>
                        <h1 className="text-5xl md:text-8xl font-serif font-bold mb-6 drop-shadow-2xl">{service.title}</h1>
                        <p className="text-xl md:text-2xl font-light text-gray-200 max-w-2xl mx-auto">{service.desc}</p>
                    </div>
                </div>
            </div>

            {/* Content Content */}
            <div className="container mx-auto px-6 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Main Text */}
                    <div className="lg:col-span-7">
                        <h2 className="text-4xl font-serif font-bold text-navy-900 mb-10 relative inline-block">
                            Overview
                            <span className="absolute bottom-0 left-0 w-1/2 h-1 bg-gold-500"></span>
                        </h2>
                        <p className="text-slate-600 text-lg leading-relaxed mb-8 font-light">
                            {service.fullDesc || service.desc}
                        </p>
                        <p className="text-slate-600 text-lg leading-relaxed font-light">
                            At Vedanco, we believe that every journey should be an experience in itself. 
                            Our {service.title} service is designed with meticulous attention to detail, ensuring that your expectations are not just met, but exceeded.
                        </p>
                    </div>

                    {/* Features Sidebar */}
                    <div className="lg:col-span-5">
                        <div className="bg-gray-50 p-10 rounded-2xl border border-gray-100 shadow-lg sticky top-32">
                            <h3 className="text-xl font-serif font-bold text-navy-900 mb-8 flex items-center">
                                <Star className="w-5 h-5 text-gold-500 mr-2" /> Service Features
                            </h3>
                            <ul className="space-y-5">
                                {service.features && service.features.map((feature: string, idx: number) => (
                                    <li key={idx} className="flex items-start space-x-4">
                                        <div className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <CheckCircle className="w-3.5 h-3.5 text-navy-900" />
                                        </div>
                                        <span className="text-slate-700 font-medium">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-12 pt-8 border-t border-gray-200">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Ready to proceed?</h4>
                                <button className="w-full bg-navy-900 hover:bg-gold-500 hover:text-navy-900 text-white font-bold py-5 rounded-xl transition-all duration-300 shadow-xl text-xs uppercase tracking-widest">
                                    Inquire About {service.title}
                                </button>
                                <p className="text-center text-xs text-gray-400 mt-6">
                                    Speak with a consultant: <span className="text-navy-900 font-bold block mt-1 text-sm">+1 (800) 555-0199</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Services Section (Redesigned for Premium Light Theme) ---

export const ServicesSection = ({ onServiceClick, onViewAllClick }: any) => {
    // Scroll Triggers
    const [headerRef, headerVisible] = useInView({ threshold: 0.3 });
    const [cardsRef, cardsVisible] = useInView({ threshold: 0.1 });

    // Show first 4 services for a balanced grid
    const previewServices = servicesData.slice(0, 4);

    return (
        <section className="py-32 bg-white relative overflow-hidden">
            {/* Subtle Background Pattern */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:40px_40px] opacity-40"></div>
            
            {/* Soft Gradient Blob */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-b from-gray-50 to-transparent rounded-full blur-3xl opacity-60 pointer-events-none -translate-y-1/2 translate-x-1/3"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                    
                    {/* Left Column: Sticky Narrative Header */}
                    <div 
                        ref={headerRef} 
                        className={`lg:col-span-4 lg:sticky lg:top-32 transition-all duration-1000 ease-out transform ${headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                    >
                        <div className="relative mb-8">
                            <div className="inline-flex items-center space-x-3 mb-6">
                                <span className="w-12 h-[2px] bg-gold-500"></span>
                                <span className="text-gold-600 font-bold uppercase tracking-[0.4em] text-[10px]">Our Expertise</span>
                            </div>
                            
                            <h2 className="text-5xl md:text-7xl font-serif text-navy-900 mb-8 leading-[1.1]">
                                Curated <br/> 
                                <span className="italic font-light text-slate-400">Aviation</span> <br />
                                Services
                            </h2>
                        </div>
                        
                        <p className="text-slate-600 text-lg leading-8 font-light mb-10 max-w-sm border-l-2 border-gold-500/20 pl-6">
                            Beyond transportation, we orchestrate experiences. Tailored solutions for the modern elite, available on-demand globally.
                        </p>

                        <button 
                            onClick={onViewAllClick}
                            className="group flex items-center space-x-4 text-navy-900 text-xs font-bold uppercase tracking-[0.2em] hover:text-gold-600 transition-colors"
                        >
                            <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center group-hover:border-gold-500 group-hover:bg-gold-500 group-hover:text-white transition-all duration-500">
                                <ArrowRight className="w-4 h-4" />
                            </div>
                            <span>View All Services</span>
                        </button>
                    </div>

                    {/* Right Column: Clean White Cards */}
                    <div 
                        ref={cardsRef} 
                        className="lg:col-span-8"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
                            {previewServices.map((service, index) => (
                                <div 
                                    key={service.id}
                                    onClick={() => onServiceClick(service)} 
                                    className={`group relative cursor-pointer transition-all duration-700 ease-out ${cardsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
                                    style={{ transitionDelay: `${index * 100}ms` }}
                                >
                                    {/* Icon */}
                                    <div className="mb-6 inline-block p-4 rounded-2xl bg-gray-50 group-hover:bg-navy-900 transition-colors duration-500 shadow-sm">
                                        <service.icon className="w-8 h-8 text-navy-900 group-hover:text-gold-500 transition-colors duration-500" strokeWidth={1.5} />
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-3xl font-serif text-navy-900 mb-4 group-hover:text-gold-600 transition-colors duration-300">
                                        {service.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-slate-500 text-sm leading-relaxed mb-8 group-hover:text-navy-800 transition-colors duration-500 max-w-xs font-medium">
                                        {service.desc}
                                    </p>

                                    {/* Animated Divider */}
                                    <div className="w-full h-px bg-gray-200 relative overflow-hidden group-hover:bg-gray-300 transition-colors">
                                        <div className="absolute top-0 left-0 w-full h-full bg-gold-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-in-out"></div>
                                    </div>
                                    
                                    {/* Interaction Hint */}
                                    <div className="mt-4 flex items-center text-[10px] font-bold uppercase tracking-widest text-transparent group-hover:text-gold-600 transition-colors duration-500 delay-100 transform translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100">
                                        Explore <ArrowRight className="w-3 h-3 ml-2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
