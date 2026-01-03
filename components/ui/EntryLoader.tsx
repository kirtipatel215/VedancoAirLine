import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

export const EntryLoader = ({ onComplete }: { onComplete: () => void }) => {
    const [step, setStep] = useState<'blackout' | 'turbine' | 'reveal' | 'boot' | 'complete'>('blackout');
    const [bootLines, setBootLines] = useState<string[]>([]);
    const [isFirstVisit, setIsFirstVisit] = useState(true);

    useEffect(() => {
        // Session Logic
        const hasVisited = sessionStorage.getItem('vedanco_has_visited');
        if (hasVisited) {
            setIsFirstVisit(false);
            // Fast path for returning users
            setTimeout(() => {
                onComplete();
            }, 800);
            return;
        }

        // First visit logic
        sessionStorage.setItem('vedanco_has_visited', 'true');
        document.body.style.overflow = 'hidden';

        // Sequence Timing
        const timeline = [
            { t: 600, action: () => setStep('turbine') },
            { t: 3400, action: () => setStep('reveal') }, // +2800ms
            { t: 4000, action: () => setBootLines(prev => [...prev, 'Initializing Flight Systems']) },
            { t: 4600, action: () => setBootLines(prev => [...prev, 'Securing Airspace Access']) },
            { t: 5200, action: () => setBootLines(prev => [...prev, 'Verifying Operator Network']) },
            {
                t: 6500, action: () => {
                    setStep('complete');
                    document.body.style.overflow = '';
                    setTimeout(onComplete, 1000); // Allow exit animation to finish
                }
            },
        ];

        const timers = timeline.map(({ t, action }) => setTimeout(action, t));

        return () => {
            timers.forEach(clearTimeout);
            document.body.style.overflow = '';
        };
    }, [onComplete]);

    // Returning user simple loader
    if (!isFirstVisit) {
        return (
            <AnimatePresence>
                {step !== 'complete' && (
                    <motion.div
                        className="fixed inset-0 z-50 bg-[#0B0F1A] flex items-center justify-center"
                        exit={{ opacity: 0, transition: { duration: 0.8 } }}
                    >
                        <div className="w-12 h-12 rounded-full border border-white/10 border-t-[#C9A24D] animate-spin" />
                    </motion.div>
                )}
            </AnimatePresence>
        );
    }

    return (
        <AnimatePresence>
            {step !== 'complete' && (
                <motion.div
                    className="fixed inset-0 z-[100] bg-[#0B0F1A] flex items-center justify-center overflow-hidden font-sans text-white select-none"
                    initial={{ y: 0 }}
                    exit={{
                        y: '-100%',
                        filter: 'blur(0px)',
                        transition: {
                            duration: 0.9,
                            ease: [0.22, 1, 0.36, 1]
                        }
                    }}
                >
                    {/* Blackout Phase - Empty by design */}

                    {/* Turbine Animation */}
                    {step !== 'blackout' && StepTurbine({ isActive: step === 'turbine' || step === 'reveal' })}

                    {/* Brand Reveal */}
                    {/* We keep this mounted once revealed to ensure exit animation works if needed, 
              or just rely on the parent AnimatePresence. 
              The requirements say "Brand reveal sequence". */}
                    {step === 'reveal' && <LogoReveal />}

                    {/* System Boot Text */}
                    <div className="absolute bottom-12 left-12 flex flex-col space-y-1 font-mono text-[10px] text-[#6EE7B7]/60 tracking-wider">
                        {bootLines.map((line, i) => (
                            <motion.span
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                            >
                                {`> ${line}...`}
                            </motion.span>
                        ))}
                    </div>

                </motion.div>
            )}
        </AnimatePresence>
    );
};

const StepTurbine = ({ isActive }: { isActive: boolean }) => {
    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
            <motion.div
                className="relative w-[30vh] h-[30vh] md:w-[600px] md:h-[600px]"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
            >
                {/* Outer Ring */}
                <motion.div
                    className="absolute inset-0 rounded-full border-[1px] border-white/5"
                    animate={{ rotate: 180 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />

                {/* Middle Ring - The Turbine Blades Abstract */}
                <motion.div
                    className="absolute inset-[15%] rounded-full border-[1px] border-white/10"
                    style={{ borderLeftColor: 'transparent', borderRightColor: 'transparent' }}
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 720 }}
                    transition={{
                        duration: 3,
                        ease: [0.4, 0, 0.2, 1],
                    }}
                />

                {/* Inner Detailed Ring */}
                <motion.div
                    className="absolute inset-[35%] rounded-full border-[1px] border-white/20 border-t-[#C9A24D]/50"
                    initial={{ rotate: 0 }}
                    animate={{ rotate: -360 }}
                    transition={{
                        duration: 4,
                        ease: "easeInOut",
                    }}
                />

                {/* Core */}
                <div className="absolute inset-0 m-auto w-2 h-2 bg-[#C9A24D] rounded-full blur-[2px] opacity-50" />
            </motion.div>
        </div>
    )
}

const LogoReveal = () => {
    const brandName = "VEDANCO AIR";

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1, // 100ms per letter
                delayChildren: 0.2,
            },
        },
    };

    const letterVariants: Variants = {
        hidden: {
            opacity: 0,
            y: 4,
            filter: 'blur(8px)',
            scale: 0.98
        },
        visible: {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            scale: 1,
            transition: {
                duration: 1.2,
                ease: [0.4, 0, 0.2, 1], // cubic-bezier
            }
        },
    };

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
            <motion.div
                className="relative flex flex-col items-center"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* Brand Name */}
                <div className="flex items-center justify-center overflow-hidden">
                    {brandName.split("").map((char, index) => (
                        <motion.span
                            key={index}
                            variants={letterVariants}
                            className={`
                        text-3xl md:text-5xl lg:text-6xl 
                        font-light tracking-[0.25em] md:tracking-[0.35em] 
                        text-[#E5E7EB] 
                        ${char === " " ? "w-4 md:w-8" : ""}
                    `}
                            style={{
                                fontFamily: 'Inter, "SF Pro Display", sans-serif',
                                textShadow: '0 0 20px rgba(229, 231, 235, 0.1)' // Very subtle glow
                            }}
                        >
                            {char}
                        </motion.span>
                    ))}
                </div>

                {/* Accent Line */}
                <motion.div
                    className="h-[1px] bg-[#C9A24D] mt-6 md:mt-8"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 140, opacity: 0.6 }}
                    transition={{ delay: 1.5, duration: 1.2, ease: "easeOut" }}
                />

                {/* Tagline */}
                <motion.p
                    className="mt-4 text-[10px] md:text-xs text-[#E5E7EB] tracking-[0.4em] uppercase opacity-60 font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    transition={{ delay: 2.0, duration: 1 }}
                >
                    Private Aviation
                </motion.p>
            </motion.div>
        </div>
    );
};
