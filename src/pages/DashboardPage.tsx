import React, { useState, useEffect } from 'react';
import { 
  Sprout, 
  Droplets, 
  FlaskConical, 
  Sun, 
  Apple, 
  HeartPulse, 
  BookOpen, 
  Bot, 
  TrendingUp, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar,
  Sparkles,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { Plant, DashboardStats, DiaryEntry, NotificationItem } from '../types/index.ts';
import { StatCard } from '../components/common/Card.tsx';
import { Button } from '../components/common/Button.tsx';
import { PlantCard } from '../components/plants/PlantCard.tsx';
import { WeatherWidget } from '../components/weather/WeatherWidget.tsx';
import { DailyCareStreakTracker } from '../components/dashboard/DailyCareStreakTracker.tsx';
import { SeasonalGardeningTips } from '../components/dashboard/SeasonalGardeningTips.tsx';

interface DashboardPageProps {
  onNavigate: (page: string) => void;
  onOpenAddPlant: () => void;
  onSelectPlant: (plant: Plant) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onOpenAddPlant,
  onSelectPlant,
}) => {
  const { user, refreshUser } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [recentDiary, setRecentDiary] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.dashboard.getStats();
      setStats(res.stats);
      setPlants(res.plants || []);
      setRecentDiary(res.recentDiary || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleWater = async (plant: Plant, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.plants.markWatered(plant.id);
      fetchDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const plantsNeedingWater = plants.filter((p) => p.nextWaterDate.split('T')[0] <= todayStr);
  const plantsNeedingFertilizer = plants.filter((p) => {
    const diff = Math.ceil((new Date(p.nextFertilizeDate).getTime() - Date.now()) / 86400000);
    return diff <= 3;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-900 to-emerald-800 text-white p-8 sm:p-10 shadow-xl border border-emerald-950/20">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/50 text-emerald-200 text-xs font-semibold backdrop-blur-md border border-emerald-800">
            <Sprout className="w-4 h-4" />
            <span>PlantPal Pro</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold font-serif tracking-tight text-white">
            Cultivating your sanctuary, {user?.name?.split(' ')[0] || 'Gardener'}.
          </h1>

          <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed max-w-lg">
            Your collection of {plants.length} plants is flourishing. You have{' '}
            <span className="font-bold text-white">
              {stats?.todayTasksCount || 0} care tasks
            </span>{' '}
            awaiting your attention today.
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            <Button
              size="md"
              variant="secondary"
              onClick={onOpenAddPlant}
              icon={<Plus className="w-5 h-5" />}
              className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
            >
              Add Plant
            </Button>
            <Button
              size="md"
              variant="ghost"
              onClick={() => onNavigate('chat')}
              className="text-emerald-50 hover:bg-emerald-950/40"
              icon={<Bot className="w-5 h-5" />}
            >
              Consult AI
            </Button>
          </div>
        </div>

        {/* Decorative subtle botanical background illustration */}
        <div className="absolute -right-16 -top-16 opacity-10 pointer-events-none">
          <Sprout className="w-96 h-96 text-white" />
        </div>
      </div>

      {/* Top 4 Core Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Plants"
          value={stats?.totalPlants ?? plants.length}
          subtitle="Registered in garden"
          icon={<Sprout className="w-5 h-5" />}
          colorScheme="emerald"
          onClick={() => onNavigate('plants')}
        />
        <StatCard
          title="Water Due Today"
          value={stats?.plantsNeedingWaterToday ?? 0}
          subtitle={stats?.overdueWateringCount ? `${stats.overdueWateringCount} overdue` : 'On schedule'}
          icon={<Droplets className="w-5 h-5" />}
          colorScheme={stats?.plantsNeedingWaterToday ? 'amber' : 'blue'}
          onClick={() => onNavigate('watering')}
        />
        <StatCard
          title="Fertilizer Planned"
          value={stats?.upcomingFertilizerCount ?? 0}
          subtitle="Next 3 days"
          icon={<FlaskConical className="w-5 h-5" />}
          colorScheme="purple"
          onClick={() => onNavigate('fertilizer')}
        />
        <StatCard
          title="Upcoming Harvests"
          value={stats?.upcomingHarvestsCount ?? 0}
          subtitle="Edible crops"
          icon={<Apple className="w-5 h-5" />}
          colorScheme="rose"
          onClick={() => onNavigate('harvest')}
        />
      </div>

      {/* Daily Care Streak Tracker */}
      <DailyCareStreakTracker
        user={user}
        onRefreshUser={refreshUser}
        onNavigate={onNavigate}
      />

      {/* Localized Microclimate & Weather-Adjusted Plant Care */}
      <WeatherWidget
        plants={plants}
        onSelectPlant={onSelectPlant}
      />

      {/* Seasonal Gardening Tips */}
      <SeasonalGardeningTips plants={plants} />

      {/* Today's Tasks & Urgent Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Today's Gardening Tasks */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-stone-900 font-serif">Today's Gardening Tasks</h2>
              <p className="text-xs text-stone-500">
                Essential moisture and nourishment checklist • Synchronized with local weather &amp; humidity
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onNavigate('watering')}
              icon={<Calendar className="w-3.5 h-3.5" />}
            >
              Watering Calendar
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200/80 p-4 space-y-3 shadow-xs">
            {plantsNeedingWater.length === 0 && plantsNeedingFertilizer.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-stone-900 text-sm">All caught up for today!</h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Every plant has received proper hydration and nutrients. Soil moisture looks well-balanced.
                </p>
              </div>
            ) : (
              <>
                {/* Water tasks */}
                {plantsNeedingWater.map((plant) => (
                  <div
                    key={`task-w-${plant.id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-sky-50/50 border border-sky-100 hover:bg-sky-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={plant.photoUrl}
                        alt={plant.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-stone-900">{plant.name}</span>
                          <span className="text-[10px] bg-sky-100 text-sky-800 font-semibold px-2 py-0.5 rounded-full">
                            Water Due
                          </span>
                        </div>
                        <p className="text-xs text-stone-500">
                          {plant.waterAmountMl || 400} ml • {plant.species}
                        </p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="primary"
                      onClick={(e) => handleWater(plant, e)}
                      icon={<Droplets className="w-3.5 h-3.5" />}
                    >
                      Water
                    </Button>
                  </div>
                ))}

                {/* Fertilizer tasks */}
                {plantsNeedingFertilizer.map((plant) => (
                  <div
                    key={`task-f-${plant.id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-purple-50/50 border border-purple-100 hover:bg-purple-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={plant.photoUrl}
                        alt={plant.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-stone-900">{plant.name}</span>
                          <span className="text-[10px] bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded-full">
                            Feed Plant
                          </span>
                        </div>
                        <p className="text-xs text-stone-500">
                          {plant.fertilizerType || 'Diluted plant food'}
                        </p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onSelectPlant(plant)}
                      icon={<FlaskConical className="w-3.5 h-3.5" />}
                    >
                      Record Feeding
                    </Button>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Quick AI Diagnostics Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-wider">
                <HeartPulse className="w-4 h-4 text-rose-600" /> AI Leaf Doctor
              </div>
              <h4 className="font-bold text-stone-900 text-base">Spots, yellowing, or drooping leaves?</h4>
              <p className="text-xs text-stone-600">
                Snap a photo to inspect possible diseases, overwatering signs, or pest activity with Gemini 3.8 Flash.
              </p>
            </div>
            <Button
              size="sm"
              variant="danger"
              onClick={() => onNavigate('disease')}
              icon={<Sparkles className="w-4 h-4" />}
              className="shrink-0"
            >
              Diagnose Leaves
            </Button>
          </div>
        </div>

        {/* Right Column: Sunlight Alerts & Diary Snippets */}
        <div className="lg:col-span-5 space-y-6">
          {/* Sunlight Checker Highlight */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
                <Sun className="w-4 h-4 text-amber-500" /> Sunlight Assessment
              </div>
              <button
                onClick={() => onNavigate('sunlight')}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1"
              >
                Checker <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Verify if your indoor or balcony plants receive suitable daily lumens without scorching delicate foliage.
            </p>

            <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/60 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Balcony Tomatoes &amp; Peppers:</span> Ensure at least 6+ hours direct southern exposure for sweet fruit setting.
              </div>
            </div>
          </div>

          {/* Recent Diary Entries */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-900 text-sm font-serif">Recent Plant Diary</h3>
              <button
                onClick={() => onNavigate('diary')}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1"
              >
                View Journal <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {recentDiary.length === 0 ? (
              <p className="text-xs text-stone-400 py-4 text-center">No diary notes recorded yet.</p>
            ) : (
              <div className="space-y-2.5">
                {recentDiary.slice(0, 3).map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 rounded-xl bg-stone-50 border border-stone-100 hover:bg-stone-100/70 transition-colors"
                  >
                    <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1">
                      <span className="font-semibold text-emerald-800 uppercase tracking-wider text-[10px]">
                        {entry.eventType.replace('_', ' ')}
                      </span>
                      <span>{new Date(entry.date).toLocaleDateString()}</span>
                    </div>
                    <h5 className="font-bold text-stone-900 text-xs truncate">{entry.title}</h5>
                    <p className="text-xs text-stone-500 line-clamp-2 mt-0.5">{entry.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Featured Plants in Garden */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900 font-serif">My Garden Collection</h2>
            <p className="text-xs text-stone-500">Live health indicators and care schedules</p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onNavigate('plants')}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            View All ({plants.length})
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {plants.slice(0, 6).map((plant) => (
            <PlantCard
              key={plant.id}
              plant={plant}
              onSelect={onSelectPlant}
              onWater={handleWater}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
