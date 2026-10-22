import React from 'react';
import { BotanicalScene } from '../components/3d/BotanicalScene.tsx';
import { AuthCard } from '../components/auth/AuthCard.tsx';
import { RegisterForm } from '../components/auth/RegisterForm.tsx';
import { Sprout, ArrowLeft } from 'lucide-react';

interface RegisterPageProps {
  onSuccess: () => void;
  onNavigateLogin: () => void;
  onNavigateHome: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onSuccess,
  onNavigateLogin,
  onNavigateHome,
}) => {
  return (
    <div className="min-h-screen w-full bg-[#102A20] text-stone-900 flex flex-col relative overflow-hidden font-sans">
      {/* Top subtle bar */}
      <header className="absolute top-0 left-0 right-0 z-30 px-6 py-4 flex items-center justify-between pointer-events-auto">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-200/90 hover:text-white bg-black/30 hover:bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-emerald-500/20 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to PlantPal Home
        </button>

        <span className="hidden sm:inline-flex text-[11px] font-mono text-emerald-300/70 uppercase tracking-widest">
          New Gardener Registration
        </span>
      </header>

      {/* Main Split-Screen Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-screen">
        {/* Left 3D Botanical Scene Column (Desktop: 7 cols) */}
        <div className="hidden lg:block lg:col-span-7 h-full relative">
          <BotanicalScene interactive={true} />
        </div>

        {/* Right Authentication Column (Desktop: 5 cols) */}
        <div className="col-span-1 lg:col-span-5 flex flex-col justify-center items-center px-4 sm:px-8 py-16 relative z-20 min-h-screen bg-gradient-to-b from-[#102A20]/80 via-[#133025]/90 to-[#0d221a]">
          {/* Subtle Mobile Botanical Header */}
          <div className="lg:hidden mb-6 text-center space-y-1">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-700 text-white shadow-lg shadow-emerald-950/40 mb-2">
              <Sprout className="w-6 h-6 text-emerald-200" />
            </div>
            <h2 className="text-xl font-bold font-serif text-[#F7F5EC]">
              Plant<span className="text-emerald-400">Pal</span>
            </h2>
          </div>

          <AuthCard
            heading="Grow With PlantPal"
            subtitle="Create your account and give your plants the care they deserve."
            onNavigateHome={onNavigateHome}
          >
            <RegisterForm
              onSuccess={onSuccess}
              onNavigateLogin={onNavigateLogin}
            />
          </AuthCard>

          {/* Footer note */}
          <p className="text-[11px] text-emerald-200/40 text-center mt-6">
            Small seeds grow into beautiful beginnings • PlantPal
          </p>
        </div>
      </div>
    </div>
  );
};
