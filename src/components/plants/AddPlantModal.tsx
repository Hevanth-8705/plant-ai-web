import React, { useState } from 'react';
import { Modal } from '../common/Modal.tsx';
import { Button } from '../common/Button.tsx';
import { PhotoUpload } from '../common/PhotoUpload.tsx';
import { Plant, PlantCategory, PlantLocation, SunlightPreference } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { Sprout, Droplets, Sun, Calendar, Sparkles } from 'lucide-react';

interface AddPlantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newPlant: Plant) => void;
  initialPlant?: Plant | null;
}

export const AddPlantModal: React.FC<AddPlantModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialPlant,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState(initialPlant?.name || '');
  const [species, setSpecies] = useState(initialPlant?.species || '');
  const [nickname, setNickname] = useState(initialPlant?.nickname || '');
  const [category, setCategory] = useState<PlantCategory>(initialPlant?.category || 'houseplant');
  const [photoUrl, setPhotoUrl] = useState(initialPlant?.photoUrl || '');
  const [location, setLocation] = useState<PlantLocation>(initialPlant?.location || 'indoor_living_room');
  const [sunlightRequirement, setSunlightRequirement] = useState<SunlightPreference>(
    initialPlant?.sunlightRequirement || 'bright_indirect'
  );
  const [wateringFrequencyDays, setWateringFrequencyDays] = useState(
    initialPlant?.wateringFrequencyDays || 7
  );
  const [waterAmountMl, setWaterAmountMl] = useState(initialPlant?.waterAmountMl || 400);
  const [fertilizeFrequencyDays, setFertilizeFrequencyDays] = useState(
    initialPlant?.fertilizeFrequencyDays || 30
  );
  const [fertilizerType, setFertilizerType] = useState(
    initialPlant?.fertilizerType || 'Balanced Liquid Plant Food'
  );
  const [potSize, setPotSize] = useState(initialPlant?.potSize || '20 cm with drainage');
  const [soilType, setSoilType] = useState(initialPlant?.soilType || 'Aerated potting mix');
  const [isHarvestable, setIsHarvestable] = useState(initialPlant?.isHarvestable || false);
  const [expectedHarvestDate, setExpectedHarvestDate] = useState(
    initialPlant?.expectedHarvestDate ? initialPlant.expectedHarvestDate.split('T')[0] : ''
  );
  const [notes, setNotes] = useState(initialPlant?.notes || '');
  const [tagsInput, setTagsInput] = useState((initialPlant?.tags || []).join(', '));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !species.trim()) {
      setError('Plant name and species are required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        name: name.trim(),
        species: species.trim(),
        nickname: nickname.trim() || undefined,
        category,
        photoUrl: photoUrl || 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80',
        location,
        sunlightRequirement,
        potSize,
        soilType,
        wateringFrequencyDays: Number(wateringFrequencyDays) || 7,
        waterAmountMl: Number(waterAmountMl) || 400,
        fertilizeFrequencyDays: Number(fertilizeFrequencyDays) || 30,
        fertilizerType,
        isHarvestable,
        expectedHarvestDate: isHarvestable && expectedHarvestDate ? new Date(expectedHarvestDate).toISOString() : undefined,
        notes: notes.trim(),
        tags: tagsInput ? tagsInput.split(',').map((t) => t.trim()).filter(Boolean) : [],
      };

      if (initialPlant) {
        const res = await api.plants.update(initialPlant.id, payload);
        onSuccess(res.plant);
      } else {
        const res = await api.plants.create(payload);
        onSuccess(res.plant);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save plant.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialPlant ? 'Edit Plant Profile' : 'Add New Plant to Garden'}
      subtitle="Configure watering frequency, sunlight needs, and botanical details"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
            {error}
          </div>
        )}

        {/* Basic Identifiers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
              Plant Name / Pet Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Monty, Roma, Cleo"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
              Botanical Species *
            </label>
            <input
              type="text"
              required
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              placeholder="e.g. Monstera Deliciosa, Solanum lycopersicum"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-stone-50/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as PlantCategory)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="houseplant">Houseplant</option>
              <option value="succulent">Succulent / Cactus</option>
              <option value="herb">Culinary Herb</option>
              <option value="vegetable">Vegetable</option>
              <option value="fruit">Fruit / Berry</option>
              <option value="flower">Flowering Plant</option>
              <option value="foliage">Foliage / Fern</option>
              <option value="bonsai">Bonsai / Miniature</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
              Location / Placement
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value as PlantLocation)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="indoor_living_room">Indoor - Living Room</option>
              <option value="indoor_bedroom">Indoor - Bedroom</option>
              <option value="indoor_kitchen">Indoor - Kitchen</option>
              <option value="indoor_bathroom">Indoor - Bathroom</option>
              <option value="balcony">Balcony</option>
              <option value="patio">Patio / Porch</option>
              <option value="garden_bed">Outdoor Garden Bed</option>
              <option value="greenhouse">Greenhouse</option>
            </select>
          </div>
        </div>

        {/* Photo Upload */}
        <PhotoUpload
          value={photoUrl}
          onChange={(val) => setPhotoUrl(val)}
          label="Plant Photograph"
          hint="Upload a photo or pick from quick presets"
        />

        {/* Care Schedules Section */}
        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
          <div className="flex items-center gap-2 text-stone-800 font-bold text-xs uppercase tracking-wider">
            <Droplets className="w-4 h-4 text-emerald-600" /> Care Schedules & Watering
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                Water Frequency (days)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={wateringFrequencyDays}
                onChange={(e) => setWateringFrequencyDays(Number(e.target.value))}
                className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                Water Amount (ml estimate)
              </label>
              <input
                type="number"
                step="50"
                min="50"
                value={waterAmountMl}
                onChange={(e) => setWaterAmountMl(Number(e.target.value))}
                className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                Sunlight Needs
              </label>
              <select
                value={sunlightRequirement}
                onChange={(e) => setSunlightRequirement(e.target.value as SunlightPreference)}
                className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 bg-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="low_indirect">Low Indirect Light</option>
                <option value="medium_indirect">Medium Indirect Light</option>
                <option value="bright_indirect">Bright Indirect Light</option>
                <option value="full_sun">Full Direct Sun (6+ hrs)</option>
                <option value="partial_shade">Partial Shade / Dappled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-200/60">
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                Fertilize Frequency (days)
              </label>
              <input
                type="number"
                min="7"
                max="180"
                value={fertilizeFrequencyDays}
                onChange={(e) => setFertilizeFrequencyDays(Number(e.target.value))}
                className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                Preferred Fertilizer
              </label>
              <input
                type="text"
                value={fertilizerType}
                onChange={(e) => setFertilizerType(e.target.value)}
                placeholder="e.g. Balanced 10-10-10 or Tomato Food"
                className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Harvest Options (for edibles) */}
        <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isHarvestable}
              onChange={(e) => setIsHarvestable(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-stone-300"
            />
            <span className="text-xs font-bold text-emerald-950">
              This plant produces an edible or usable harvest (tomatoes, herbs, peppers, greens)
            </span>
          </label>

          {isHarvestable && (
            <div className="pt-2 animate-in fade-in duration-150">
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                Expected Harvest Target Date (estimated range)
              </label>
              <input
                type="date"
                value={expectedHarvestDate}
                onChange={(e) => setExpectedHarvestDate(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}
        </div>

        {/* Pot & Soil Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
              Pot Size & Container
            </label>
            <input
              type="text"
              value={potSize}
              onChange={(e) => setPotSize(e.target.value)}
              placeholder="e.g. 25 cm terracotta with drainage"
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. aroid, favorite, edible"
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50/50"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
            Personal Notes & Observations
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Special watering instructions, pruning milestones, window placement..."
            className="w-full text-sm px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50/50 focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {initialPlant ? 'Save Changes' : 'Add to My Garden'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
