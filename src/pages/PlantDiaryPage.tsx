import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Tag, 
  Trash2, 
  Edit3, 
  Image as ImageIcon 
} from 'lucide-react';
import { Plant, DiaryEntry, DiaryEventType } from '../types/index.ts';
import { api } from '../services/api.ts';
import { Button } from '../components/common/Button.tsx';
import { Modal } from '../components/common/Modal.tsx';
import { PhotoUpload } from '../components/common/PhotoUpload.tsx';

export const PlantDiaryPage: React.FC = () => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedPlantFilter, setSelectedPlantFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // New / Edit modal
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [plantId, setPlantId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [eventType, setEventType] = useState<DiaryEventType>('general_note');
  const [tagsInput, setTagsInput] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [diaryRes, plantsRes] = await Promise.all([
        api.diary.list(),
        api.plants.list(),
      ]);
      setEntries(diaryRes.entries || []);
      setPlants(plantsRes.plants || []);
      if (plantsRes.plants?.length > 0 && !plantId) {
        setPlantId(plantsRes.plants[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setEventType('general_note');
    setTagsInput('');
    setPhotoUrl('');
    setShowModal(true);
  };

  const handleOpenEdit = (entry: DiaryEntry) => {
    setEditingId(entry.id);
    setPlantId(entry.plantId || '');
    setTitle(entry.title);
    setContent(entry.content);
    setEventType(entry.eventType);
    setTagsInput((entry.tags || []).join(', '));
    setPhotoUrl(entry.photoUrls?.[0] || '');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      const payload = {
        plantId: plantId || undefined,
        title: title.trim(),
        content: content.trim(),
        eventType,
        tags: tagsInput ? tagsInput.split(',').map((t) => t.trim()).filter(Boolean) : [],
        photoUrls: photoUrl ? [photoUrl] : [],
        date: new Date().toISOString(),
      };

      if (editingId) {
        await api.diary.update(editingId, payload);
      } else {
        await api.diary.add(payload);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this diary entry?')) {
      await api.diary.delete(id);
      fetchData();
    }
  };

  // Filter logic
  const filteredEntries = entries.filter((entry) => {
    const matchesPlant = selectedPlantFilter === 'all' || entry.plantId === selectedPlantFilter;
    const matchesType = selectedTypeFilter === 'all' || entry.eventType === selectedTypeFilter;
    const matchesSearch =
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.tags && entry.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchesPlant && matchesType && matchesSearch;
  });

  const eventTypes: Array<{ id: string; label: string }> = [
    { id: 'all', label: 'All Events' },
    { id: 'watering', label: 'Watering' },
    { id: 'fertilizing', label: 'Fertilizing' },
    { id: 'pruning', label: 'Pruning' },
    { id: 'repotting', label: 'Repotting' },
    { id: 'growth', label: 'Growth' },
    { id: 'flowering', label: 'Flowering' },
    { id: 'harvest', label: 'Harvest' },
    { id: 'pest_control', label: 'Pest Control' },
    { id: 'general_note', label: 'General Note' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-emerald-950 flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-emerald-700" /> Plant Journal &amp; Diary
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Chronological botanical reflections, pruning records, and care observations
          </p>
        </div>

        <Button variant="primary" onClick={handleOpenAdd} icon={<Plus className="w-4 h-4" />}>
          New Journal Entry
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search entries by title, notes, or tags..."
              className="w-full text-sm pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedPlantFilter}
              onChange={(e) => setSelectedPlantFilter(e.target.value)}
              className="text-xs font-semibold px-3 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50"
            >
              <option value="all">All Plants</option>
              {plants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Event Type Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {eventTypes.map((et) => (
            <button
              key={et.id}
              onClick={() => setSelectedTypeFilter(et.id)}
              className={`text-xs font-medium px-3.5 py-1.5 rounded-full transition-all shrink-0 ${
                selectedTypeFilter === et.id
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {et.label}
            </button>
          ))}
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-3">
            <BookOpen className="w-12 h-12 text-stone-400 mx-auto" />
            <h4 className="font-bold text-stone-900 text-base">No journal entries found</h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Start recording milestones, repotting notes, or pest management observations.
            </p>
            <Button variant="primary" size="sm" onClick={handleOpenAdd}>
              Create Entry
            </Button>
          </div>
        ) : (
          filteredEntries.map((entry) => {
            const plant = plants.find((p) => p.id === entry.plantId);
            return (
              <div
                key={entry.id}
                className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-3 hover:border-emerald-200 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-stone-400 mb-1">
                      <span className="font-bold uppercase tracking-wider text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {entry.eventType.replace('_', ' ')}
                      </span>
                      <span>•</span>
                      <span>{new Date(entry.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      {plant && (
                        <>
                          <span>•</span>
                          <span className="font-semibold text-stone-700">{plant.name}</span>
                        </>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-stone-900">{entry.title}</h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(entry)}
                      className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line">
                  {entry.content}
                </p>

                {/* Attached Photo */}
                {entry.photoUrls && entry.photoUrls.length > 0 && (
                  <div className="pt-2">
                    <img
                      src={entry.photoUrls[0]}
                      alt="Journal attachment"
                      className="h-40 rounded-xl object-cover border border-stone-200"
                    />
                  </div>
                )}

                {/* Tags */}
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-stone-100">
                    {entry.tags.map((tag) => (
                      <span key={tag} className="text-[11px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: New / Edit Entry */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'Edit Journal Entry' : 'New Plant Journal Entry'}
        subtitle="Document daily observations, pruning, or potting updates"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Associated Plant
              </label>
              <select
                value={plantId}
                onChange={(e) => setPlantId(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50"
              >
                <option value="">General Garden Note</option>
                {plants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.species})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">
                Event Category
              </label>
              <select
                value={eventType}
                onChange={(e: any) => setEventType(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50"
              >
                <option value="watering">Watering</option>
                <option value="fertilizing">Fertilizing</option>
                <option value="pruning">Pruning / Trimming</option>
                <option value="repotting">Repotting</option>
                <option value="growth">Growth Progress</option>
                <option value="flowering">Flowering</option>
                <option value="harvest">Harvest</option>
                <option value="pest_control">Pest Treatment</option>
                <option value="general_note">General Note</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Cleared yellow leaves and added fresh compost"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Observations &amp; Reflection *
            </label>
            <textarea
              rows={4}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe what you noticed today..."
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200"
            />
          </div>

          <PhotoUpload
            value={photoUrl}
            onChange={(val) => setPhotoUrl(val)}
            label="Optional Attachment"
            hint="Attach a photo to this diary entry"
          />

          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. spring-growth, potting, organic"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-200"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingId ? 'Save Changes' : 'Save Entry'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
