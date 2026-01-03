
import React, { useState, useEffect } from 'react';
import { HeroSection } from './components/HeroSection';
import { TrustedSection, ProductsSection, HowItWorksSection, DestinationsSection, TestimonialsSection, CTASection, WhyChooseSection } from './components/Sections.tsx';
import { ServicesSection, ServiceDetailView, AllServicesView } from './components/ServiceComponents.tsx';
import { FleetSection, FleetDetailView, AllFleetView } from './components/FleetSection.tsx';
import { MembershipView } from './components/Membership.tsx';
import { AllDestinationsView } from './components/DestinationsComponents.tsx';
import { PrivacyPolicy, TermsConditions, SafetyStandards, CookiePolicy } from './components/Policies.tsx';

interface HomeProps {
    user: any;
    onBookingAuthRequired: () => void;
    onBookingSuccess: () => void;
    handlePolicyClick: (policy: string) => void;
    viewingPolicy: string | null;
    handleClosePolicy: () => void;
    navAction: { type: string; target: string; timestamp: number } | null;
}

export const Home: React.FC<HomeProps> = ({
    user,
    onBookingAuthRequired,
    onBookingSuccess,
    handlePolicyClick,
    viewingPolicy,
    handleClosePolicy,
    navAction
}) => {
    // Local View States
    const [selectedService, setSelectedService] = useState<any>(null);
    const [viewingAllServices, setViewingAllServices] = useState(false);
    const [selectedFleet, setSelectedFleet] = useState<any>(null);
    const [viewingAllFleet, setViewingAllFleet] = useState(false);
    const [viewingMembership, setViewingMembership] = useState(false);
    const [viewingAllDestinations, setViewingAllDestinations] = useState(false);

    // Handle Navigation Actions from Parent (Navbar)
    useEffect(() => {
        if (!navAction) return;

        // Reset all specific views to ensure we are on the "Landing Page" base state
        const resetViews = () => {
            setSelectedService(null);
            setViewingAllServices(false);
            setSelectedFleet(null);
            setViewingAllFleet(false);
            setViewingMembership(false);
            setViewingAllDestinations(false);
            handleClosePolicy();
        };

        if (navAction.type === 'view') {
            resetViews();
            if (navAction.target === 'membership') setViewingMembership(true);
        } else if (navAction.type === 'scroll') {
            // If we are currently in a sub-view (like Membership), close it first
            resetViews();

            // Allow React a tick to re-render the sections before scrolling
            setTimeout(() => {
                const element = document.getElementById(navAction.target);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
    }, [navAction]);

    // --- Render Logic Priority Chain ---

    // 1. Policies (Overlays everything)
    if (viewingPolicy) {
        switch (viewingPolicy) {
            case 'privacy': return <PrivacyPolicy onClose={handleClosePolicy} />;
            case 'terms': return <TermsConditions onClose={handleClosePolicy} />;
            case 'safety': return <SafetyStandards onClose={handleClosePolicy} />;
            case 'cookie': return <CookiePolicy onClose={handleClosePolicy} />;
            default: return <PrivacyPolicy onClose={handleClosePolicy} />;
        }
    }

    // 2. Full Screen Views
    if (viewingMembership) {
        return <MembershipView onClose={() => setViewingMembership(false)} onPolicyClick={handlePolicyClick} />;
    }
    if (viewingAllDestinations) {
        return <AllDestinationsView onClose={() => setViewingAllDestinations(false)} onPolicyClick={handlePolicyClick} />;
    }
    if (selectedService) {
        return <ServiceDetailView service={selectedService} onClose={() => setSelectedService(null)} onPolicyClick={handlePolicyClick} />;
    }
    if (viewingAllServices) {
        return <AllServicesView onServiceClick={setSelectedService} onClose={() => setViewingAllServices(false)} onPolicyClick={handlePolicyClick} />;
    }
    if (selectedFleet) {
        return <FleetDetailView jet={selectedFleet} onClose={() => setSelectedFleet(null)} onBook={() => { }} onPolicyClick={handlePolicyClick} />;
    }
    if (viewingAllFleet) {
        return <AllFleetView onFleetClick={setSelectedFleet} onClose={() => setViewingAllFleet(false)} onPolicyClick={handlePolicyClick} />;
    }

    // 3. Default Landing Page
    return (
        <div className="animate-fade-in">
            <HeroSection user={user} onSignInRequired={onBookingAuthRequired} onBookingSuccess={onBookingSuccess} />
            <TrustedSection />
            <div id="services-section">
                <ServicesSection onServiceClick={setSelectedService} onViewAllClick={() => setViewingAllServices(true)} />
            </div>

            {/* The New Enhanced Section */}
            <WhyChooseSection />

            <div id="fleet-section">
                <FleetSection onFleetClick={setSelectedFleet} onViewAll={() => setViewingAllFleet(true)} />
            </div>
            <ProductsSection />
            <HowItWorksSection />
            <div id="destinations-section">
                <DestinationsSection onViewAllClick={() => setViewingAllDestinations(true)} />
            </div>
            <TestimonialsSection />
            <CTASection />
        </div>
    );
};
