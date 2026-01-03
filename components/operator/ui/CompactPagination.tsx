import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const CompactPagination = () => {
    return (
        <div className="fixed bottom-8 right-8 flex items-center gap-4 bg-charcoal-900/90 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-2xl z-50 animate-fade-in-up">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mr-2">Page 1 of 5</span>

            <button className="w-8 h-8 rounded-full bg-white/5 hover:bg-gold-500 hover:text-charcoal-900 flex items-center justify-center transition-all text-gray-400">
                <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex gap-1">
                <button className="w-8 h-8 rounded-full bg-gold-500 text-charcoal-900 font-bold text-xs shadow-lg shadow-gold-500/20">1</button>
                <button className="w-8 h-8 rounded-full hover:bg-white/5 text-gray-400 hover:text-white font-bold text-xs transition-colors">2</button>
                <button className="w-8 h-8 rounded-full hover:bg-white/5 text-gray-400 hover:text-white font-bold text-xs transition-colors">3</button>
            </div>

            <button className="w-8 h-8 rounded-full bg-white/5 hover:bg-gold-500 hover:text-charcoal-900 flex items-center justify-center transition-all text-gray-400">
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
};
