import React, { useState, useEffect } from 'react';
import { Star, Plus, Trash2, Sprout } from 'lucide-react';
import { api } from '../services/api.ts';
import { WishlistItem } from '../types/index.ts';
import { Button } from '../components/common/Button.tsx';
import { Card } from '../components/common/Card.tsx';

export const WishlistPage: React.FC = () => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await api.wishlist.list();
      setItems(res.items || []);
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this from your wishlist?')) {
      await api.wishlist.delete(id);
      fetchWishlist();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900 font-serif">Plant Wishlist</h1>
        <Button variant="primary" icon={<Plus className="w-4 h-4" />}>Add to Wishlist</Button>
      </div>

      {loading ? (
        <p>Loading wishlist...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card key={item.id} className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
                  <Star className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900">{item.species}</h3>
                  <p className="text-xs text-stone-500 capitalize">{item.category}</p>
                </div>
              </div>
              <p className="text-sm text-stone-600">{item.notes}</p>
              <div className="flex items-center justify-between pt-3 border-t">
                <Button variant="ghost" size="sm" icon={<Sprout className="w-4 h-4 text-emerald-600" />} children="" />
                <Button variant="ghost" size="sm" icon={<Trash2 className="w-4 h-4 text-rose-600" />} onClick={() => handleDelete(item.id)} children="" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
