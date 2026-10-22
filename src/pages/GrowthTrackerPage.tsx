import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Plus, 
  Calendar, 
  Sparkles, 
  Trash2, 
  Camera, 
  ArrowRight,
  Maximize2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { Plant, GrowthRecord } from '../types/index.ts';
import { api } from '../services/api.ts';
import { Button } from '../components/common/Button.tsx';
import { Modal } from '../components/common/Modal.tsx';
import { PhotoUpload } from '../components/common/PhotoUpload.tsx';

export const GrowthTrackerPage: React.FC = () => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedPlantId, setSelectedPlantId] = useState<string>('');
  const [records, setRecords] = useState<GrowthRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [heightCm, setHeightCm] = useState(15);
  const [leafCount, setLeafCount] = useState(6);
  const [floweringStatus, setFloweringStatus] = useState<'none' | 'budding' | 'blooming' | 'faded'>('none');
  const [milestone, setMilestone] = useState('');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  const fetchPlants = async () => {
    try {
      setLoading(true);
      const res = await api.plants.list();
      const list = res.plants || [];
      setPlants(list);
      if (list.length > 0 && !selectedPlantId) {
        setSelectedPlantId(list[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecords = async (plantId: string) => {
    try {
      const res = await api.growth.list(plantId);
      setRecords(res.records || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPlants();
  }, []);

  useEffect(() => {
    if (selectedPlantId) {
      fetchRecords(selectedPlantId);
    }
  }, [selectedPlantId]);

  const handleAddMeasurement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlantId) return;

    try {
      await api.growth.add(selectedPlantId, {
        heightCm: Number(heightCm),
        leafCount: Number(leafCount),
        floweringStatus,
        milestone: milestone.trim() || undefined,
        notes: notes.trim() || undefined,
        photoUrl: photoUrl || undefined,
        date: new Date().toISOString(),
      });
      setShowAddModal(false);
      setMilestone('');
      setNotes('');
      setPhotoUrl('');
      fetchRecords(selectedPlantId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (recordId: string) => {
    if (confirm('Delete this growth measurement?')) {
      await api.growth.delete(selectedPlantId, recordId);
      fetchRecords(selectedPlantId);
    }
  };

  const activePlant = plants.find((p) => p.id === selectedPlantId);

  // Growth Analytics calculations
  const hasMultipleRecords = records.length >= 2;
  const initialRecord = records[0];
  const latestRecord = records[records.length - 1];
  const heightGain = hasMultipleRecords ? latestRecord.heightCm - initialRecord.heightCm : 0;
  const leafGain = hasMultipleRecords ? latestRecord.leafCount - initialRecord.leafCount : 0;

  const chartData = records.map((r) => ({
    date: new Date(r.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    height: r.heightCm,
    leaves: r.leafCount,
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-emerald-950 flex items-center gap-2.5">
            <TrendingUp className="w-7 h-7 text-emerald-600" /> Plant Growth Tracker
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Track height progress, leaf expansion, and milestone development over time
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Record Measurement
        </Button>
      </div>

      {/* Plant Selector Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {plants.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedPlantId(p.id)}
            className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border transition-all shrink-0 ${
              selectedPlantId === p.id
                ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-xs'
                : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
            }`}
          >
            <img src={p.photoUrl} alt={p.name} className="w-6 h-6 rounded-full object-cover" />
            <span className="text-xs font-bold">{p.name}</span>
          </button>
        ))}
      </div>

      {activePlant && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Chart Area */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-stone-900 text-lg font-serif">
                    Growth Progression for {activePlant.name}
                  </h3>
                  <p className="text-xs text-stone-500">Plotted over observation dates</p>
                </div>

                {hasMultipleRecords && (
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                      +{heightGain} cm height
                    </span>
                    <span className="font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg">
                      +{leafGain} leaves
                    </span>
                  </div>
                )}
              </div>

              {!hasMultipleRecords ? (
                <div className="h-64 flex flex-col items-center justify-center bg-stone-50 rounded-2xl border border-dashed border-stone-200 text-center p-6 text-xs text-stone-500 space-y-2">
                  <TrendingUp className="w-8 h-8 text-stone-400" />
                  <p className="font-bold text-stone-700">Need at least 2 measurements to plot curve</p>
                  <p>Click "Record Measurement" above to log today's height and leaf count.</p>
                </div>
              ) : (
                <div className="h-72 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[...chartData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0efe9" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line yAxisId="left" type="monotone" dataKey="height" stroke="#047857" strokeWidth={3} name="Height (cm)" />
                      <Line yAxisId="right" type="monotone" dataKey="leaves" stroke="#0284c7" strokeWidth={2} name="Leaf Count" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Growth Records Timeline */}
            <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-stone-900 text-base font-serif">
                Chronological Measurements ({records.length})
              </h3>

              <div className="divide-y divide-stone-100">
                {records.map((r) => (
                  <div key={r.id} className="py-4 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 text-sm">
                          {r.heightCm} cm • {r.leafCount} leaves
                        </span>
                        {r.milestone && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                            {r.milestone}
                          </span>
                        )}
                      </div>
                      <p className="text-stone-400 text-[11px] mt-0.5">
                        Recorded on {new Date(r.date).toLocaleDateString()}
                      </p>
                      {r.notes && <p className="text-stone-600 mt-1">{r.notes}</p>}
                    </div>

                    <button
                      onClick={() => handleDelete(r.id)}
                      className="text-stone-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors"
                      title="Delete measurement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Visual Photo Gallery */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-stone-200/80 p-5 shadow-xs space-y-4">
              <h3 className="font-bold text-stone-900 text-base font-serif flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-700" /> Photo Timeline
              </h3>

              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 aspect-square">
                  <img
                    src={activePlant.photoUrl}
                    alt={activePlant.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 bg-stone-50 rounded-xl text-xs text-stone-600 space-y-1">
                  <p className="font-bold text-stone-800">Visual Growth Tips:</p>
                  <p>Take photographs from the same angle and distance once every month to see leaf expansion clearly.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add Measurement */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Record Growth Entry"
        subtitle={`Measure height and leaves for ${activePlant?.name || 'plant'}`}
      >
        <form onSubmit={handleAddMeasurement} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Height (cm) *
              </label>
              <input
                type="number"
                required
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Leaf Count *
              </label>
              <input
                type="number"
                required
                value={leafCount}
                onChange={(e) => setLeafCount(Number(e.target.value))}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Flowering Status
            </label>
            <select
              value={floweringStatus}
              onChange={(e: any) => setFloweringStatus(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200"
            >
              <option value="none">No flowers / Foliage stage</option>
              <option value="budding">Flower buds emerging</option>
              <option value="blooming">In full bloom</option>
              <option value="faded">Blooms faded / setting fruit</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Milestone (e.g. First fenestration, repotted, fruiting)
            </label>
            <input
              type="text"
              value={milestone}
              onChange={(e) => setMilestone(e.target.value)}
              placeholder="e.g. Unfurled massive double split leaf"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Stem thickness, new aerial root growth..."
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
            <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Measurement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
