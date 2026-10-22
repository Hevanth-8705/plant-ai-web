import React from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password?: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password = '',
}) => {
  const hasLength = password.length >= 8;
  const hasNumber = /[0-9]/.test(password);
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  let score = 0;
  if (hasLength) score++;
  if (hasNumber) score++;
  if (hasLetter) score++;
  if (hasSpecial) score++;

  const strengthLabels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = [
    'bg-stone-200',
    'bg-rose-500',
    'bg-amber-500',
    'bg-lime-500',
    'bg-emerald-600',
  ];

  const currentLabel = password.length === 0 ? '' : strengthLabels[score];

  if (!password) return null;

  return (
    <div className="space-y-2 pt-1 animate-in fade-in duration-150">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-stone-500 font-medium">Password strength:</span>
        <span
          className={`font-bold ${
            score <= 1
              ? 'text-rose-600'
              : score === 2
              ? 'text-amber-600'
              : score === 3
              ? 'text-lime-700'
              : 'text-emerald-700'
          }`}
        >
          {currentLabel}
        </span>
      </div>

      {/* Progress Bars */}
      <div className="grid grid-cols-4 gap-1.5 h-1.5">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`h-full rounded-full transition-all duration-300 ${
              score >= step ? strengthColors[score] : 'bg-stone-200'
            }`}
          />
        ))}
      </div>

      {/* Rules Criteria */}
      <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px] text-stone-500">
        <span className={`flex items-center gap-1 ${hasLength ? 'text-emerald-700 font-semibold' : 'text-stone-400'}`}>
          {hasLength ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3" />}
          8+ characters
        </span>
        <span className={`flex items-center gap-1 ${hasNumber && hasLetter ? 'text-emerald-700 font-semibold' : 'text-stone-400'}`}>
          {hasNumber && hasLetter ? <Check className="w-3 h-3 text-emerald-600" /> : <X className="w-3 h-3" />}
          Letters &amp; numbers
        </span>
      </div>
    </div>
  );
};
