import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'amber' | 'rose' | 'blue' | 'purple' | 'stone' | 'lime';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'green',
  size = 'md',
  icon,
}) => {
  const variantStyles = {
    green: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    lime: 'bg-lime-50 text-lime-900 border-lime-200',
    amber: 'bg-amber-50 text-amber-900 border-amber-200/80',
    rose: 'bg-rose-50 text-rose-800 border-rose-200',
    blue: 'bg-sky-50 text-sky-800 border-sky-200',
    purple: 'bg-purple-50 text-purple-800 border-purple-200',
    stone: 'bg-stone-100 text-stone-700 border-stone-200',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
