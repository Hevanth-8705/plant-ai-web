import React, { useState, useEffect } from 'react';
import { Package, Plus, Trash2, Edit3, AlertTriangle } from 'lucide-react';
import { api } from '../services/api.ts';
import { InventoryItem } from '../types/index.ts';
import { Button } from '../components/common/Button.tsx';
import { Card } from '../components/common/Card.tsx';

const QUICK_ADD_ITEMS = [
  { name: 'Potting Soil', category: 'soil' as const, unit: 'kg' as const, quantity: 5, minThreshold: 2 },
  { name: 'Liquid Fertilizer', category: 'fertilizer' as const, unit: 'ml' as const, quantity: 500, minThreshold: 100 },
  { name: 'Small Plastic Pot', category: 'pot' as const, unit: 'pieces' as const, quantity: 5, minThreshold: 3 },
];

export const InventoryPage: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await api.inventory.list();
      setItems(res.items || []);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleQuickAdd = async (item: typeof QUICK_ADD_ITEMS[0]) => {
    await api.inventory.add(item);
    fetchInventory();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this item?')) {
      await api.inventory.delete(id);
      fetchInventory();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900 font-serif">Inventory Manager</h1>
        <div className="flex items-center gap-2">
          {QUICK_ADD_ITEMS.map((item) => (
            <Button
              key={item.name}
              variant="outline"
              size="sm"
              icon={<Plus className="w-3 h-3" />}
              onClick={() => handleQuickAdd(item)}
            >
              Add {item.name}
            </Button>
          ))}
          <Button variant="primary" icon={<Plus className="w-4 h-4" />}>Add Supply</Button>
        </div>
      </div>

      {loading ? (
        <p>Loading inventory...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card key={item.id} className="relative p-5 space-y-3">
              {item.quantity <= item.minThreshold && (
                <div className="absolute top-2 right-2 text-rose-500">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900">{item.name}</h3>
                  <p className="text-xs text-stone-500 capitalize">{item.category}</p>
                </div>
              </div>
              <p className="text-sm font-semibold">
                Stock: {item.quantity} {item.unit}
              </p>
              <div className="flex items-center justify-between pt-3 border-t">
                <Button variant="ghost" size="sm" icon={<Edit3 className="w-4 h-4" />} children="" />
                <Button variant="ghost" size="sm" icon={<Trash2 className="w-4 h-4 text-rose-600" />} onClick={() => handleDelete(item.id)} children="" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
