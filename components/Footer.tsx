
import React from 'react';
import { LogoIcon, LogoText } from './Logo.tsx';

export const Footer = ({ onPolicyClick, onAdminClick, onOperatorClick, user }: any) => (
    <footer className="bg-black pt-16 md:pt-24 pb-8 md:pb-12 text-gray-400 border-t border-white/10 font-sans">
        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-16 md:mb-20">
            {/* Brand Column */}
            <div>
                <div className="flex items-center space-x-3 mb-8">
                    <LogoIcon className="w-10 h-10" color="text-gold-500" />
                    <LogoText color="text-white" subColor="text-gold-500" />
                </div>
                <p className="text-sm mb-8 leading-relaxed font-light text-gray-500 max-w-xs">
                    Vedanco Air sets the standard for private aviation. Uncompromising safety, luxury, and service for the discerning traveler.
                </p>
                <div className="flex space-x-6">
                    {['Instagram', 'Twitter', 'LinkedIn', 'Facebook'].map((social) => (
                        <a key={social} href="#" className="hover:text-gold-500 transition-colors text-[10px] uppercase tracking-widest font-bold">{social}</a>
                    ))}
                </div>
            </div>

            {/* Links Columns */}
            <div>
                <h4 className="text-white font-bold uppercase tracking-widest text-[10px] mb-8 flex items-center">
                    <span className="w-1 h-1 bg-gold-500 mr-3 rounded-full"></span> Company
                </h4>
                <ul className="space-y-4 text-sm font-light">
                    <li><button className="hover:text-white transition-colors text-left hover:translate-x-1 transform duration-300">About Us</button></li>
                    <li><button className="hover:text-white transition-colors text-left hover:translate-x-1 transform duration-300">Careers</button></li>
                    <li><button className="hover:text-white transition-colors text-left hover:translate-x-1 transform duration-300">Press & Media</button></li>
                    <li><button className="hover:text-white transition-colors text-left hover:translate-x-1 transform duration-300">Sustainability</button></li>
                </ul>
            </div>

            <div>
                <h4 className="text-white font-bold uppercase tracking-widest text-[10px] mb-8 flex items-center">
                    <span className="w-1 h-1 bg-gold-500 mr-3 rounded-full"></span> Services
                </h4>
                <ul className="space-y-4 text-sm font-light">
                    <li><button className="hover:text-white transition-colors text-left hover:translate-x-1 transform duration-300">Private Charter</button></li>
                    <li><button className="hover:text-white transition-colors text-left hover:translate-x-1 transform duration-300">Jet Card Membership</button></li>
                    <li><button className="hover:text-white transition-colors text-left hover:translate-x-1 transform duration-300">Empty Legs</button></li>
                    <li><button className="hover:text-white transition-colors text-left hover:translate-x-1 transform duration-300">Medical Repatriation</button></li>
                </ul>
            </div>

            <div>
                <h4 className="text-white font-bold uppercase tracking-widest text-[10px] mb-8 flex items-center">
                    <span className="w-1 h-1 bg-gold-500 mr-3 rounded-full"></span> Legal
                </h4>
                <ul className="space-y-4 text-sm font-light">
                    <li>
                        <button onClick={() => onPolicyClick && onPolicyClick('privacy')} className="hover:text-white transition-colors text-left hover:translate-x-1 transform duration-300">
                            Privacy Policy
                        </button>
                    </li>
                    <li>
                        <button onClick={() => onPolicyClick && onPolicyClick('terms')} className="hover:text-white transition-colors text-left hover:translate-x-1 transform duration-300">
                            Terms & Conditions
                        </button>
                    </li>
                    <li>
                        <button onClick={() => onPolicyClick && onPolicyClick('safety')} className="hover:text-white transition-colors text-left hover:translate-x-1 transform duration-300">
                            Safety Standards
                        </button>
                    </li>
                </ul>
            </div>
        </div>

        {/* Footer Bottom */}
        <div className="container mx-auto px-6 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
            <p className="font-light tracking-wide">&copy; {new Date().getFullYear()} Vedanco Air. All rights reserved.</p>
            <div className="mt-4 md:mt-0 flex items-center gap-8">
                <span className="hidden md:inline">Part 135 / DGCA / EASA Certified.</span>
                <div className="flex gap-6">
                    {/* Only show Operator Portal if user is logged out OR is an operator */}
                    {(!user || (user && user.isOperator)) && (
                        <button onClick={onOperatorClick} className="text-gray-500 hover:text-white transition-colors uppercase font-bold tracking-widest text-[9px]">Partner Portal</button>
                    )}
                    <button onClick={onAdminClick} className="text-gray-500 hover:text-white transition-colors uppercase font-bold tracking-widest text-[9px]">Admin Access</button>
                </div>
            </div>
        </div>
    </footer>
);
