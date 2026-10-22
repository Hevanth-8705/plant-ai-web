import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  Upload, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Camera, 
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Plant, PlantHealthReport } from '../types/index.ts';
import { api } from '../services/api.ts';
import { Button } from '../components/common/Button.tsx';
import { PhotoUpload } from '../components/common/PhotoUpload.tsx';
import { Badge } from '../components/common/Badge.tsx';

interface DiseaseDetectionPageProps {
  initialPlant?: Plant | null;
  onClearInitialPlant?: () => void;
}

const COMMON_SYMPTOMS = [
  'Yellowing leaves (chlorosis)',
  'Brown or crispy leaf tips',
  'Dark circular leaf spots',
  'White powdery film on foliage',
  'Drooping or wilting stems',
  'Curling or distorted new leaves',
  'Sticky residue or honeydew',
  'Fine web-like filaments',
  'Mushy stem base / foul odor',
  'Premature flower or fruit drop',
];

export const DiseaseDetectionPage: React.FC<DiseaseDetectionPageProps> = ({
  initialPlant,
}) => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [selectedPlantId, setSelectedPlantId] = useState<string>(initialPlant?.id || '');
  const [species, setSpecies] = useState(initialPlant?.species || '');
  const [photoBase64, setPhotoBase64] = useState<string>('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState('');
  const [affectedParts, setAffectedParts] = useState<string[]>(['Leaves']);
  const [durationDays, setDurationDays] = useState(4);
  const [wateringHabits, setWateringHabits] = useState('Watered once every 5-7 days');
  const [sunlightConditions, setSunlightConditions] = useState('Bright indirect light near east window');
  const [recentFertilizer, setRecentFertilizer] = useState('Diluted liquid feed 2 weeks ago');

  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<PlantHealthReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.plants.list().then((res) => {
      setPlants(res.plants || []);
      if (initialPlant) {
        setSelectedPlantId(initialPlant.id);
        setSpecies(initialPlant.species);
        if (initialPlant.photoUrl) setPhotoBase64(initialPlant.photoUrl);
      }
    });
  }, [initialPlant]);

  const toggleSymptom = (sym: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  const handleDiagnose = async () => {
    try {
      setLoading(true);
      setError(null);

      const allSymptoms = [...selectedSymptoms];
      if (customSymptom.trim()) allSymptoms.push(customSymptom.trim());

      const res = await api.disease.analyze({
        plantId: selectedPlantId || undefined,
        plantSpecies: species || 'Unknown Plant Species',
        symptoms: allSymptoms,
        affectedParts,
        durationDays: Number(durationDays),
        wateringHabits,
        sunlightConditions,
        recentFertilizer,
        imageBase64: photoBase64 || undefined,
      });

      setReport(res.report);
    } catch (err: any) {
      setError(err.message || 'Disease diagnostic failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-emerald-950 flex items-center gap-2.5">
          <Stethoscope className="w-7 h-7 text-rose-600" /> AI Plant Disease Detection &amp; Diagnostics
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Multimodal botanical vision analysis powered by Gemini 3.8 Flash with safe cultural remedies
        </p>
      </div>

      {/* Conservative Diagnosis Transparency Banner */}
      <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/70 flex items-start gap-3 text-xs text-emerald-950">
        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Transparent Scientific Approach:</p>
          <p className="leading-relaxed">
            Photographs provide observable physical symptoms, but do not replace microscopic pathology tests. PlantPal never fabricates certainty or invents artificial confidence numbers. We provide evidence-backed hypotheses, cultural remediation, and preventive garden hygiene.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form & Photo Upload */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-xs space-y-5">
            <h3 className="font-bold text-stone-900 text-base font-serif">
              Upload Specimen &amp; Report Symptoms
            </h3>

            {/* Plant Link */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                  Plant in Your Garden
                </label>
                <select
                  value={selectedPlantId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedPlantId(id);
                    const found = plants.find((p) => p.id === id);
                    if (found) {
                      setSpecies(found.species);
                      if (found.photoUrl) setPhotoBase64(found.photoUrl);
                    }
                  }}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50"
                >
                  <option value="">General Assessment (Not Linked)</option>
                  {plants.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.species})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                  Botanical Species
                </label>
                <input
                  type="text"
                  value={species}
                  onChange={(e) => setSpecies(e.target.value)}
                  placeholder="e.g. Ficus Lyrata, Solanum lycopersicum"
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50"
                />
              </div>
            </div>

            {/* Photo Upload */}
            <PhotoUpload
              value={photoBase64}
              onChange={(val) => setPhotoBase64(val)}
              label="Affected Leaf / Stem Photograph"
              hint="Take a clear close-up of discoloration, lesions, or affected undersides"
            />

            {/* Symptoms Checklist */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
                Observed Physical Symptoms (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMON_SYMPTOMS.map((sym) => {
                  const isSelected = selectedSymptoms.includes(sym);
                  return (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => toggleSymptom(sym)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all text-left ${
                        isSelected
                          ? 'bg-rose-100 text-rose-900 border-rose-300 font-semibold shadow-2xs'
                          : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {sym}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Environmental Questions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  How long have symptoms persisted?
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50"
                  />
                  <span className="text-xs text-stone-500">days</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Recent Watering Pattern
                </label>
                <input
                  type="text"
                  value={wateringHabits}
                  onChange={(e) => setWateringHabits(e.target.value)}
                  placeholder="e.g. Twice weekly, soil kept saturated"
                  className="w-full text-sm px-3 py-2 rounded-xl border border-stone-200 bg-stone-50/50"
                />
              </div>
            </div>

            <Button
              variant="danger"
              size="lg"
              className="w-full"
              loading={loading}
              onClick={handleDiagnose}
              icon={<Sparkles className="w-5 h-5" />}
            >
              Analyze Symptoms with Vision AI
            </Button>
          </div>
        </div>

        {/* Right Column: Structured Diagnostic Results */}
        <div className="lg:col-span-5 space-y-6">
          {report ? (
            <div className="bg-white rounded-3xl border border-stone-200/80 p-6 shadow-lg space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Diagnostic Hypothesis
                  </span>
                  <h3 className="text-xl font-bold font-serif text-stone-900 mt-0.5">
                    {report.diagnosisTitle}
                  </h3>
                </div>
                <Badge variant={report.severity === 'severe' ? 'rose' : report.severity === 'moderate' ? 'amber' : 'green'}>
                  {report.severity} severity
                </Badge>
              </div>

              {/* Inconclusive Warning if applicable */}
              {!report.isConclusive && report.inconclusiveReason && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                  <span className="font-bold">Preliminary Hypothesis:</span> {report.inconclusiveReason}
                </div>
              )}

              {/* Visual Observations vs Causes */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-stone-600">
                  Visual Findings:
                </h4>
                <ul className="space-y-1 text-xs text-stone-600">
                  {report.visualObservations.map((obs, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{obs}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Possible Causes List */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <h4 className="font-bold text-xs uppercase tracking-wider text-stone-600">
                  Probable Causes:
                </h4>
                <div className="space-y-2">
                  {report.possibleCauses.map((cause, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-900">{cause.name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200 text-stone-700">
                          {cause.likelihood} Likelihood
                        </span>
                      </div>
                      <p className="text-stone-600 text-[11px] leading-relaxed">{cause.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Safe Treatments */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Safe Cultural Remediation:
                </h4>
                <ul className="space-y-1.5 text-xs">
                  {report.safeTreatments.map((step, idx) => (
                    <li key={idx} className="p-2.5 rounded-xl bg-emerald-50 text-emerald-950 font-medium border border-emerald-100">
                      {idx + 1}. {step}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Preventive Tips */}
              <div className="space-y-2 pt-2 border-t border-stone-100 text-xs text-stone-600">
                <h4 className="font-bold text-xs uppercase tracking-wider text-stone-600">
                  Long-term Prevention:
                </h4>
                <ul className="list-disc pl-4 space-y-1">
                  {report.preventiveTips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>

              {/* Disclaimer */}
              <div className="p-3 rounded-xl bg-stone-100 text-[11px] text-stone-500 italic border border-stone-200">
                {report.expertDisclaimer}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-stone-200/80 p-10 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                <Stethoscope className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-stone-900 text-base">Awaiting Leaf Inspection</h4>
              <p className="text-xs text-stone-500 leading-relaxed max-w-xs mx-auto">
                Upload a photograph of troubled foliage and choose any matching symptoms. Gemini 3.8 Flash will evaluate observable signs.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
