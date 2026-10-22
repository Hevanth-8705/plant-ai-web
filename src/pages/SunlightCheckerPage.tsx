import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  ArrowRight,
  Compass
} from 'lucide-react';
import { Plant, SunlightAssessment, SunlightPreference, PlantLocation } from '../types/index.ts';
import { api } from '../services/api.ts';
import { Button } from '../components/common/Button.tsx';
import { PhotoUpload } from '../components/common/PhotoUpload.tsx';

export const SunlightCheckerPage: React.FC = () => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedPlantId, setSelectedPlantId] = useState<string>('');
  const [plantRequirement, setPlantRequirement] = useState<SunlightPreference>('bright_indirect');
  const [environment, setEnvironment] = useState<PlantLocation>('indoor_living_room');
  const [dailyHours, setDailyHours] = useState(5);
  const [lightType, setLightType] = useState<'direct' | 'indirect' | 'shade'>('indirect');
  const [windowFacing, setWindowFacing] = useState<'south' | 'east' | 'west' | 'north' | 'none'>('east');
  const [locationPhoto, setLocationPhoto] = useState('');

  const [assessment, setAssessment] = useState<SunlightAssessment | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.plants.list().then((res) => {
      const list = res.plants || [];
      setPlants(list);
      if (list.length > 0) {
        setSelectedPlantId(list[0].id);
        setPlantRequirement(list[0].sunlightRequirement);
        setEnvironment(list[0].location);
        setDailyHours(list[0].currentLightHours || 5);
        setLightType(list[0].currentLightType || 'indirect');
      }
    });
  }, []);

  const handlePlantChange = (id: string) => {
    setSelectedPlantId(id);
    const p = plants.find((x) => x.id === id);
    if (p) {
      setPlantRequirement(p.sunlightRequirement);
      setEnvironment(p.location);
      if (p.currentLightHours) setDailyHours(p.currentLightHours);
      if (p.currentLightType) setLightType(p.currentLightType);
    }
  };

  const handleAssess = async () => {
    try {
      setLoading(true);
      const selected = plants.find((p) => p.id === selectedPlantId);
      const res = await api.sunlight.assess({
        plantRequirement,
        environment,
        dailyHours: Number(dailyHours),
        lightType,
        windowFacing,
        plantName: selected?.name || 'Selected Plant',
      });
      setAssessment(res.assessment);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-emerald-950 flex items-center gap-2.5">
          <Sun className="w-7 h-7 text-amber-500" /> Sunlight Assessment &amp; Placement Checker
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Evaluate daylight exposure and window orientations to prevent foliage scorch or sluggish growth
        </p>
      </div>

      {/* Scientific Measurement Disclaimer */}
      <div className="p-4 bg-stone-100 rounded-2xl border border-stone-200 flex items-start gap-3 text-xs text-stone-600">
        <Info className="w-5 h-5 text-stone-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-stone-800">Observation Note:</span> Standard smartphone and web cameras adjust their exposure automatically and cannot measure calibrated Photosynthetically Active Radiation (PAR) or foot-candles. This assessment compares your reported physical window layout and daylight hours against biological plant benchmarks.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Inputs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-stone-900 text-base font-serif">
              Current Plant Placement Conditions
            </h3>

            {/* Plant Selector */}
            {plants.length > 0 && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                  Evaluate For Plant
                </label>
                <select
                  value={selectedPlantId}
                  onChange={(e) => handlePlantChange(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50"
                >
                  {plants.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.species}) — Needs: {p.sunlightRequirement.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                  Plant Biological Requirement
                </label>
                <select
                  value={plantRequirement}
                  onChange={(e) => setPlantRequirement(e.target.value as SunlightPreference)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50"
                >
                  <option value="low_indirect">Low Indirect Light (Snake, ZZ)</option>
                  <option value="medium_indirect">Medium Indirect Light (Pothos, Philo)</option>
                  <option value="bright_indirect">Bright Indirect Light (Monstera, Ficus)</option>
                  <option value="full_sun">Full Direct Sun 6+ hrs (Tomatoes, Basil, Cacti)</option>
                  <option value="partial_shade">Partial Shade / Dappled Morning Sun</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                  Growing Environment
                </label>
                <select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value as PlantLocation)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50"
                >
                  <option value="indoor_living_room">Indoor Living Room</option>
                  <option value="indoor_bedroom">Indoor Bedroom</option>
                  <option value="indoor_kitchen">Indoor Kitchen Window</option>
                  <option value="balcony">Balcony (Covered / Open)</option>
                  <option value="patio">Patio / Porch</option>
                  <option value="garden_bed">Outdoor Garden Bed</option>
                  <option value="greenhouse">Greenhouse</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                  Estimated Daylight Hours
                </label>
                <input
                  type="number"
                  min="0"
                  max="16"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(Number(e.target.value))}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                  Light Quality
                </label>
                <select
                  value={lightType}
                  onChange={(e: any) => setLightType(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50"
                >
                  <option value="direct">Direct Beams Touch Leaves</option>
                  <option value="indirect">Bright Diffused (No Direct Beams)</option>
                  <option value="shade">Dappled or Deep Shade</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                  Window Orientation
                </label>
                <select
                  value={windowFacing}
                  onChange={(e: any) => setWindowFacing(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50"
                >
                  <option value="south">South (Intense midday sun)</option>
                  <option value="east">East (Gentle morning sun)</option>
                  <option value="west">West (Hot afternoon sun)</option>
                  <option value="north">North (Consistent soft cool light)</option>
                  <option value="none">No immediate window</option>
                </select>
              </div>
            </div>

            <PhotoUpload
              value={locationPhoto}
              onChange={(val) => setLocationPhoto(val)}
              label="Location Photograph (Optional)"
              hint="Upload a photo showing the plant pot relative to the window"
            />

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
              onClick={handleAssess}
              icon={<Sun className="w-5 h-5 text-amber-300" />}
            >
              Analyze Sunlight Suitability
            </Button>
          </div>
        </div>

        {/* Results / Status Indicator */}
        <div className="lg:col-span-5 space-y-6">
          {assessment ? (
            <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-md space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  Sunlight Status
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    assessment.status === 'Suitable'
                      ? 'bg-emerald-100 text-emerald-800'
                      : assessment.status === 'Low'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {assessment.status}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 space-y-2">
                <h4 className="font-bold text-stone-900 text-sm font-serif">Assessment Summary</h4>
                <p className="text-xs text-stone-600 leading-relaxed">{assessment.summary}</p>
              </div>

              <div className="space-y-2 text-xs">
                <p className="font-bold text-stone-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" /> Risk Analysis:
                </p>
                <p className="text-stone-600 leading-relaxed bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                  {assessment.riskAnalysis}
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <p className="font-bold text-stone-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Actionable Recommendations:
                </p>
                <ul className="space-y-1.5">
                  {assessment.recommendations.map((rec, idx) => (
                    <li key={idx} className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 text-emerald-950 font-medium">
                      • {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-stone-200/80 p-10 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
                <Sun className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-stone-900 text-base">Check Light Exposure</h4>
              <p className="text-xs text-stone-500 leading-relaxed max-w-xs mx-auto">
                Configure your window orientation and light hours, then click "Analyze Sunlight Suitability" to verify conditions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
