import React from 'react';
import { 
  Sprout, 
  Droplets, 
  Sun, 
  FlaskConical, 
  TrendingUp, 
  Stethoscope, 
  Apple, 
  Bot, 
  CheckCircle, 
  ArrowRight,
  ShieldCheck,
  Heart
} from 'lucide-react';
import { Button } from '../components/common/Button.tsx';

interface LandingPageProps {
  onEnterGarden: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterGarden,
  onOpenAuth,
}) => {
  return (
    <div className="min-h-screen bg-[#fafaf7] text-stone-900 flex flex-col font-sans">
      {/* Top Banner Navigation */}
      <nav className="border-b border-stone-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-900 text-white flex items-center justify-center shadow-xs">
              <Sprout className="w-6 h-6 text-emerald-200" />
            </div>
            <span className="text-xl font-bold tracking-tight text-emerald-950 font-serif">
              Plant<span className="text-emerald-700">Pal</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenAuth('login')}
            >
              Sign In
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onEnterGarden}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Open Garden Demo
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-4 sm:px-8 pt-12 pb-20 max-w-7xl mx-auto flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 text-emerald-900 text-xs font-semibold border border-emerald-200/60">
              <Sprout className="w-4 h-4 text-emerald-700" />
              <span>Your Personal AI Gardening &amp; Plant Care Companion</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-emerald-950 font-serif leading-[1.15]">
              Grow Smarter. <br />
              Care Better. <br />
              <span className="text-emerald-700 italic">Live Greener.</span>
            </h1>

            <p className="text-base sm:text-lg text-stone-600 max-w-xl leading-relaxed">
              PlantPal takes the guesswork out of plant parenting. Receive intelligent watering and fertilizer schedules, analyze sick leaves with vision AI, verify sunlight conditions, track growth milestones, and celebrate homegrown harvests.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Button
                size="lg"
                variant="primary"
                onClick={onEnterGarden}
                icon={<ArrowRight className="w-5 h-5" />}
              >
                Launch My Garden
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onOpenAuth('register')}
              >
                Create Free Account
              </Button>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-stone-500 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" /> Gemini 3.8 Flash Vision
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" /> Safe Organic Remedies
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" /> Web Reminders &amp; Calendar
              </span>
            </div>
          </div>

          {/* Hero Visual Card Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-stone-200/80 shadow-2xl bg-white p-3 rotate-1 hover:rotate-0 transition-transform duration-300">
              <div className="relative h-80 rounded-2xl overflow-hidden bg-stone-100">
                <img
                  src="https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=900&q=80"
                  alt="Monstera Deliciosa in living room"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-900 border border-emerald-100 flex items-center gap-1.5 shadow-xs">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Monty • Healthy
                </div>
                <div className="absolute bottom-3 right-3 bg-emerald-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 shadow-md">
                  <Droplets className="w-3.5 h-3.5 text-sky-400" /> Next Water in 4d
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">Monstera Deliciosa</h4>
                    <p className="text-xs text-stone-500">Bright Indirect • Living Room</p>
                  </div>
                  <span className="text-xs font-semibold bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
                    Aroid
                  </span>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-between text-xs text-stone-600">
                  <span className="flex items-center gap-1.5">
                    <Sun className="w-4 h-4 text-amber-500" /> 6 hrs Diffused Light
                  </span>
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-600" /> +17 cm This Season
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="bg-white py-16 px-4 sm:px-8 border-t border-stone-200/80">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-bold font-serif text-emerald-950">
              Everything Your Garden Needs to Flourish
            </h2>
            <p className="text-sm text-stone-600">
              From balcony herbs to statement indoor foliage, PlantPal guides every watering, feeding, and harvest.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-stone-50/70 border border-stone-200/70 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                <Droplets className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-stone-900 text-lg">Smart Watering Reminders</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Adaptive watering schedules that factor in pot size, soil mixture, seasonal temperature, and plant species.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-stone-50/70 border border-stone-200/70 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-stone-900 text-lg">AI Plant Health &amp; Diagnostics</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Photograph affected foliage to analyze symptoms with Gemini vision AI. Receive safe, non-toxic organic remedies.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-stone-50/70 border border-stone-200/70 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Sun className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-stone-900 text-lg">Sunlight Assessment</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Evaluate window exposure and light quality against each plant's biological needs to prevent leaf scorch or etiolation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-stone-50/70 border border-stone-200/70 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <FlaskConical className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-stone-900 text-lg">Fertilizer Planning</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Prevent dangerous over-fertilization with scheduled feeding cycles, dilution guides, and NPK ratio tracking.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-stone-50/70 border border-stone-200/70 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-stone-900 text-lg">Visual Growth Curves</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Plot height and leaf count over time with interactive Recharts analytics. Celebrate germination, flowering, and new leaves.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-stone-50/70 border border-stone-200/70 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-lime-100 text-lime-800 flex items-center justify-center">
                <Apple className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-stone-900 text-lg">Harvest Tracking &amp; Diary</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Track ripening windows for edible crops and maintain a searchable personal plant journal with tags and milestones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200 bg-stone-100/80 py-8 px-4 text-center text-xs text-stone-500">
        <p className="flex items-center justify-center gap-1 font-medium text-stone-700">
          PlantPal — Your Personal AI Gardening Assistant
        </p>
        <p className="mt-1 text-[11px] text-stone-500">
          Horticultural estimations are guidelines. Always verify soil moisture and plant conditions.
        </p>
      </footer>
    </div>
  );
};
