
import React from 'react';
import { ArrowLeft, Shield, FileText, Lock, Cookie, Plane } from 'lucide-react';
import { Footer } from './Footer.tsx';
import { LogoIcon } from './Logo.tsx';

// Reusable Layout for Policy Pages
const PolicyLayout = ({ title, subtitle, icon: Icon, onClose, children }: any) => {
    return (
        <div className="min-h-screen bg-gray-50 animate-fade-in">
            {/* Sticky Header */}
            <div className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 py-4 px-6 flex justify-between items-center">
                <button 
                    onClick={onClose}
                    className="flex items-center space-x-2 text-charcoal-900 hover:text-gold-500 transition-colors font-bold uppercase tracking-widest text-xs"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                </button>
                <div className="flex items-center space-x-2">
                    <LogoIcon className="w-8 h-8" color="text-gold-500" />
                    <span className="font-serif text-lg font-bold text-charcoal-900 tracking-widest">VEDANCO</span>
                </div>
                <div className="w-20"></div> 
            </div>

            {/* Header Section */}
            <div className="pt-32 pb-16 bg-white text-center px-6 border-b border-gray-100">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm text-gold-500 border border-gray-100">
                    <Icon className="w-8 h-8" />
                </div>
                <h1 className="text-4xl md:text-5xl font-serif text-charcoal-900 mb-4">{title}</h1>
                <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base uppercase tracking-widest font-semibold">
                    {subtitle}
                </p>
            </div>

            {/* Content */}
            <div className="container mx-auto px-6 py-16 max-w-4xl">
                <div className="bg-white p-8 md:p-12 rounded-xl border border-gray-200 shadow-sm prose prose-lg prose-headings:font-serif prose-headings:text-charcoal-900 prose-p:text-gray-600 prose-a:text-gold-600 max-w-none">
                    {children}
                </div>
            </div>

            {/* Note: We don't include the Footer here to avoid recursive loops or navigation confusion within policy pages, 
                or we can include it but without navigation props if we want simple display. 
                For now, a simple footer line is enough or the main Footer with no-op handlers. */}
            <div className="bg-charcoal-950 py-8 text-center text-gray-500 text-xs border-t border-charcoal-900">
                <p>&copy; {new Date().getFullYear()} Vedanco Air. All rights reserved.</p>
            </div>
        </div>
    );
};

// Content wrapper to inject into layout
const ContentWrapper = ({ children, ...props }: any) => (
    <PolicyLayout {...props}>
        <div className="space-y-8">
            {children}
        </div>
    </PolicyLayout>
);

export const PrivacyPolicy = ({ onClose }) => (
    <ContentWrapper title="Privacy Policy" subtitle="Last Updated: October 2023" icon={Lock} onClose={onClose}>
        <section>
            <h3 className="text-2xl font-serif font-bold text-charcoal-900 mb-4">1. Introduction</h3>
            <p className="text-gray-600 leading-relaxed">At Vedanco Air, we are committed to maintaining the trust and confidence of our visitors to our web site. In particular, we want you to know that Vedanco Air is not in the business of selling, renting or trading email lists with other companies and businesses for marketing purposes.</p>
        </section>
        
        <section>
            <h3 className="text-2xl font-serif font-bold text-charcoal-900 mb-4">2. Collection of Personal Data</h3>
            <p className="text-gray-600 leading-relaxed mb-4">When you book a flight, sign up for our newsletter, or request a quote, we may collect personal information such as your name, email address, phone number, passport details, and payment information. This data is strictly used to facilitate your travel arrangements and ensure a seamless luxury experience.</p>
        </section>

        <section>
            <h3 className="text-2xl font-serif font-bold text-charcoal-900 mb-4">3. Use of Data</h3>
            <p className="text-gray-600 leading-relaxed mb-4">We use your personal information to:</p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>Process your flight bookings and additional concierge requests.</li>
                <li>Send you flight itineraries and updates.</li>
                <li>Improve our services and website functionality.</li>
                <li>Comply with legal and regulatory obligations in aviation.</li>
            </ul>
        </section>

        <section>
            <h3 className="text-2xl font-serif font-bold text-charcoal-900 mb-4">4. Data Security</h3>
            <p className="text-gray-600 leading-relaxed">We implement top-tier security measures including SSL encryption and secure server storage to protect your personal data from unauthorized access, alteration, or disclosure.</p>
        </section>
    </ContentWrapper>
);

export const TermsConditions = ({ onClose }) => (
    <ContentWrapper title="Terms & Conditions" subtitle="Operational Guidelines" icon={FileText} onClose={onClose}>
        <section>
            <h3 className="text-2xl font-serif font-bold text-charcoal-900 mb-4">1. Acceptance of Terms</h3>
            <p className="text-gray-600 leading-relaxed">By accessing this website and booking services with Vedanco Air, you agree to be bound by these Terms and Conditions and all applicable laws and regulations.</p>
        </section>

        <section>
            <h3 className="text-2xl font-serif font-bold text-charcoal-900 mb-4">2. Booking & Cancellation</h3>
            <p className="text-gray-600 leading-relaxed">All bookings are subject to aircraft availability and owner approval. Cancellation policies vary by operator and aircraft type. Generally, cancellations made within 72 hours of departure may incur a 100% cancellation fee.</p>
        </section>

        <section>
            <h3 className="text-2xl font-serif font-bold text-charcoal-900 mb-4">3. Flight Operations</h3>
            <p className="text-gray-600 leading-relaxed">Vedanco Air acts as an agent for the client. Flights are performed by fully licensed and insured air carriers. The pilot in command has the final authority on whether a flight can safely proceed.</p>
        </section>

        <section>
            <h3 className="text-2xl font-serif font-bold text-charcoal-900 mb-4">4. Luggage & Hazardous Materials</h3>
            <p className="text-gray-600 leading-relaxed">Luggage capacity is limited by the specific aircraft. Hazardous materials are strictly prohibited on board. Clients are responsible for ensuring they comply with all customs and immigration regulations.</p>
        </section>
    </ContentWrapper>
);

export const SafetyStandards = ({ onClose }) => (
    <ContentWrapper title="Safety Standards" subtitle="Our Uncompromising Commitment" icon={Shield} onClose={onClose}>
        <section>
            <h3 className="text-2xl font-serif font-bold text-charcoal-900 mb-4">1. Operator Vetting</h3>
            <p className="text-gray-600 leading-relaxed">Safety is the cornerstone of Vedanco Air. We do not own or operate aircraft; instead, we partner exclusively with operators who meet the highest industry standards.</p>
        </section>

        <section>
            <h3 className="text-2xl font-serif font-bold text-charcoal-900 mb-4">2. ARGUS & Wyvern Ratings</h3>
            <p className="text-gray-600 leading-relaxed">We prioritize operators holding ARGUS Gold/Platinum or Wyvern Wingman certifications. These third-party audits verify pilot training hours, maintenance records, and operational history.</p>
        </section>

        <section>
            <h3 className="text-2xl font-serif font-bold text-charcoal-900 mb-4">3. Crew Requirements</h3>
            <p className="text-gray-600 leading-relaxed">All flights are crewed by two pilots (Captain and First Officer). Our minimum requirement for Captains exceeds FAA/EASA standards, typically requiring over 3,000 hours of total flight time.</p>
        </section>

        <section>
            <h3 className="text-2xl font-serif font-bold text-charcoal-900 mb-4">4. Maintenance Protocols</h3>
            <p className="text-gray-600 leading-relaxed">Every aircraft in our network undergoes rigorous maintenance checks in accordance with the manufacturer's maintenance program and regulatory authority requirements.</p>
        </section>
    </ContentWrapper>
);

export const CookiePolicy = ({ onClose }) => (
    <ContentWrapper title="Cookie Policy" subtitle="Digital Experience Enhancement" icon={Cookie} onClose={onClose}>
        <section>
            <h3 className="text-2xl font-serif font-bold text-charcoal-900 mb-4">1. What are Cookies?</h3>
            <p className="text-gray-600 leading-relaxed">Cookies are small text files placed on your device to help the site provide a better user experience. In general, cookies are used to retain user preferences and store information for things like shopping carts.</p>
        </section>

        <section>
            <h3 className="text-2xl font-serif font-bold text-charcoal-900 mb-4">2. How We Use Cookies</h3>
            <p className="text-gray-600 leading-relaxed">We use cookies to analyze traffic via Google Analytics, enabling us to understand visitor behavior and improve our site structure. We do not use cookies to collect personally identifiable information.</p>
        </section>

        <section>
            <h3 className="text-2xl font-serif font-bold text-charcoal-900 mb-4">3. Managing Cookies</h3>
            <p className="text-gray-600 leading-relaxed">You may prefer to disable cookies on this site and on others. The most effective way to do this is to disable cookies in your browser. We suggest consulting the Help section of your browser.</p>
        </section>
    </ContentWrapper>
);
