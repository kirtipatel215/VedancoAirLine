
import React from 'react';

interface LogoProps {
    className?: string;
    color?: string;
}

export const LogoIcon: React.FC<LogoProps> = ({ className = "w-10 h-10", color = "text-navy-900" }) => (
    <svg viewBox="0 0 200 200" className={`${className} ${color} fill-current transition-colors duration-300`} xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D4A853" />
                <stop offset="100%" stopColor="#9E7125" />
            </linearGradient>
        </defs>

        {/* Outer Ring */}
        <path d="M 180 100 A 80 80 0 1 0 120 175" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />

        {/* Inner Ring - Thinner */}
        <path d="M 170 100 A 70 70 0 1 0 115 165" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />

        {/* The Jet Body - Sleeker */}
        <g transform="translate(10, 10) rotate(-10 100 100)">
            <path d="M 40 120 Q 80 110 110 80 L 160 50 L 175 55 L 140 90 L 155 110 L 120 110 L 90 90 L 40 120 Z" fill="currentColor" />
        </g>

        {/* Speed/Motion Lines - Swoosh Effect */}
        <path d="M 30 130 Q 90 120 160 60" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M 20 140 Q 80 130 140 80" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
    </svg>
);

interface LogoTextProps {
    color?: string;
    subColor?: string;
    size?: string;
    showSub?: boolean;
}

export const LogoText: React.FC<LogoTextProps> = ({ color = "text-navy-900", subColor = "text-gold-500", size = "text-2xl", showSub = true }) => (
    <div className="flex flex-col">
        <span className={`font-serif font-bold tracking-[0.15em] leading-none ${size} ${color} transition-colors duration-300`}>VEDANCO</span>
        {showSub && (
            <span className={`text-[0.4em] md:text-[0.5em] font-bold uppercase tracking-[0.3em] ${subColor} leading-tight mt-1 transition-colors duration-300`}>
                Private Jet Booking
            </span>
        )}
    </div>
);

export const FullLogo = ({ className = "", iconClass = "w-12 h-12", color = "text-navy-900", textColor = "text-navy-900", subColor = "text-gold-500", vertical = false }) => (
    <div className={`flex ${vertical ? 'flex-col justify-center text-center' : 'flex-row items-center'} gap-3 ${className}`}>
        <LogoIcon className={iconClass} color={color} />
        <LogoText color={textColor} subColor={subColor} />
    </div>
);
