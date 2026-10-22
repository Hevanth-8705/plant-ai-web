import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Plus, 
  Sparkles 
} from 'lucide-react';
import { Plant } from '../types/index.ts';
import { api } from '../services/api.ts';
import { Button } from '../components/common/Button.tsx';
import { Modal } from '../components/common/Modal.tsx';

export const FertilizerPlannerPage: React.FC = () => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);

  // Feeding modal
  const [fertilizerType, setFertilizerType] = useState('Balanced Liquid Food (10-10-10)');
  const [npk, setNpk] = useState('10-10-10');
  const [amount, setAmount] = useState(5);
  const [unit, setUnit] = useState<'ml' | 'g'>('ml');
  const [notes, setNotes] = useState('Diluted to half strength');

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

  const handleOpenFeed = (plant: Plant) => {
    setSelectedPlant(plant);
    setFertilizerType(plant.fertilizerType || 'Balanced Houseplant Food');
  };

  const handleConfirmFeed = async () => {
    if (!selectedPlant) return;
    try {
      await api.plants.markFertilized(selectedPlant.id, {
        fertilizerType,
        npkRatio: npk,
        amount: Number(amount),
        unit,
        notes,
        recordDiary: true,
      });
      setSelectedPlant(null);
      fetchPlants();
    } catch (err) {
      console.error(err);
    }
  };

  const now = new Date();
  const sortedPlants = [...plants].sort(
    (a, b) => new Date(a.nextFertilizeDate).getTime() - new Date(b.nextFertilizeDate).getTime()
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-emerald-950 flex items-center gap-2.5">
          <FlaskConical className="w-7 h-7 text-purple-600" /> Fertilizer &amp; Nutrition Planner
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Schedule organic and mineral plant feeds, balance NPK ratios, and avoid fertilizer burn
        </p>
      </div>

      {/* Safety Warning against Over-Fertilization */}
      <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 flex items-start gap-3 text-xs text-amber-950">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Horticultural Safety Warning: Less Is Always More!</p>
          <p className="leading-relaxed">
            Over-fertilizing causes toxic mineral salt accumulation in container soils, which draws water backward out of roots and leads to scorched brown leaf margins. Always follow label directions and dilute houseplant liquid foods to 50% strength during active growing seasons.
          </p>
        </div>
      </div>

      {/* Feeding Schedule Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-4">
        <h3 className="font-bold text-stone-900 text-base font-serif">
          Upcoming Feeding Schedule
        </h3>

        <div className="divide-y divide-stone-100">
          {sortedPlants.map((plant) => {
            const nextDate = new Date(plant.nextFertilizeDate);
            const diffDays = Math.ceil((nextDate.getTime() - now.getTime()) / 86400000);
            const isDue = diffDays <= 0;

            return (
              <div key={plant.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={plant.photoUrl} alt={plant.name} className="w-12 h-12 rounded-xl object-cover" />
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">{plant.name}</h4>
                    <p className="text-xs text-stone-500">{plant.fertilizerType || 'General Plant Food'}</p>
                    <span className="text-[11px] text-stone-400">
                      Frequency: Every {plant.fertilizeFrequencyDays} days
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-left sm:text-right">
                    <span className={`text-xs font-bold ${isDue ? 'text-purple-700' : 'text-stone-700'}`}>
                      {isDue ? 'Due for feeding!' : `In ${diffDays} days`}
                    </span>
                    <span className="text-[11px] text-stone-400 block">
                      {nextDate.toLocaleDateString()}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant={isDue ? 'primary' : 'outline'}
                    onClick={() => handleOpenFeed(plant)}
                    icon={<FlaskConical className="w-3.5 h-3.5" />}
                  >
                    Feed Plant
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: Record Fertilizer */}
      <Modal
        isOpen={!!selectedPlant}
        onClose={() => setSelectedPlant(null)}
        title={selectedPlant ? `Feed ${selectedPlant.name}` : 'Record Feeding'}
        subtitle="Log fertilizer details and application amount"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Fertilizer Type / Formula
            </label>
            <input
              type="text"
              value={fertilizerType}
              onChange={(e) => setFertilizerType(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                NPK Ratio (e.g. 10-10-10)
              </label>
              <input
                type="text"
                value={npk}
                onChange={(e) => setNpk(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Amount
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200"
                />
                <select
                  value={unit}
                  onChange={(e: any) => setUnit(e.target.value)}
                  className="text-xs px-2 rounded-xl border border-stone-200"
                >
                  <option value="ml">ml</option>
                  <option value="g">grams</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Notes / Dilution
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 1 tsp per gallon of water"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
            <Button variant="outline" onClick={() => setSelectedPlant(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmFeed}>
              Save Application
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
