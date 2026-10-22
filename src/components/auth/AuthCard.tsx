import React from 'react';
import { Sprout } from 'lucide-react';

interface AuthCardProps {
  children: React.ReactNode;
  heading: string;
  subtitle: string;
  onNavigateHome?: () => void;
}

export const AuthCard: React.FC<AuthCardProps> = ({
  children,
  heading,
  subtitle,
  onNavigateHome,
}) => {
  return (
    <div className="w-full max-w-md mx-auto relative z-20">
      {/* Decorative backdrop glow */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-lime-500/20 blur-xl opacity-75 pointer-events-none" />

      {/* Main Glassmorphic Card */}
      <div className="relative rounded-3xl bg-white/90 backdrop-blur-xl border border-white/80 shadow-2xl shadow-emerald-950/15 p-6 sm:p-9 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <button
            type="button"
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-900 text-white flex items-center justify-center shadow-md shadow-emerald-900/20 group-hover:scale-105 transition-transform">
              <Sprout className="w-5 h-5 text-emerald-200" />
            </div>
            <span className="text-2xl font-bold font-serif tracking-tight text-emerald-950">
              Plant<span className="text-emerald-700">Pal</span>
            </span>
          </button>

          <div>
            <h1 className="text-2xl font-bold font-serif text-stone-900 tracking-tight">
              {heading}
            </h1>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Form Body */}
        {children}
      </div>
    </div>
  );
};
