import React, { useEffect, useState } from 'react';
import { ArrowRight, ChevronDown, Calendar, Users, Plane, MapPin, Search, Briefcase } from 'lucide-react';
import { SecureApiService } from './dashboard/service';

export const HeroSection = ({ user, onSignInRequired, onBookingSuccess }: { user: any, onSignInRequired: () => void, onBookingSuccess?: () => void }) => {
    const [scrolled, setScrolled] = useState(false);

    // Form State
    const [tripType, setTripType] = useState('one-way'); // 'one-way' | 'round-trip'
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [date, setDate] = useState('');
    const [returnDate, setReturnDate] = useState('');
    const [passengers, setPassengers] = useState(1);
    const [purpose, setPurpose] = useState('Leisure');
    const [luggage, setLuggage] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookingError, setBookingError] = useState('');
    const [bookingSuccess, setBookingSuccess] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToContent = () => {
        const section = document.getElementById('services-section');
        section?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setBookingError('');
        setBookingSuccess(false);

        if (!user) {
            onSignInRequired();
            return;
        }

        if (!from || !to || !date) {
            setBookingError('Please fill in all required fields.');
            return;
        }

        if (tripType === 'round-trip' && !returnDate) {
            setBookingError('Please select a return date.');
            return;
        }

        setIsSubmitting(true);

        try {
            await SecureApiService.createInquiry({
                from,
                to,
                date,
                returnDate: tripType === 'round-trip' ? returnDate : null,
                passengers: passengers.toString(),
                purpose,
                notes: `Trip Type: ${tripType}. Luggage: ${luggage || 'None'}. Booking from Landing Page`
            });

            setBookingSuccess(true);

            if (onBookingSuccess) {
                onBookingSuccess();
            } else {
                setFrom('');
                setTo('');
                setDate('');
                setReturnDate('');
                setPassengers(1);
                setLuggage('');
            }

            // Optional: Scroll to dashboard or show more specific success UI?
            // For now, inline success message is good.
        } catch (err: any) {
            console.error(err);
            setBookingError(err.message || 'Failed to submit inquiry.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="relative min-h-[100dvh] md:h-screen w-full overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute inset-0">
                <img
                    src="https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=2600&auto=format&fit=crop"
                    alt="Private Jet Interior"
                    className="w-full h-full object-cover scale-105 animate-slow-zoom"
                />

                {/* Premium Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0B1120] via-[#0B1120]/60 to-transparent opacity-90"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-transparent to-transparent opacity-90"></div>
            </div>

            {/* Content Container */}
            <div className="relative h-full container mx-auto px-6 flex flex-col md:flex-row items-center justify-center md:justify-between z-10 pt-28 pb-24 md:py-20">

                {/* Left Side: Headlines */}
                <div className="w-full md:w-1/2 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>

                    {/* Pre-header Tag */}
                    <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 mb-6 md:mb-8 w-fit overflow-hidden group hover:bg-white/20 transition-all cursor-default">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                        <span className="text-amber-400 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em]">The New Standard in Aviation</span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-4xl md:text-7xl lg:text-8xl font-serif font-medium text-white leading-[1.1] mb-6 md:mb-8 tracking-tight">
                        Elevate Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 italic">Expectations</span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-base md:text-xl text-gray-300 font-light max-w-2xl leading-relaxed mb-8 md:mb-12 border-l-2 border-amber-500 pl-6">
                        Experience the pinnacle of private aviation. Vedanco Air combines seamless technology with white-glove service to deliver a travel experience that respects your time and exceeds your standards.
                    </p>

                    <div className="flex gap-4">
                        <button
                            onClick={scrollToContent}
                            className="bg-transparent border border-white/20 text-white px-8 py-3 rounded-sm uppercase tracking-widest text-xs font-bold hover:bg-white hover:text-navy-900 transition-all"
                        >
                            Explore Fleet
                        </button>
                    </div>
                </div>

                {/* Right Side: Booking Form */}
                <div className="w-full md:w-1/3 mt-8 md:mt-0 opacity-0 animate-fade-in-up pb-10 md:pb-0" style={{ animationDelay: '0.4s' }}>
                    <div className="bg-[#0B1120]/80 backdrop-blur-xl border border-white/20 p-6 md:p-8 rounded-lg shadow-2xl relative overflow-hidden group">
                        {/* Shimmer Effect */}
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-serif text-white flex items-center gap-3">
                                <Plane className="w-6 h-6 text-amber-500 transform -rotate-45" />
                                Start Your Journey
                            </h3>
                        </div>

                        {/* Trip Type Toggle */}
                        <div className="flex bg-black/40 rounded-lg p-1 mb-6 border border-white/10">
                            <button
                                onClick={() => setTripType('one-way')}
                                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all ${tripType === 'one-way' ? 'bg-amber-500 text-[#0B1120]' : 'text-gray-400 hover:text-white'}`}
                            >
                                One Way
                            </button>
                            <button
                                onClick={() => setTripType('round-trip')}
                                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all ${tripType === 'round-trip' ? 'bg-amber-500 text-[#0B1120]' : 'text-gray-400 hover:text-white'}`}
                            >
                                Round Trip
                            </button>
                        </div>

                        {bookingSuccess && !onBookingSuccess ? (
                            <div className="bg-green-500/20 border border-green-500/30 p-6 rounded text-center animate-fade-in">
                                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Plane className="w-6 h-6 text-white" />
                                </div>
                                <h4 className="text-white font-bold text-lg mb-2">Request Received</h4>
                                <p className="text-gray-200 text-sm">
                                    Our concierge team will review your request and contact you shortly with a personalized quote.
                                </p>
                                <button
                                    onClick={() => setBookingSuccess(false)}
                                    className="mt-4 text-amber-400 text-xs font-bold uppercase hover:text-white transition-colors"
                                >
                                    Book Another Flight
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleBookingSubmit} className="space-y-4">

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-white/80 tracking-wider">From</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 w-4 h-4 text-amber-500" />
                                            <input
                                                type="text"
                                                placeholder="Departure"
                                                value={from}
                                                onChange={(e) => setFrom(e.target.value)}
                                                className="w-full bg-black/50 border border-white/20 rounded p-2.5 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-white/80 tracking-wider">To</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 w-4 h-4 text-amber-500" />
                                            <input
                                                type="text"
                                                placeholder="Destination"
                                                value={to}
                                                onChange={(e) => setTo(e.target.value)}
                                                className="w-full bg-black/50 border border-white/20 rounded p-2.5 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className={`grid ${tripType === 'round-trip' ? 'grid-cols-2' : 'grid-cols-1'} gap-4 transition-all`}>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-white/80 tracking-wider">Date</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-3 w-4 h-4 text-amber-500" />
                                            <input
                                                type="date"
                                                value={date}
                                                onChange={(e) => setDate(e.target.value)}
                                                className="w-full bg-black/50 border border-white/20 rounded p-2.5 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors text-sm [color-scheme:dark]"
                                            />
                                        </div>
                                    </div>
                                    {tripType === 'round-trip' && (
                                        <div className="space-y-1 animate-fade-in">
                                            <label className="text-xs font-bold uppercase text-white/80 tracking-wider">Return</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-3 w-4 h-4 text-amber-500" />
                                                <input
                                                    type="date"
                                                    value={returnDate}
                                                    onChange={(e) => setReturnDate(e.target.value)}
                                                    className="w-full bg-black/50 border border-white/20 rounded p-2.5 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors text-sm [color-scheme:dark]"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-white/80 tracking-wider">Passengers</label>
                                        <div className="relative">
                                            <Users className="absolute left-3 top-3 w-4 h-4 text-amber-500" />
                                            <select
                                                value={passengers}
                                                onChange={(e) => setPassengers(parseInt(e.target.value))}
                                                className="w-full bg-black/50 border border-white/20 rounded p-2.5 pl-10 text-white focus:outline-none focus:border-amber-500 transition-colors text-sm appearance-none"
                                            >
                                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16].map(n => (
                                                    <option key={n} value={n} className="bg-[#0B1120]">{n} Pax</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase text-white/80 tracking-wider">Purpose</label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-3 top-3 w-4 h-4 text-amber-500" />
                                            <select
                                                value={purpose}
                                                onChange={(e) => setPurpose(e.target.value)}
                                                className="w-full bg-black/50 border border-white/20 rounded p-2.5 pl-10 text-white focus:outline-none focus:border-amber-500 transition-colors text-sm appearance-none"
                                            >
                                                {['Leisure', 'Business', 'Medical', 'Cargo', 'Other'].map(p => (
                                                    <option key={p} value={p} className="bg-[#0B1120]">{p}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-white/80 tracking-wider">Luggage</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 2 Large Suitcases, 1 Golf Bag"
                                        value={luggage}
                                        onChange={(e) => setLuggage(e.target.value)}
                                        className="w-full bg-black/50 border border-white/20 rounded p-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors text-sm"
                                    />
                                </div>

                                {bookingError && (
                                    <p className="text-red-400 text-xs mt-2 bg-red-500/10 p-2 rounded border border-red-500/20">{bookingError}</p>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full mt-6 bg-amber-500 text-[#0B1120] font-bold uppercase tracking-widest py-4 rounded-sm hover:bg-white transition-all shadow-lg hover:shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <span className="w-5 h-5 border-2 border-navy-900 border-t-transparent rounded-full animate-spin"></span>
                                    ) : (
                                        <>
                                            Request Quote <Search className="w-4 h-4" />
                                        </>
                                    )}
                                </button>

                                {!user && (
                                    <p className="text-center text-gray-400 text-[10px] mt-3">
                                        You'll be asked to sign in to save your request.
                                    </p>
                                )}
                            </form>
                        )}
                    </div>
                </div>

            </div>

            {/* Scroll Indicator */}
            <div
                onClick={scrollToContent}
                className="absolute bottom-12 left-1/2 transform -translate-x-1/2 text-white/50 hover:text-white cursor-pointer transition-colors flex flex-col items-center animate-bounce z-20"
            >
                <span className="text-[10px] uppercase tracking-widest mb-2">Scroll</span>
                <ChevronDown className="w-6 h-6" />
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-amber-500/5 to-transparent pointer-events-none"></div>
        </section>
    );
};
