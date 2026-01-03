
import React from 'react';
import { ArrowLeft, Plane, MapPin, ArrowRight } from 'lucide-react';
import { destinationsData } from '../data/data.tsx';
import { LogoIcon } from './Logo.tsx';

export const AllDestinationsView = ({ onClose, onPolicyClick }: any) => {
    return (
        <div className="min-h-screen bg-gray-50 animate-fade-in">
             {/* Sticky Header */}
             <div className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 py-4 px-6 flex justify-between items-center">
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

            {/* Header Section */}
            <div className="relative pt-32 pb-24 bg-charcoal-950 text-center px-6 overflow-hidden">
                <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-900/80 to-charcoal-900/80"></div>
                
                <div className="relative z-10">
                    <span className="text-gold-500 font-bold uppercase tracking-[0.3em] text-xs mb-4 block">Global Network</span>
                    <h1 className="text-4xl md:text-6xl font-serif text-white mb-6">World Class Destinations</h1>
                    <p className="text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed font-light">
                        Fly directly to over 5,000 airports worldwide. From major hubs to remote islands, the world is yours to explore.
                    </p>
                </div>
            </div>

            {/* Destinations Grid */}
            <div className="container mx-auto px-6 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {destinationsData.map((city) => (
                        <div 
                            key={city.id} 
                            className="group bg-white rounded-lg shadow-md hover:shadow-2xl border border-gray-200 overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-2"
                        >
                            <div className="relative h-72 overflow-hidden">
                                <img src={city.image} alt={city.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-charcoal-900 rounded-sm flex items-center">
                                    <MapPin className="w-3 h-3 mr-1 text-gold-500" /> {city.name}
                                </div>
                            </div>
                            
                            <div className="p-8">
                                <h3 className="text-2xl font-serif font-bold text-charcoal-900 mb-3">{city.name}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed mb-6 border-b border-gray-100 pb-6">
                                    {city.desc}
                                </p>
                                
                                <div className="flex justify-between items-center">
                                    <div className="text-xs font-medium text-gray-400">
                                        Approx Flight: <span className="text-charcoal-900 font-bold ml-1">{city.flightTime}</span>
                                    </div>
                                    <div className="flex items-center text-xs font-bold uppercase tracking-widest text-gold-600 group-hover:text-charcoal-900 transition-colors">
                                        Get Quote <ArrowRight className="w-3 h-3 ml-1" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {/* Custom Destination Card */}
                    <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center p-8 text-center hover:bg-gold-50 hover:border-gold-300 transition-all cursor-pointer group shadow-sm hover:shadow-md">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform border border-gray-200">
                            <MapPin className="w-8 h-8 text-gold-500" />
                        </div>
                        <h3 className="text-xl font-serif font-bold text-charcoal-900 mb-2">Somewhere Else?</h3>
                        <p className="text-gray-500 text-sm mb-6 max-w-xs">We can fly to any operational airport in the world. Tell us where you want to go.</p>
                        <button className="bg-charcoal-900 text-white px-6 py-3 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-gold-500 transition-colors shadow-md">
                            Request Custom Route
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
