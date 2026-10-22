import React, { useState, useEffect } from 'react';
import { 
  Droplets, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  ArrowRight,
  Info
} from 'lucide-react';
import { Plant, WateringLog } from '../types/index.ts';
import { api } from '../services/api.ts';
import { Button } from '../components/common/Button.tsx';
import { Badge } from '../components/common/Badge.tsx';

interface WateringCalendarPageProps {
  onSelectPlant: (plant: Plant) => void;
}

export const WateringCalendarPage: React.FC<WateringCalendarPageProps> = ({
  onSelectPlant,
}) => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlants = async () => {
    try {
      setLoading(true);
      const res = await api.plants.list();
      setPlants(res.plants || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlants();
  }, []);

  const handleWater = async (plantId: string) => {
    try {
      await api.plants.markWatered(plantId);
      fetchPlants();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSnooze = async (plant: Plant, days: number) => {
    try {
      const currentNext = new Date(plant.nextWaterDate);
      const snoozed = new Date(currentNext.getTime() + days * 86400000);
      await api.plants.update(plant.id, {
        nextWaterDate: snoozed.toISOString(),
      });
      fetchPlants();
    } catch (err) {
      console.error(err);
    }
  };

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const tomorrow = new Date(now.getTime() + 86400000);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const overdue = plants.filter((p) => p.nextWaterDate.split('T')[0] < todayStr);
  const dueToday = plants.filter((p) => p.nextWaterDate.split('T')[0] === todayStr);
  const dueTomorrow = plants.filter((p) => p.nextWaterDate.split('T')[0] === tomorrowStr);
  const upcoming = plants.filter((p) => p.nextWaterDate.split('T')[0] > tomorrowStr).sort(
    (a, b) => new Date(a.nextWaterDate).getTime() - new Date(b.nextWaterDate).getTime()
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-emerald-950 flex items-center gap-2.5">
          <Droplets className="w-7 h-7 text-sky-600" /> Smart Watering Calendar
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Monitor soil hydration intervals, snooze schedules, and log watering events
        </p>
      </div>

      {/* Moisture Finger Test Banner */}
      <div className="p-4 bg-sky-50/70 rounded-2xl border border-sky-200/70 flex items-start gap-3 text-xs text-sky-950">
        <Info className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">The Golden Rule of Watering:</span> Schedules are dynamic estimates. Always check the top 2 inches (5 cm) of soil with your finger before watering. If the soil clings to your skin or feels moist, postpone watering for 2–3 days!
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {/* Overdue */}
        {overdue.length > 0 && (
          <div className="bg-rose-50/50 rounded-2xl border border-rose-200/80 p-5 space-y-3">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Overdue Tasks ({overdue.length})</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {overdue.map((p) => (
                <div key={p.id} className="bg-white rounded-xl p-3.5 border border-rose-200 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-3">
                    <img src={p.photoUrl} alt={p.name} className="w-12 h-12 rounded-lg object-cover" />
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm">{p.name}</h4>
                      <p className="text-xs text-stone-500">{p.waterAmountMl || 400} ml • {p.species}</p>
                      <span className="text-[10px] text-rose-600 font-bold block mt-0.5">
                        Due: {new Date(p.nextWaterDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button size="sm" variant="outline" onClick={() => handleSnooze(p, 1)}>
                      +1d
                    </Button>
                    <Button size="sm" variant="primary" onClick={() => handleWater(p.id)} icon={<Droplets className="w-3.5 h-3.5" />}>
                      Water
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Due Today */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-900 text-base font-serif flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" /> Due Today ({dueToday.length})
            </h3>
          </div>

          {dueToday.length === 0 ? (
            <p className="text-xs text-stone-400 py-4 text-center">
              No plants scheduled for watering today. Everything is properly hydrated!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {dueToday.map((p) => (
                <div key={p.id} className="bg-stone-50 rounded-xl p-3.5 border border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={p.photoUrl} alt={p.name} className="w-12 h-12 rounded-lg object-cover" />
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm">{p.name}</h4>
                      <p className="text-xs text-stone-500">{p.waterAmountMl || 400} ml • {p.species}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button size="sm" variant="outline" onClick={() => handleSnooze(p, 2)}>
                      Snooze 2d
                    </Button>
                    <Button size="sm" variant="primary" onClick={() => handleWater(p.id)} icon={<Droplets className="w-3.5 h-3.5" />}>
                      Water
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Due Tomorrow */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 space-y-4 shadow-xs">
          <h3 className="font-bold text-stone-900 text-base font-serif flex items-center gap-2">
            <Calendar className="w-4 h-4 text-sky-600" /> Tomorrow ({dueTomorrow.length})
          </h3>

          {dueTomorrow.length === 0 ? (
            <p className="text-xs text-stone-400 py-4 text-center">No tasks tomorrow.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {dueTomorrow.map((p) => (
                <div key={p.id} className="bg-stone-50 rounded-xl p-3.5 border border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={p.photoUrl} alt={p.name} className="w-12 h-12 rounded-lg object-cover" />
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm">{p.name}</h4>
                      <p className="text-xs text-stone-500">{p.waterAmountMl || 400} ml • {p.species}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleWater(p.id)}>
                    Water Early
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming This Week and Later */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 space-y-4 shadow-xs">
          <h3 className="font-bold text-stone-900 text-base font-serif">
            Upcoming Later This Week ({upcoming.length})
          </h3>

          <div className="divide-y divide-stone-100">
            {upcoming.map((p) => {
              const diffDays = Math.ceil((new Date(p.nextWaterDate).getTime() - now.getTime()) / 86400000);
              return (
                <div key={p.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img src={p.photoUrl} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <h4 className="font-bold text-stone-900 text-sm">{p.name}</h4>
                      <p className="text-stone-500">{p.species}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-800">
                      In {diffDays} days
                    </span>
                    <span className="text-[11px] text-stone-400 block">
                      {new Date(p.nextWaterDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
