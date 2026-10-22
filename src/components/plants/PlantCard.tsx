import React from 'react';
import { Plant } from '../../types/index.ts';
import { Badge } from '../common/Badge.tsx';
import { Button } from '../common/Button.tsx';
import { Droplets, Sun, Sparkles, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface PlantCardProps {
  plant: Plant;
  onSelect: (plant: Plant) => void;
  onWater: (plant: Plant, e: React.MouseEvent) => void;
}

export const PlantCard: React.FC<PlantCardProps> = ({
  plant,
  onSelect,
  onWater,
}) => {
  const now = new Date();
  const nextWater = new Date(plant.nextWaterDate);
  const diffDays = Math.ceil((nextWater.getTime() - now.getTime()) / 86400000);

  const isDueToday = diffDays === 0;
  const isOverdue = diffDays < 0;

  const categoryLabels: Record<string, string> = {
    houseplant: 'Houseplant',
    succulent: 'Succulent',
    herb: 'Herb',
    vegetable: 'Vegetable',
    fruit: 'Fruit',
    flower: 'Flowering',
    foliage: 'Foliage',
    bonsai: 'Bonsai',
  };

  const sunlightLabels: Record<string, string> = {
    low_indirect: 'Low Indirect',
    medium_indirect: 'Medium Indirect',
    bright_indirect: 'Bright Indirect',
    full_sun: 'Full Sun',
    partial_shade: 'Partial Shade',
  };

  return (
    <div
      onClick={() => onSelect(plant)}
      className="group bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-lg hover:border-emerald-300 transition-all duration-200 overflow-hidden cursor-pointer flex flex-col h-full"
    >
      {/* Plant Image Header */}
      <div className="relative h-48 w-full overflow-hidden bg-stone-100">
        <img
          src={plant.photoUrl || 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80'}
          alt={plant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Health Status Pill */}
        <div className="absolute top-3 left-3">
          {plant.healthStatus === 'attention_needed' ? (
            <Badge variant="rose" icon={<AlertCircle className="w-3 h-3 text-rose-600" />}>
              Needs Attention
            </Badge>
          ) : plant.healthStatus === 'recovering' ? (
            <Badge variant="amber" icon={<Clock className="w-3 h-3 text-amber-600" />}>
              Recovering
            </Badge>
          ) : (
            <Badge variant="green" icon={<CheckCircle className="w-3 h-3 text-emerald-600" />}>
              Healthy
            </Badge>
          )}
        </div>

        {/* Category Pill */}
        <div className="absolute top-3 right-3">
          <Badge variant="stone">
            {categoryLabels[plant.category] || plant.category}
          </Badge>
        </div>

        {/* Edible Harvest indicator */}
        {plant.isHarvestable && (
          <div className="absolute bottom-3 left-3 bg-amber-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
            <Sparkles className="w-3 h-3" /> Edible Crop
          </div>
        )}
      </div>

      {/* Body Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-bold text-stone-900 text-base group-hover:text-emerald-800 transition-colors truncate">
              {plant.name}
            </h3>
            {plant.nickname && (
              <span className="text-[11px] text-stone-500 font-medium truncate shrink-0">
                "{plant.nickname}"
              </span>
            )}
          </div>
          <p className="text-xs text-stone-500 italic truncate mt-0.5">
            {plant.species}
          </p>

          {/* Quick Specifications */}
          <div className="mt-3 flex items-center gap-3 text-xs text-stone-600">
            <div className="flex items-center gap-1 text-[11px]">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>{sunlightLabels[plant.sunlightRequirement] || 'Indirect'}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px]">
              <Droplets className="w-3.5 h-3.5 text-sky-500" />
              <span>Every {plant.wateringFrequencyDays}d</span>
            </div>
          </div>
        </div>

        {/* Watering Status & Action */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          <div className="text-[11px]">
            <p className="text-stone-400 font-medium uppercase tracking-wider text-[10px]">
              Watering Schedule
            </p>
            {isOverdue ? (
              <span className="font-bold text-rose-600">
                Overdue by {Math.abs(diffDays)}d
              </span>
            ) : isDueToday ? (
              <span className="font-bold text-amber-600">
                Due Today!
              </span>
            ) : (
              <span className="font-medium text-stone-700">
                Due in {diffDays} {diffDays === 1 ? 'day' : 'days'}
              </span>
            )}
          </div>

          <Button
            size="sm"
            variant={isDueToday || isOverdue ? 'primary' : 'outline'}
            onClick={(e) => onWater(plant, e)}
            icon={<Droplets className="w-3.5 h-3.5" />}
          >
            Water
          </Button>
        </div>
      </div>
    </div>
  );
};
