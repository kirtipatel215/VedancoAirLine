
import React from 'react';
import { ArrowLeft, Plane, Check, Star, Shield, Zap, Crown, Gem, Award } from 'lucide-react';
import { LogoIcon } from './Logo.tsx';

export const MembershipView = ({ onClose, onPolicyClick }) => {

    const tiers = [
        {
            name: "Bronze Access",
            price: "$5,000",
            period: "/ year",
            color: "from-orange-300 to-amber-700",
            textColor: "text-amber-700",
            borderColor: "border-amber-200",
            icon: Shield,
            desc: "Essential priority for the occasional charter traveler.",
            benefits: [
                "Guaranteed availability (48h notice)",
                "Fixed hourly rates on Light Jets",
                "No interchange fees",
                "Standard catering included",
                "Personal Travel Agent"
            ]
        },
        {
            name: "Silver Horizon",
            price: "$15,000",
            period: "/ year",
            color: "from-gray-300 to-gray-500",
            textColor: "text-gray-500",
            borderColor: "border-gray-300",
            icon: Star,
            featured: true,
            desc: "Enhanced flexibility and comfort for regular flyers.",
            benefits: [
                "Guaranteed availability (24h notice)",
                "Fixed rates on Light & Midsize Jets",
                "5% Flight Credit bonus",
                "Premium catering & beverages",
                "No blackout dates (excl. holidays)",
                "1 Complimentary Cabin Upgrade"
            ]
        },
        {
            name: "Gold Sovereign",
            price: "$50,000",
            period: "/ year",
            color: "from-yellow-300 to-yellow-600",
            textColor: "text-yellow-600",
            borderColor: "border-yellow-400",
            icon: Crown,
            desc: "The ultimate status. Zero compromises, limitless freedom.",
            benefits: [
                "Guaranteed availability (10h notice)",
                "Fixed rates on All Cabin Classes",
                "10% Flight Credit bonus",
                "Michelin-star dining curation",
                "Empty Leg priority access",
                "Dedicated 24/7 Lifestyle Manager",
                "Unlimited complimentary upgrades"
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 animate-fade-in">
            {/* Sticky Header */}
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
                <div className="w-20"></div> {/* Spacer */}
            </div>

            {/* Hero Section */}
            <div className="relative h-[60vh] md:h-[70vh] w-full mt-16 overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1577032757640-3948b8c25732?auto=format&fit=crop&w=2000&q=80"
                    alt="Luxury Lifestyle"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-charcoal-950/90 via-charcoal-900/60 to-transparent"></div>
                <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-20">
                    <div className="max-w-3xl animate-fade-in-up">
                        <span className="text-gold-400 font-bold uppercase tracking-[0.3em] text-xs md:text-sm mb-4 block">The Inner Circle</span>
                        <h1 className="text-4xl md:text-7xl lg:text-8xl font-serif text-white mb-6 leading-tight">
                            Elevate Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-200 to-gold-500">Privileges</span>
                        </h1>
                        <p className="text-gray-300 text-base md:text-xl max-w-2xl leading-relaxed mb-8 font-light">
                            Join the Vedanco Membership program to unlock fixed hourly rates, guaranteed aircraft availability, and a suite of exclusive lifestyle benefits.
                        </p>
                    </div>
                </div>
            </div>

            {/* Tiers Section */}
            <div className="py-16 md:py-24 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-3xl md:text-5xl font-serif text-charcoal-900 mb-4 md:mb-6">Choose Your Status</h2>
                        <p className="text-charcoal-600 text-sm md:text-base">Select the tier that aligns with your travel frequency and lifestyle demands.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {tiers.map((tier, idx) => (
                            <div
                                key={idx}
                                className={`relative bg-white rounded-xl overflow-hidden transition-all duration-300 group hover:-translate-y-2 ${tier.featured ? 'shadow-2xl border-2 border-gold-200 transform scale-105 z-10' : 'shadow-lg border border-gray-100'}`}
                            >
                                {/* Metallic Header */}
                                <div className={`h-2 w-full bg-gradient-to-r ${tier.color}`}></div>

                                <div className="p-8 md:p-10 flex flex-col h-full">
                                    <div className="mb-6 flex justify-between items-start">
                                        <div>
                                            <h3 className={`text-2xl font-serif font-bold ${tier.textColor} mb-2`}>{tier.name}</h3>
                                            <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Membership Tier</p>
                                        </div>
                                        <div className={`p-3 rounded-full bg-gray-50 ${tier.textColor}`}>
                                            <tier.icon className="w-6 h-6" />
                                        </div>
                                    </div>

                                    <div className="mb-8 pb-8 border-b border-gray-100">
                                        <div className="flex items-baseline">
                                            <span className="text-3xl md:text-4xl font-serif font-bold text-charcoal-900">{tier.price}</span>
                                            <span className="text-gray-500 ml-2 font-medium">{tier.period}</span>
                                        </div>
                                        <p className="text-gray-500 text-sm mt-4 leading-relaxed">{tier.desc}</p>
                                    </div>

                                    <ul className="space-y-4 mb-10 flex-grow">
                                        {tier.benefits.map((benefit, i) => (
                                            <li key={i} className="flex items-start">
                                                <Check className={`w-5 h-5 mr-3 flex-shrink-0 ${tier.featured ? 'text-gold-500' : 'text-gray-400'}`} />
                                                <span className="text-charcoal-900 text-sm font-medium">{benefit}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <button className={`w-full py-4 rounded-sm font-bold uppercase tracking-widest text-xs transition-all duration-300 ${tier.featured ? 'bg-gold-500 text-white hover:bg-charcoal-900' : 'bg-gray-100 text-charcoal-900 hover:bg-gold-500 hover:text-white'}`}>
                                        Select {tier.name.split(' ')[0]}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Feature Comparison Matrix */}
            <div className="py-16 md:py-24 bg-white border-t border-gray-100">
                <div className="container mx-auto px-6 max-w-5xl">
                    <h2 className="text-3xl font-serif text-charcoal-900 mb-8 md:mb-12 text-center">Benefit Comparison</h2>

                    <div className="overflow-x-auto pb-4">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr>
                                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-gray-400 border-b border-gray-200 w-1/4">Feature</th>
                                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-amber-700 border-b border-gray-200 text-center w-1/4">Bronze</th>
                                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-gray-500 border-b border-gray-200 text-center w-1/4">Silver</th>
                                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-yellow-600 border-b border-gray-200 text-center w-1/4">Gold</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-charcoal-900">
                                <tr>
                                    <td className="py-4 px-6 border-b border-gray-100 font-bold">Booking Notice</td>
                                    <td className="py-4 px-6 border-b border-gray-100 text-center">48 Hours</td>
                                    <td className="py-4 px-6 border-b border-gray-100 text-center">24 Hours</td>
                                    <td className="py-4 px-6 border-b border-gray-100 text-center font-bold text-gold-600">10 Hours</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 border-b border-gray-100 font-bold">Peak Day Surcharges</td>
                                    <td className="py-4 px-6 border-b border-gray-100 text-center">Standard</td>
                                    <td className="py-4 px-6 border-b border-gray-100 text-center">Waived (20 days)</td>
                                    <td className="py-4 px-6 border-b border-gray-100 text-center font-bold text-gold-600">Waived Always</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 border-b border-gray-100 font-bold">Catering</td>
                                    <td className="py-4 px-6 border-b border-gray-100 text-center">Standard</td>
                                    <td className="py-4 px-6 border-b border-gray-100 text-center">Premium</td>
                                    <td className="py-4 px-6 border-b border-gray-100 text-center font-bold text-gold-600">Michelin Star</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 border-b border-gray-100 font-bold">De-icing Inclusion</td>
                                    <td className="py-4 px-6 border-b border-gray-100 text-center text-gray-300"><span className="sr-only">No</span>—</td>
                                    <td className="py-4 px-6 border-b border-gray-100 text-center">50% Covered</td>
                                    <td className="py-4 px-6 border-b border-gray-100 text-center font-bold text-gold-600">100% Covered</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 border-b border-gray-100 font-bold">Transfer Services</td>
                                    <td className="py-4 px-6 border-b border-gray-100 text-center">Available</td>
                                    <td className="py-4 px-6 border-b border-gray-100 text-center">Luxury Sedan</td>
                                    <td className="py-4 px-6 border-b border-gray-100 text-center font-bold text-gold-600">Helicopter / Limo</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="bg-charcoal-900 py-16 md:py-20 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                <div className="container mx-auto px-6 text-center relative z-10">
                    <Gem className="w-12 h-12 text-gold-500 mx-auto mb-6" />
                    <h2 className="text-3xl md:text-5xl font-serif text-white mb-6">Experience the Exceptional</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto mb-10 text-base md:text-lg">
                        Contact our membership team to discuss your bespoke aviation requirements.
                    </p>
                    <button className="bg-white text-charcoal-900 hover:bg-gold-500 hover:text-white px-10 py-4 rounded-sm font-bold tracking-widest uppercase transition-all duration-300 shadow-xl text-xs md:text-sm">
                        Inquire About Membership
                    </button>
                </div>
            </div>
        </div>
    );
};
