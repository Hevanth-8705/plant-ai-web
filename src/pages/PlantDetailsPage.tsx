import React, { useState, useEffect } from 'react';
import { 
  Sprout, 
  Droplets, 
  FlaskConical, 
  Sun, 
  TrendingUp, 
  Stethoscope, 
  Apple, 
  BookOpen, 
  Edit3, 
  Trash2, 
  ArrowLeft, 
  Calendar, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Sparkles,
  Star,
  Image as ImageIcon
} from 'lucide-react';
import { MultiPhotoUpload } from '../components/common/MultiPhotoUpload.tsx';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { Plant, WateringLog, FertilizerLog, GrowthRecord, HarvestRecord, DiaryEntry, PlantHealthReport } from '../types/index.ts';
import { api } from '../services/api.ts';
import { Button } from '../components/common/Button.tsx';
import { Badge } from '../components/common/Badge.tsx';
import { Modal } from '../components/common/Modal.tsx';

interface PlantDetailsPageProps {
  plantId: string;
  onBack: () => void;
  onEdit: (plant: Plant) => void;
  onDiagnose: (plant: Plant) => void;
}

export const PlantDetailsPage: React.FC<PlantDetailsPageProps> = ({
  plantId,
  onBack,
  onEdit,
  onDiagnose,
}) => {
  const [data, setData] = useState<{
    plant: Plant;
    wateringLogs: WateringLog[];
    fertilizerLogs: FertilizerLog[];
    growthRecords: GrowthRecord[];
    harvestRecords: HarvestRecord[];
    diaryEntries: DiaryEntry[];
    healthReports: PlantHealthReport[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'care' | 'growth' | 'health' | 'harvest' | 'diary'>('care');

  // Modals state
  const [showWaterModal, setShowWaterModal] = useState(false);
  const [showFertilizeModal, setShowFertilizeModal] = useState(false);
  const [showGrowthModal, setShowGrowthModal] = useState(false);
  const [showHarvestModal, setShowHarvestModal] = useState(false);
  const [showDiaryModal, setShowDiaryModal] = useState(false);

  // Form inputs
  const [waterAmount, setWaterAmount] = useState(400);
  const [waterMethod, setWaterMethod] = useState<'top' | 'bottom' | 'mist'>('top');
  const [fertilizerType, setFertilizerType] = useState('');
  const [fertilizerAmount, setFertilizerAmount] = useState(5);
  const [growthHeight, setGrowthHeight] = useState(10);
  const [growthLeaves, setGrowthLeaves] = useState(5);
  const [growthMilestone, setGrowthMilestone] = useState('');
  const [harvestQty, setHarvestQty] = useState(1);
  const [harvestUnit, setHarvestUnit] = useState<'pieces' | 'grams' | 'kg'>('pieces');
  const [harvestRating, setHarvestRating] = useState<number>(5);
  const [diaryTitle, setDiaryTitle] = useState('');
  const [diaryContent, setDiaryContent] = useState('');
  const [diaryPhotos, setDiaryPhotos] = useState<string[]>([]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await api.plants.get(plantId);
      setData(res);
      setWaterAmount(res.plant.waterAmountMl || 400);
      setFertilizerType(res.plant.fertilizerType || 'Balanced Food');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [plantId]);

  if (loading || !data) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-stone-500 font-medium">Loading botanical profile...</p>
      </div>
    );
  }

  const { plant, wateringLogs, fertilizerLogs, growthRecords, harvestRecords, diaryEntries, healthReports } = data;

  // Growth chart formatting
  const chartData = growthRecords.map((r) => ({
    date: new Date(r.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    height: r.heightCm,
    leaves: r.leafCount,
  }));

  const handleQuickWater = async () => {
    try {
      await api.plants.markWatered(plant.id, {
        amountMl: waterAmount,
        method: waterMethod,
        recordDiary: true,
      });
      setShowWaterModal(false);
      fetchDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecordFertilizer = async () => {
    try {
      await api.plants.markFertilized(plant.id, {
        fertilizerType,
        amount: fertilizerAmount,
        unit: 'ml',
        recordDiary: true,
      });
      setShowFertilizeModal(false);
      fetchDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddGrowth = async () => {
    try {
      await api.growth.add(plant.id, {
        heightCm: Number(growthHeight),
        leafCount: Number(growthLeaves),
        milestone: growthMilestone || undefined,
        floweringStatus: 'none',
      });
      setShowGrowthModal(false);
      setGrowthMilestone('');
      fetchDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddHarvest = async () => {
    try {
      await api.harvest.add({
        plantId: plant.id,
        quantity: Number(harvestQty),
        unit: harvestUnit,
        qualityRating: harvestRating as any,
        date: new Date().toISOString(),
      });
      setShowHarvestModal(false);
      fetchDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddDiary = async () => {
    try {
      await api.diary.add({
        plantId: plant.id,
        title: diaryTitle,
        content: diaryContent,
        eventType: 'general_note',
        tags: [plant.category, plant.name],
        date: new Date().toISOString(),
        photoUrls: diaryPhotos,
      });
      setShowDiaryModal(false);
      setDiaryTitle('');
      setDiaryContent('');
      setDiaryPhotos([]);
      fetchDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to remove ${plant.name} from your garden?`)) {
      await api.plants.delete(plant.id);
      onBack();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-white border border-stone-200 px-3 py-1.5 rounded-xl shadow-2xs hover:bg-stone-50"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Plants
        </button>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(plant)}
            icon={<Edit3 className="w-3.5 h-3.5" />}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            icon={<Trash2 className="w-3.5 h-3.5 text-rose-600" />}
            className="hover:bg-rose-50"
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Hero Plant Header */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Photo */}
          <div className="md:col-span-5 h-64 md:h-auto relative bg-stone-100">
            <img
              src={plant.photoUrl}
              alt={plant.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <Badge variant="stone">{plant.category}</Badge>
            </div>
          </div>

          {/* Core Specs */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold font-serif text-emerald-950">
                    {plant.name}
                  </h1>
                  <p className="text-sm text-stone-500 italic mt-0.5">
                    {plant.species} {plant.nickname ? `• "${plant.nickname}"` : ''}
                  </p>
                </div>

                <Badge
                  variant={plant.healthStatus === 'attention_needed' ? 'rose' : plant.healthStatus === 'recovering' ? 'amber' : 'green'}
                >
                  {plant.healthStatus?.replace('_', ' ') || 'healthy'}
                </Badge>
              </div>

              {/* Tag Pills */}
              {plant.tags && plant.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {plant.tags.map((t) => (
                    <span key={t} className="text-[11px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md">
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {/* Quick Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-stone-100 text-xs">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 block">
                    Location
                  </span>
                  <span className="font-semibold text-stone-800">
                    {plant.location.replace('indoor_', 'Indoor ').replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 block">
                    Light Requirement
                  </span>
                  <span className="font-semibold text-stone-800">
                    {plant.sunlightRequirement.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 block">
                    Water Schedule
                  </span>
                  <span className="font-semibold text-stone-800">
                    Every {plant.wateringFrequencyDays} days ({plant.waterAmountMl || 400} ml)
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 block">
                    Pot &amp; Soil
                  </span>
                  <span className="font-semibold text-stone-800 truncate block">
                    {plant.potSize || 'Container with drainage'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 block">
                    Next Water Due
                  </span>
                  <span className="font-bold text-emerald-700">
                    {new Date(plant.nextWaterDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 block">
                    Next Feeding
                  </span>
                  <span className="font-bold text-purple-700">
                    {new Date(plant.nextFertilizeDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-stone-100">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowWaterModal(true)}
                icon={<Droplets className="w-4 h-4" />}
              >
                Water Plant
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowFertilizeModal(true)}
                icon={<FlaskConical className="w-4 h-4" />}
              >
                Record Feeding
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDiagnose(plant)}
                icon={<Stethoscope className="w-4 h-4 text-rose-600" />}
              >
                AI Disease Check
              </Button>
              {plant.isHarvestable && (
                <Button
                  variant="amber"
                  size="sm"
                  onClick={() => setShowHarvestModal(true)}
                  icon={<Apple className="w-4 h-4" />}
                >
                  Log Harvest
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-stone-200 overflow-x-auto pb-px">
        {[
          { id: 'care', label: 'Care & Logs', icon: <Droplets className="w-4 h-4" /> },
          { id: 'growth', label: `Growth & Charts (${growthRecords.length})`, icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'health', label: `Health Reports (${healthReports.length})`, icon: <Stethoscope className="w-4 h-4" /> },
          ...(plant.isHarvestable ? [{ id: 'harvest', label: `Harvest (${harvestRecords.length})`, icon: <Apple className="w-4 h-4" /> }] : []),
          { id: 'diary', label: `Plant Diary (${diaryEntries.length})`, icon: <BookOpen className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all shrink-0 ${
              activeTab === tab.id
                ? 'border-emerald-700 text-emerald-800'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: Care & Schedules */}
      {activeTab === 'care' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Watering History */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-900 text-sm font-serif flex items-center gap-2">
                <Droplets className="w-4 h-4 text-sky-600" /> Watering History
              </h3>
              <Button size="sm" variant="outline" onClick={() => setShowWaterModal(true)}>
                + Log
              </Button>
            </div>

            {wateringLogs.length === 0 ? (
              <p className="text-xs text-stone-400 py-6 text-center">No watering logs recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {wateringLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-stone-800">{new Date(log.date).toLocaleDateString()}</p>
                      <p className="text-[11px] text-stone-500">{log.amountMl} ml • {log.method} method</p>
                    </div>
                    <span className="text-[11px] text-stone-400">{log.notes}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fertilizer History */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-stone-900 text-sm font-serif flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-purple-600" /> Fertilizer Applications
              </h3>
              <Button size="sm" variant="outline" onClick={() => setShowFertilizeModal(true)}>
                + Log
              </Button>
            </div>

            {fertilizerLogs.length === 0 ? (
              <p className="text-xs text-stone-400 py-6 text-center">No fertilizer applications logged yet.</p>
            ) : (
              <div className="space-y-2">
                {fertilizerLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-stone-800">{new Date(log.date).toLocaleDateString()}</p>
                      <p className="text-[11px] text-stone-500">{log.fertilizerType} • {log.amount} {log.unit}</p>
                    </div>
                    <span className="text-[11px] text-stone-400">{log.notes}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Growth Tracker & Analytics */}
      {activeTab === 'growth' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-stone-900 text-base font-serif">Growth Progression Chart</h3>
                <p className="text-xs text-stone-500">Height (cm) and Leaf Count over observation dates</p>
              </div>
              <Button size="sm" variant="primary" onClick={() => setShowGrowthModal(true)} icon={<Plus className="w-4 h-4" />}>
                Record Measurement
              </Button>
            </div>

            {growthRecords.length < 2 ? (
              <div className="p-8 text-center text-xs text-stone-500 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                Growth curves will render once at least 2 measurement entries are recorded.
              </div>
            ) : (
              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
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

          {/* Growth Milestones Timeline */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-stone-900 text-base font-serif">Growth History &amp; Milestones</h3>
            <div className="space-y-3">
              {growthRecords.map((r) => (
                <div key={r.id} className="p-4 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-stone-400 font-semibold">{new Date(r.date).toLocaleDateString()}</span>
                    <h5 className="font-bold text-stone-900 text-sm mt-0.5">{r.milestone || `${r.heightCm} cm • ${r.leafCount} Leaves`}</h5>
                    {r.notes && <p className="text-stone-500 mt-1">{r.notes}</p>}
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    {r.heightCm} cm
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Health Reports */}
      {activeTab === 'health' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-stone-900 text-base font-serif">Plant Health Assessments</h3>
              <p className="text-xs text-stone-500">AI leaf diagnostics and environmental stress assessments</p>
            </div>
            <Button
              size="sm"
              variant="danger"
              onClick={() => onDiagnose(plant)}
              icon={<Stethoscope className="w-4 h-4" />}
            >
              Run AI Diagnostic
            </Button>
          </div>

          {healthReports.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200/80 p-12 text-center space-y-3">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-stone-900 text-sm">No health issues reported</h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Monty has no active diseases on file. If leaves begin spotting or yellowing, snap a photo to diagnose.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {healthReports.map((rep) => (
                <div key={rep.id} className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-400">{new Date(rep.date).toLocaleDateString()}</span>
                      <h4 className="font-bold text-stone-900 text-base">{rep.diagnosisTitle}</h4>
                    </div>
                    <Badge variant={rep.severity === 'severe' ? 'rose' : 'amber'}>
                      {rep.severity} severity
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-stone-100">
                    <div>
                      <p className="font-bold text-stone-800 mb-1">Visual Observations:</p>
                      <ul className="list-disc pl-4 space-y-0.5 text-stone-600">
                        {rep.visualObservations.map((o, idx) => (
                          <li key={idx}>{o}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="font-bold text-stone-800 mb-1">Recommended Safe Treatments:</p>
                      <ul className="list-disc pl-4 space-y-0.5 text-emerald-800">
                        {rep.safeTreatments.map((t, idx) => (
                          <li key={idx}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <p className="text-[11px] text-stone-400 italic pt-2 border-t border-stone-100">
                    {rep.expertDisclaimer}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Harvest Records */}
      {activeTab === 'harvest' && plant.isHarvestable && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-stone-900 text-base font-serif">Homegrown Harvests</h3>
              <p className="text-xs text-stone-500">Record yields and culinary milestones</p>
            </div>
            <Button size="sm" variant="amber" onClick={() => setShowHarvestModal(true)} icon={<Plus className="w-4 h-4" />}>
              Record Harvest
            </Button>
          </div>

          {harvestRecords.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-200/80 p-12 text-center space-y-3">
              <Apple className="w-10 h-10 text-amber-600 mx-auto" />
              <h4 className="font-bold text-stone-900 text-sm">No harvests logged yet</h4>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Expected maturity window: {plant.expectedHarvestDate ? new Date(plant.expectedHarvestDate).toLocaleDateString() : 'Approaching soon'}.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {harvestRecords.map((h) => (
                <div key={h.id} className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-800 text-base">
                      {h.quantity} {h.unit}
                    </span>
                    <span className="text-[11px] text-stone-400">
                      {new Date(h.date).toLocaleDateString()}
                    </span>
                  </div>
                  {h.qualityRating && (
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: h.qualityRating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  )}
                  {h.notes && <p className="text-xs text-stone-600">{h.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: Plant Diary */}
      {activeTab === 'diary' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-stone-900 text-base font-serif">Plant Journal Entries</h3>
              <p className="text-xs text-stone-500">Chronological care reflections and notes</p>
            </div>
            <Button size="sm" variant="primary" onClick={() => setShowDiaryModal(true)} icon={<Plus className="w-4 h-4" />}>
              Add Diary Note
            </Button>
          </div>

          {diaryEntries.length === 0 ? (
            <p className="text-xs text-stone-400 py-8 text-center bg-white rounded-2xl border border-stone-200">
              No journal entries recorded for this plant yet.
            </p>
          ) : (
            <div className="space-y-3">
              {diaryEntries.map((e) => (
                <div key={e.id} className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs text-stone-400">
                    <span className="font-bold text-emerald-800 uppercase tracking-wider text-[10px]">
                      {e.eventType.replace('_', ' ')}
                    </span>
                    <span>{new Date(e.date).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-bold text-stone-900 text-sm">{e.title}</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">{e.content}</p>
                  {e.photoUrls && e.photoUrls.length > 0 && (
                    <div className="flex gap-2 pt-2">
                      {e.photoUrls.map((url, i) => (
                        <img key={i} src={url} className="w-16 h-16 rounded-lg object-cover" />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: Water Plant */}
      <Modal
        isOpen={showWaterModal}
        onClose={() => setShowWaterModal(false)}
        title={`Water ${plant.name}`}
        subtitle="Confirm hydration and soil condition"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Water Amount (ml)
            </label>
            <input
              type="number"
              step="50"
              value={waterAmount}
              onChange={(e) => setWaterAmount(Number(e.target.value))}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Watering Method
            </label>
            <select
              value={waterMethod}
              onChange={(e: any) => setWaterMethod(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200"
            >
              <option value="top">Top Watering (Drain until saucer fills)</option>
              <option value="bottom">Bottom Soaking (Submerge pot base for 20 mins)</option>
              <option value="mist">Misting &amp; Soil Spritz</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
            <Button variant="outline" onClick={() => setShowWaterModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleQuickWater} icon={<Droplets className="w-4 h-4" />}>
              Confirm Watered
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL: Record Fertilizer */}
      <Modal
        isOpen={showFertilizeModal}
        onClose={() => setShowFertilizeModal(false)}
        title={`Feed ${plant.name}`}
        subtitle="Log nutrient type and dosage"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Fertilizer Type / Brand
            </label>
            <input
              type="text"
              value={fertilizerType}
              onChange={(e) => setFertilizerType(e.target.value)}
              placeholder="e.g. Balanced Organic 10-10-10"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Amount (ml / diluted solution)
            </label>
            <input
              type="number"
              value={fertilizerAmount}
              onChange={(e) => setFertilizerAmount(Number(e.target.value))}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200"
            />
          </div>

          <div className="p-3 bg-amber-50 rounded-xl text-amber-900 text-xs border border-amber-200">
            Safety tip: Never fertilize bone-dry soil. Always lightly moisten the root zone first.
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
            <Button variant="outline" onClick={() => setShowFertilizeModal(false)}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={handleRecordFertilizer}>
              Save Feeding
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL: Record Growth */}
      <Modal
        isOpen={showGrowthModal}
        onClose={() => setShowGrowthModal(false)}
        title="Record Growth Measurement"
        subtitle="Track height and leaf production"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Height (cm)
              </label>
              <input
                type="number"
                value={growthHeight}
                onChange={(e) => setGrowthHeight(Number(e.target.value))}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Leaf Count
              </label>
              <input
                type="number"
                value={growthLeaves}
                onChange={(e) => setGrowthLeaves(Number(e.target.value))}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Milestone (Optional)
            </label>
            <input
              type="text"
              value={growthMilestone}
              onChange={(e) => setGrowthMilestone(e.target.value)}
              placeholder="e.g. New leaf shoot opened, first flower bud"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
            <Button variant="outline" onClick={() => setShowGrowthModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddGrowth}>
              Save Measurement
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL: Record Harvest */}
      <Modal
        isOpen={showHarvestModal}
        onClose={() => setShowHarvestModal(false)}
        title="Record Harvest Yield"
        subtitle="Celebrate homegrown culinary produce"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Quantity
              </label>
              <input
                type="number"
                value={harvestQty}
                onChange={(e) => setHarvestQty(Number(e.target.value))}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Unit
              </label>
              <select
                value={harvestUnit}
                onChange={(e: any) => setHarvestUnit(e.target.value)}
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
              Quality Rating (1 to 5 stars)
            </label>
            <select
              value={harvestRating}
              onChange={(e) => setHarvestRating(Number(e.target.value))}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200"
            >
              <option value="5">⭐⭐⭐⭐⭐ 5 Stars - Peak Flavor</option>
              <option value="4">⭐⭐⭐⭐ 4 Stars - Very Good</option>
              <option value="3">⭐⭐⭐ 3 Stars - Moderate</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
            <Button variant="outline" onClick={() => setShowHarvestModal(false)}>
              Cancel
            </Button>
            <Button variant="amber" onClick={handleAddHarvest}>
              Log Harvest
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL: Add Diary */}
      <Modal
        isOpen={showDiaryModal}
        onClose={() => setShowDiaryModal(false)}
        title={`Add Diary Entry for ${plant.name}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Title
            </label>
            <input
              type="text"
              value={diaryTitle}
              onChange={(e) => setDiaryTitle(e.target.value)}
              placeholder="e.g. Moved away from heating draft"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Observation Notes
            </label>
            <textarea
              rows={3}
              value={diaryContent}
              onChange={(e) => setDiaryContent(e.target.value)}
              placeholder="Describe leaf posture, soil smell, root development..."
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200"
            />
          </div>

          <MultiPhotoUpload
            values={diaryPhotos}
            onChange={setDiaryPhotos}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
            <Button variant="outline" onClick={() => setShowDiaryModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddDiary}>
              Save Entry
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
