import React, { useState, forwardRef, useId } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

interface PasswordFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ label = 'Password', error, helperText, className = '', id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const reactGeneratedId = useId();
    const inputId = id || reactGeneratedId;

    return (
      <div className="space-y-1.5 text-left">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-bold text-stone-700 tracking-wide">
            {label}
          </label>
        )}

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            <Lock className="w-4 h-4" />
          </div>

          <input
            id={inputId}
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            className={`w-full text-sm pl-10 pr-11 py-2.5 rounded-xl border transition-all outline-none ${
              error
                ? 'border-rose-400 bg-rose-50/40 text-rose-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                : 'border-stone-200/90 bg-white/90 text-stone-900 placeholder:text-stone-400 focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600'
            } ${className}`}
            {...props}
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700 transition-colors focus:outline-none cursor-pointer"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {error ? (
          <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 animate-in fade-in duration-150">
            {error}
          </p>
        ) : helperText ? (
          <p className="text-[11px] text-stone-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

PasswordField.displayName = 'PasswordField';
