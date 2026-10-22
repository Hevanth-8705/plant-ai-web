import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-stone-200/80 shadow-xs transition-all duration-200 ${
        hoverable ? 'hover:shadow-md hover:border-emerald-300/80 hover:-translate-y-0.5 cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: string;
  colorScheme?: 'emerald' | 'amber' | 'rose' | 'blue' | 'purple';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  colorScheme = 'emerald',
  onClick,
}) => {
  const schemeStyles = {
    emerald: {
      bg: 'bg-emerald-50/70',
      text: 'text-emerald-700',
      border: 'border-emerald-100',
    },
    amber: {
      bg: 'bg-amber-50/80',
      text: 'text-amber-700',
      border: 'border-amber-100',
    },
    rose: {
      bg: 'bg-rose-50/70',
      text: 'text-rose-700',
      border: 'border-rose-100',
    },
    blue: {
      bg: 'bg-sky-50/70',
      text: 'text-sky-700',
      border: 'border-sky-100',
    },
    purple: {
      bg: 'bg-purple-50/70',
      text: 'text-purple-700',
      border: 'border-purple-100',
    },
  };

  const scheme = schemeStyles[colorScheme];

  return (
    <Card
      onClick={onClick}
      hoverable={!!onClick}
      className="p-5 flex items-start justify-between relative overflow-hidden"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-stone-900 tracking-tight">{value}</h3>
        {subtitle && <p className="text-xs text-stone-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-xl ${scheme.bg} ${scheme.text} ${scheme.border} border shrink-0`}>
        {icon}
      </div>
    </Card>
  );
};
