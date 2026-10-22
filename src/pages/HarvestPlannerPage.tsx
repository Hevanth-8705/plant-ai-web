import React, { useState, useEffect } from 'react';
import { 
  Apple, 
  Calendar, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  Star, 
  Plus, 
  Info,
  Scale
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Plant, HarvestRecord } from '../types/index.ts';
import { api } from '../services/api.ts';
import { Button } from '../components/common/Button.tsx';
import { Modal } from '../components/common/Modal.tsx';
import { Badge } from '../components/common/Badge.tsx';

export const HarvestPlannerPage: React.FC = () => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [records, setRecords] = useState<HarvestRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedPlantId, setSelectedPlantId] = useState<string>('');
  const [quantity, setQuantity] = useState(5);
  const [unit, setUnit] = useState<'pieces' | 'grams' | 'kg'>('pieces');
  const [qualityRating, setQualityRating] = useState<number>(5);
  const [notes, setNotes] = useState('Picked at peak ripeness');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plantsRes, harvestRes] = await Promise.all([
        api.plants.list(),
        api.harvest.list(),
      ]);
      const edible = (plantsRes.plants || []).filter((p) => p.isHarvestable);
      setPlants(edible);
      setRecords(harvestRes.records || []);
      if (edible.length > 0 && !selectedPlantId) {
        setSelectedPlantId(edible[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogHarvest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlantId) return;

    try {
      await api.harvest.add({
        plantId: selectedPlantId,
        quantity: Number(quantity),
        unit,
        qualityRating: qualityRating as any,
        notes,
        date: new Date().toISOString(),
      });

      // Celebration confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#047857', '#10b981', '#f59e0b', '#ef4444', '#84cc16'],
        });
      } catch (err) {
        // fallback if confetti canvas not available
      }

      setShowLogModal(false);
      setNotes('');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const now = new Date();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-emerald-950 flex items-center gap-2.5">
            <Apple className="w-7 h-7 text-amber-600" /> Harvest Planning &amp; Yield Tracker
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Track ripening windows for edible crops, fruits, and culinary herbs
          </p>
        </div>

        <Button
          variant="amber"
          onClick={() => setShowLogModal(true)}
          icon={<Plus className="w-4 h-4" />}
          disabled={plants.length === 0}
        >
          Record Harvest
        </Button>
      </div>

      {/* Observation Guidance Banner */}
      <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/70 flex items-start gap-3 text-xs text-amber-950">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Maturity Observation Guide:</span> Estimated harvest windows are approximations influenced by weather, sunlight, and container size. Always verify ripeness through observable signs: full coloration, gentle give upon slight pressure, and characteristic sweet aroma.
        </div>
      </div>

      {/* Active Edible Crops */}
      <div className="space-y-4">
        <h3 className="font-bold text-stone-900 text-base font-serif">
          Active Edible Crops in Garden ({plants.length})
        </h3>

        {plants.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 space-y-2">
            <p className="text-sm font-bold text-stone-800">No edible plants registered</p>
            <p className="text-xs text-stone-500">
              When adding a plant (e.g. tomatoes, basil, peppers, mint), check "This plant produces an edible harvest" to plan maturities.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plants.map((plant) => {
              const harvestDate = plant.expectedHarvestDate ? new Date(plant.expectedHarvestDate) : null;
              const daysLeft = harvestDate ? Math.ceil((harvestDate.getTime() - now.getTime()) / 86400000) : null;
              const isReady = daysLeft !== null && daysLeft <= 2;

              return (
                <div key={plant.id} className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <img src={plant.photoUrl} alt={plant.name} className="w-14 h-14 rounded-xl object-cover" />
                      <div>
                        <h4 className="font-bold text-stone-900 text-base">{plant.name}</h4>
                        <p className="text-xs text-stone-500">{plant.species}</p>
                        <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full mt-1 inline-block">
                          Planted: {new Date(plant.plantedDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-stone-500">Expected Maturity:</span>
                        <span className="font-bold text-stone-800">
                          {harvestDate ? harvestDate.toLocaleDateString() : 'Continuous harvest'}
                        </span>
                      </div>
                      {daysLeft !== null && (
                        <div className="flex justify-between items-center pt-1 border-t border-stone-200/60">
                          <span className="text-stone-500">Status:</span>
                          <span className={`font-bold ${isReady ? 'text-amber-600' : 'text-emerald-700'}`}>
                            {isReady ? 'Ready to pick!' : `${daysLeft} days to peak ripeness`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="amber"
                    className="w-full"
                    onClick={() => {
                      setSelectedPlantId(plant.id);
                      setShowLogModal(true);
                    }}
                    icon={<Apple className="w-3.5 h-3.5" />}
                  >
                    Log Harvest
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Harvest History Log */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-stone-900 text-base font-serif flex items-center gap-2">
          <Scale className="w-5 h-5 text-amber-600" /> Historical Harvest Yields ({records.length})
        </h3>

        {records.length === 0 ? (
          <p className="text-xs text-stone-400 py-6 text-center">No harvests recorded yet.</p>
        ) : (
          <div className="divide-y divide-stone-100">
            {records.map((r) => {
              const plant = plants.find((p) => p.id === r.plantId);
              return (
                <div key={r.id} className="py-3.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-900 text-sm">
                        {r.quantity} {r.unit}
                      </span>
                      <span className="text-stone-700 font-semibold">
                        • {plant?.name || 'Homegrown Produce'}
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-400">
                      Harvested on {new Date(r.date).toLocaleDateString()}
                    </span>
                    {r.notes && <p className="text-stone-600 mt-0.5">{r.notes}</p>}
                  </div>

                  {r.qualityRating && (
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {Array.from({ length: r.qualityRating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: Record Harvest */}
      <Modal
        isOpen={showLogModal}
        onClose={() => setShowLogModal(false)}
        title="Record Harvest Yield"
        subtitle="Log weight, quantity, and culinary quality"
      >
        <form onSubmit={handleLogHarvest} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Select Crop *
            </label>
            <select
              value={selectedPlantId}
              onChange={(e) => setSelectedPlantId(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50"
            >
              {plants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.species})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Unit
              </label>
              <select
                value={unit}
                onChange={(e: any) => setUnit(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200"
              >
                <option value="pieces">Pieces / Fruit</option>
                <option value="grams">Grams</option>
                <option value="kg">Kilograms</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Flavor &amp; Quality Rating
            </label>
            <select
              value={qualityRating}
              onChange={(e) => setQualityRating(Number(e.target.value))}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200"
            >
              <option value="5">⭐⭐⭐⭐⭐ 5 Stars - Peak Sweetness / Flavor</option>
              <option value="4">⭐⭐⭐⭐ 4 Stars - Very Good</option>
              <option value="3">⭐⭐⭐ 3 Stars - Average Quality</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Culinary Notes / Recipe
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Used for fresh caprese salad and homemade pizza"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
            <Button type="button" variant="outline" onClick={() => setShowLogModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="amber">
              Record Harvest &amp; Celebrate
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
