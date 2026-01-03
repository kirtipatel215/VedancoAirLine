
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut, LayoutDashboard, ChevronRight } from 'lucide-react';
import { FullLogo, LogoIcon } from './Logo';

interface NavbarProps {
    isScrolled: boolean;
    mobileMenuOpen: boolean;
    setMobileMenuOpen: (open: boolean) => void;
    onFleetClick: () => void;
    onMembershipClick: () => void;
    onServicesClick: () => void;
    onDestinationsClick: () => void;
    onSignInClick: () => void;
    user: any;
    onSignOut: () => void;
    onDashboardClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
    isScrolled,
    mobileMenuOpen,
    setMobileMenuOpen,
    onFleetClick,
    onMembershipClick,
    onServicesClick,
    onDestinationsClick,
    onSignInClick,
    user,
    onSignOut,
    onDashboardClick
}) => {
    // Premium reveal animation
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const navLinks = [
        { name: 'Fleet', action: onFleetClick },
        { name: 'Membership', action: onMembershipClick },
        { name: 'Services', action: onServicesClick },
        { name: 'Destinations', action: onDestinationsClick },
    ];

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${isScrolled
                    ? 'bg-white/95 backdrop-blur-md py-4 shadow-sm border-gray-100'
                    : 'bg-transparent py-4 md:py-6 border-transparent'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    {/* Logo Area */}
                    <div className="flex items-center cursor-pointer z-50 relative" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <FullLogo
                            iconClass="w-10 h-10"
                            color={isScrolled || mobileMenuOpen ? "text-[#0B1120]" : "text-white"}
                            textColor={isScrolled || mobileMenuOpen ? "text-[#0B1120]" : "text-white"}
                            subColor={isScrolled || mobileMenuOpen ? "text-gold-500" : "text-amber-400"}
                        />
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <button
                                key={link.name}
                                onClick={link.action}
                                className={`text-sm tracking-[0.15em] uppercase font-medium transition-colors duration-300 relative group ${isScrolled ? 'text-gray-600 hover:text-[#0B1120]' : 'text-white hover:text-amber-400'
                                    }`}
                            >
                                {link.name}
                                <span className={`absolute -bottom-2 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${isScrolled ? 'bg-gold-500' : 'bg-amber-400'}`} />
                            </button>
                        ))}

                        <div className="w-px h-6 bg-gray-200 mx-4" />

                        {user ? (
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={onDashboardClick}
                                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${isScrolled ? 'text-[#0B1120] hover:text-gold-600' : 'text-white hover:text-amber-400'}`}
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    <span>Dashboard</span>
                                </button>
                                <button
                                    onClick={onSignOut}
                                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${isScrolled ? 'text-gray-500 hover:text-red-500' : 'text-white/70 hover:text-red-400'}`}
                                    title="Sign Out"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={onSignInClick}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium tracking-wide transition-all duration-300 ${isScrolled
                                    ? 'bg-[#0B1120] text-white hover:bg-[#1a2e4d] shadow-md hover:shadow-lg'
                                    : 'bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white hover:text-[#0B1120] shadow-lg'
                                    }`}
                            >
                                <User className="w-4 h-4" />
                                <span>SIGN IN</span>
                            </button>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden z-50 p-2 text-[#0B1120] focus:outline-none"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed inset-0 z-40 bg-white md:hidden flex flex-col pt-32 px-8"
                    >
                        <div className="flex flex-col space-y-8">
                            {navLinks.map((link, idx) => (
                                <motion.button
                                    key={link.name}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 + idx * 0.1 }}
                                    onClick={() => {
                                        link.action();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="flex items-center justify-between text-2xl font-serif text-[#0B1120] border-b border-gray-100 pb-4"
                                >
                                    <span>{link.name}</span>
                                    <ChevronRight className="w-5 h-5 text-gold-500" />
                                </motion.button>
                            ))}

                            <div className="pt-8 space-y-4">
                                {user ? (
                                    <>
                                        <button
                                            onClick={() => {
                                                onDashboardClick();
                                                setMobileMenuOpen(false);
                                            }}
                                            className="w-full flex items-center justify-center gap-3 bg-midnight-900 text-white py-4 rounded-xl font-medium tracking-wide shadow-lg"
                                        >
                                            <LayoutDashboard className="w-5 h-5" />
                                            Dashboard
                                        </button>
                                        <button
                                            onClick={() => {
                                                onSignOut();
                                                setMobileMenuOpen(false);
                                            }}
                                            className="w-full flex items-center justify-center gap-3 bg-gray-100 text-gray-600 py-4 rounded-xl font-medium tracking-wide hover:bg-gray-200"
                                        >
                                            <LogOut className="w-5 h-5" />
                                            Sign Out
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => {
                                            onSignInClick();
                                            setMobileMenuOpen(false);
                                        }}
                                        className="w-full flex items-center justify-center gap-3 bg-midnight-900 text-white py-4 rounded-xl font-medium tracking-wide shadow-lg"
                                    >
                                        <User className="w-5 h-5" />
                                        Sign In
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="mt-auto pb-12 text-center text-gray-400 text-sm">
                            <p>© 2025 Vedanco Air</p>
                            <p>Luxury Private Jet Charter</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
