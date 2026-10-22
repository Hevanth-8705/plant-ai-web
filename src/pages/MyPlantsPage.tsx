import React, { useState, useEffect } from 'react';
import { 
  Sprout, 
  Search, 
  Filter, 
  Plus, 
  Droplets, 
  Sparkles,
  ArrowUpDown,
  Tag
} from 'lucide-react';
import { Plant, PlantCategory } from '../types/index.ts';
import { api } from '../services/api.ts';
import { Button } from '../components/common/Button.tsx';
import { PlantCard } from '../components/plants/PlantCard.tsx';

interface MyPlantsPageProps {
  onOpenAddPlant: () => void;
  onSelectPlant: (plant: Plant) => void;
}

export const MyPlantsPage: React.FC<MyPlantsPageProps> = ({
  onOpenAddPlant,
  onSelectPlant,
}) => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedHealth, setSelectedHealth] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'water_due' | 'name' | 'newest'>('water_due');

  const fetchPlants = async () => {
    try {
      setLoading(true);
      const res = await api.plants.list();
      setPlants(res.plants || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlants();
  }, []);

  const handleWater = async (plant: Plant, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.plants.markWatered(plant.id);
      fetchPlants();
    } catch (err) {
      console.error(err);
    }
  };

  // Filter & Search Logic
  const filteredPlants = plants.filter((plant) => {
    const matchesSearch = 
      plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.species.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (plant.tags && plant.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesCategory = selectedCategory === 'all' || plant.category === selectedCategory;
    const matchesHealth = selectedHealth === 'all' || plant.healthStatus === selectedHealth;

    return matchesSearch && matchesCategory && matchesHealth;
  });

  // Sort Logic
  const sortedPlants = [...filteredPlants].sort((a, b) => {
    if (sortBy === 'water_due') {
      return new Date(a.nextWaterDate).getTime() - new Date(b.nextWaterDate).getTime();
    }
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const categories = [
    { id: 'all', label: 'All Plants' },
    { id: 'houseplant', label: 'Houseplants' },
    { id: 'succulent', label: 'Succulents' },
    { id: 'herb', label: 'Herbs' },
    { id: 'vegetable', label: 'Vegetables' },
    { id: 'foliage', label: 'Foliage' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-emerald-950">
            My Plants Collection
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Browse, monitor, and care for your registered botanical inventory
          </p>
        </div>
        <Button
          variant="primary"
          onClick={onOpenAddPlant}
          icon={<Plus className="w-4 h-4" />}
        >
          Add New Plant
        </Button>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by plant name, botanical species, or tag..."
              className="w-full text-sm pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="w-4 h-4 text-stone-400" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="text-xs font-semibold px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 focus:ring-2 focus:ring-emerald-500 text-stone-700"
            >
              <option value="water_due">Watering Due First</option>
              <option value="name">Alphabetical (A-Z)</option>
              <option value="newest">Recently Added</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`text-xs font-medium px-3.5 py-1.5 rounded-full transition-all shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Plant Cards */}
      {sortedPlants.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Sprout className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-900">No plants found</h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try clearing your search query or switching categories.'
                : 'Your garden is empty. Add your first plant to start scheduling reminders!'}
            </p>
          </div>
          <Button
            variant="primary"
            onClick={onOpenAddPlant}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Plant Now
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedPlants.map((plant) => (
            <PlantCard
              key={plant.id}
              plant={plant}
              onSelect={onSelectPlant}
              onWater={handleWater}
            />
          ))}
        </div>
      )}
    </div>
  );
};
