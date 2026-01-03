
import React, { useRef, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Plane, Check, Gauge, Armchair, Box, Info, Users } from 'lucide-react';
import { fleetData } from '../data/data.tsx';
import { LogoIcon } from './Logo.tsx';

// --- Single Fleet Item Detail View ---
export const FleetDetailView = ({ jet, onClose, onBook, onPolicyClick }: any) => {
    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 animate-fade-in pb-20">
            {/* Sticky Header */}
            <div className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 py-4 px-6 flex justify-between items-center shadow-sm">
                <button
                    onClick={onClose}
                    className="flex items-center space-x-2 text-charcoal-900 hover:text-gold-500 transition-colors font-bold uppercase tracking-widest text-xs"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Fleet</span>
                </button>
                <div className="flex items-center space-x-2">
                    <LogoIcon className="w-8 h-8" color="text-gold-500" />
                    <span className="font-serif text-lg font-bold text-charcoal-900 tracking-widest">VEDANCO</span>
                </div>
                <div className="w-20"></div>
            </div>

            {/* Hero Section */}
            <div className="relative h-[70vh] w-full mt-16 group">
                <img
                    src={jet.image}
                    alt={jet.name}
                    className="w-full h-full object-cover transition-transform duration-10000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/80 via-charcoal-950/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 text-white">
                    <div className="container mx-auto">
                        <span className="inline-block px-3 py-1 bg-gold-500 text-charcoal-900 text-xs font-bold uppercase tracking-widest mb-4 rounded-sm">{jet.category}</span>
                        <h1 className="text-4xl md:text-8xl font-serif font-bold mb-4 drop-shadow-lg">{jet.name}</h1>
                        <div className="flex flex-wrap gap-4 md:gap-12 text-sm md:text-base font-medium opacity-90">
                            <div className="flex items-center"><Users className="w-5 h-5 mr-2 text-gold-500" /> {jet.seats} Passengers</div>
                            <div className="flex items-center"><Gauge className="w-5 h-5 mr-2 text-gold-500" /> {jet.speed} Cruise Speed</div>
                            <div className="flex items-center"><Plane className="w-5 h-5 mr-2 text-gold-500" /> {jet.range} Range</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Content */}
            <div className="container mx-auto px-6 py-16 md:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Left Column: Description & Specs */}
                    <div className="lg:col-span-8">
                        <h2 className="text-3xl font-serif font-bold text-charcoal-900 mb-8">Aircraft Overview</h2>
                        <p className="text-xl text-charcoal-600 leading-relaxed mb-12 font-light">
                            {jet.description}
                        </p>

                        <h3 className="text-xl font-bold text-charcoal-900 mb-6 border-b border-gray-200 pb-2">Technical Specifications</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                            <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Cabin Height</p>
                                <p className="text-lg font-bold text-charcoal-900">{jet.cabinHeight}</p>
                            </div>
                            <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Baggage Vol</p>
                                <p className="text-lg font-bold text-charcoal-900">{jet.baggage}</p>
                            </div>
                            <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Max Speed</p>
                                <p className="text-lg font-bold text-charcoal-900">{jet.speed}</p>
                            </div>
                            <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Max Range</p>
                                <p className="text-lg font-bold text-charcoal-900">{jet.range}</p>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-charcoal-900 mb-6 border-b border-gray-200 pb-2">Cabin Amenities</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {jet.amenities.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center space-x-3">
                                    <div className="w-6 h-6 rounded-full bg-gold-100 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-gold-600" />
                                    </div>
                                    <span className="text-charcoal-700 font-medium">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: CTA */}
                    <div className="lg:col-span-4">
                        <div className="bg-charcoal-950 text-white p-8 rounded-lg shadow-2xl sticky top-28">
                            <h3 className="text-2xl font-serif mb-2">Fly on the {jet.name}</h3>
                            <p className="text-gray-400 text-sm mb-8">Subject to availability. Instant quotes available.</p>

                            <button onClick={onBook} className="w-full bg-gold-500 hover:bg-white hover:text-charcoal-900 text-charcoal-900 font-bold py-4 rounded-sm transition-all duration-300 shadow-md mb-4 tracking-widest uppercase text-xs">
                                Request Quote
                            </button>
                            <button className="w-full border border-white/20 hover:border-white hover:bg-white/5 text-white font-bold py-4 rounded-sm transition-all duration-300 mb-6 tracking-widest uppercase text-xs">
                                Download Spec Sheet
                            </button>

                            <div className="border-t border-white/10 pt-6">
                                <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Need Assistance?</p>
                                <p className="text-lg font-bold text-white">+1 (800) 999-VEDANCO</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// --- All Fleet View (Grid) ---
export const AllFleetView = ({ onFleetClick, onClose, onPolicyClick }: any) => {
    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 animate-fade-in">
            <div className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 py-4 px-6 flex justify-between items-center shadow-sm">
                <button
                    onClick={onClose}
                    className="flex items-center space-x-2 text-charcoal-900 hover:text-gold-500 transition-colors font-bold uppercase tracking-widest text-xs"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Home</span>
                </button>
                <div className="flex items-center space-x-2">
                    <LogoIcon className="w-8 h-8" color="text-gold-500" />
                    <span className="font-serif text-lg font-bold text-charcoal-900 tracking-widest">VEDANCO</span>
                </div>
                <div className="w-20"></div>
            </div>

            <div className="pt-24 md:pt-32 pb-12 md:pb-16 bg-charcoal-950 text-center px-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <h1 className="text-3xl md:text-6xl font-serif text-white mb-6 relative z-10">Our Global Fleet</h1>
                <p className="text-gray-400 max-w-2xl mx-auto text-base md:text-lg leading-relaxed relative z-10">
                    From agile light jets for short hops to majestic ultra-long-range airliners, choose the perfect aircraft for your mission.
                </p>
            </div>

            <div className="container mx-auto px-6 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {fleetData.map((jet) => (
                        <div
                            key={jet.id}
                            onClick={() => onFleetClick(jet)}
                            className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-xl hover:border-gold-300 transition-all duration-300"
                        >
                            <div className="relative h-64 overflow-hidden">
                                <img src={jet.image} alt={jet.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-bold uppercase tracking-wider text-charcoal-900 rounded-sm">
                                    {jet.category}
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-2xl font-serif font-bold text-charcoal-900 mb-4 group-hover:text-gold-600 transition-colors">{jet.name}</h3>
                                <div className="flex justify-between text-sm text-gray-500 mb-6 border-b border-gray-100 pb-4">
                                    <div className="flex items-center"><Users className="w-4 h-4 mr-1" /> {jet.seats}</div>
                                    <div className="flex items-center"><Plane className="w-4 h-4 mr-1" /> {jet.range}</div>
                                    <div className="flex items-center"><Gauge className="w-4 h-4 mr-1" /> {jet.speed}</div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-widest text-gold-600 group-hover:underline">View Details</span>
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gold-500 group-hover:text-white transition-colors">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Main Fleet Section (Scrollable Carousel) ---
export const FleetSection = ({ onFleetClick, onViewAll }: any) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const { current } = scrollContainerRef;
            const scrollAmount = 350; // Width of card + gap
            if (direction === 'left') {
                current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

    return (
        <section className="py-16 md:py-24 bg-gray-50 border-t border-gray-100">
            <div className="container mx-auto px-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                    <div>
                        <span className="text-gold-600 font-bold uppercase tracking-widest text-xs mb-2 block">Our Aircraft</span>
                        <h2 className="text-3xl md:text-5xl font-serif text-charcoal-900">The Fleet</h2>
                    </div>

                    <div className="flex items-center gap-6 mt-6 md:mt-0">
                        {/* Desktop View All */}
                        <button onClick={onViewAll} className="hidden md:block text-sm font-bold uppercase tracking-widest text-charcoal-900 hover:text-gold-600 transition-colors mr-4">
                            View All Aircraft
                        </button>

                        {/* Navigation Arrows */}
                        <div className="flex space-x-2">
                            <button onClick={() => scroll('left')} className="p-3 border border-gray-200 rounded-full hover:bg-gold-500 hover:border-gold-500 hover:text-white text-charcoal-900 transition-all bg-white shadow-sm active:scale-95">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <button onClick={() => scroll('right')} className="p-3 border border-gray-200 rounded-full hover:bg-gold-500 hover:border-gold-500 hover:text-white text-charcoal-900 transition-all bg-white shadow-sm active:scale-95">
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Horizontal Scroll Container */}
                <div
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto space-x-6 pb-8 snap-x snap-mandatory scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {fleetData.map((jet) => (
                        <div
                            key={jet.id}
                            className="min-w-[85vw] md:min-w-[350px] lg:min-w-[400px] snap-center group relative overflow-hidden rounded-lg shadow-md border border-gray-200 bg-white flex-shrink-0 cursor-pointer hover:shadow-xl hover:border-gold-300 transition-all duration-300"
                            onClick={() => onFleetClick(jet)}
                        >
                            <div className="h-64 md:h-80 w-full relative overflow-hidden">
                                <img src={jet.image} alt={jet.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/90 via-transparent to-transparent opacity-90"></div>

                                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                                    <span className="text-white text-[10px] font-bold uppercase tracking-wider">{jet.category}</span>
                                </div>

                                <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                                    <h3 className="text-2xl font-serif mb-2">{jet.name}</h3>
                                    <div className="h-0.5 w-12 bg-gold-500 group-hover:w-full transition-all duration-500"></div>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-4 mb-4">
                                    <div className="text-center md:text-left">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold flex justify-center md:justify-start items-center"><Armchair className="w-3 h-3 mr-1" /> Seats</p>
                                        <p className="text-sm font-bold text-charcoal-900">{jet.seats}</p>
                                    </div>
                                    <div className="text-center md:text-left">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold flex justify-center md:justify-start items-center"><Plane className="w-3 h-3 mr-1" /> Range</p>
                                        <p className="text-sm font-bold text-charcoal-900">{jet.range}</p>
                                    </div>
                                    <div className="text-center md:text-left">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold flex justify-center md:justify-start items-center"><Gauge className="w-3 h-3 mr-1" /> Speed</p>
                                        <p className="text-sm font-bold text-charcoal-900">{jet.speed}</p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center mt-4">
                                    <span className="text-xs text-gold-600 font-bold uppercase tracking-widest group-hover:text-charcoal-900 transition-colors">View Details</span>
                                    <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-gold-500 group-hover:border-gold-500 group-hover:text-white transition-colors">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* CTA Card at the end of scroll */}
                    <div
                        className="min-w-[85vw] md:min-w-[350px] lg:min-w-[400px] snap-center rounded-lg bg-white border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-10 flex-shrink-0 hover:border-gold-400 hover:shadow-lg transition-all cursor-pointer group"
                        onClick={onViewAll}
                    >
                        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                            <Plane className="w-8 h-8 text-charcoal-900" />
                        </div>
                        <h3 className="text-xl font-serif font-bold text-charcoal-900 mb-2">View Full Fleet</h3>
                        <p className="text-center text-gray-500 text-sm mb-6">Explore our complete collection of 50+ aircraft types.</p>
                        <span className="text-xs font-bold uppercase tracking-widest text-gold-600 border-b border-gold-600 pb-1">Discover All</span>
                    </div>
                </div>

                {/* Mobile View All Button */}
                <div className="mt-8 text-center md:hidden">
                    <button onClick={onViewAll} className="inline-flex items-center text-sm font-bold tracking-widest uppercase text-charcoal-900 border-b border-gold-500 pb-1">
                        View All Aircraft <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                </div>
            </div>
            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </section>
    );
};
