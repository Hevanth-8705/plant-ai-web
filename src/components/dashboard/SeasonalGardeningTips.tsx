import React, { useState } from 'react';
import { Leaf, Sun, Snowflake, CloudRain, Sparkles, CheckCircle2, ChevronRight, Apple, ShieldCheck, Thermometer } from 'lucide-react';
import { Plant } from '../../types/index.ts';

interface SeasonalGardeningTipsProps {
  plants: Plant[];
  className?: string;
}

export const SeasonalGardeningTips: React.FC<SeasonalGardeningTipsProps> = ({
  plants,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'indoor' | 'outdoor' | 'harvest'>('all');
  const [completedTips, setCompletedTips] = useState<Record<string, boolean>>({});

  // Determine current season based on current month (October -> Autumn)
  const currentMonth = new Date().getMonth(); // 0-11 (9 is October)
  let seasonName = 'Autumn / Fall';
  let seasonIcon = <Leaf className="w-5 h-5 text-amber-600" />;
  let seasonGradient = 'from-amber-500/10 via-orange-500/5 to-yellow-500/10';
  let seasonBorder = 'border-amber-200/80';
  let seasonDescription = 'Transition period: Preparing for cooler weather, harvesting late crops, and migrating tender plants indoors.';

  if (currentMonth >= 2 && currentMonth <= 4) {
    seasonName = 'Spring Awakening';
    seasonIcon = <Sun className="w-5 h-5 text-emerald-600" />;
    seasonGradient = 'from-emerald-500/10 via-teal-500/5 to-lime-500/10';
    seasonBorder = 'border-emerald-200/80';
    seasonDescription = 'Active growth phase: Time for repotting, fresh soil, starting seedlings, and boosting fertilizer.';
  } else if (currentMonth >= 5 && currentMonth <= 7) {
    seasonName = 'Summer Peak';
    seasonIcon = <Sun className="w-5 h-5 text-amber-500" />;
    seasonGradient = 'from-yellow-500/10 via-amber-500/5 to-orange-500/10';
    seasonBorder = 'border-amber-200/80';
    seasonDescription = 'High sun intensity: Frequent watering, container cooling, and vigilant pest monitoring required.';
  } else if (currentMonth >= 8 && currentMonth <= 10) {
    seasonName = 'Autumn Harvest';
    seasonIcon = <Leaf className="w-5 h-5 text-orange-600" />;
    seasonGradient = 'from-amber-600/10 via-orange-600/5 to-amber-500/10';
    seasonBorder = 'border-orange-200/80';
    seasonDescription = 'Harvest bounty season: Final fruit ripening, frost protection, and indoor transition for tropicals.';
  } else {
    seasonName = 'Winter Rest';
    seasonIcon = <Snowflake className="w-5 h-5 text-blue-600" />;
    seasonGradient = 'from-blue-500/10 via-indigo-500/5 to-sky-500/10';
    seasonBorder = 'border-blue-200/80';
    seasonDescription = 'Dormancy period: Reduced watering, pebble trays for indoor humidity, and protecting from cold window drafts.';
  }

  // Analyze user's collection for personalized recommendations
  const hasVegetables = plants.some(p => p.category === 'vegetable' || p.category === 'herb');
  const hasHouseplants = plants.some(p => p.category === 'houseplant' || p.category === 'foliage');
  const hasSucculents = plants.some(p => p.category === 'succulent');
  const hasHarvestable = plants.some(p => p.isHarvestable);

  const tipsList = [
    {
      id: 'tip_indoor_migration',
      category: 'indoor',
      title: 'Prepare Tropical Foliage for Indoor Heating',
      description: 'With outdoor temperatures dropping, central heating dries indoor air. Group monsteras and fiddle leaf figs together and plan to mist or use pebble trays.',
      applicable: hasHouseplants,
      icon: <Thermometer className="w-4 h-4 text-orange-600" />,
      actionText: 'Check humidity levels',
    },
    {
      id: 'tip_harvest_veggies',
      category: 'harvest',
      title: 'Harvest Final Summer Fruiting Crops',
      description: 'Pick remaining Roma tomatoes and peppers before overnight temperatures drop below 5°C to prevent chilling injury and flavor loss.',
      applicable: hasVegetables || hasHarvestable,
      icon: <Apple className="w-4 h-4 text-rose-600" />,
      actionText: 'View edible crops',
    },
    {
      id: 'tip_reduce_watering',
      category: 'outdoor',
      title: 'Adjust Watering Frequencies for Colder Roots',
      description: 'Lower ambient temperatures slow root metabolism and water uptake. Allow soil to dry out 25-30% longer between waterings to prevent root rot.',
      applicable: true,
      icon: <CloudRain className="w-4 h-4 text-blue-600" />,
      actionText: 'Review plant schedules',
    },
    {
      id: 'tip_succulent_dormancy',
      category: 'indoor',
      title: 'Protect Succulents from Window Drafts',
      description: 'Snake plants and succulents enter semi-dormancy during autumn. Suspend all liquid fertilizers and water sparingly every 3-4 weeks.',
      applicable: hasSucculents,
      icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
      actionText: 'Inspect succulent soil',
    },
  ];

  const filteredTips = tipsList.filter(tip => {
    if (activeTab === 'indoor') return tip.category === 'indoor';
    if (activeTab === 'outdoor') return tip.category === 'outdoor';
    if (activeTab === 'harvest') return tip.category === 'harvest';
    return true;
  });

  const toggleTipCompletion = (id: string) => {
    setCompletedTips(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className={`bg-gradient-to-br ${seasonGradient} rounded-3xl border ${seasonBorder} p-5 sm:p-6 shadow-sm space-y-4 relative overflow-hidden ${className}`}>
      {/* Background glow */}
      <div className="absolute right-0 top-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/80 border border-amber-200 shadow-sm flex items-center justify-center">
            {seasonIcon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-stone-900 text-base sm:text-lg font-serif">Seasonal Gardening Guide</h3>
              <span className="text-xs font-black bg-white/80 text-stone-800 px-2.5 py-0.5 rounded-full border border-stone-200/60 shadow-2xs">
                {seasonName}
              </span>
            </div>
            <p className="text-xs text-stone-600 max-w-xl">
              {seasonDescription}
            </p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 bg-white/70 p-1 rounded-xl border border-stone-200/80 text-xs font-medium">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'all' ? 'bg-amber-700 text-white shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'}`}
          >
            All Tips
          </button>
          <button
            onClick={() => setActiveTab('indoor')}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'indoor' ? 'bg-amber-700 text-white shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'}`}
          >
            Indoor
          </button>
          <button
            onClick={() => setActiveTab('harvest')}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'harvest' ? 'bg-amber-700 text-white shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'}`}
          >
            Harvest
          </button>
        </div>
      </div>

      {/* Personalized Plant Collection Notice */}
      <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-3.5 border border-amber-200/60 flex items-center justify-between gap-3 text-xs relative z-10 shadow-2xs">
        <div className="flex items-center gap-2 text-stone-700">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Tailored for your garden: <strong className="text-stone-900">{plants.length} active plants</strong> ({plants.filter(p => p.category === 'houseplant' || p.category === 'foliage').length} houseplants, {plants.filter(p => p.category === 'vegetable' || p.category === 'herb').length} edibles).
          </span>
        </div>
        <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
          Personalized AI Advice
        </span>
      </div>

      {/* Tips Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 relative z-10">
        {filteredTips.map((tip) => {
          const isDone = completedTips[tip.id];
          return (
            <div
              key={tip.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                isDone
                  ? 'bg-emerald-50/70 border-emerald-200 opacity-80'
                  : 'bg-white/95 border-stone-200/80 shadow-2xs hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}>
                  {isDone ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : tip.icon}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`font-bold text-sm ${isDone ? 'line-through text-stone-500' : 'text-stone-900 font-serif'}`}>
                      {tip.title}
                    </h4>
                    {tip.applicable && !isDone && (
                      <span className="text-[10px] uppercase font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full shrink-0">
                        Priority
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {tip.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                <button
                  onClick={() => toggleTipCompletion(tip.id)}
                  className={`font-medium flex items-center gap-1.5 transition-colors ${
                    isDone ? 'text-emerald-700 hover:text-emerald-800' : 'text-amber-800 hover:text-amber-900 font-bold'
                  }`}
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isDone ? 'text-emerald-600 fill-emerald-100' : 'text-stone-400'}`} />
                  {isDone ? 'Completed' : 'Mark as Done'}
                </button>

                <span className="text-[11px] text-stone-400 font-medium">
                  {tip.category.toUpperCase()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
