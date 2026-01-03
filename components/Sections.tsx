
import React, { useState, useEffect, useRef } from 'react';
import { Globe, Heart, Anchor, Wind, Star, ChevronRight, ArrowRight, ChevronLeft, X, Smartphone, Clock, DollarSign, Map, Shield, Plane, CheckCircle2 } from 'lucide-react';
import { destinationsData, BENEFITS_DATA } from '../data/data.tsx';

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
    }, [options]);

    return [ref, isInView] as const;
};

// --- Trusted By Section (Premium Dark Monochrome) ---
export const TrustedSection = () => (
    <section className="bg-[#0B1120] border-b border-white/5 py-8 md:py-12 relative overflow-hidden">
        <div className="container mx-auto px-6 text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 mb-6 md:mb-8 block">As Seen In</span>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-24 opacity-40 hover:opacity-80 transition-all duration-700">
                {['Forbes', 'Bloomberg', 'TechCrunch', 'Vogue', 'GQ'].map((brand) => (
                    <span key={brand} className="text-xl md:text-3xl font-serif font-bold text-white cursor-default tracking-tight hover:text-amber-500 transition-colors duration-500">
                        {brand}
                    </span>
                ))}
            </div>
        </div>
    </section>
);

// --- Excellence in Motion (Premium Dark) ---
export const WhyChooseSection = () => {

    const StoryBlock = ({ title, copy, img, align = 'left', delay = 0 }: any) => {
        const [ref, inView] = useInView({ threshold: 0.2 });

        return (
            <div ref={ref} className={`flex flex-col md:flex-row items-center gap-10 md:gap-32 py-12 md:py-24 ${align === 'right' ? 'md:flex-row-reverse' : ''}`}>

                {/* Visual Side */}
                <div className={`w-full md:w-1/2 transition-all duration-1000 ease-out ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24'}`}>
                    <div className="relative overflow-hidden aspect-[16/11] group shadow-2xl rounded-sm border border-white/5">
                        <div className="absolute inset-0 bg-white/5 animate-pulse" />
                        <img
                            src={img}
                            alt={title}
                            className="w-full h-full object-cover transition-transform duration-[4000ms] ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100"
                        />
                        {/* Premium vignette overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] to-transparent opacity-20"></div>
                    </div>
                </div>

                {/* Narrative Side */}
                <div className="w-full md:w-1/2 px-0 md:px-0">
                    <div className={`transition-all duration-1000 ease-out delay-200 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                        <span className="text-amber-500 font-bold uppercase tracking-[0.3em] text-[10px] mb-4 md:mb-6 block">The Vedanco Standard</span>
                        <h3 className="text-3xl md:text-5xl lg:text-6xl font-serif text-white mb-6 md:mb-8 leading-[1.1]">
                            {title}
                        </h3>
                        <p className="text-gray-400 text-base md:text-lg font-light leading-loose max-w-md mb-8">
                            {copy}
                        </p>
                        <div className="w-16 h-[2px] bg-gradient-to-r from-amber-500 to-amber-700"></div>
                    </div>
                </div>
            </div>
        );
    };

    const [introRef, introInView] = useInView({ threshold: 0.1 });

    return (
        <section className="bg-[#0B1120] text-white relative">
            <div className="container mx-auto px-6 relative z-10 pt-16 md:pt-32 pb-12">

                {/* Intro Frame */}
                <div ref={introRef} className="flex flex-col justify-center items-center text-center mb-16 md:mb-32">
                    <div className={`transition-all duration-1000 ease-out ${introInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
                        <span className="text-amber-500 font-bold uppercase tracking-[0.4em] text-xs mb-6 md:mb-8 block">Our Philosophy</span>
                        <h2 className="text-4xl md:text-7xl lg:text-8xl font-serif text-white mb-8 md:mb-10 tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">
                            Perfection is not <br />
                            <span className="italic font-light text-gray-500">an accident.</span>
                        </h2>
                        <p className="text-gray-400 text-base md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
                            We don't just fly aircraft. We orchestrate time, physics, and luxury into a seamless symphony of travel.
                        </p>
                    </div>
                </div>

                {/* Story Blocks */}
                <div className="max-w-7xl mx-auto">
                    <StoryBlock
                        title="Precision Engineering"
                        copy="Every detail measured. Every decision deliberate. We curate flight plans with the accuracy of a Swiss chronometer, ensuring seamless execution from takeoff to touchdown."
                        img="https://plus.unsplash.com/premium_photo-1682144562076-19fa1b95ef4e?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8UHJlY2lzaW9uJTIwRW5naW5lZXJpbmd8ZW58MHx8MHx8fDA%3D"
                        align="left"
                    />

                    <StoryBlock
                        title="Uncompromising Trust"
                        copy="Built on verified operators, certified aircraft, and disciplined execution. Safety isn't a feature; it's our foundation. We employ the strictest vetting process in the industry."
                        img="https://images.unsplash.com/photo-1579878092855-461d04cc2a69?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fFVuY29tcHJvbWlzaW5nJTIwVHJ1c3QlMjBhaXJjcmFmdHxlbnwwfHwwfHx8MA%3D%3D"
                        align="right"
                    />
                </div>
            </div>
        </section>
    );
};

// --- Products (Rich Image Cards - Deep Navy) ---
export const ProductsSection = () => {
    const products = [
        {
            name: "Vedanco Yatra",
            subtitle: "Curated Expeditions",
            img: "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=800&q=80",
            desc: "Discover the world's most remote corners in absolute comfort."
        },
        {
            name: "Vedanco Weddings",
            subtitle: "Destination Events",
            img: "https://images.unsplash.com/photo-1519225468359-2996bc01c083?auto=format&fit=crop&w=800&q=80",
            desc: "Arrive at your special day with the grandeur it deserves."
        },
        {
            name: "Vedanco Rescue",
            subtitle: "Medical Air Transport",
            img: "https://images.unsplash.com/photo-1584036561566-b93a945c3bf0?auto=format&fit=crop&w=800&q=80",
            desc: "Rapid response medical evacuation with ICU-equipped aircraft."
        },
        {
            name: "Vedanco Heli",
            subtitle: "Urban Mobility",
            img: "https://images.unsplash.com/photo-1559586616-361e18714958?auto=format&fit=crop&w=800&q=80",
            desc: "Bypass traffic and land directly at your final destination."
        }
    ];

    return (
        <section className="py-16 md:py-32 bg-[#080C14] relative overflow-hidden">

            {/* Section Header */}
            <div className="container mx-auto px-6 mb-12 md:mb-24 relative z-10 flex flex-col md:flex-row items-end justify-between">
                <div className="max-w-xl">
                    <span className="text-amber-500 font-bold uppercase tracking-[0.2em] text-xs mb-4 md:mb-6 block">Beyond the Jet</span>
                    <h2 className="text-4xl md:text-6xl font-serif text-white leading-tight">Tailored Aviation <br />Solutions</h2>
                </div>
                <div className="mt-8 md:mt-0">
                    <p className="text-gray-400 text-sm max-w-sm leading-relaxed border-l border-white/10 pl-6">
                        Specialized divisions dedicated to unique mission profiles, from urgent medical transport to luxury leisure travel.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 h-auto md:h-[600px] gap-4 md:gap-1">
                    {products.map((product, index) => (
                        <div key={index} className="group relative overflow-hidden cursor-pointer h-[350px] md:h-full transition-all duration-700 ease-in-out hover:grow-[1] md:hover:grow-[2.5] rounded-sm md:rounded-none">
                            {/* Background Image */}
                            <img src={product.img} alt={product.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-[#0B1120]/60 group-hover:bg-[#0B1120]/30 transition-colors duration-700"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-transparent to-transparent opacity-90"></div>

                            {/* Content */}
                            <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-end">
                                <span className="text-amber-400 text-[10px] uppercase tracking-widest font-bold mb-2 md:mb-4 transform translate-y-4 opacity-100 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-500 delay-100">{product.subtitle}</span>
                                <h3 className="text-2xl md:text-3xl font-serif text-white font-medium mb-4 transform translate-y-0 md:translate-y-4 md:group-hover:translate-y-0 transition-transform duration-500">{product.name}</h3>
                                <div className="h-[1px] w-full md:w-0 bg-amber-500 md:group-hover:w-full transition-all duration-700 ease-out mb-4 md:mb-6"></div>
                                <p className="text-gray-200 text-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 transform translate-y-0 md:translate-y-4 md:group-hover:translate-y-0 transition-all duration-500 delay-200 hidden md:block leading-relaxed max-w-xs">
                                    {product.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// --- How It Works (Premium Step Guide) ---
export const HowItWorksSection = () => {
    const steps = [
        { num: "01", title: "Search", desc: "Define your route." },
        { num: "02", title: "Select", desc: "Choose your aircraft." },
        { num: "03", title: "Confirm", desc: "Instant booking." },
        { num: "04", title: "Depart", desc: "Fly in 15 minutes." },
    ];

    return (
        <section className="py-16 md:py-24 bg-[#0B1120] border-t border-white/5 relative">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-16">
                    <div className="w-full md:w-1/3">
                        <h2 className="text-3xl md:text-4xl font-serif text-white mb-4 md:mb-6">Effortless <br />Command</h2>
                        <p className="text-gray-400 font-light leading-relaxed text-sm md:text-base">
                            We've stripped away the complexity. Our proprietary booking engine connects you directly to the fleet, bypassing brokers and delays.
                        </p>
                        <button className="mt-6 md:mt-8 text-amber-500 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center group">
                            Learn More <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="w-full md:w-2/3 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                        {steps.map((step, index) => (
                            <div key={index} className="flex flex-col border-l border-white/10 pl-6 md:pl-8 group hover:border-amber-500 transition-colors duration-500 py-2">
                                <span className="text-4xl md:text-5xl font-serif text-gray-700 group-hover:text-amber-500 transition-colors mb-2 md:mb-4 block">{step.num}</span>
                                <h3 className="text-white font-bold text-sm tracking-wide mb-2 uppercase">{step.title}</h3>
                                <p className="text-gray-500 text-xs">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

// --- Destinations (Deep Dark Grid) ---
export const DestinationsSection = ({ onViewAllClick }: any) => {
    const featuredDestinations = destinationsData.slice(0, 3);

    return (
        <section className="py-16 md:py-32 bg-[#0F172A] relative border-t border-white/5">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 md:mb-16">
                    <div>
                        <span className="text-amber-500 font-bold uppercase tracking-widest text-xs mb-4 block">Global Network</span>
                        <h2 className="text-4xl md:text-5xl font-serif text-white">Featured <br />Destinations</h2>
                    </div>
                    <button
                        onClick={onViewAllClick}
                        className="flex md:hidden items-center text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-amber-500 transition-colors mt-6 group border-b border-gray-600 hover:border-amber-500 pb-2"
                    >
                        View All Destinations
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={onViewAllClick}
                        className="hidden md:flex items-center text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-amber-500 transition-colors mt-6 md:mt-0 group border-b border-gray-600 hover:border-amber-500 pb-2"
                    >
                        View All Destinations
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* Asymmetrical Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 h-auto md:h-[650px]">
                    <div className="md:col-span-8 relative group h-[350px] md:h-full rounded-sm overflow-hidden cursor-pointer shadow-2xl border border-white/5">
                        <img src={featuredDestinations[0].image} className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-transparent to-transparent opacity-90"></div>
                        <div className="absolute bottom-0 left-0 p-8 md:p-12 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                            <div className="bg-amber-500 text-[#0B1120] text-[10px] font-bold uppercase tracking-widest px-3 py-1 inline-block mb-3 md:mb-4">Trending</div>
                            <h3 className="text-3xl md:text-4xl font-serif font-bold mb-3 md:mb-4">{featuredDestinations[0].name}</h3>
                            <p className="text-sm text-gray-300 max-w-lg leading-relaxed mb-6 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 delay-100 hidden md:block">{featuredDestinations[0].desc}</p>
                            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest flex items-center">Explore <ArrowRight className="w-4 h-4 ml-2" /></span>
                        </div>
                    </div>
                    <div className="md:col-span-4 flex flex-col gap-6 md:gap-8">
                        {featuredDestinations.slice(1).map((city: any, idx: number) => (
                            <div key={idx} className="relative group h-[250px] md:h-1/2 rounded-sm overflow-hidden cursor-pointer shadow-xl border border-white/5">
                                <img src={city.image} className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-transparent to-transparent opacity-90"></div>
                                <div className="absolute bottom-0 left-0 p-6 md:p-8 text-white">
                                    <h3 className="text-xl md:text-2xl font-serif font-bold mb-2">{city.name}</h3>
                                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wider group-hover:text-amber-400 transition-colors">{city.flightTime} Flight</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

// --- Testimonials (Deep Elegant) ---
export const TestimonialsSection = () => {
    return (
        <section className="py-20 md:py-40 bg-[#0B1120] relative border-t border-white/5 flex items-center justify-center">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:16px_16px]"></div>

            <div className="container mx-auto px-6 text-center max-w-5xl relative z-10">
                <Star className="w-8 h-8 text-amber-500 mx-auto mb-8 md:mb-10 fill-current animate-pulse" />
                <h2 className="text-3xl md:text-4xl lg:text-6xl font-serif text-white mb-10 md:mb-16 leading-tight tracking-tight">
                    "Vedanco has completely redefined what I expect from private aviation. The attention to detail is simply obsessive."
                </h2>
                <div className="flex items-center justify-center gap-5">
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" className="w-16 h-16 rounded-full grayscale object-cover ring-2 ring-amber-500/20" />
                    <div className="text-left">
                        <p className="text-sm font-bold text-white uppercase tracking-widest">James Worthington</p>
                        <p className="text-xs text-amber-500 mt-1">CEO, Worthington Capital</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

// --- CTA (Cinematic Gold) ---
export const CTASection = () => (
    <section className="py-20 md:py-32 relative overflow-hidden bg-black flex items-center justify-center min-h-[50vh] md:min-h-[60vh]">

        {/* BG Image */}
        <div className="absolute inset-0 opacity-40">
            <img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=2000&q=80" className="w-full h-full object-cover grayscale blur-sm scale-110" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-[#0B1120]/80 to-[#0B1120]/40"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/20 to-transparent"></div>

        <div className="container mx-auto px-6 relative z-10 text-center">
            <span className="text-amber-500 font-bold uppercase tracking-[0.3em] text-xs mb-6 md:mb-8 block animate-fade-in-up">The Journey Begins</span>
            <h2 className="text-4xl md:text-5xl lg:text-8xl font-serif text-white mb-10 md:mb-12 tracking-tight drop-shadow-2xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>Ready to Take Flight?</h2>

            <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <button className="bg-amber-500 text-[#0B1120] px-10 md:px-12 py-4 md:py-5 rounded-sm font-bold tracking-[0.2em] uppercase text-xs hover:bg-white transition-all shadow-[0_0_30px_-5px_rgba(245,158,11,0.5)] hover:shadow-white/20 hover:scale-105 transform duration-300 w-full md:w-auto">
                    Begin Your Inquiry
                </button>
                <button className="border border-white/20 text-white px-10 md:px-12 py-4 md:py-5 rounded-sm font-bold tracking-[0.2em] uppercase text-xs hover:bg-white hover:text-[#0B1120] transition-all backdrop-blur-sm w-full md:w-auto">
                    Contact Concierge
                </button>
            </div>
        </div>
    </section>
);
