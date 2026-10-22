import React, { useState } from 'react';
import { Flame, Trophy, CheckCircle2, Sparkles, Award, ArrowRight, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { User } from '../../types/index.ts';
import { Button } from '../common/Button.tsx';
import { api } from '../../services/api.ts';

interface DailyCareStreakTrackerProps {
  user: User | null;
  onRefreshUser: () => Promise<void>;
  onNavigate: (page: string) => void;
  className?: string;
}

export const DailyCareStreakTracker: React.FC<DailyCareStreakTrackerProps> = ({
  user,
  onRefreshUser,
  onNavigate,
  className = '',
}) => {
  const [claiming, setClaiming] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const streakDays = user?.streakDays || 7;
  const todayStr = new Date().toISOString().split('T')[0];
  const hasClaimedToday = (user as any)?.lastStreakCheckInDate === todayStr;

  const handleClaimBonus = async () => {
    if (hasClaimedToday || claiming) return;
    try {
      setClaiming(true);
      const res = await api.auth.updateUser({
        // Call backend checkin or update
      });
      // Or we can invoke our custom endpoint if added, or api.auth.updateUser.
      // Let's call fetch for streak-checkin endpoint we will add to server.ts
      const checkinRes = await fetch('/api/auth/streak-checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('plantpal_auth_token') || ''}`,
        },
      });
      const data = await checkinRes.json();

      if (!checkinRes.ok) {
        throw new Error(data.error || 'Failed to check in');
      }

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      setMessage({
        text: `Success! Claimed +20 XP and maintained your ${data.streakDays || streakDays}-day care streak!`,
        type: 'success',
      });

      await onRefreshUser();
    } catch (err: any) {
      setMessage({
        text: err.message || 'Already checked in today or unable to claim bonus.',
        type: 'error',
      });
    } finally {
      setClaiming(false);
    }
  };

  // 7-day consistency visualization (Mon - Sun)
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const currentDayIndex = (new Date().getDay() + 6) % 7; // 0 for Monday

  return (
    <div className={`bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-emerald-500/10 rounded-3xl border border-amber-200/80 p-5 sm:p-6 shadow-sm space-y-4 relative overflow-hidden ${className}`}>
      {/* Decorative background glow */}
      <div className="absolute right-0 top-0 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-stone-900 text-base sm:text-lg font-serif">Daily Care Streak</h3>
              <span className="text-xs font-black bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200">
                🔥 {streakDays} Days
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Consistent daily plant care unlocks bonus XP &amp; Gardener level badges.
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant={hasClaimedToday ? 'ghost' : 'primary'}
          onClick={handleClaimBonus}
          disabled={hasClaimedToday || claiming}
          icon={hasClaimedToday ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Zap className="w-4 h-4" />}
          className={hasClaimedToday ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default' : 'bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700 shadow-sm'}
        >
          {hasClaimedToday ? 'Bonus Claimed Today ✓' : claiming ? 'Claiming...' : 'Claim Daily Bonus (+20 XP)'}
        </Button>
      </div>

      {/* Inline Feedback Message */}
      {message && (
        <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 animate-in fade-in duration-200 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <Sparkles className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{message.text}</span>
        </div>
      )}

      {/* 7-Day Weekly Consistency Progress Bar & Habit Checkers */}
      <div className="bg-white/90 rounded-2xl p-4 border border-amber-100 shadow-2xs space-y-3 relative z-10">
        <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
          <span>Weekly Habit Consistency (7-Day Goal)</span>
          <span className="text-emerald-700 font-bold">{Math.min(streakDays, 7)} / 7 Days Active</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden p-0.5 border border-stone-200/60">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500 shadow-xs"
            style={{ width: `${Math.min(100, (Math.min(streakDays, 7) / 7) * 100)}%` }}
          />
        </div>

        {/* Days of week pill indicators */}
        <div className="grid grid-cols-7 gap-2 pt-1">
          {daysOfWeek.map((day, idx) => {
            const isCompleted = idx <= currentDayIndex;
            const isToday = idx === currentDayIndex;
            return (
              <div
                key={day}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                  isToday
                    ? 'bg-amber-50 border-amber-300 shadow-xs ring-1 ring-amber-400'
                    : isCompleted
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                    : 'bg-stone-50 border-stone-200 text-stone-400 opacity-60'
                }`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider">{day}</span>
                <div className="mt-1">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-stone-300" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Link to Gardener Level & Badges */}
      <div className="flex items-center justify-between pt-1 text-xs relative z-10">
        <div className="flex items-center gap-1.5 text-stone-600">
          <Trophy className="w-3.5 h-3.5 text-amber-600" />
          <span>Level {user?.level || 3} • {user?.title || 'Green Thumb Apprentice'} ({user?.xp || 340} XP)</span>
        </div>

        <button
          onClick={() => onNavigate('gardener-level')}
          className="text-emerald-800 hover:text-emerald-900 font-bold flex items-center gap-1 transition-colors"
        >
          View Badges &amp; Ranks <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
