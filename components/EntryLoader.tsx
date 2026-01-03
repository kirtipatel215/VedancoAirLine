import React from 'react';
import { LogoIcon } from './Logo';

interface EntryLoaderProps {
    fadingOut: boolean;
}

export const EntryLoader: React.FC<EntryLoaderProps> = ({ fadingOut }) => {
    return (
        <div
            className={`fixed inset-0 z-[9999] bg-[#0B1120] flex flex-col items-center justify-center overflow-hidden transition-all duration-1000 ease-in-out ${fadingOut ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100 scale-100'
                }`}
        >
            {/* Cinematic Ambient Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-[#0B1120] to-[#0B1120]"></div>
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

            <div className="relative z-10 flex flex-col items-center">

                {/* Logo Container with Golden Glow */}
                <div className="relative mb-12">
                    {/* Rotating Rings */}
                    <div className="absolute inset-[-20%] border border-amber-500/20 rounded-full animate-[spin_12s_linear_infinite]"></div>
                    <div className="absolute inset-[-10%] border border-amber-500/30 rounded-full animate-[spin_8s_linear_infinite_reverse]"></div>

                    {/* Glowing Core */}
                    <div className="bg-[#0B1120] p-8 rounded-full border border-amber-500/20 shadow-[0_0_60px_rgba(245,158,11,0.2)] animate-pulse relative group">
                        <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-xl"></div>
                        <LogoIcon className="w-24 h-24 md:w-32 md:h-32 text-amber-500 relative z-10" color="text-amber-500" />
                    </div>
                </div>

                {/* Brand Reveal */}
                <div className="text-center space-y-4">
                    <div className="overflow-hidden">
                        <h1 className="text-4xl md:text-6xl font-serif font-bold text-white tracking-[0.25em] uppercase animate-slide-up opacity-0" style={{ animationFillMode: 'forwards', animationDelay: '0.2s' }}>
                            Vedanco
                        </h1>
                    </div>

                    <div className="flex items-center justify-center gap-4 opacity-0 animate-fade-in" style={{ animationFillMode: 'forwards', animationDelay: '0.8s' }}>
                        <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-amber-500"></div>
                        <span className="text-amber-500 text-[10px] md:text-xs font-bold uppercase tracking-[0.4em]">
                            Private Aviation
                        </span>
                        <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-amber-500"></div>
                    </div>
                </div>
            </div>

            {/* Minimalist Progress Bar */}
            <div className="absolute bottom-12 left-0 w-full flex justify-center">
                <div className="w-64 h-[2px] bg-white/10 rounded-full overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500 to-transparent w-full -translate-x-full animate-[shimmer_2s_infinite_ease-in-out]"></div>
                </div>
            </div>

            <style>{`
                @keyframes slide-up {
                    0% { transform: translateY(100%); opacity: 0; }
                    100% { transform: translateY(0); opacity: 1; }
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    50% { transform: translateX(100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-slide-up {
                    animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .animate-fade-in {
                    animation: fade-in 1s ease-out;
                }
                @keyframes fade-in {
                    0% { opacity: 0; }
                    100% { opacity: 1; }
                }
            `}</style>
        </div>
    );
};
