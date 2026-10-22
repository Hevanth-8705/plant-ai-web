import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Database, 
  Sparkles, 
  RotateCcw, 
  Download, 
  CheckCircle, 
  Save, 
  ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';
import { Button } from '../components/common/Button.tsx';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [gardenType, setGardenType] = useState(user?.gardenType || 'Balcony & Indoor Urban Oasis');
  const [experienceLevel, setExperienceLevel] = useState(user?.experienceLevel || 'intermediate');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [healthStatus, setHealthStatus] = useState<any>(null);

  useEffect(() => {
    api.health.check().then((h) => setHealthStatus(h)).catch(() => {});
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        name,
        gardenType,
        experienceLevel: experienceLevel as any,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetDemoGarden = async () => {
    if (confirm('Restore the garden to Maya Green’s default demo state? All sample plants and logs will be restored.')) {
      setResetting(true);
      try {
        await api.seed.reset();
        window.location.reload();
      } catch (err) {
        console.error(err);
        setResetting(false);
      }
    }
  };

  const handleExportData = async () => {
    try {
      const res = await api.dashboard.getStats();
      const jsonStr = JSON.stringify(res, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `plantpal_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-200">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-emerald-950 flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-emerald-700" /> Garden Settings &amp; Profile
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Manage your gardener profile, preferences, data backups, and AI integration
        </p>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
            alt={user?.name || 'User'}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-400"
          />
          <div>
            <h3 className="font-bold text-stone-900 text-lg">{user?.name}</h3>
            <p className="text-xs text-stone-500">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 pt-4 border-t border-stone-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                Display Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                Garden Type
              </label>
              <input
                type="text"
                value={gardenType}
                onChange={(e) => setGardenType(e.target.value)}
                placeholder="e.g. Balcony & Indoor Urban Oasis"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
              Gardening Experience
            </label>
            <select
              value={experienceLevel}
              onChange={(e: any) => setExperienceLevel(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50"
            >
              <option value="beginner">Beginner (Getting started with easy houseplants)</option>
              <option value="intermediate">Intermediate (Comfortable with aroids, herbs, &amp; balcony crops)</option>
              <option value="experienced">Experienced (Advanced propagation, orchids, exotic varieties)</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-4">
            {savedSuccess ? (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> Profile saved successfully!
              </span>
            ) : <span />}

            <Button type="submit" variant="primary" icon={<Save className="w-4 h-4" />}>
              Save Profile
            </Button>
          </div>
        </form>
      </div>

      {/* Integration & Database Status */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="font-bold text-stone-900 text-base font-serif flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-700" /> System &amp; AI Integration Status
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
            <span className="font-bold text-stone-500 uppercase tracking-wider text-[10px] block">
              AI Vision &amp; Diagnosis Provider
            </span>
            <span className="font-bold text-emerald-800 text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              {healthStatus?.aiProvider || 'Gemini 3.8 Flash (Server-Side SDK)'}
            </span>
            <p className="text-stone-500 text-[11px] mt-1">
              Provides disease symptom reasoning, photo inspection, and conversational advice.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
            <span className="font-bold text-stone-500 uppercase tracking-wider text-[10px] block">
              Database Persistence Engine
            </span>
            <span className="font-bold text-stone-800 text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              JSON Data Store (.data/plantpal_store.json)
            </span>
            <p className="text-stone-500 text-[11px] mt-1">
              Supports seamless offline/container storage or external MongoDB URI connection.
            </p>
          </div>
        </div>
      </div>

      {/* Garden Data Utilities */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="font-bold text-stone-900 text-base font-serif">Garden Data Management</h3>
        <p className="text-xs text-stone-500">
          Export your complete garden records or restore the default botanical demo database.
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Button
            variant="outline"
            onClick={handleExportData}
            icon={<Download className="w-4 h-4" />}
          >
            Export Garden JSON Backup
          </Button>

          <Button
            variant="ghost"
            onClick={handleResetDemoGarden}
            loading={resetting}
            icon={<RotateCcw className="w-4 h-4 text-rose-600" />}
            className="hover:bg-rose-50 text-rose-700"
          >
            Restore Demo Garden
          </Button>
        </div>
      </div>
    </div>
  );
};
