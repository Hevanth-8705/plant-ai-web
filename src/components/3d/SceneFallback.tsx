import React from 'react';
import { Sprout } from 'lucide-react';

interface SceneFallbackProps {
  reason?: string;
}

export const SceneFallback: React.FC<SceneFallbackProps> = () => {
  return (
    <div className="relative w-full h-full min-h-[400px] flex flex-col items-center justify-center p-8 overflow-hidden bg-gradient-to-br from-[#102A20] via-[#15382B] to-[#0A1D16] text-white">
      {/* Ambient botanical aura */}
      <div className="absolute w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-64 h-64 rounded-full bg-lime-400/5 blur-2xl pointer-events-none" />

      {/* Botanical Emblem */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-sm">
        <div className="relative">
          <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-emerald-600/30 to-emerald-950/60 border border-emerald-400/30 flex items-center justify-center shadow-2xl backdrop-blur-md">
            <Sprout className="w-14 h-14 text-emerald-300" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-lime-400 shadow-[0_0_12px_#a3e635]" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-semibold tracking-widest uppercase text-emerald-300/80">
            Botanical Sanctum
          </span>
          <h2 className="text-2xl font-bold font-serif tracking-tight text-[#F7F5EC]">
            Enter the World of PlantPal
          </h2>
          <p className="text-xs text-stone-300/80 leading-relaxed">
            Every great garden starts with a single seed. Nurture your plants, monitor daily daylight, and grow greener every day.
          </p>
        </div>

        {/* Decorative quote */}
        <div className="pt-4 border-t border-emerald-500/20 text-[11px] text-emerald-200/60 italic font-serif">
          “Small seeds grow into beautiful beginnings.”
        </div>
      </div>
    </div>
  );
};
