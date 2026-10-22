import React from 'react';
import { Award, Trophy, Star, Sparkles, CheckCircle2, Lock, Flame, Shield, ArrowRight, Zap, BookOpen, Droplets, Sprout, Apple, Stethoscope } from 'lucide-react';
import { User, Badge } from '../types/index.ts';
import { Button } from '../components/common/Button.tsx';

interface GardenerLevelPageProps {
  user: User | null;
  onNavigate: (page: string) => void;
}

export const GardenerLevelPage: React.FC<GardenerLevelPageProps> = ({ user, onNavigate }) => {
  const currentXp = user?.xp || 340;
  const currentLevel = user?.level || 3;
  const title = user?.title || 'Green Thumb Apprentice';
  const streakDays = user?.streakDays || 7;

  // Level calculation: Each level takes 150 XP
  const xpForCurrentLevel = (currentLevel - 1) * 150;
  const xpForNextLevel = currentLevel * 150;
  const xpInCurrentLevel = currentXp - xpForCurrentLevel;
  const progressPercent = Math.min(100, Math.max(0, (xpInCurrentLevel / 150) * 100));

  const defaultBadges: Badge[] = user?.badges || [
    {
      id: 'badge_first_seed',
      title: 'First Seed',
      description: 'Added your very first plant to PlantPal.',
      icon: '🌱',
      category: 'plants',
      isUnlocked: true,
      unlockedAt: '2026-01-15T09:00:00.000Z',
    },
    {
      id: 'badge_hydration_hero',
      title: 'Hydration Hero',
      description: 'Completed 5 successful plant watering tasks.',
      icon: '💧',
      category: 'watering',
      isUnlocked: true,
      unlockedAt: '2026-01-20T10:00:00.000Z',
    },
    {
      id: 'badge_diary_scribe',
      title: 'Botanical Scribe',
      description: 'Logged 3 diary entries chronicling your garden journey.',
      icon: '📖',
      category: 'diary',
      isUnlocked: true,
      unlockedAt: '2026-02-01T14:00:00.000Z',
    },
    {
      id: 'badge_plant_doctor',
      title: 'Plant Doctor',
      description: 'Successfully diagnosed a plant health issue using AI.',
      icon: '🩺',
      category: 'health',
      isUnlocked: true,
      unlockedAt: '2026-02-15T16:00:00.000Z',
    },
    {
      id: 'badge_harvest_master',
      title: 'Bumper Harvest',
      description: 'Logged your first delicious home-grown harvest.',
      icon: '🍎',
      category: 'harvest',
      isUnlocked: false,
    },
    {
      id: 'badge_master_horticulturist',
      title: 'Master Horticulturist',
      description: 'Reach Level 5 and earn 1,000 XP.',
      icon: '👑',
      category: 'level',
      isUnlocked: false,
    },
  ];

  const unlockedCount = defaultBadges.filter((b) => b.isUnlocked).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-stone-900 text-white p-6 sm:p-10 shadow-xl border border-emerald-700/40">
        <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/40 text-emerald-200 text-xs font-semibold uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5 text-amber-300" /> Gardener Level System & Rewards
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-serif tracking-tight text-[#F7F5EC]">
              Level {currentLevel}: {title}
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              Nurture your plants, complete care tasks on time, and record growth milestones in your diary to earn XP, unlock prestigious botanical badges, and rise through the gardening ranks!
            </p>
          </div>

          <div className="flex items-center gap-4 bg-emerald-950/60 backdrop-blur-md px-5 py-4 rounded-2xl border border-emerald-600/30 shadow-inner">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-300 uppercase tracking-wider">Active Streak</p>
              <p className="text-2xl font-black text-white">{streakDays} Days</p>
            </div>
          </div>
        </div>

        {/* Progress Bar to Next Level */}
        <div className="mt-8 pt-6 border-t border-emerald-700/40 space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-emerald-200">Level {currentLevel} ({currentXp} XP Total)</span>
            <span className="text-amber-300 font-mono">{xpForNextLevel - currentXp} XP to Level {currentLevel + 1}</span>
          </div>
          <div className="w-full h-3 bg-emerald-950/80 rounded-full overflow-hidden p-0.5 border border-emerald-600/30">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-amber-300 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500 font-mono">Total Experience</p>
            <p className="text-2xl font-black text-stone-900">{currentXp} XP</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500 font-mono">Badges Unlocked</p>
            <p className="text-2xl font-black text-stone-900">{unlockedCount} / {defaultBadges.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500 font-mono">Gardener Rank</p>
            <p className="text-sm font-black text-emerald-900 truncate max-w-[180px]">{title}</p>
          </div>
        </div>
      </div>

      {/* Badges Showcase Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-stone-900 font-serif">Gardening Badges & Trophies</h2>
            <p className="text-xs text-stone-500 mt-0.5">Complete milestones across your plant collection to unlock prestigious awards.</p>
          </div>
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-200/60">
            <Sparkles className="w-4 h-4 text-emerald-600" /> {unlockedCount} Unlocked
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {defaultBadges.map((badge) => (
            <div
              key={badge.id}
              className={`relative rounded-2xl p-5 border transition-all flex items-start gap-4 ${
                badge.isUnlocked
                  ? 'bg-gradient-to-br from-emerald-50/60 to-white border-emerald-200 shadow-xs hover:shadow-md'
                  : 'bg-stone-50/80 border-stone-200/60 opacity-75'
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-sm ${
                  badge.isUnlocked
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white'
                    : 'bg-stone-200 text-stone-400'
                }`}
              >
                {badge.isUnlocked ? badge.icon : <Lock className="w-6 h-6" />}
              </div>

              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-stone-900">{badge.title}</h3>
                  {badge.isUnlocked ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Unlocked
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200 text-stone-600">
                      Locked
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">{badge.description}</p>
                {badge.unlockedAt && (
                  <p className="text-[10px] text-emerald-700 font-medium mt-1">
                    Unlocked on {new Date(badge.unlockedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How to Earn XP Guide */}
      <div className="bg-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg border border-emerald-900 space-y-6">
        <div>
          <h2 className="text-xl font-black font-serif text-[#F7F5EC]">How to Earn Experience Points (XP)</h2>
          <p className="text-xs text-stone-300 mt-1">Every action you take to care for your green companions rewards XP:</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-emerald-900/60 rounded-2xl p-4 border border-emerald-700/50 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-emerald-100 flex items-center justify-center shrink-0">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Water Plants</p>
              <p className="text-xs font-mono text-emerald-300">+15 XP per watering</p>
            </div>
          </div>

          <div className="bg-emerald-900/60 rounded-2xl p-4 border border-emerald-700/50 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-emerald-100 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Log Diary Entry</p>
              <p className="text-xs font-mono text-emerald-300">+25 XP per entry</p>
            </div>
          </div>

          <div className="bg-emerald-900/60 rounded-2xl p-4 border border-emerald-700/50 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-emerald-100 flex items-center justify-center shrink-0">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Add New Plant</p>
              <p className="text-xs font-mono text-emerald-300">+30 XP per plant</p>
            </div>
          </div>

          <div className="bg-emerald-900/60 rounded-2xl p-4 border border-emerald-700/50 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-emerald-100 flex items-center justify-center shrink-0">
              <Apple className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Record Harvest</p>
              <p className="text-xs font-mono text-emerald-300">+35 XP per harvest</p>
            </div>
          </div>

          <div className="bg-emerald-900/60 rounded-2xl p-4 border border-emerald-700/50 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-emerald-100 flex items-center justify-center shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">AI Health Diagnosis</p>
              <p className="text-xs font-mono text-emerald-300">+20 XP per report</p>
            </div>
          </div>

          <div className="bg-emerald-900/60 rounded-2xl p-4 border border-emerald-700/50 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-emerald-100 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Daily Streak</p>
              <p className="text-xs font-mono text-emerald-300">+10 XP daily check-in</p>
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button
            variant="secondary"
            onClick={() => onNavigate('plants')}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Care For Plants Now
          </Button>
        </div>
      </div>
    </div>
  );
};
